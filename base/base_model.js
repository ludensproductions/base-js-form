import { removeError, handleKeyDown, handlePaste, addSingleError, removeSingleError } from '../utils/utils.js';

// Abstract class
export class BaseModel {

    static isEventListenerAdded = false;

    constructor() {
        this.prefix = '';
        this.fields = [];
        this.requiredFields = [];
        this.errors = [];
        this.regex = {};
        this.data = {};
        this.formatoIncorrecto = 'El formato no es válido';
    }
    
    addBaseEventsListener(requiredFields = []) {
        if (BaseModel.isEventListenerAdded) return;
        const fields = document.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
        for (let i = 0; i < fields.length; i++) {

            fields[i].addEventListener('input', (event) => {
                removeSingleError(event.target);
            });

            fields[i].addEventListener('input', (event) => {
                
                const input = event.target;
                if (event.target && event.target.type === 'text' && event.target.classList.contains('uppercase')) {
                    const cursorPosition = input.selectionStart; // Save cursor position
                
                    // Modify the value
                    input.value = input.value.toUpperCase();
                
                    // Restore cursor position
                    input.setSelectionRange(cursorPosition, cursorPosition);
                }

                // validate regex and add error message
                let regex = event.target.getAttribute('pattern');
                let value = event.target.value;
                
                const reg = this.validateRegex(value, regex);
                if (!reg && value !== '') {
                    

                    addSingleError(event.target, this.formatoIncorrecto);
                }


            });

            fields[i].addEventListener('keydown', (event) => {
                handleKeyDown(event);
            });


            fields[i].addEventListener('paste', (event) => {
                handlePaste(event);
            });



        }
        BaseModel.isEventListenerAdded = true;
    }

    addError(errorList=null) {
        if (!errorList) errorList = this.errors;

        for (const [key, value] of Object.entries(errorList)) {
            if (key === 'documentos_aduanales') continue;
            
            const element = document.querySelector(`#${key}`);

            const existingError = element.parentElement.querySelector('.error-message');

            if (existingError){
                //remove existing error
                existingError.remove();
            }
            const PTag = document.createElement('p');
            PTag.classList.add('error-message');
            PTag.classList.add('text-danger');
            PTag.innerHTML = value;
            element.parentElement.appendChild(PTag);


        }

        const error = document.querySelector('.error-message');
        if (error) {
            error.closest('div').scrollIntoView({block: "center", behavior: "smooth"});
        }


    }


    //verificar regex
    validateRegex(value, regex) {
        if (!regex) return true;
        const reg = new RegExp(regex);
        return reg.test(value);
    }

    
}
