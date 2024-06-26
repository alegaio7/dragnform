import WidgetCommonPropertiesEditor from "./widget-common.editor.js";

export default class WidgetRadioropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        this.chkHorizontalDisposition = this._dialogContainer.querySelector('#chkWidgetPropRadioHorizontal');
        var _t = this;
        if (this.chkHorizontalDisposition && this._callbacks.onHorizontalDispositionChanged) {
            this.chkHorizontalDisposition.addEventListener('change', function() {
                    _t._callbacks.onHorizontalDispositionChanged(_t, this.checked);
                });
        }
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