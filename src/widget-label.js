import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetLabel extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_LABEL, fragment);
        this.labelClass = fragment.labelClass;
        this.verticalAlignment = fragment.verticalAlignment ?? constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER;
        this.horizontalAlignment = fragment.horizontalAlignment ?? constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = { 
            horizontalAlignment: this.horizontalAlignment,
            labelClass: this.labelClass,
            verticalAlignment: this.verticalAlignment,
         };
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
                var label = s.querySelector(".widget-label");
                if (label)
                    label.setAttribute("style", style);
            });
        }
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var labelIdDesign = `lbl_design_${this.id}`;
        var labelIdRun = `lbl_run_${this.id}`;
        var labelIdView = `lbl_view_${this.id}`;

        // this.globalClasses.label is a generic class applies to all labels
        // this.labelClass is a class specific to this label instance
        var labelClass = this.globalClasses.label ?? ""
        if (this.labelClass) 
            labelClass += (labelClass === "" ? "" : " ") + `${this.labelClass}`;

        var replacements = {
            colClass: "widget-col-" + this.columns,
            id: this.id,
            labelClass: labelClass,
            labelIdDesign: labelIdDesign,
            labelIdRun: labelIdRun,
            labelIdView: labelIdView,
            label: this.label,
            mode: constants.WIDGET_MODE_DESIGN,
            name: this.name,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            style: this._buildOuterStyleAttribute(), 
            type: this.type,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-label", replacements);
        super._renderDOM(container, parser, html);
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************
}

export default WidgetLabel;