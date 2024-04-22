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

    /// <summary>
    /// Base rendering logic for input widgets (text, number, etc).
    /// </summary>
    _renderInternal(container, parser, bodyhtml) {
        var template = super._getHTMLTemplate();
        var v = this.value;
        if (this.value === null || this.value === undefined)
            v = this.widgetRenderOptions.nullValue ? this.widgetRenderOptions.nullValue : "";
    
        template.designMode.bodySection = bodyhtml.replace("{0}", `input_design_${this.id}`); 
        template.runMode.bodySection = bodyhtml.replace("{0}", `input_run_${this.id}`);
    
        // view mode body
        var labelHtml = this._getLabelHTML();
        bodyhtml = `${labelHtml ? labelHtml : ""}
            <span data-part="value" ${this.globalClasses.span ? 'class="' + this.globalClasses.span + '"' : ""}>${v}</span>`;
        template.viewMode.bodySection = bodyhtml;

        super._renderInternal(container, template, parser);
        super._updateUI();
        this._updateContols();

        var _t = this;
        var input = this._el.querySelector("input");
        if (input)
            input.addEventListener("blur", function(e) {
                _t.value = e.currentTarget.value;
            });
    }

    _getLabelHTML() {
        if (!this.label)
            return "";

        // widget global class already handled in base class
        var labelClass = "";
        if (this.globalClasses.label)
            labelClass = `class="${this.globalClasses.label}"`;
        
        var html = `<label ${labelClass} for="{0}">`;
        var reqMarkHtml = `<span class="required-mark">${this.requiredAttributeSettings.mark}</span>`;
        if (this.required && 
            this.requiredAttributeSettings.mark && 
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE)
            html  += reqMarkHtml;

        html  += `${this.label}`

        if (this.required && 
            this.requiredAttributeSettings.mark && 
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            html  += reqMarkHtml;

        html  += `</label>`;

        return html;
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var inputs = this._el.querySelectorAll("input");
            if (inputs && inputs.length) {
                inputs.forEach(input => {
                    input.value = this.value;
                });
            }

            var viewModeValue = this._el.querySelector(`span[data-part="value"]`);
            if (viewModeValue)
                viewModeValue.innerHTML = this.value;
        }
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