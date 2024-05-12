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
            style: this._buildStyleAttribute(), 
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

    _buildStyleAttribute() {
        var style = super._buildStyleAttribute();

        if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER)
            style += "justify-content: center;";
        else if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM)
            style += "justify-content: end;";
        else
            style += "justify-content: start;";

        if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER)
            style += "align-items: center;";
        else if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT)
            style += "align-items: end;";
        else
            style += "align-items: start;";

        return style;
    }
}

export default WidgetLabel;