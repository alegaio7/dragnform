import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetSpacer extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_SPACER, fragment);
    }

    render(container, parser) {
        var template = super._getHTMLTemplate();
        super._renderInternal(container, template, parser);
    }
}

export default WidgetSpacer;