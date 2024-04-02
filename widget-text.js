import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetText extends WidgetInputBase {
    constructor(options) {
        super(constants.WIDGET_TYPE_TEXT, options);

        if (!options)
            options = {};
        
        var _t = this;

        // text widget defaults
        this.minLength = 0;
        this.minLengthMessage = constants.WIDGET_VALIDATION_MIN_LENGTH;
        this.maxLength = constants.WIDGET_TYPE_TEXT_MAX_LENGTH;
        this.maxLengthMessage = constants.WIDGET_VALIDATION_MAX_LENGTH;
        this.pattern = null; // this is not a regex, but an object containing a regex and a validation message
        this.patternMessage = null;
        this.required = false;

        // check validations
        if (options.validations && options.validations.length) {
            options.validations.forEach(v => {
                if (v.type === `required`) {
                    _t.required = true;
                    if (v.message)
                        _t.requiredMessage = v.message;
                }
                else if (v.type === `minLength`) {
                    _t.minLength = parseInt(v.value);
                    if (v.message)
                        _t.minLengthMessage = v.message;
                }
                else if (v.type === `maxLength`) {
                    _t.maxLength = parseInt(v.value);
                    if (v.message)
                        _t.maxLengthMessage = v.message;
                }
                else if (v.type === `pattern`) {
                    let p = Widget.getRegexPattern(v.value);
                    if (!p)
                        throw new Error(`Widget ${this.id}: pattern not found: ${v.value}`);
                    _t.pattern = p;
                    _t.patternMessage = p.validationMessage;
                    if (v.message)
                        _t.patternMessage = v.message;
                }
            });
        }

        if (!(this.minLength >= 0))
            throw new Error(`Widget ${this.id}: minLength must be greater than or equal to 0.`);
        if (!(this.maxLength <= constants.WIDGET_TYPE_TEXT_MAX_LENGTH))
            throw new Error(`Widget ${this.id}: minLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
        
        if (!(this.maxLength >= 0))
            throw new Error(`Widget ${this.id}: maxLength must be greater than or equal to 0`);
        if (!(this.maxLength <= constants.WIDGET_TYPE_TEXT_MAX_LENGTH))
            throw new Error(`Widget ${this.id}: maxLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        if (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN ||
            renderOptions.renderMode === constants.WIDGET_MODE_RUN) {
                var html;
                var template = super._getHTMLTemplate(renderOptions);
                var labelHtml = super._getLabelHTML(renderOptions);
                renderOptions.renderValidationSection = true;
                html = `${labelHtml ? labelHtml : ""}
                <input type="text" 
                id="input_${this.id}" 
                ${(this.options.globalClasses && this.options.globalClasses.input) ? 'class="' + this.options.globalClasses.input + '"' : ""}
                ${this.minLength ? 'minlength="' + this.minLength + '"' : ""}
                ${this.maxLength ? 'maxlength="' + this.maxLength + '"' : ""}
                ${this.required ? 'required' : ""}
                ${this._value ? 'value="' + this._value + '"' : ""}
                ${this.name ? 'name="' + this.name + '"' : ""}
                >`
                template.bodySection = html;
                super._renderBase(container, template, parser, renderOptions);
        } else if (renderOptions.renderMode === constants.WIDGET_MODE_VIEW) {
            super.render(container, parser, renderOptions);
        }
    }

    setValue(v) {
        this._value = v;
        // _el can be null if element was not rendered yet
        if (this._el)
            this._el.value = this._value;
    }

    validate(validateOptions) {
        super.clearError();
        var input = this._el.querySelector(`input`);
        var r = super._validateInputCtl(input, validateOptions);

        // if base validation ok, validate text-specific properties
        if (r.result) {
            if (input.value) {
                if (this.minLength && input.value.length < this.minLength)
                    r = { result: false, message: this.minLengthMessage };
                else if (this.maxLength && input.value.length > this.maxLength)
                    r = { result: false, message: this.maxLengthMessage };
                else if (this.pattern && !this.pattern.value.test(input.value))
                    r = { result: false, message: this.patternMessage };
            }
        }
        if (validateOptions && validateOptions.showErrors && !r.result)
            super.setError(r);
        return r;
    }
}

export default WidgetText;