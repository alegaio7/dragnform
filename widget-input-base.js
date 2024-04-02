import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetInputBase extends Widget {
    constructor(widgetType, options) {
        super(widgetType, options);

        if (!options)
            options = {};
        
        // defaults
        this.required = false;
        this.requiredMessage = constants.WIDGET_VALIDATION_REQUIRED;

        var _t = this;
        if (options.validations && options.validations.length) {
            options.validations.forEach(v => {
                if (v.type === `required`) {
                    _t.required = true;
                    if (v.message)
                        _t.requiredMessage = v.message;
                }
            });
        }

        this._el = null;
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        if (renderOptions.renderMode === constants.WIDGET_MODE_VIEW) {
            var html;
            var template = super._getHTMLTemplate(renderOptions);
            var labelHtml = this._getLabelHTML(renderOptions);
            var v = this._value;
            if (this._value === null || this._value === undefined)
                v = renderOptions.nullValue ? renderOptions.nullValue : "";
            html = `${labelHtml ? labelHtml : ""}
                <span ${(this.options.globalClasses && this.options.globalClasses.span) ? 'class="' + this.options.globalClasses.span + '"' : ""}
                id="input_${this.id}">${v}</span>`;
            template.bodySection = html;
            super._renderBase(container, template, parser, renderOptions);
        }
    }
    
    _getLabelHTML(renderOptions) {
        if (!this.label)
            return "";

        // widget global class already handled in base class
        var labelClass = "";
        if (this.options.globalClasses && this.options.globalClasses.label)
            labelClass = `class="${this.options.globalClasses.label}"`;
        
        var html = `<label ${labelClass} for="input_${this.id}">`;
        var reqMarkHtml = `<span class="required-mark">${this.requiredAttributeSettings.requiredMarkText}</span>`;
        if (this.required && 
            (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN || renderOptions.renderMode === constants.WIDGET_MODE_RUN) &&
            this.requiredAttributeSettings.requiredMarkText && 
            this.requiredAttributeSettings.requiredMarkPosition == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE)
            html  += reqMarkHtml;

        html  += `${this.label}`

        if (this.required && 
            (renderOptions.renderMode === constants.WIDGET_MODE_DESIGN || renderOptions.renderMode === constants.WIDGET_MODE_RUN) && 
            this.requiredAttributeSettings.requiredMarkText && 
            this.requiredAttributeSettings.requiredMarkPosition == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            html  += reqMarkHtml;

        html  += `</label>`;

        return html;
    }

    _validateInputCtl(input, validateOptions) {
        var r;
        if (!input) {
            r = { result: false, message: `Widget ${this.id}: input not found` };
        }
        else if (!input.value) {
            if (this.required)
                r = { result: false, message: this.requiredMessage };
        }

        if (!r)
            r = { result: true };

        return r;
    }
}

export default WidgetInputBase;