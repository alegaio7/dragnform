import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetText extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_TEXT, fragment);

        this._minLength = 0;
        this._maxLength = 0;
        this.minLengthValidationMessage = "";
        this.maxLengthValidationMessage = "";
        this.pattern = null;
        this.patternValidationMessage = "";

        var v = this._findValidation("minLength");
        if (v) {
            this._minLength = (typeof v.value === "number" ? v.value : 0);
            if (this._minLength < 0 || this._minLength > constants.WIDGET_TYPE_TEXT_MAX_LENGTH)
                throw new Error(`Widget ${this.id}: minLength must be greater than or equal to 0.`);
            this.minLengthValidationMessage = v.message;
        }

        v = this._findValidation("maxLength");
        if (v) {
            this._maxLength = (typeof v.value === "number" ? v.value : 0);
            if (this._maxLength < 0 || this._maxLength > constants.WIDGET_TYPE_TEXT_MAX_LENGTH)
                throw new Error(`Widget ${this.id}: minLength must be less than or equal to ${constants.WIDGET_TYPE_TEXT_MAX_LENGTH}`);
            this.maxLengthValidationMessage = v.message;
        }

        v = this._findValidation("pattern");
        if (v) {
            let p = Widget.getRegexPattern(v.value);
            if (!p)
                throw new Error(`Widget ${this.id}: pattern not found: ${v.value}`);
            this.pattern = p;
            this.patternValidationMessage = v.message ?? Strings.WidgetValidation_PatternMessage;
        }
    }

    get minLength() { return this._minLength; }
    set minLength(value) {
        this._minLength = value;
        this.refresh();
    }

    get maxLength() { return this._maxLength; }
    set maxLength(value) {
        this._maxLength = value;
        this.refresh();
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {validations: [
            { type: "minLength", value: this.minLength, message: this.minLengthValidationMessage },
            { type: "maxLength", value: this.maxLength, message: this.maxLengthValidationMessage },
            { type: "required", value: this.required, message: this.requiredValidationMessage },
        ]};

        if (this.pattern)
            localProps.validations.push({ type: "pattern", value: this.pattern.name, message: this.pattern.message });

        localProps.value = this.value ?? null;
        Object.assign(json, localProps);
        return json;
    }
    
    getEditorProperties() {
        var props = super.getEditorProperties();

        props.push(
            { name: "minLength", type: "number", elementId: "txtWidgetPropMinLength", value: this.minLength },
            { name: "maxLength", type: "number", elementId: "txtWidgetPropMaxLength", value: this.maxLength },
            { name: "required", type: "boolean", elementId: "chkWidgetPropRequired", value: this.required },
        );
        return props;
    }

    async getPropertiesEditorTemplate() {
        var baseName = "widget-text";
        var html = await (await fetch(`/editors/${baseName}.editor.html`)).text();
        var replacements = this._getCommonEditorPropertyReplacements();

        replacements.labelMinLength = Strings.WidgetEditor_Text_Widget_MinLength;
        replacements.labelMaxLength = Strings.WidgetEditor_Text_Widget_MaxLength;

        return {
            baseName: baseName,
            handlingClassName: "WidgetTextPropertiesEditor",
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
                if (this.minLength !== null)
                    input.setAttribute("minlength", this.minLength);
                else
                    input.removeAttribute("minlength");

                if (this.maxLength > 0)
                    input.setAttribute("maxlength", this.maxLength);
                else
                    input.removeAttribute("maxlength");
            });
        }

        var beforeMarks = this._el.querySelectorAll(".required-mark[data-position='before']");
        var afterMarks = this._el.querySelectorAll(".required-mark[data-position='after']");
        if (this.required && this.requiredAttributeSettings && this.requiredAttributeSettings.mark) {
            beforeMarks.forEach(m => m.style.display = this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE ? "inline" : "none");
            afterMarks.forEach(m => m.style.display = this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER ? "inline" : "none");
        } else {
            beforeMarks.forEach(m => m.style.display = "none");
            afterMarks.forEach(m => m.style.display = "none");
        }
    }

    /// <summary>
    /// Generates the markup for the input control used in design and run modes. 
    /// The markup for view mode is generated by the base class.
    /// </summary>
    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var inputIdDesign = `input_design_${this.id}`;
        var inputIdRun = `input_run_${this.id}`;
        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasMaxLength: (typeof this.maxLength === "number" && this.maxLength >= 0),
            hasMinLength: (typeof this.minLength === "number" && this.minLength >= 0),
            hasName: this.name ? true : false,
            hasTip: this.widgetRenderOptions.renderTips && this.tip,
            hasValue: this.value ? true : false,
            id: this.id,
            inputClass: this.globalClasses.input ?? "",
            inputIdDesign: inputIdDesign,
            inputIdRun: inputIdRun,
            label: this.label,
            mark: this.requiredAttributeSettings.mark,
            maxLength: this.maxLength,
            minLength: this.minLength,
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

        var html = await super._loadWidgetTemplate("widget-text", replacements);
        super._renderDOM(container, parser, html);
    }

    get value() { return super.value; }
    set value(value) {
        super.value = value;
    }

    validate(validationOptions) {
        this.clearError();
        var input = this._el.querySelector(`[data-show-when="run"] input`);
        var r = super._validateInputCtl(input);

        // if base validation ok, validate text-specific properties
        if (r.result) {
            if (input.value) {
                if (this.minLength !== null && input.value.length < this.minLength)
                    r = { result: false, message: this.minLengthValidationMessage };
                else if (this.maxLength > 0 && input.value.length > this.maxLength)
                    r = { result: false, message: this.maxLengthValidationMessage };
                else if (this.pattern && !this.pattern.regex.test(input.value))
                    r = { result: false, message: this.patternValidationMessage };
            }
        }

        if (validationOptions && validationOptions.showErrors && !r.result)
            this.setError(r);
        return r;
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************
}

export default WidgetText;