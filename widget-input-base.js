import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetInputBase extends Widget {
    constructor(widgetType, fragment) {
        super(widgetType, fragment);

        if (!fragment)
        fragment = {};
        
        // defaults
        this.required = fragment.required === true ? true : false;
        this.requiredMessage = fragment.requiredMessage ?? constants.WIDGET_VALIDATION_REQUIRED;

        var _t = this;
        if (fragment.validations && fragment.validations.length) {
            fragment.validations.forEach(v => {
                if (v.type === `required`) {
                    _t.required = true;
                    if (v.message)
                        _t.requiredMessage = v.message;
                }
            });
        }
    }

    render(container, parser, widgetRenderOptions) {
        if (!widgetRenderOptions)
            widgetRenderOptions = {};
        if (widgetRenderOptions.renderMode === constants.WIDGET_MODE_VIEW) {
            var html;
            var template = super._getHTMLTemplate(widgetRenderOptions);
            var labelHtml = this._getLabelHTML(widgetRenderOptions);
            var v = this.value;
            if (this.value === null || this.value === undefined)
                v = widgetRenderOptions.nullValue ? widgetRenderOptions.nullValue : "";
            html = `${labelHtml ? labelHtml : ""}
                <span ${this.globalClasses.span ? 'class="' + this.globalClasses.span + '"' : ""}
                id="input_${this.id}">${v}</span>`;
            template.bodySection = html;
            super._renderInternal(container, template, parser, widgetRenderOptions);
        }
    }
    
    _getLabelHTML(widgetRenderOptions) {
        if (!this.label)
            return "";

        // widget global class already handled in base class
        var labelClass = "";
        if (this.globalClasses.label)
            labelClass = `class="${this.globalClasses.label}"`;
        
        var html = `<label ${labelClass} for="input_${this.id}">`;
        var reqMarkHtml = `<span class="required-mark">${this.requiredAttributeSettings.mark}</span>`;
        if (this.required && 
            (widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN || widgetRenderOptions.renderMode === constants.WIDGET_MODE_RUN) &&
            this.requiredAttributeSettings.mark && 
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE)
            html  += reqMarkHtml;

        html  += `${this.label}`

        if (this.required && 
            (widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN || widgetRenderOptions.renderMode === constants.WIDGET_MODE_RUN) && 
            this.requiredAttributeSettings.mark && 
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            html  += reqMarkHtml;

        html  += `</label>`;

        return html;
    }

    _validateInputCtl(input) {
        var r;
        var validations = this.validations;
        if (!input) {
            r = { result: false, message: `Widget ${this.id}: input not found` };
        }
        else if (!input.value) {
            var rv = validations.find(x => x.type === "required");
            if (rv)
                r = { result: false, message: this.requiredMessage };
        }

        if (!r)
            r = { result: true };

        return r;
    }
}

export default WidgetInputBase;