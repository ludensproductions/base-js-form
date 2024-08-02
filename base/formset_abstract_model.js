import { removeError, handleKeyDown, handlePaste, addSingleError, removeSingleError } from '../utils/utils.js';

import {BaseModel} from './base_model.js';
// Abstract class
export default class FormsetAbstractModel extends BaseModel {


    constructor() {
        super();
        this.data = {};
        this.errors = {};
        this.prefix = '';
        this.uniqueValues = [];

    }

    addRepeatListener() {


        const divContainer = document.getElementById(`list_${this.prefix}`);

        if (!divContainer) return;

        //add event listener to the add button
        divContainer.addEventListener('input', (event) => {
        
            if (event.target.tagName !== 'INPUT') return;

            this.uniqueValues.forEach((field) => {

                let inputName = field;
                
                removeSingleError(event.target);
                this.validateUniqueValues(event.target, inputName);

                
            });

        });
    }
    
    validateUniqueValues(element, inputName, isEvent=true) {
        let value = element.value;
        const totalForms = document.getElementById(`id_${this.prefix}-TOTAL_FORMS`).value;   
        for (let i = 0; i < totalForms; i++) {
            let formId = `id_${this.prefix}-${i}`;
            let searchString = `#${formId}-${inputName}`;
            let input = document.querySelector(searchString);
            let inputValue = input.value;
            if (inputValue === value) {
                if (element.id !== input.id) {
                    if (isEvent){
                        addSingleError(element, 'Este valor ya existe');
                    }else{
                        this.errors[element.id] = 'Este valor ya existe';
                    }
                    
                    return;
                }
            }
        }
    }



    validateFields() {
        this.data = [];
        this.errors = {};

        removeError(`list_${this.prefix}`);

        const numberForms = document.getElementById(`id_${this.prefix}-TOTAL_FORMS`).value;

        for (let i = 0; i < numberForms; i++) {
            let formData = {};

            this.fields.forEach((field) => {
                let inputName = field;
                if (Array.isArray(field)) {
                    inputName = field[1];
                    field = field[0];
                }

                let searchString = `id_${this.prefix}-${i}-${inputName}`;
                let input = document.querySelector(`#${searchString}`);


                let value;
                
                if (input) {
                    value = input.value;

                    if (input.type === 'checkbox' || input.type === 'radio') {
                        value = input.checked;
                    }
                }

                

                if (!value && this.requiredFields.includes(field)) {
                    this.errors[searchString] = 'Este campo es requerido';
                    return;
                }

                
                if (typeof this[`validate_${field}`] === 'function') {
                    value = this[`validate_${field}`](this.data, value);
                }
                
                if (!value) return;

                if (this.uniqueValues.includes(field)) {
                    this.validateUniqueValues(input, inputName, false);
                }

                if (this.regex[field] && !this.validateRegex(value, this.regex[field])) {

                    this.errors[searchString] = 'El formato no es válido';
                }
                console.log('animooooo');
                formData[field] = value;
            });

            if (typeof this[`validate`] === 'function') {
                this.data = this[`validate`](this.data);
            }

            if (Object.keys(formData).length == 0) {
                return 
            }

            this.data.push(formData);
        
        }

        if (Object.keys(this.errors).length > 0) {

                
            return this.errors;
        }

        return this.data;
    }
}
