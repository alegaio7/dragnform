import WidgetCommonPropertiesEditor from "./widget-common.editor.js";

export default class WidgetRadioPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        this._radioOptions = options.widget.radioOptions;

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
        let txtTitle = cloneEl.querySelector(`#txtRadioOptionTitle1`);
        txtTitle.setAttribute('id', `txtRadioOptionTitle${newIndex}`);
        txtTitle.value = radioOption ? radioOption.title : '';

        let txtValue = cloneEl.querySelector(`#txtRadioOptionValue1`);
        txtValue.setAttribute('id', `txtRadioOptionValue${newIndex}`);
        txtValue.value = radioOption ? radioOption.value : '';

        let removeBtn = cloneEl.querySelector('[data-action="remove"]');
        removeBtn.removeAttribute("style");

        radioCont.appendChild(cloneEl);
        this._attachHandlers(cloneEl);
        return cloneEl;
    }
    
    _attachHandlers(radioEl) {
        var index = radioEl.getAttribute('data-index');
        radioEl.querySelector('[data-action="remove"]').addEventListener('click', e => {
            if (confirm(Strings.WidgetEditor_Radio_Confirm_Remove_Option_Message)) {
                radioEl.remove();
                if (this._callbacks.onRadioOptionRemove)
                    this._callbacks.onRadioOptionRemove(this, this.widget, index);
            }
        });
        var evts = ['change', 'input'];
        for (var i = 0; i < evts.length; i++) {
            radioEl.querySelector(`#txtRadioOptionTitle${index}`).addEventListener(evts[i], e => {
                if (this._callbacks.onRadioOptionTitleChanged)
                    this._callbacks.onRadioOptionTitleChanged(this, this.widget, e.target.value, index - 1);
            });
            radioEl.querySelector(`#txtRadioOptionValue${index}`).addEventListener(evts[i], e => {
                if (this._callbacks.onRadioOptionValueChanged)
                    this._callbacks.onRadioOptionValueChanged(this, this.widget, e.target.value, index - 1);
            });
        }
    }

    _setupRadioOptions() {
        var radioCont = this._dialogContainer.querySelector('[data-part="radio-options-container"]');
        for (var i = 0; i < this._radioOptions.length; i++) {
            var index = i + 1;
            if (index <= 2) { // use existing DOM elements
                let radioEl = radioCont.querySelector(`.widget-radio-option[data-index="${index}"]`);
                radioEl.setAttribute('data-id', this._radioOptions[i].id);
                let txtTitle = radioEl.querySelector(`#txtRadioOptionTitle${index}`);
                txtTitle.value = this._radioOptions[i].title;
                let txtValue = radioEl.querySelector(`#txtRadioOptionValue${index}`);
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