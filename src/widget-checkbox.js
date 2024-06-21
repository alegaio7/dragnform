import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetCheckbox extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_CHECKBOX, fragment);
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var checkboxIdDesign = `input_design_${this.id}`;
        var checkboxIdRun = `input_run_${this.id}`;
        var replacements = {
            checkboxClass: this.globalClasses.checkbox ?? "",
            checkboxIdDesign: checkboxIdDesign,
            checkboxIdRun: checkboxIdRun,
            colClass: "widget-col-" + this.columns,
            hasName: this.name ? true : false,
            hasTip: this.widgetRenderOptions.renderTips && this.tip,
            hasValue: this.value ? true : false,
            id: this.id,
            isChecked: this.value,
            label: this.label,
            labelClass: this.globalClasses.checkboxLabel ?? "",
            mode: constants.WIDGET_MODE_DESIGN,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            style: this._buildOuterStyleAttribute(),
            type: this.type,
            value: this.value,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-checkbox", replacements);
        this._renderDOM(container, parser, html);
    }

    get value() { return super.value; }
    set value(value) {
        value = !!value;
        super.value = value;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {};
        localProps.value = this.value ?? false;
        Object.assign(json, localProps);
        return json;
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;
        super.refresh();
        var style = this._buildSectionsStyleAttribute();
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length) {
            sections.forEach(s => {
                var label = s.querySelector(".widget-checkbox-label [data-part='label']");
                if (label)
                    label.setAttribute("style", style);
            });
        }
    }

    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);
        super.refresh();
        this._updateContols();

        var _t = this;
        var checkboxes = this._el.querySelectorAll("input[type='checkbox']"); // inputs for design mode and run mode.
        
        if (checkboxes)
            checkboxes.forEach(input => {
                input.addEventListener("change", function(e) {
                    _t.value = e.currentTarget.checked;
                });
            });
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var inputs = this._el.querySelectorAll("input[type='checkbox']");
            if (inputs && inputs.length) {
                inputs.forEach(input => {
                    input.checked = this.value;
                });
            }

            var viewModeValue = this._el.querySelector(`span[data-part="value"]`);
            if (viewModeValue)
                viewModeValue.innerHTML = this.value ? "[X]" : "[  ]";
        }
    }
}

export default WidgetCheckbox;