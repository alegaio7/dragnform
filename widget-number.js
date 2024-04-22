import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetNumber extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_NUMBER, fragment);

        // check validations
        var vals = this.validations;
        if (vals.length) {
            vals.forEach(v => {
                if (v.type === "min" || v.type === "max") {
                    let n = parseInt(v.value);
                    if (isNaN(n) || n === undefined || n === null) {
                        if (v.type === "min")
                            throw new Error(`Widget ${this.id}: min must be a valid number`);
                        else if (v.type === "max")
                            throw new Error(`Widget ${this.id}: max must be a valid number`);
                    }
                }
            });
        }
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {validations: this.validations};
        if (!isNaN(this.value) && this.value !== null && this.value !== undefined)
            localProps.value = this.value;
        Object.assign(json, localProps);
        return json;
    }

    render(container, parser) {
        var labelHtml = super._getLabelHTML();
        var bodyhtml = `${labelHtml ? labelHtml : ""}
            <input type="text" 
            id="{0}" 
            ${this.globalClasses.input ? 'class="' + this.globalClasses.input + '"' : ""}
            ${this.validations.minLength ? 'minlength="' + this.validations.minLength + '"' : ""}
            ${this.validations.maxLength ? 'maxlength="' + this.validations.maxLength + '"' : ""}
            ${this.validations.required ? 'required' : ""}
            ${this.value ? 'value="' + this.value + '"' : ""}
            ${this.name ? 'name="' + this.name + '"' : ""}
            >`;

        super._renderInternal(container, parser, bodyhtml);
    }

    get value() { return super.value; }
    set value(value) {
        if (value === null || value === undefined || value === "" || isNaN(value))
            super.value = null;
        else {
            var n = parseInt(value, 10);
            if (isNaN(n) || n === undefined || n === null)
                throw new Error(`Widget ${this.id}: value must be a valid number`);
            super.value = n;
        }
    }

    validate(validateOptions) {
        super.clearError();
        var input = this._el.querySelector(`input`);
        var r = super._validateInputCtl(input);

        // if base validation ok, validate number-specific properties
        if (r.result) {
            var n = parseInt(input.value, 10);
            this.validations.forEach(v => {
                if (v.type === "min") {
                    if (isNaN(n) || n < v.value)
                        r = { result: false, message: v.message };
                } else if (v.type === "max") {
                    if (isNaN(n) || n > v.value)
                        r = { result: false, message: v.message };
                }
            });
        }
        if (validateOptions && validateOptions.showErrors && !r.result)
            super.setError(r);
        return r;
    }
}

export default WidgetNumber;