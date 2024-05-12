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
                    v.value = n;
                }
            });
        }
    }

    get min() { return this._findValidation("min")?.value; }
    get minValidationMessage() { return this._findValidation("min")?.message; }
    get max() { return this._findValidation("max")?.value; }
    get maxValidationMessage() { return this._findValidation("max")?.message; }

    exportJson() {
        var json = super.exportJson();
        var localProps = {validations: this.validations};
        if (!isNaN(this.value) && this.value !== null && this.value !== undefined)
            localProps.value = this.value;
        Object.assign(json, localProps);
        return json;
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var inputIdDesign = `input_design_${this.id}`;
        var inputIdRun = `input_run_${this.id}`;
        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasMax: (typeof this.min === 'number'),
            hasMin: (typeof this.max === 'number'),
            hasName: this.name ? true : false,
            hasTip: this.widgetRenderOptions.renderTips && this.tip,
            hasValue: this.value ? true : false,
            id: this.id,
            inputClass: this.globalClasses.input ?? "",
            inputIdDesign: inputIdDesign,
            inputIdRun: inputIdRun,
            label: this.label,
            mark: this.requiredAttributeSettings.mark,
            max: this.max,
            min: this.min,
            mode: constants.WIDGET_MODE_DESIGN,
            labelClass: this.globalClasses.label ?? "",
            required: this.required,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            showRequiredMarkAfter: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER,
            showRequiredMarkBefore: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE,
            spanClass: this.globalClasses.span ?? "",
            style: this._buildStyleAttribute(),
            type: this.type,
            value: this.value,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-number", replacements);
        super._renderDOM(container, parser, html);
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
        this.clearError();
        var input = this._el.querySelector(`[data-show-when="run"] input`);
        var r = super._validateInputCtl(input);

        // if base validation ok, validate text-specific properties
        if (r.result) {
            if (input.value) {
                var n = parseInt(input.value, 10);
                if (typeof this.min === "number" && n < this.min)
                    r = { result: false, message: this.minValidationMessage };
                else if (typeof this.max === "number" && n > this.max)
                    r = { result: false, message: this.maxValidationMessage };
            }
        }

        if (validateOptions && validateOptions.showErrors && !r.result)
            this.setError(r);
        return r;
    }
}

export default WidgetNumber;