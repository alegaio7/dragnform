import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetSpacer extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_SPACER, fragment);
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var replacements = {
            colClass: "widget-col-" + this.columns,
            id: this.id,
            mode: constants.WIDGET_MODE_DESIGN,
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