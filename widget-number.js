import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetNumber extends WidgetInputBase {
    constructor(options) {
        super(constants.WIDGET_NUMBER, options);

        if (!options)
            options = {};
        
        var _t = this;
        // defaults
        this.min = 0;
        this.minValueMessage = constants.WIDGET_VALIDATION_MIN_VALUE;
        this.max = constants.WIDGET_NUMBER_MAX;
        this.maxValueMessage = constants.WIDGET_VALIDATION_MAX_VALUE;
        // required handled in parent class

        // check validations
        if (options.validations && options.validations.length) {
            options.validations.forEach(v => {
                if (v.type === `min`) {
                    _t.min = parseInt(v.value);
                    if (v.message)
                        _t.minValueMessage = v.message;
                }
                else if (v.type === `max`) {
                    _t.max = parseInt(v.value);
                    if (v.message)
                        _t.maxValueMessage = v.message;
                }
            });
        }

        if (this.min === isNaN || this.min === undefined || this.min === null)
            throw new Error(`Number Widget ${this.id}: min must be a valid number`);
        
        if (this.max === isNaN || this.max === undefined || this.max === null)
            throw new Error(`Number Widget ${this.id}: max must be a valid number`);
            
        this._el = null;
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        renderOptions.renderValidationSection = true;
        var template = super._getHTMLTemplate(renderOptions);
        var labelHtml = super._getLabelHTML();
        var inputClass = "";
        if (this.options.globalClasses && this.options.globalClasses.input)
            inputClass = `class="${this.options.globalClasses.input}"`;
        var inputHtml = `<input ${inputClass} type="number" id="input_${this.id}" name="${this.name}" min="${this.min}" max="${this.max}"`;
        if (this.required)
            inputHtml += ` required`;
        inputHtml += '>';

        template.bodySection = labelHtml + inputHtml;
        super._renderBase(container, template, parser, renderOptions);
    }

    validate(options) {
        super.clearError();
        var input = this._el.querySelector(`input`);
        var r = super._validateInputCtl(input, options);

        // if base validation ok, validate number-specific properties
        if (r.result) {
            var n = parseInt(input.value, 10);
            if (n === isNaN || n === undefined || n === null)
                r = { result: false, message: this.requiredMessage };
            else if (n > this.max)
                r = { result: false, message: this.maxValueMessage };
            else if (n < this.min)
                r = { result: false, message: this.minValueMessage };
        }
        if (options && options.showErrors && !r.result)
            super.setError(r);
        return r;
    }
}

export default WidgetNumber;