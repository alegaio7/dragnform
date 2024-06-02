import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetNumber extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_NUMBER, fragment);

        this._min = 0;
        this._max = 0;
        this.minValidationMessage = "";
        this.maxValidationMessage = "";

        var v = this._findValidation("min");
        if (v) {
            this._min = typeof v.value === "number" ? v.value : null;
            this.minValidationMessage = v.message;
        }

        v = this._findValidation("max");
        if (v) {
            this._max = typeof v.value === "number" ? v.value : null;
            this.maxValidationMessage = v.message;
        }
    }

    get min() { return this._min; }
    set min(value) {
        this._min = value;
        this.refresh();
    }

    get max() { return this._max; }
    set max(value) {
        this._max = value;
        this.refresh();
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {validations: [
            { type: "min", value: this.min, message: this.minValidationMessage },
            { type: "max", value: this.max, message: this.maxValidationMessage },
            { type: "required", value: this.required, message: this.requiredValidationMessage },
        ]};
        if (!isNaN(this.value) && this.value !== null && this.value !== undefined)
            localProps.value = this.value;
        Object.assign(json, localProps);
        return json;
    }

    getEditorProperties() {
        var props = super.getEditorProperties();

        props.push(
            { name: "min", type: "number", elementId: "txtWidgetPropMinValue", value: this.min },
            { name: "max", type: "number", elementId: "txtWidgetPropMaxValue", value: this.max },
            { name: "required", type: "boolean", elementId: "chkWidgetPropRequired", value: this.required },
        );
        return props;
    }

    async getPropertiesEditorTemplate() {
        var baseName = "widget-number";
        var html = await (await fetch(`/editors/${baseName}.editor.html`)).text();
        var replacements = this._getCommonEditorPropertyReplacements();

        replacements.labelMinValue = Strings.WidgetEditor_Text_Widget_MinValue;
        replacements.labelMaxValue = Strings.WidgetEditor_Text_Widget_MaxValue;

        return {
            baseName: baseName,
            handlingClassName: "WidgetNumberPropertiesEditor",
            replacements: replacements,
            template: html
        };
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;
        super.refresh();
        var inputs = this._el.querySelectorAll("input");
        if (inputs.length) {
            inputs.forEach(input => {
                if (this.min !== null)
                    input.setAttribute("min", this.min);
                else
                    input.removeAttribute("min");

                if (this.max != null)
                    input.setAttribute("max", this.max);
                else
                    input.removeAttribute("max");
            });
        }
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
            style: this._buildOuterStyleAttribute(),
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