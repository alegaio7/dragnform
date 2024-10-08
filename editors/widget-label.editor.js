import WidgetCommonPropertiesEditor from "./widget-common.editor.js";

export default class WidgetLabelPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);
    }

    init() {
        super.init();
        this._updateControls();
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************    
    _updateControls() {
        super._updateControls();
    }
}