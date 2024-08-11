import Widget from "./widget-base.js";
import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";
import functions from './functions.js';

class WidgetText extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_TEXT, fragment);

        this._textTransform = constants.TEXT_TRANSFORM_NONE;
        if (fragment.textTransform && constants.textTransformations.indexOf(fragment.textTransform) >= 0)
            this._textTransform = fragment.textTransform;

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

    get textTransform() { return this._textTransform; }
    set textTransform(value) {
        if (constants.textTransformations.indexOf(value) < 0)
            return;
        this._textTransform = value;
        if (this.value) {
            if (value === constants.TEXT_TRANSFORM_UPPERCASE)
                this.value = this.value.toUpperCase();
            else if (value === constants.TEXT_TRANSFORM_LOWERCASE)
                this.value = this.value.toLowerCase();
            else if (value === constants.TEXT_TRANSFORM_TITLECASE)
                this.value = functions.titleCase(this.value);
        }
        this.refresh();
        this._updateContols();
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {
            validations: [
                { type: "minLength", value: this.minLength, message: this.minLengthValidationMessage },
                { type: "maxLength", value: this.maxLength, message: this.maxLengthValidationMessage },
                { type: "required", value: this.required, message: this.valueRequiredValidationMessage }
            ]
        };

        localProps.textTransform = this.textTransform;
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
            { name: "minLengthValidationMessage", type: "string", elementId: "txtWidgetPropMinLengthValidationMessage", value: this.minLengthValidationMessage },
            { name: "maxLength", type: "number", elementId: "txtWidgetPropMaxLength", value: this.maxLength },
            { name: "maxLengthValidationMessage", type: "string", elementId: "txtWidgetPropMaxLengthValidationMessage", value: this.maxLengthValidationMessage },
            { name: "required", type: "boolean", elementId: "chkWidgetPropRequired", value: this.required },
            { name: "textTransform", type: "multiple", elementIds: ["optTextTransformationNone", "optTextTransformationUppercase", "optTextTransformationLowercase", "optTextTransformationTitlecase"], value: this.textTransform },
            { name: "valueRequiredValidationMessage", type: "string", elementId: "txtWidgetPropRequiredValidationMessage", value: this.valueRequiredValidationMessage }
        );
        return props;
    }

    async getPropertiesEditorTemplate() {
        var props = await this._getPropertiesEditorTemplateCore("widget-text", "WidgetTextPropertiesEditor");
        var replacements = props.replacements;

        replacements.labelMinLength = Strings.WidgetEditor_Text_Widget_MinLength;
        replacements.labelMinLengthValidationMessage = Strings.WidgetEditor_Text_Widget_MinLengthValidationMessage;
        replacements.labelMaxLength = Strings.WidgetEditor_Text_Widget_MaxLength;
        replacements.labelMaxLengthValidationMessage = Strings.WidgetEditor_Text_Widget_MaxLengthValidationMessage;
        replacements.labelValueRequiredValidationMessage = Strings.WidgetEditor_Common_Widget_ValueRequiredMessage;

        replacements.labelTextTransformations = Strings.Widget_Text_Text_Transformations;
        replacements.labelTextTransformationsNone = Strings.Widget_Text_Text_TransformationsNone;
        replacements.labelTextTransformationsUpper = Strings.Widget_Text_Text_TransformationsUpper;
        replacements.labelTextTransformationsLower = Strings.Widget_Text_Text_TransformationsLower;
        replacements.labelTextTransformationsTitle = Strings.Widget_Text_Text_TransformationsTitle;

        return props;
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

        this._el.classList.remove("widget-text-transform-none", "widget-text-transform-uppercase", "widget-text-transform-lowercase", "widget-text-transform-titlecase");
        if (this.textTransform === constants.TEXT_TRANSFORM_UPPERCASE)
            this._el.classList.add("widget-text-transform-uppercase");
        else if (this.textTransform === constants.TEXT_TRANSFORM_LOWERCASE)
            this._el.classList.add("widget-text-transform-lowercase");
        else if (this.textTransform === constants.TEXT_TRANSFORM_TITLECASE)
            this._el.classList.add("widget-text-transform-titlecase");
        else
            this._el.classList.add("widget-text-transform-none");

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
            hasTip: this.widgetRenderOptions.renderTips,
            hasValue: this.value ? true : false,
            id: this.id,
            inputClass: this.globalClasses.input ?? "",
            inputIdDesign: inputIdDesign,
            inputIdRun: inputIdRun,
            label: this.label,
            labelClass: this.globalClasses.inputLabel ?? "",
            mark: this.requiredAttributeSettings.mark,
            maxLength: this.maxLength,
            maxLengthValidationMessage: this.maxLengthValidationMessage,
            minLength: this.minLength,
            minLengthValidationMessage: this.minLengthValidationMessage,
            mode: constants.WIDGET_MODE_DESIGN,
            required: this.required,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            showRequiredMarkAfter: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER,
            showRequiredMarkBefore: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE,
            style: this._buildOuterStyleAttribute(),
            type: this.type,
            value: this.value,
            valueControlClass: this.globalClasses.valueControl ?? "",
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

    _updateContols() {
        super._updateContols();
        // _el can be null if element was not rendered yet
        if (this._el) {
            var viewModeValue = this._el.querySelector(`span[data-part="value"]`);
            if (viewModeValue)
                viewModeValue.innerHTML = this.value ? this.value : "&nbsp;";   // render nbsp so to keep the height of the element
        }
    }
}

export default WidgetText;