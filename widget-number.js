import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetNumber extends WidgetInputBase {
    constructor(options) {
        super(constants.WIDGET_TYPE_NUMBER, options);

        if (!options)
            options = {};
        
        var _t = this;

        // defaults
        this.min = 0;
        this.minValueMessage = constants.WIDGET_VALIDATION_MIN_VALUE;
        this.max = constants.WIDGET_TYPE_NUMBER_MAX;
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
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        renderOptions.renderValidationSection = true;
        var template = super._getHTMLTemplate(renderOptions);
        var labelHtml = super._getLabelHTML(renderOptions);
        if (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN) {
            var inputClass = "";
            if (this.options.globalClasses && this.options.globalClasses.input)
                inputClass = `class="${this.options.globalClasses.input}"`;
            var html = `<input ${inputClass} type="number" id="input_${this.id}" name="${this.name}" min="${this.min}" max="${this.max}"`;
            if (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN && this.required)
                html += ` required`;
            if (!isNaN(this._value))
                html += ` value="${this._value}"`;
            html += '>';
        } else {
            var v = this._value;
            if (this._value === null || this._value === undefined)
                v = renderOptions.nullValue ? renderOptions.nullValue : "";
            var spanClass = "";
            if (this.options.globalClasses && this.options.globalClasses.span)
                spanClass = `class="${this.options.globalClasses.span}"`;
            html = `<span ${spanClass} id="input_${this.id}">${v}</span>`;
        }
        template.bodySection = labelHtml + html;
        super._renderBase(container, template, parser, renderOptions);
    }

    setValue(v) {
        if (v === null || v === undefined || v === "" || v === isNaN)
            this._value = null;
        else {
            var n = parseInt(v, 10);
            if (n === isNaN || n === undefined || n === null)
                throw new Error(`Widget ${this.id}: value must be a valid number`);
            this._value = n;
        }
        // _el can be null if element was not rendered yet
        if (this._el)
            this._el.value = this._value;
    }

    validate(validateOptions) {
        super.clearError();
        var input = this._el.querySelector(`input`);
        var r = super._validateInputCtl(input, validateOptions);

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
        if (validateOptions && validateOptions.showErrors && !r.result)
            super.setError(r);
        return r;
    }
}

export default WidgetNumber;