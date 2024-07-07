export default class WidgetCommonPropertiesEditor {
    constructor(options) {
        if (!options)
            throw new Error('WidgetCommonPropertiesEditor options is required');

        if (!options.dialogContainer)
            throw new Error('WidgetCommonPropertiesEditor options.dialogContainer is required');

        if (!options.widget)
            throw new Error('WidgetCommonPropertiesEditor options.widget is required');

        this.widget = options.widget;
        var c;
        if (typeof options.dialogContainer === "string")
            c = document.getElementById(options.dialogContainer);
        else if (options.dialogContainer instanceof HTMLElement)
            c = options.dialogContainer;
        else
            throw new Error('WidgetCommonPropertiesEditor options.dialogContainer must be a string or HTMLElement');

        var _t = this;
        this._dialogContainer = c;

        // setup dialog controls
        var editorProps = options.widget.getEditorProperties();
        if (editorProps) {
            editorProps.forEach(p => {
                if (p.elementId) {
                    let el = document.getElementById(p.elementId);
                    if (el) {
                        if (p.readonly)
                            el.innerHTML = p.value;
                        else {
                            if (p.type === "boolean")
                                el.checked = p.value;
                            else if (p.type === "number" || p.type === "string")
                                el.value = p.value;
                        }
                    }
                } else if (p.elementIds) { // used for properties that are bound to multiple elements like radio buttons
                    p.elementIds.forEach(eId => {
                        let el = document.getElementById(eId);
                        if (el) {
                            if (el.value === p.value)
                                el.checked = true;
                            else
                                el.checked = false;
                        }
                    });
                }
            });
        }

        // setup dialog  callbacks
        if (!options.callbacks)
            options.callbacks = {};
        this._callbacks = options.callbacks;
        
        var acceptButton = this._dialogContainer.querySelector('[data-action="accept"]');
        if (acceptButton)
            acceptButton.onclick = function() {
                var changedProps = _t._updateWidgetPropertiesFromControls();
                if (this._callbacks.onAccept)
                    _t._callbacks.onAccept(_t, changedProps);
            }.bind(this);

        var cancelButton = this._dialogContainer.querySelector('[data-action="cancel"]');
        if (cancelButton)
            cancelButton.onclick = function() {
                // restore widget props as they were before editing
                if (editorProps) {
                    editorProps.forEach(p => {
                        _t.widget[p.name] = p.value;
                    });
                }
                if (this._callbacks.onCancel)
                    _t._callbacks.onCancel(_t);
            }.bind(this);

        this.txtLabel = document.getElementById('txtWidgetPropLabel');
        if (this.txtLabel && this._callbacks.onLabelChanged) {
            this.txtLabel.addEventListener('change', function() {
                _t._callbacks.onLabelChanged(_t, _t.widget, _t.txtLabel.value);
            });

            this.txtLabel.addEventListener('input', function() {
                _t._callbacks.onLabelChanged(_t, _t.widget, _t.txtLabel.value);
            });
        }

        this.txtFontSize = document.getElementById('txtWidgetFontSize');
        if (this.txtFontSize && this._callbacks.onFontSizeChanged)
            this.txtFontSize.addEventListener('change', function() {
                var n = parseInt(_t.txtFontSize.value, 10);
                _t._callbacks.onFontSizeChanged(_t, _t.widget, n);
            });


        this.optFontWeights = this._dialogContainer.querySelectorAll('input[name="fontWeight"]');
        if (this.optFontWeights && this._callbacks.onFontWeightChanged) {
            this.optFontWeights.forEach(function(opt) {
                opt.addEventListener('change', function() {
                    _t._callbacks.onFontWeightChanged(_t, _t.widget, this.value);
                });
            });
        }

        this.chkFontUnderline = document.getElementById('chkWidgetPropFontUnderline');
        if (this.chkFontUnderline)
            this.chkFontUnderline.addEventListener('change', function() {
                _t._updateControls();
                if (_t._callbacks.onFontUnderlineChanged)
                    _t._callbacks.onFontUnderlineChanged(_t, _t.widget, _t.chkFontUnderline.checked);
            });

        this.txtColumns = document.getElementById('txtWidgetPropColumns');
        if (this.txtColumns && this._callbacks.onColumnsChanged)
            this.txtColumns.addEventListener('change', function() {
                var n = parseInt(_t.txtColumns.value, 10);
                _t._callbacks.onColumnsChanged(_t, _t.widget, n);
            });

        this.chkAutoHeight = document.getElementById('chkWidgetPropAutoHeight');
        if (this.chkAutoHeight)
            this.chkAutoHeight.addEventListener('change', function() {
                _t._updateControls();
                if (_t._callbacks.onAutoHeightChanged)
                    _t._callbacks.onAutoHeightChanged(_t, _t.widget, _t.chkAutoHeight.checked);
            });

        this.txtHeight = document.getElementById('txtWidgetPropHeight');
        if (this.txtHeight && this._callbacks.onHeightChanged)
            this.txtHeight.addEventListener('change', function() {
                if (!_t.chkAutoHeight.checked) {
                    var n = parseInt(_t.txtHeight.value, 10);
                    _t._callbacks.onHeightChanged(_t, _t.widget, n);
                }
            });

        this.chkRequired = document.getElementById('chkWidgetPropRequired');
        if (this.chkRequired && this._callbacks.onRequiredChanged)
            this.chkRequired.addEventListener('change', function() {
                _t._callbacks.onRequiredChanged(_t, _t.widget, _t.chkRequired.checked);
            });

        this.optHAlignments = this._dialogContainer.querySelectorAll('input[name="halignment"]');
        if (this.optHAlignments && this._callbacks.onHorizontalAlignmentChanged) {
            this.optHAlignments.forEach(function(opt) {
                opt.addEventListener('change', function() {
                    _t._callbacks.onHorizontalAlignmentChanged(_t, _t.widget, this.value);
                });
            });
        }

        this.optVAlignments = this._dialogContainer.querySelectorAll('input[name="valignment"]');
        if (this.optVAlignments && this._callbacks.onVerticalAlignmentChanged) {
            this.optVAlignments.forEach(function(opt) {
                opt.addEventListener('change', function() {
                    _t._callbacks.onVerticalAlignmentChanged(_t, _t.widget, this.value);
                });
            });
        }

        this.txtTip = document.getElementById('txtWidgetPropTip');
        if (this.txtTip && this._callbacks.onTipChanged) {
            this.txtTip.addEventListener('change', function() {
                _t._callbacks.onTipChanged(_t, _t.widget, _t.txtTip.value);
            });

            this.txtTip.addEventListener('input', function() {
                _t._callbacks.onTipChanged(_t, _t.widget, _t.txtTip.value);
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

    _updateWidgetPropertiesFromControls() {
        var properties = this.widget.getEditorProperties();
        this.widget.batchUpdating = true;
        var changedProps = [];
        if (properties) {
            properties.forEach(p => {
                if (p.elementId) {
                    if (p.readonly)
                        return;
                    if (p.name in this.widget) {
                        var el = document.getElementById(p.elementId);
                        if (el) {
                            if (p.type === "boolean")
                                this.widget[p.name] = el.checked;
                            else if (p.type === "number") {
                                if (el.value === "" || isNaN(el.value))
                                    this.widget[p.name] = null;
                                else
                                    this.widget[p.name] = parseInt(el.value, 10);
                            }
                            else
                                this.widget[p.name] = el.value;
                            changedProps.push(p.name);
                        }
                    }
                } else if (p.elementIds) {
                    p.elementIds.forEach(eId => { 
                        var el = document.getElementById(eId);
                        if (el && el.checked) {
                            this.widget[p.name] = el.value;
                            changedProps.push(p.name);
                            /*
                            if (this._rememberedProperties.has(p.name))
                                this._rememberedProperties.set(p.name, this.widget[p.name]);
                            */
                        }
                    });
                }
            });
        }
        this.widget.batchUpdating = false;
        return changedProps;
        // this.modified = true;
        // widgetInfo.widget.refresh(); // not needed since setting batchUpdating = false; will trigger a refresh
    }
}
