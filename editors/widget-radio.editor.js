import WidgetCommonPropertiesEditor from "./widget-common.editor.js";

export default class WidgetRadioPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        this._radioOptions = options.widget.radioOptions;

        this._savedRadioOptions = [...options.widget.radioOptions];

        this.chkHorizontalDisposition = this._dialogContainer.querySelector('#chkWidgetPropRadioHorizontal');
        var _t = this;
        if (this.chkHorizontalDisposition && this._callbacks.onHorizontalDispositionChanged) {
            this.chkHorizontalDisposition.addEventListener('change', function() {
                    _t._callbacks.onHorizontalDispositionChanged(_t, _t.widget, this.checked);
                });
        }

        this._setupRadioOptions();
        this._dialogContainer.querySelector('[data-action="add"]').addEventListener('click', e => {
            var cloneEl = this._addRadioOption();
            if (this._callbacks.onRadioOptionAdd) {
                var ro = this._callbacks.onRadioOptionAdd(this, this.widget, {title: "", value: "" } );
                cloneEl.setAttribute("data-id", ro.id);
            }
        });
    }

    init() {
        super.init();
        this._updateControls();
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************
    _addRadioOption(newIndex, radioOption) {
        if (!newIndex)
            newIndex = this._radioOptions.length + 1;
        var radioCont = this._dialogContainer.querySelector('[data-part="radio-options-container"]');
        var radioOptionModel = radioCont.querySelector('.widget-radio-option[data-index="1"]');
        var cloneEl = radioOptionModel.cloneNode(true);
        
        cloneEl.setAttribute('data-index', newIndex);
        cloneEl.setAttribute('data-id', "");
        if (radioOption)
            cloneEl.setAttribute('data-id', radioOption.id);

        let txtTitle = cloneEl.querySelector(`[data-part="radio-title"]`);
        txtTitle.setAttribute('id', `txtRadioOptionTitle${newIndex}`);
        txtTitle.value = radioOption ? radioOption.title : '';

        let txtValue = cloneEl.querySelector(`[data-part="radio-value"]`);
        txtValue.setAttribute('id', `txtRadioOptionValue${newIndex}`);
        txtValue.value = radioOption ? radioOption.value : '';

        let removeBtn = cloneEl.querySelector('[data-action="remove"]');
        removeBtn.removeAttribute("style");

        radioCont.appendChild(cloneEl);
        this._attachHandlers(cloneEl);
        return cloneEl;
    }
    
    _attachHandlers(radioEl) {
        radioEl.querySelector('[data-action="remove"]').addEventListener('click', e => {
            if (confirm(Strings.WidgetEditor_Radio_Confirm_Remove_Option_Message)) {
                radioEl.remove();
                let id = radioEl.getAttribute('data-id');
                if (this._callbacks.onRadioOptionRemove)
                    this._callbacks.onRadioOptionRemove(this, this.widget, id);
            }
        });
        var evts = ['change', 'input'];
        for (var i = 0; i < evts.length; i++) {
            radioEl.querySelector(`[data-part="radio-title"]`).addEventListener(evts[i], e => {
                if (this._callbacks.onRadioOptionTitleChanged) {
                    let id = radioEl.getAttribute('data-id');
                    this._callbacks.onRadioOptionTitleChanged(this, this.widget, e.target.value, id);
                }
            });
            radioEl.querySelector(`[data-part="radio-value"]`).addEventListener(evts[i], e => {
                if (this._callbacks.onRadioOptionValueChanged) {
                    let id = radioEl.getAttribute('data-id');
                    this._callbacks.onRadioOptionValueChanged(this, this.widget, e.target.value, id);
                }
            });
        }
    }

    _cancelDialogHandler() {
        super._cancelDialogHandler();
        this.widget.radioOptions = this._savedRadioOptions;
    }

    _setupRadioOptions() {
        var radioCont = this._dialogContainer.querySelector('[data-part="radio-options-container"]');
        for (var i = 0; i < this._radioOptions.length; i++) {
            var index = i + 1;
            if (index <= 2) { // use existing DOM elements
                var ro = this._radioOptions[i];
                let radioEl = radioCont.querySelector(`.widget-radio-option[data-index="${index}"]`);
                radioEl.setAttribute('data-id', ro.id);

                let txtTitle = radioEl.querySelector(`[data-part="radio-title"]`);
                txtTitle.value = this._radioOptions[i].title;

                let txtValue = radioEl.querySelector(`[data-part="radio-value"]`);
                txtValue.value = this._radioOptions[i].value;

                let removeBtn = radioEl.querySelector('[data-action="remove"]');
                removeBtn.setAttribute("style", "display: none");
                this._attachHandlers(radioEl);
            }
            else
            {
                this._addRadioOption(index, this._radioOptions[i]);
            }
        }
    }

    _updateControls() {
        super._updateControls();
    }
}