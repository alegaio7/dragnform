import Widget from "./widget-base.js";
import * as constants from './constants.js';
import Icons from './icons.js';
import functions from './jfi-functions.js';

class WidgetRadio extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_RADIO, fragment);

        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";

        this._lastIndex = 0;
        this._radioOptions = fragment.radioOptions ?? [
            { title: Strings.Widget_Radio_Default_Option1_Title, value: Strings.Widget_Radio_Default_Option1_Title },
            { title: Strings.Widget_Radio_Default_Option2_Title, value: Strings.Widget_Radio_Default_Option2_Title },
        ];
        this._checkOptions(this._radioOptions);

        this._horizontalDisposition = fragment.horizontalDisposition === false ? false : true;

        this._required = false;
        this.valueRequiredValidationMessage = Strings.WidgetValidation_RequiredMessage;
        var v = this._findValidation("required");
        if (v) {
            this._required = !!v.value;
            this.valueRequiredValidationMessage = v.message ?? Strings.WidgetValidation_RequiredMessage;
        }
    }
    
    get horizontalDisposition() { return this._horizontalDisposition; }
    set horizontalDisposition(value) {
        this._horizontalDisposition = value;
        this.refresh();
    }

    get name() { return this._name; }
    set name(value) {
        this._name = value;
        this.refresh();
    }

    get radioOptions() { return this._radioOptions; }
    set radioOptions(value) {
        var prevValue = this.value;
        this._checkOptions(value);
        this._radioOptions = value;
        this._renderRadioOptionElements();
        this.refresh();
        if (prevValue)
            this.value = prevValue;
    }

    get required() { return this._required; }
    set required(value) {
        this._required = value;
        this.refresh();
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {
            validations: [
                { type: "required", value: this.required, message: this.valueRequiredValidationMessage }
            ]
        };
        localProps.horizontalDisposition = this.horizontalDisposition;
        localProps.radioOptions = this.radioOptions;
        localProps.value = this.value;
        Object.assign(json, localProps);
        return json;
    }    

    getEditorProperties() {
        var props = super.getEditorProperties();

        props.push(
            { name: "horizontalDisposition", type: "boolean", elementId: "chkWidgetPropRadioHorizontal", value: this.horizontalDisposition },
            { name: "required", type: "boolean", elementId: "chkWidgetPropRequired", value: this.required },
            { name: "valueRequiredValidationMessage", type: "string", elementId: "txtWidgetPropRequiredValidationMessage", value: this.valueRequiredValidationMessage }
        );
        return props;
    }

    async getPropertiesEditorTemplate() {
        var props = await this._getPropertiesEditorTemplateCore("widget-radio", "WidgetRadioPropertiesEditor");
        var replacements = props.replacements;

        replacements.addIcon = Icons.WidgetEditor_Common_AddOptionIcon;
        replacements.addOptionButtonTitle = Strings.WidgetEditor_Radio_Add_Option_Button_Title;
        replacements.labelRadioHorizontal = Strings.WidgetEditor_Radio_Widget_Horizontal;
        replacements.labelValueRequiredValidationMessage = Strings.WidgetEditor_Common_Widget_ValueRequiredMessage;
        replacements.labelRadioOptions = Strings.Widget_Radio_Options_Title;
        replacements.moveDownButtonTitle = Strings.WidgetEditor_Common_MoveDownButtonTitle;
        replacements.moveDownIcon = Icons.WidgetEditor_Common_MoveDownIcon;
        replacements.moveUpButtonTitle = Strings.WidgetEditor_Common_MoveUpButtonTitle;
        replacements.moveUpIcon = Icons.WidgetEditor_Common_MoveUpIcon;
        replacements.radioOptionTitleLabel = Strings.Widget_Radio_Options_Label_Title;
        replacements.radioOptionValueLabel = Strings.Widget_Radio_Options_Label_Value;
        replacements.radioOptionTitle1 = this._radioOptions[0].title;
        replacements.radioOptionValue1 = this._radioOptions[0].value;
        replacements.radioOptionTitle2 = this._radioOptions[1].title;
        replacements.radioOptionValue2 = this._radioOptions[1].value;
        replacements.removeIcon = Icons.WidgetEditor_Common_RemoveOptionIcon;
        replacements.removeOptionButtonTitle = Strings.WidgetEditor_Radio_Remove_Option_Button_Title;
        return props;
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;
        super.refresh();
        if (this.horizontalDisposition)
            this._el.classList.add("flow-row");
        else
            this._el.classList.remove("flow-row");
        var style = this._buildSectionsStyleAttribute();
        var radioItemsStyle = this._buildRadioItemsStyle();
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length) {
            sections.forEach(s => {
                var label = s.querySelector("[data-part='label']");
                if (label)
                    label.setAttribute("style", style);

                for (var i = 1; i <= this._radioOptions.length; i++) {
                    var id = this._radioOptions[i - 1].id;
                    var radioEl = s.querySelector(`[data-part="widget-radio-set"][data-id="${id}"]`);
                    let titleCont = radioEl.querySelector(`[data-part="radio-item-title"]`);
                    titleCont.setAttribute("style", radioItemsStyle);
                    let title = radioEl.querySelector(`[data-part="radio-item-title-text"]`);
                    title.innerHTML = this._radioOptions[i - 1].title;
                    let input = radioEl.querySelector(`input`);
                    input.value = this._radioOptions[i - 1].value;
                }

                var radiocont = s.querySelector(`[data-part="widget-radio-sets-container"]`);
                if (radiocont) {
                    radiocont.classList.remove("widget-h-align-start");
                    radiocont.classList.remove("widget-h-align-center");
                    radiocont.classList.remove("widget-h-align-end");
                    radiocont.classList.remove("widget-v-align-start");
                    radiocont.classList.remove("widget-v-align-center");
                    radiocont.classList.remove("widget-v-align-end");

                    if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_TOP)
                        radiocont.classList.add("widget-v-align-start");
                    else if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER)
                        radiocont.classList.add("widget-v-align-center");
                    else if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM)
                        radiocont.classList.add("widget-v-align-end");
    
                    if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT)
                        radiocont.classList.add("widget-h-align-start");
                    else if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER)
                        radiocont.classList.add("widget-h-align-center");
                    else if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT)
                        radiocont.classList.add("widget-h-align-end");
                }
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

        var radioIdDesign = `input_design_${this.id}`;
        var radioIdRun = `input_run_${this.id}`;
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
            radioClass: this.globalClasses.radio ?? "",
            radioIdDesign: radioIdDesign,
            radioIdRun: radioIdRun,
            radioLabelClass: this.globalClasses.radioLabel ?? "",
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

        var html = await super._loadWidgetTemplate("widget-radio", replacements);
        this._renderDOM(container, parser, html);
    }

    get value() { return super.value; }
    set value(value) {
        if (value === null)
            super.value = null;
        else {
            var valueOk = false;
            this._radioOptions.forEach(option => {
                if (option.value === value) {
                    super.value = value;
                    valueOk = true;
                    return;
                }
            });
            if (!valueOk)
                return;
        }
        this.refresh();
    }

    validate(validationOptions) {
        this.clearError();
        var input = this._el.querySelector(`[data-show-when="run"] input:checked`);

        var r;
        if (!input && this.required) {
            r = { result: false, message: this.valueRequiredValidationMessage };

            if (validationOptions && validationOptions.showErrors)
                this.setError(r);
        }

        if (!r)
            r = { result: true };

        return r;
    }

    _buildRadioItemsStyle() {
        var style = "";
        if (this.fontSize)
            style += `font-size: ${this.fontSize}px;`;
        if (this.textColor)
            style += `color: ${this.textColor};`;
        return style;
    }

    _checkOptions(value) {
        if (!Array.isArray(value))
            throw new Error("radioOptions must be an array of key-value.");
        if (value.length < 2)
            throw new Error("radioOptions must have at least two elements.");
        value.forEach((v, i) => {
            if (v.hasOwnProperty("title") && v.hasOwnProperty("value")) {
                if (!v.hasOwnProperty("id"))
                    v.id = functions.uuidv4();
                return;
            }
            throw new Error(`radioOptions[${i}] must have 'title' and 'value' properties.`);
        });
        this._lastIndex = value.length;
    }

    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);

        var radioContainerDesign = this._el.querySelector(`[data-show-when="design"] [data-part="widget-radio-sets-container"]`);
        var radioContainerRun = this._el.querySelector(`[data-show-when="run"] [data-part="widget-radio-sets-container"]`);
        var radioContainerView = this._el.querySelector(`[data-show-when="view"] [data-part="widget-radio-sets-container"]`);
        var allSections = [radioContainerDesign, radioContainerRun, radioContainerView];

        var _t = this;
        allSections.forEach((s, sindex) => {
            var radioOptions = s.querySelectorAll(`[data-part="widget-radio-set"]`);
            var firstRadioNode;
            if (radioOptions && radioOptions.length) {
                radioOptions.forEach(v => {
                    if (v.getAttribute("data-initial") === "1")
                        firstRadioNode = v; // keep ref
                    v.remove();
                });
            }

            this._radioOptions.forEach((option, index) => {
                let node = this._createNewRadioOptionEl(firstRadioNode, option);
                if (index === 0)
                    node.setAttribute("data-initial", "1");
                s.appendChild(node);
            });
        });

        super.refresh();
        this._updateContols();
    }

    _createNewRadioOptionEl(modelNode, radioOptionItem) {
        var _t = this;
        var cloneEl = modelNode.cloneNode(true);
        cloneEl.setAttribute('data-id', radioOptionItem.id);
        cloneEl.removeAttribute("data-initial");
        let txtTitle = cloneEl.querySelector(`[data-part="radio-item-title-text"]`);
        txtTitle.innerHTML = radioOptionItem.title;
        let input = cloneEl.querySelector(`input`);
        input.id = this.id + "_" + this._lastIndex;
        input.value = radioOptionItem.value;
        input.name = this.name + "_" + this._lastIndex;
        input.addEventListener("click", function(e) {
            _t.value = e.currentTarget.value;
        });
        this._lastIndex++;
        return cloneEl;
    }

    _renderRadioOptionElements() {
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length) {
            sections.forEach(s => {
                // determine which options are new
                var radioCont = s.querySelector('[data-part="widget-radio-sets-container"]');

                // remove current options except the initial, which is used to clone the other nodes from it
                var firstRadioNode;
                var radioOptions = radioCont.querySelectorAll(`[data-part="widget-radio-set"]`);
                if (radioOptions && radioOptions.length) {
                    radioOptions.forEach(v => {
                        if (v.getAttribute("data-initial") === "1") {
                            firstRadioNode = v;
                            return;
                        }
                        v.remove();
                    });
                }

                // radioOptions should already be sorted by view order
                for (var i = 0; i < this._radioOptions.length; i++) {
                    if (i === 0)
                        firstRadioNode.setAttribute("data-id", this._radioOptions[i].id);
                    else {
                        var node = this._createNewRadioOptionEl(firstRadioNode, this._radioOptions[i]);
                        radioCont.appendChild(node);
                    }
                }
            });
        }
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var inputs = this._el.querySelectorAll("input[type='radio']");
            if (inputs && inputs.length) {
                inputs.forEach(input => {
                    input.checked = false;
                    if (input.value === this.value)
                        input.checked = true;
                });
            }
        }
    }
}

export default WidgetRadio;