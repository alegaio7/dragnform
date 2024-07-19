import functions from "../functions.js";
import WidgetCommonPropertiesEditor from "./widget-common.editor.js";
export default class WidgetRadioPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        this._radioOptions = [...options.widget.radioOptions];
        this._savedRadioOptions = [...options.widget.radioOptions];

        this.chkHorizontalDisposition = this._dialogContainer.querySelector('#chkWidgetPropRadioHorizontal');
        var _t = this;
        if (this.chkHorizontalDisposition && this._callbacks.onHorizontalDispositionChanged) {
            this.chkHorizontalDisposition.addEventListener('change', function() {
                    _t._callbacks.onHorizontalDispositionChanged(_t, _t.widget, this.checked);
                });
        }

        this._setupRadioOptions();
        this._setupOrderButtons();
        this._dialogContainer.querySelector('[data-action="add"]').addEventListener('click', e => {
            var cloneEl = this._addRadioOption();
            var id = functions.uuidv4();
            cloneEl.setAttribute('data-id', id);
            this._radioOptions.push({id: id, title: "", value: ""});
            this._setupOrderButtons();
            if (this._callbacks.onRadioOptionsChanged)
                this._callbacks.onRadioOptionsChanged(this, this.widget, this._radioOptions);
            var inp = cloneEl.querySelector(`[data-part="radio-title"]`);
            if (inp)
                inp.focus();
        });
    }

    init() {
        super.init();
        this._updateControls();
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************
    _acceptDialogHandler() {
        this.widget.radioOptions = this._radioOptions;
        super._acceptDialogHandler()
    }

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
        removeBtn.classList.remove("widget-hide");

        radioCont.appendChild(cloneEl);
        this._attachHandlers(cloneEl);
        return cloneEl;
    }
    
    _attachHandlers(radioEl) {
        radioEl.querySelector('[data-action="remove"]').addEventListener('click', e => {
            if (confirm(Strings.WidgetEditor_Radio_Confirm_Remove_Option_Message)) {
                radioEl.remove();
                let id = radioEl.getAttribute('data-id');

                for (var i = 0; i < this._radioOptions.length; i++) {
                    if (this._radioOptions[i].id === id) {
                        this._radioOptions.splice(i, 1);
                        break;
                    }
                }

                if (this._callbacks.onRadioOptionsChanged)
                    this._callbacks.onRadioOptionsChanged(this, this.widget, this._radioOptions);
            }
        });

        radioEl.querySelector(`[data-part="radio-title"]`).addEventListener("blur", e => {
            // copy title to value if value is empty
            var inpValue = radioEl.querySelector(`[data-part="radio-value"]`);
            if (inpValue && !inpValue.value)
                inpValue.value = e.target.value;
        });

        var evts = ['change', 'input'];
        for (var i = 0; i < evts.length; i++) {
            radioEl.querySelector(`[data-part="radio-title"]`).addEventListener(evts[i], e => {
                let id = radioEl.getAttribute('data-id');
                let ro = this._radioOptions.find(ro => ro.id === id);
                ro.title = e.target.value;
                if (this._callbacks.onRadioOptionTitleChanged)
                    this._callbacks.onRadioOptionTitleChanged(this, this.widget, e.target.value, id);
            });
            radioEl.querySelector(`[data-part="radio-value"]`).addEventListener(evts[i], e => {
                let id = radioEl.getAttribute('data-id');
                let ro = this._radioOptions.find(ro => ro.id === id);
                ro.value = e.target.value;
                if (this._callbacks.onRadioOptionValueChanged)
                    this._callbacks.onRadioOptionValueChanged(this, this.widget, e.target.value, id);
            });
        }

        radioEl.querySelector('[data-action="move-up"]').addEventListener('click', e => {
            this._moveRadioOption(radioEl, -1);
        });
        radioEl.querySelector('[data-action="move-down"]').addEventListener('click', e => {
            this._moveRadioOption(radioEl, 1);
        });
    }

    _cancelDialogHandler() {
        super._cancelDialogHandler();
        // restore radio options previously saved since they're an array (ref object)
        this.widget.radioOptions = this._savedRadioOptions;
    }

    _moveRadioOption(radioEl, direction) {
        var radioCont = this._dialogContainer.querySelector('[data-part="radio-options-container"]');
        var radioOptions = radioCont.querySelectorAll('.widget-radio-option');
        var index = parseInt(radioEl.getAttribute('data-index'));
        var newIndex = index + direction;
        if (newIndex < 1 || newIndex > radioOptions.length)
            return;
        
        var refNode, modevNode;
        var ro;
        if (direction > 0) { // move down
            refNode = radioEl;
            modevNode = radioCont.querySelector(`.widget-radio-option[data-index="${newIndex}"]`);
        }
        else { // move up
            refNode = radioCont.querySelector(`.widget-radio-option[data-index="${newIndex}"]`);
            modevNode = radioEl;
        }
        
        radioCont.insertBefore(modevNode, refNode);

        ro = this._radioOptions[index - 1];
        this._radioOptions[index - 1] = this._radioOptions[newIndex - 1];
        this._radioOptions[newIndex - 1] = ro;
        
        this._setupOrderButtons();
        if (this._callbacks.onRadioOptionsChanged) {
            this._callbacks.onRadioOptionsChanged(this, this.widget, this._radioOptions);
        }
    }

    _setupOrderButtons() {
        var radioOptions = this._dialogContainer.querySelectorAll('[data-part="radio-options-container"] .widget-radio-option');
        for (var i = 0; i < radioOptions.length; i++) {
            var radioEl = radioOptions[i];
            radioEl.setAttribute('data-index', i + 1);
            var btnUp = radioEl.querySelector('[data-action="move-up"]');
            var btnDown = radioEl.querySelector('[data-action="move-down"]');
            btnUp.removeAttribute("disabled");
            btnDown.removeAttribute("disabled");
            let removeBtn = radioEl.querySelector('[data-action="remove"]');
            removeBtn.classList.remove("widget-hide");
            if (i == 0) 
                btnUp.setAttribute("disabled", "disabled");
            if (i == radioOptions.length - 1)
                btnDown.setAttribute("disabled", "disabled");
            if (i < 2)
                removeBtn.classList.add("widget-hide");
        }
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
                removeBtn.classList.add("widget-hide");
                this._attachHandlers(radioEl);
            }
            else {
                this._addRadioOption(index, this._radioOptions[i]);
            }
        }
    }
}