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

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        if (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN ||
            renderOptions.renderMode === constants.WIDGET_MODE_RUN) {
                renderOptions.renderValidationSection = true;
                var template = super._getHTMLTemplate(renderOptions);
                var labelHtml = super._getLabelHTML(renderOptions);
                var html = `${labelHtml ? labelHtml : ""}
                    <input type="number" 
                    id="input_${this.id}" 
                    ${this.globalClasses.input ? 'class="' + this.globalClasses.input + '"' : ""}
                    min="${this.validations.min}"
                    max="${this.validations.max}"
                    ${this.validations.required ? 'required' : ""}
                    ${!isNaN(this.value) ? 'value="' + this.value + '"' : ""}
                    ${this.name ? 'name="' + this.name + '"' : ""}
                    >`;
                template.bodySection = html;
                super._renderInternal(container, template, parser, renderOptions);

                var _t = this;
                this._el.querySelector("input").addEventListener("blur", function(e) {
                    _t.setValue(e.currentTarget.value, false);
                });
        } else {
            super.render(container, parser, renderOptions);
        }
    }

    setValue(v, setCtlValue) {
        if (setCtlValue !== false)
            setCtlValue = true;

        if (v === null || v === undefined || v === "" || isNaN(v))
            this._value = null;
        else {
            var n = parseInt(v, 10);
            if (isNaN(n) || n === undefined || n === null)
                throw new Error(`Widget ${this.id}: value must be a valid number`);
            this._value = n;
        }
        // _el can be null if element was not rendered yet
        if (setCtlValue && this._el)
            this._el.querySelector("input").value = this._value;
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