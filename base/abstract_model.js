import { removeError } from '../utils/utils.js';
import { BaseModel } from './base_model.js';

export default class AbstractModel extends BaseModel {


    constructor() {
        super();
        
        this.data = {};
        this.errors = {};

    }
    

    validateFields(sectionId = null) {
        this.data = {};
        this.errors = {};

        removeError()
        this.fields.forEach((field) => {
            let inputName = field;
            if (Array.isArray(field)) {
                inputName = field[1];
                field = field[0];
            }

            let searchString = this.prefix ? `id_${this.prefix}-${inputName}` : `id_${inputName}`;
            
            let input;

            if (sectionId) searchString = `${sectionId} #${searchString}`;

            input = document.querySelector(`#${searchString}`);

            let value;
            
            if (input) {
                value = input.value;
            }

            if (!value && this.requiredFields.includes(field)) {
                this.errors[searchString] = 'Este campo es requerido';
                return;
            }

            
            if (typeof this[`validate_${field}`] === 'function') {
                value = this[`validate_${field}`](this.data, value);
            }
            
            if (!value) return;
            if (this.regex[field] && !this.validateRegex(value, this.regex[field])) {

                this.errors[searchString] = 'El formato no es válido';
            }
            
            this.data[field] = value;
        });

        if (typeof this[`validate`] === 'function') {
            this.data = this[`validate`](this.data);
        }

        if (Object.keys(this.errors).length > 0) {

            this.addError();
            return;
        }

        return this.data;
    }
}
