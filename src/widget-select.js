import Widget from "./widget-base.js";
import * as constants from './constants.js';
import Icons from './icons.js';
import functions from './functions.js';

class WidgetSelect extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_SELECT, fragment);

        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";

        this._selectOptions = fragment.selectOptions ?? [];
        this._checkOptions(this._selectOptions);

        this._required = false;
        this.valueRequiredValidationMessage = Strings.WidgetValidation_RequiredMessage;
        var v = this._findValidation("required");
        if (v) {
            this._required = !!v.value;
            this.valueRequiredValidationMessage = v.message ?? Strings.WidgetValidation_RequiredMessage;
        }
    }
    
    get name() { return this._name; }
    set name(value) {
        this._name = value;
        this.refresh();
    }

    get selectOptions() { return this._selectOptions; }
    set selectOptions(value) {
        this._checkOptions(value);
        this._selectOptions = value;
        this._renderSelectOptionElements();
        this.refresh();
    }

    get required() { return this._required; }
    set required(value) {
        this._required = value;
        this.refresh();
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {};
        localProps.selectOptions = this.selectOptions;
        localProps.value = this.value;
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
        var props = await this._getPropertiesEditorTemplateCore("widget-select", "WidgetSelectPropertiesEditor");
        var replacements = props.replacements;

        replacements.addIcon = Icons.WidgetSelectEditorDialog_AddOptionIcon;
        replacements.addOptionButtonTitle = Strings.WidgetEditor_Select_Add_Option_Button_Title;
        replacements.labelValueRequiredValidationMessage = Strings.WidgetEditor_Common_Widget_ValueRequiredMessage;
        replacements.labelSelectOptions = Strings.Widget_Select_Options_Title;
        replacements.selectOptionTitleLabel = Strings.Widget_Select_Options_Label_Title;
        replacements.selectOptionValueLabel = Strings.Widget_Select_Options_Label_Value;
        replacements.removeIcon = Icons.WidgetSelectEditorDialog_RemoveOptionIcon;
        replacements.removeOptionButtonTitle = Strings.WidgetEditor_Select_Remove_Option_Button_Title;
        return props;
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;
        super.refresh();
        var style = this._buildSectionsStyleAttribute();
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length) {
            sections.forEach(s => {
                var label = s.querySelector("[data-part='label']");
                if (label)
                    label.setAttribute("style", style);
            });
        }

        var beforeMarks = this._el.querySelectorAll("[data-part='required-mark'][data-position='before']");
        var afterMarks = this._el.querySelectorAll("[data-part='required-mark'][data-position='after']");
        if (this.required && this.requiredAttributeSettings && this.requiredAttributeSettings.mark) {
            beforeMarks.forEach(m => m.style.display = this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE ? "inline" : "none");
            afterMarks.forEach(m => m.style.display = this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER ? "inline" : "none");
        } else {
            beforeMarks.forEach(m => m.style.display = "none");
            afterMarks.forEach(m => m.style.display = "none");
        }
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var selectIdDesign = `select_design_${this.id}`;
        var selectIdRun = `select_run_${this.id}`;
        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasName: this.name ? true : false,
            hasTip: this.widgetRenderOptions.renderTips,
            hasValue: this.value ? true : false,
            id: this.id,
            label: this.label,
            labelClass: this.globalClasses.inputLabel ?? "",
            mark: this.requiredAttributeSettings.mark,
            mode: constants.WIDGET_MODE_DESIGN,
            selectClass: this.globalClasses.select ?? "",
            selectIdDesign: selectIdDesign,
            selectIdRun: selectIdRun,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            showRequiredMarkAfter: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER,
            showRequiredMarkBefore: this.required && this.requiredAttributeSettings.mark && this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE,
            style: this._buildOuterStyleAttribute(),
            type: this.type,
            value: this.value,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-select", replacements);
        this._renderDOM(container, parser, html);
    }

    get value() { return super.value; }
    set value(value) {
        if (value === null)
            super.value = null;
        else {
            var valueOk = false;
            this._selectOptions.forEach(option => {
                if (option.value === value) {
                    super.value = value;
                    valueOk = true;
                    return;
                }
            });
            if (!valueOk)
                throw new Error(`Invalid value '${value}' for select widget.`);
        }
        this.refresh();
    }

    validate(validationOptions) {
        this.clearError();
        var select = this._el.querySelector(`[data-show-when="run"] select`);

        var r;
        if (!select) {
            r = { result: false, message: `Widget ${this.id}: select control not found` };
        }
        else if (!select.value && this.required) {
            r = { result: false, message: this.valueRequiredValidationMessage };
        }

        if (!r)
            r = { result: true };

        if (validationOptions && validationOptions.showErrors && !r.result)
            this.setError(r);

        return r;
    }

    _checkOptions(value) {
        if (!Array.isArray(value))
            throw new Error("selectOptions must be an array of key-value.");
        if (value.length < 2)
            throw new Error("selectOptions must have at least two elements.");
        value.forEach((v, i) => {
            if (v.hasOwnProperty("title") && v.hasOwnProperty("value")) {
                if (!v.hasOwnProperty("id"))
                    v.id = functions.uuidv4();
                return;
            }
            throw new Error(`selectOptions[${i}] must have 'title' and 'value' properties.`);
        });
    }

    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);
        super.refresh();
        this._updateContols();

        var _t = this;
        var selects = this._el.querySelectorAll("select"); // inputs for design mode and run mode.
        
        if (selects)
            selects.forEach(input => {
                input.addEventListener("change", function(e) {
                    debugger        // TODO ver si el value es el correcto
                    _t.value = e.currentTarget.value;
                });
            });
    }

    _renderSelectOptionElements() {
        var selects = this._el.querySelectorAll("select");
        if (selects && selects.length) {
            selects.forEach(s => {
                s.innerHTML = "";
                this._selectOptions.forEach(option => {
                    var optionEl = document.createElement("option");
                    optionEl.setAttribute("data-id", option.id);
                    optionEl.innerHTML = option.title;
                    optionEl.value = option.value;
                    s.appendChild(optionEl);
                });
            });
        }
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var selects = this._el.querySelectorAll("select");
            if (selects && selects.length) {
                selects.forEach(s => {
                    s.value = this.value;
                });
            }
        }
    }
}

export default WidgetSelect;