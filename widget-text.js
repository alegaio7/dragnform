import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetText extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_TEXT, fragment);

        // check validations
        var vals = this.validations;
        if (vals.length) {
            vals.forEach(v => {
                if (v.type === "minLength" || v.type === "maxLength") {
                    let n = parseInt(v.value);
                    if (!(n >= 0)) {
                        if (v.type === "minLength")
                            throw new Error(`Widget ${this.id}: minLength must be greater than or equal to 0.`);
                        else if (v.type === "maxLength")
                            throw new Error(`Widget ${this.id}: minLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
                    }

                    if (!(n <= constants.WIDGET_TYPE_TEXT_MAX_LENGTH)) {
                        if (v.type === "minLength")
                            throw new Error(`Widget ${this.id}: minLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
                        else if (v.type === "maxLength")
                            throw new Error(`Widget ${this.id}: maxLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
                    }
                
                } else if (v.type === "pattern") {
                    let p = Widget.getRegexPattern(v.value);
                    if (!p)
                        throw new Error(`Widget ${this.id}: pattern not found: ${v.value}`);
                    v.pattern = p;
                }
            });
        }
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {validations: this.validations};
        if (localProps.validations && localProps.validations.length) {
            localProps.validations.forEach(v => {
                if (v.type === "pattern" && v.pattern)
                    delete v.pattern;  // delete object created in .ctor
            });
        }
        if (this.value)
            localProps.value = this.value;
        Object.assign(json, localProps);
        return json;
    }

    render(container, parser, widgetRenderOptions) {
        if (!widgetRenderOptions)
            widgetRenderOptions = {};
        if (widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN ||
            widgetRenderOptions.renderMode === constants.WIDGET_MODE_RUN) {
                var template = super._getHTMLTemplate(widgetRenderOptions);
                var labelHtml = super._getLabelHTML(widgetRenderOptions);
                widgetRenderOptions.renderValidationSection = true;
                var html = `${labelHtml ? labelHtml : ""}
                    <input type="text" 
                    id="input_${this.id}" 
                    ${this.globalClasses.input ? 'class="' + this.globalClasses.input + '"' : ""}
                    ${this.validations.minLength ? 'minlength="' + this.validations.minLength + '"' : ""}
                    ${this.validations.maxLength ? 'maxlength="' + this.validations.maxLength + '"' : ""}
                    ${this.validations.required ? 'required' : ""}
                    ${this.value ? 'value="' + this.value + '"' : ""}
                    ${this.name ? 'name="' + this.name + '"' : ""}
                    >`;
                template.bodySection = html;
                super._renderInternal(container, template, parser, widgetRenderOptions);

                var _t = this;
                this._el.querySelector("input").addEventListener("blur", function(e) {
                    _t.setValue(e.currentTarget.value, false);
                });
        } else if (widgetRenderOptions.renderMode === constants.WIDGET_MODE_VIEW) {
            super.render(container, parser, widgetRenderOptions);
        }
    }

    setValue(v, setCtlValue) {
        if (setCtlValue !== false)
            setCtlValue = true;
        this._value = v;
        // _el can be null if element was not rendered yet
        if (setCtlValue && this._el)
            this._el.querySelector("input").value = this._value;
    }

    validate(validateOptions) {
        super.clearError();
        var input = this._el.querySelector(`input`);
        var r = super._validateInputCtl(input);

        // if base validation ok, validate text-specific properties
        if (r.result) {
            if (input.value) {
                this.validations.forEach(v => {
                    if (v.type === "minLength") {
                        if (input.value.length < v.value)
                            r = { result: false, message: v.message };
                    } else if (v.type === "maxLength") {
                        if (input.value.length > v.value)
                            r = { result: false, message: v.message };
                    } else if (v.type === "pattern" && v.pattern) {
                        if (!v.pattern.regex.test(input.value))
                            r = { result: false, message: v.message };
                    }
                });
            }
        }
        if (validateOptions && validateOptions.showErrors && !r.result)
            super.setError(r);
        return r;
    }
}

export default WidgetText;