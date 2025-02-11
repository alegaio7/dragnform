import * as constants from './constants.js';
import WidgetInputBase from "./widget-input-base.js";

class WidgetEmail extends WidgetInputBase {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_EMAIL, fragment);
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {
            validations: [
                { type: "required", value: this.required, message: this.valueRequiredValidationMessage }
            ]
        };

        localProps.value = this.value ?? null;
        Object.assign(json, localProps);
        return json;
    }
    
    getEditorProperties() {
        var props = super.getEditorProperties();

        props.push(
            { name: "required", type: "boolean", elementId: "chkWidgetPropRequired", value: this.required },
            { name: "valueRequiredValidationMessage", type: "string", elementId: "txtWidgetPropRequiredValidationMessage", value: this.valueRequiredValidationMessage }
        );
        return props;
    }

    async getPropertiesEditorTemplate() {
        var props = await this._getPropertiesEditorTemplateCore("widget-email", "WidgetEmailPropertiesEditor");
        var replacements = props.replacements;
        replacements.labelValueRequiredValidationMessage = Strings.WidgetEditor_Common_Widget_ValueRequiredMessage;
        return props;
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;

        super.refresh();
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
            mode: constants.WIDGET_MODE_DESIGN,
            name: this.name,
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

        var html = await super._loadWidgetTemplate("widget-email", replacements);
        super._renderDOM(container, parser, html);
    }

    get value() { return super.value; }
    set value(value) {
        super.value = value;
    }

    validate(validationOptions) {
        super._beforeValidation();
        this.clearError();
        var input = this._el.querySelector(`[data-show-when="run"] input`);
        var r = super._validateInputCtl(input);

        if (r.result) {
            const regex = constants.WIDGET_VALIDATION_EMAIL_REGEX;
            if (!regex.test(input.value)) {
                r = { result: false, message: Strings.Widget_Email_Invalid_Email_Format };
            }
        }

        if (validationOptions && validationOptions.showErrors && !r.result)
            this.setError(r);
        super._afterValidation(r);
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

export default WidgetEmail;