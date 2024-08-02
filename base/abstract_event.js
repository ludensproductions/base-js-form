export default class AbstractEvents {
    constructor() {
        this.model = null;
        this.url = null;
        this.redirectUrl = null;
        this.registerEvents();
    }


    registerEvents = () => {
        document.getElementById('submitButton').addEventListener('click', (e) => this.submitData(e));
    };


    submitData = (e) => {
        e.preventDefault();
        let loadingSpinner = document.querySelector('#overlay-spinner')
        loadingSpinner.style.visibility = 'visible';
        
        let jsonData = this.model.validateFields();
        console.log(jsonData);

        if (!jsonData || this.model.errors.length > 0) {
            loadingSpinner.style.visibility = 'hidden';
            return;
        }
        
        let url = this.url;

        const primaryKey = JSON.parse(document.getElementById('primary_key').textContent);
        let method = 'POST';

        if (primaryKey && primaryKey !== '') {
            url = `${this.url}${primaryKey}`;
            method = 'PUT';
            
        }

        const body = JSON.stringify(jsonData, (key, val) => {
            return val;
        });

        let csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: body,
        })
        .then(response => {
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            const { status, data } = result;
            if (status === 200 || status === 201) {
                window.location.href = this.redirectUrl
                loadingSpinner.style.visibility = 'hidden';

                return
            }

            let message = 'Error al guardar la direccion';

            if (data.details){
                message = "<strong>" + data.details.map(item => item.message).join('</p><p>')+ "</strong>";
            }
            
            if (data.detail){
                message = "<strong>" + data.detail.map(item => {
                    if (item.type == 'value_error.str.regex') {
                        const field = item.loc[item.loc.length - 1];
                        const regexMessage = item.msg.split(' ').pop();
                        return `El formato del campo ${field} no es válido: ${regexMessage}`;
                    } else if (item.type == 'value_error.missing') {
                        return `El campo ${item.loc[item.loc.length - 1]} es requerido`;
                    }
                    else if (item.type == 'value_error.extra') {
                        return `Se detectó un campo adicional no esperado: ${item.loc[item.loc.length - 1]}`;
                    }
                    }
                ).join('</p><p>')+ "</strong>";
            }
            this.model.errors['non_field_errors'] = message;
            this.model.addError();
            loadingSpinner.style.visibility = 'hidden';

            
        })
        .catch((error) => {
            loadingSpinner.style.visibility = 'hidden';
            console.error('Error:', error);
        });
    }
}