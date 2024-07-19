import functions from "../functions.js";
import WidgetCommonPropertiesEditor from "./widget-common.editor.js";
export default class WidgetSelectPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        var options = options.widget.selectOptions ?? [];
        this._selectOptions = [...options];
        this._savedSelectOptions = [...options]; // make a copy

        this._setupSelectOptions();
        this._setupOrderButtons();
        this._dialogContainer.querySelector('[data-action="add"]').addEventListener('click', e => {
            var cloneEl = this._addSelectOption();
            var id = functions.uuidv4();
            cloneEl.setAttribute('data-id', id);
            this._selectOptions.push({id: id, title: "", value: ""});
            this._setupOrderButtons();
            if (this._callbacks.onSelectOptionsChanged)
                this._callbacks.onSelectOptionsChanged(this, this.widget, this._selectOptions );
            var inp = cloneEl.querySelector(`[data-part="option-title"]`);
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
        this.widget.selectOptions = this._selectOptions;
        super._acceptDialogHandler()
    }

    _addSelectOption(newIndex, selectOption) {
        if (!newIndex)
            newIndex = this._selectOptions.length + 1;
        var selectCont = this._dialogContainer.querySelector('[data-part="select-options-container"]');
        var selectOptionModel = selectCont.querySelector('.widget-select-option[data-index="1"]');
        var cloneEl = selectOptionModel.cloneNode(true);
        
        cloneEl.setAttribute('data-index', newIndex);
        cloneEl.setAttribute('data-id', "");
        if (selectOption)
            cloneEl.setAttribute('data-id', selectOption.id);

        let txtTitle = cloneEl.querySelector(`[data-part="option-title"]`);
        txtTitle.setAttribute('id', `txtSelectOptionTitle${newIndex}`);
        txtTitle.value = selectOption ? selectOption.title : '';

        let txtValue = cloneEl.querySelector(`[data-part="option-value"]`);
        txtValue.setAttribute('id', `txtSelectOptionValue${newIndex}`);
        txtValue.value = selectOption ? selectOption.value : '';

        let removeBtn = cloneEl.querySelector('[data-action="remove"]');
        removeBtn.removeAttribute("style");

        selectCont.appendChild(cloneEl);
        this._attachHandlers(cloneEl);
        return cloneEl;
    }
    
    _attachHandlers(optionEl) {
        optionEl.querySelector('[data-action="remove"]').addEventListener('click', e => {
            if (confirm(Strings.WidgetEditor_Select_Confirm_Remove_Option_Message)) {
                optionEl.remove();
                let id = optionEl.getAttribute('data-id');

                for (var i = 0; i < this._selectOptions.length; i++) {
                    if (this._selectOptions[i].id === id) {
                        this._selectOptions.splice(i, 1);
                        break;
                    }
                }

                if (this._callbacks.onSelectOptionsChanged)
                    this._callbacks.onSelectOptionsChanged(this, this.widget, this._selectOptions);
            }
        });

        optionEl.querySelector(`[data-part="option-title"]`).addEventListener("blur", e => {
            // copy title to value if value is empty
            var inpValue = optionEl.querySelector(`[data-part="option-value"]`);
            if (inpValue && !inpValue.value)
                inpValue.value = e.target.value;
        });

        var evts = ['change', 'input'];
        for (var i = 0; i < evts.length; i++) {
            optionEl.querySelector(`[data-part="option-title"]`).addEventListener(evts[i], e => {
                let id = optionEl.getAttribute('data-id');
                let so = this._selectOptions.find(ro => ro.id === id);
                so.title = e.target.value;
                if (this._callbacks.onSelectOptionTitleChanged)
                    this._callbacks.onSelectOptionTitleChanged(this, this.widget, e.target.value, id);
            });
            optionEl.querySelector(`[data-part="option-value"]`).addEventListener(evts[i], e => {
                let id = optionEl.getAttribute('data-id');
                let so = this._selectOptions.find(ro => ro.id === id);
                so.value = e.target.value;
                if (this._callbacks.onSelectOptionValueChanged)
                    this._callbacks.onSelectOptionValueChanged(this, this.widget, e.target.value, id);
            });
        }

        optionEl.querySelector('[data-action="move-up"]').addEventListener('click', e => {
            this._moveSelectOption(optionEl, -1);
        });
        optionEl.querySelector('[data-action="move-down"]').addEventListener('click', e => {
            this._moveSelectOption(optionEl, 1);
        });
    }

    _cancelDialogHandler() {
        super._cancelDialogHandler();
        // restore select options previously saved since they're an array (ref object)
        this.widget.selectOptions = this._savedSelectOptions;
    }

    _moveSelectOption(optionEl, direction) {
        var selectCont = this._dialogContainer.querySelector('[data-part="select-options-container"]');
        var selectOptions = selectCont.querySelectorAll('.widget-select-option');
        var index = parseInt(optionEl.getAttribute('data-index'));
        var newIndex = index + direction;
        if (newIndex < 1 || newIndex > selectOptions.length)
            return;
        
        var refNode, modevNode;
        var ro;
        if (direction > 0) { // move down
            refNode = optionEl;
            modevNode = selectCont.querySelector(`.widget-select-option[data-index="${newIndex}"]`);
        }
        else { // move up
            refNode = selectCont.querySelector(`.widget-select-option[data-index="${newIndex}"]`);
            modevNode = optionEl;
        }
        
        selectCont.insertBefore(modevNode, refNode);

        ro = this._selectOptions[index - 1];
        this._selectOptions[index - 1] = this._selectOptions[newIndex - 1];
        this._selectOptions[newIndex - 1] = ro;
        
        this._setupOrderButtons();
        if (this._callbacks.onSelectOptionsChanged) {
            this._callbacks.onSelectOptionsChanged(this, this.widget, this._selectOptions);
        }
    }

    _setupOrderButtons() {
        var selectOptions = this._dialogContainer.querySelectorAll('[data-part="select-options-container"] .widget-select-option');
        for (var i = 0; i < selectOptions.length; i++) {
            var optionEl = selectOptions[i];
            optionEl.setAttribute('data-index', i + 1);
            var btnUp = optionEl.querySelector('[data-action="move-up"]');
            var btnDown = optionEl.querySelector('[data-action="move-down"]');
            btnUp.removeAttribute("disabled");
            btnDown.removeAttribute("disabled");
            let removeBtn = optionEl.querySelector('[data-action="remove"]');
            removeBtn.classList.remove("widget-hide");
            if (i == 0) 
                btnUp.setAttribute("disabled", "disabled");
            if (i == selectOptions.length - 1)
                btnDown.setAttribute("disabled", "disabled");
            if (i < 2)
                removeBtn.classList.add("widget-hide");
        }
    }

    _setupSelectOptions() {
        var selectCont = this._dialogContainer.querySelector('[data-part="select-options-container"]');
        for (var i = 0; i < this._selectOptions.length; i++) {
            var index = i + 1;
            if (index <= 2) { // use existing DOM elements
                var ro = this._selectOptions[i];
                let optionEl = selectCont.querySelector(`.widget-select-option[data-index="${index}"]`);
                optionEl.setAttribute('data-id', ro.id);

                let txtTitle = optionEl.querySelector(`[data-part="option-title"]`);
                txtTitle.value = this._selectOptions[i].title;

                let txtValue = optionEl.querySelector(`[data-part="option-value"]`);
                txtValue.value = this._selectOptions[i].value;

                let removeBtn = optionEl.querySelector('[data-action="remove"]');
                removeBtn.setAttribute("style", "display: none");
                this._attachHandlers(optionEl);
            }
            else
            {
                this._addSelectOption(index, this._selectOptions[i]);
            }
        }
    }
}