export default class WidgetCommonPropertiesEditor {
    constructor() {
        this.chkAutoHeight = document.getElementById('chkWidgetPropAutoHeight');
        var _t = this;
        if (this.chkAutoHeight)
            this.chkAutoHeight.addEventListener('change', function() {
                _t._updateControls();
            });

    }

    init() {
        this._updateControls();
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************    
    _updateControls() {
        var txtWidgetPropHeight = document.getElementById('txtWidgetPropHeight');
        txtWidgetPropHeight.disabled = this.chkAutoHeight.checked;
    }
}
