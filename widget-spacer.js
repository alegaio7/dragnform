import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetSpacer extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_SPACER, fragment);
    }

    render(container, parser, widgetRenderOptions) {
        if (!widgetRenderOptions)
            widgetRenderOptions = {};
        widgetRenderOptions.renderValidationSection = false;
        var template = super._getHTMLTemplate(widgetRenderOptions);
        super._renderInternal(container, template, parser, widgetRenderOptions);
    }
}

export default WidgetSpacer;