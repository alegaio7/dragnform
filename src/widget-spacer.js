import Widget from "./widget-base.js";
import * as constants from './constants.js';
import functions from './dnf-functions.js';

class WidgetSpacer extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_SPACER, fragment);
    }

    getEditorProperties() {
        return [
            { name: "autoHeight", type: "boolean", elementId: "chkWidgetPropAutoHeight", value: this.autoHeight },
            { name: "columns", type: "number", elementId: "txtWidgetPropColumns", value: this.columns },
            { name: "height", type: "number", elementId: "txtWidgetPropHeight", value: functions.convertToPixels(this.height) },
            { name: "id", type: "string", elementId: "lblWidgetId", value: Strings.WidgetEditor_Common_Widget_Properties.replace("{0}", this.id), readonly: true },
        ];
    }

    async getPropertiesEditorTemplate() {
        var props = await this._getPropertiesEditorTemplateCore("widget-spacer", "WidgetSpacerPropertiesEditor");
        return props;
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var replacements = {
            colClass: "widget-col-" + this.columns,
            id: this.id,
            mode: constants.WIDGET_MODE_DESIGN,
            name: this.name,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            type: this.type,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-spacer", replacements);
        super._renderDOM(container, parser, html);
    }
}

export default WidgetSpacer;