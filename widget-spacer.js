import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetSpacer extends Widget {
    constructor(options) {
        super(constants.WIDGET_TYPE_SPACER, options);
        this._button = null;
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        renderOptions.renderValidationSection = false;
        var template = super._getHTMLTemplate(renderOptions);
        super._renderInternal(container, template, parser, renderOptions);
    }
}

export default WidgetSpacer;