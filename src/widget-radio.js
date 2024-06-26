import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetRadio extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_RADIO, fragment);

        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";

        this._radioOptions = fragment.radioOptions ?? [
            { key: 'Y', value: Strings.Widget_Radio_Option1 },
            { key: 'N', value: Strings.Widget_Radio_Option2 },
        ];
        this._checkOptions(this._radioOptions);

        this._horizontalDisposition = fragment.horizontalDisposition ?? false;

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
        this._checkOptions(value);
        this._radioOptions = value;
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
        localProps.horizontalDisposition = this.horizontalDisposition;
        localProps.value = this.value ?? false;
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
        var baseName = "widget-radio";
        var html = await (await fetch(`/editors/${baseName}.editor.html`)).text();
        var replacements = this._getCommonEditorPropertyReplacements();

        replacements.labelRadioHorizontal = Strings.WidgetEditor_Radio_Widget_Horizontal;
        replacements.labelValueRequiredValidationMessage = Strings.WidgetEditor_Common_Widget_ValueRequiredMessage;

        return {
            baseName: baseName,
            handlingClassName: "WidgetRadioPropertiesEditor",
            replacements: replacements,
            template: html
        };
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
                var label = s.querySelector(".widget-label [data-part='label']");
                if (label)
                    label.setAttribute("style", style);

                var radioItems = s.querySelectorAll(".widget-radio-label");
                if (radioItems && radioItems.length) {
                    radioItems.forEach(r => {
                        r.setAttribute("style", radioItemsStyle);
                    });
                }

                var radiocont = s.querySelector(`[data-part="radio-container"]`);
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
            hasTip: this.widgetRenderOptions.renderTips && this.tip,
            hasValue: this.value ? true : false,
            id: this.id,
            label: this.label,
            labelClass: this.globalClasses.inputLabel ?? "",
            mode: constants.WIDGET_MODE_DESIGN,
            radioClass: this.globalClasses.radio ?? "",
            radioIdDesign: radioIdDesign,
            radioIdRun: radioIdRun,
            radioLabelClass: this.globalClasses.radioLabel ?? "",
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
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
        var valueOk = false;
        this._radioOptions.forEach(option => {
            if (option.key === value) {
                super.value = value;
                valueOk = true;
                return;
            }
        });
        if (!valueOk)
            throw new Error(`Invalid value '${value}' for radio widget.`);
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
        return style;
    }

    _checkOptions(value) {
        if (!Array.isArray(value))
            throw new Error("radioOptions must be an array of key-value.");
        if (value.length < 2)
            throw new Error("radioOptions must have at least two elements.");
        value.forEach((v, i) => {
            if (v.hasOwnProperty("key") && v.hasOwnProperty("value"))
                return;
            throw new Error(`radioOptions[${i}] must have 'key' and 'value' properties.`);
        });
    }

    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);

        var radioContainerDesign = this._el.querySelector(`[data-show-when="design"] [data-part="radio-container"]`);
        var radioContainerRun = this._el.querySelector(`[data-show-when="run"] [data-part="radio-container"]`);
        var radioContainerView = this._el.querySelector(`[data-show-when="view"] [data-part="radio-container"]`);
        var allSections = [radioContainerDesign, radioContainerRun, radioContainerView];

        var _t = this;
        allSections.forEach((s, sindex) => {
            var radioOptions = s.querySelectorAll(`.widget-radio-group`);
            var firstRadioNode;
            if (radioOptions && radioOptions.length) {
                radioOptions.forEach(v => {
                    if (v.getAttribute("data-first-value") === "1")
                        firstRadioNode = v; // keep ref
                    v.remove(); // remove all but the first value
                });
            }
            this._radioOptions.forEach((option, index) => {
                let node = firstRadioNode.cloneNode(true);
                if (index > 0)
                    node.removeAttribute("data-first-value");
                let input = node.querySelector(`input`);
                input.id = _t.id + "_" + index;
                input.value = option.key;
                input.name = _t.name + "_" + sindex;
                input.addEventListener("click", function(e) {
                    _t.value = e.currentTarget.value;
                });
                node.querySelector('[data-part="radio-label"]').innerHTML = option.value;
                s.appendChild(node);
            });
        });

        super.refresh();
        this._updateContols();
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var inputs = this._el.querySelectorAll("input[type='radio']");
            if (inputs && inputs.length) {
                inputs.forEach(input => {
                    if (input.value === this.value)
                        input.checked = true;
                });
            }
        }
    }
}

export default WidgetRadio;