export default class WidgetCommonPropertiesEditor {
    constructor(options) {
        if (!options)
            throw new Error('WidgetCommonPropertiesEditor options is required');

        if (!options.dialogContainer)
            throw new Error('WidgetCommonPropertiesEditor options.dialogContainer is required');

        var c;
        if (typeof options.dialogContainer === "string")
            c = document.getElementById(options.dialogContainer);
        else if (options.dialogContainer instanceof HTMLElement)
            c = options.dialogContainer;
        else
            throw new Error('WidgetCommonPropertiesEditor options.dialogContainer must be a string or HTMLElement');

        var _t = this;
        this._dialogContainer = c;
        if (!options.callbacks)
            options.callbacks = {};
        this._callbacks = options.callbacks;

        this.txtLabel = document.getElementById('txtWidgetPropLabel');
        if (this.txtLabel && this._callbacks.onLabelChanged) {
            this.txtLabel.addEventListener('change', function() {
                _t._callbacks.onLabelChanged(_t, _t.txtLabel.value);
            });

            this.txtLabel.addEventListener('input', function() {
                _t._callbacks.onLabelChanged(_t, _t.txtLabel.value);
            });
        }

        this.txtColumns = document.getElementById('txtWidgetPropColumns');
        if (this.txtColumns && this._callbacks.onColumnsChanged)
            this.txtColumns.addEventListener('change', function() {
                var n = parseInt(_t.txtColumns.value, 10);
                _t._callbacks.onColumnsChanged(_t, n);
            });

        this.chkAutoHeight = document.getElementById('chkWidgetPropAutoHeight');
        if (this.chkAutoHeight)
            this.chkAutoHeight.addEventListener('change', function() {
                _t._updateControls();
                if (_t._callbacks.onAutoHeightChanged)
                    _t._callbacks.onAutoHeightChanged(_t, _t.chkAutoHeight.checked);
            });

        this.txtHeight = document.getElementById('txtWidgetPropHeight');
        if (this.txtHeight && this._callbacks.onHeightChanged)
            this.txtHeight.addEventListener('change', function() {
                if (!_t.chkAutoHeight.checked) {
                    var n = parseInt(_t.txtHeight.value, 10);
                    _t._callbacks.onHeightChanged(_t, _t.txtHeight.value);
                }
            });

        this.chkRequired = document.getElementById('chkWidgetPropRequired');
        if (this.chkRequired && this._callbacks.onRequiredChanged)
            this.chkRequired.addEventListener('change', function() {
                _t._callbacks.onRequiredChanged(_t, _t.chkRequired.checked);
            });

        this.optHAlignments = this._dialogContainer.querySelectorAll('input[name="halignment"]');
        if (this.optHAlignments && this._callbacks.onHorizontalAlignmentChanged) {
            this.optHAlignments.forEach(function(opt) {
                opt.addEventListener('change', function() {
                    _t._callbacks.onHorizontalAlignmentChanged(_t, this.value);
                });
            });
        }

        this.optVAlignments = this._dialogContainer.querySelectorAll('input[name="valignment"]');
        if (this.optVAlignments && this._callbacks.onVerticalAlignmentChanged) {
            this.optVAlignments.forEach(function(opt) {
                opt.addEventListener('change', function() {
                    _t._callbacks.onVerticalAlignmentChanged(_t, this.value);
                });
            });
        }
    }

    init() {
        var firstInput = this._dialogContainer.querySelector('input,select');
        if (firstInput) {
            firstInput.focus();
            if (typeof firstInput.select === "function")
                firstInput.select();
        }
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************    
    _updateControls() {
        var txtWidgetPropHeight = document.getElementById('txtWidgetPropHeight');
        txtWidgetPropHeight.disabled = this.chkAutoHeight.checked;
    }
}
