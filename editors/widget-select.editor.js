import WidgetCommonPropertiesEditor from "./widget-common.editor.js";

export default class WidgetSelectPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);

        this._selectOptions = options.widget.selectOptions;

        this._savedselectOptions = [...options.widget.selectOptions];

        this._setupSelectOptions();
        this._dialogContainer.querySelector('[data-action="add"]').addEventListener('click', e => {
            var cloneEl = this._addSelectOption();
            if (this._callbacks.onSelectOptionAdd) {
                var ro = this._callbacks.onSelectOptionAdd(this, this.widget, {title: "", value: "" } );
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

        let txtTitle = cloneEl.querySelector(`[data-part="select-title"]`);
        txtTitle.setAttribute('id', `txtSelectOptionTitle${newIndex}`);
        txtTitle.value = selectOption ? selectOption.title : '';

        let txtValue = cloneEl.querySelector(`[data-part="select-value"]`);
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
                if (this._callbacks.onSelectOptionRemove)
                    this._callbacks.onSelectOptionRemove(this, this.widget, id);
            }
        });
        var evts = ['change', 'input'];
        for (var i = 0; i < evts.length; i++) {
            optionEl.querySelector(`[data-part="option-title"]`).addEventListener(evts[i], e => {
                if (this._callbacks.onSelectOptionTitleChanged) {
                    let id = optionEl.getAttribute('data-id');
                    this._callbacks.onSelectOptionTitleChanged(this, this.widget, e.target.value, id);
                }
            });
            optionEl.querySelector(`[data-part="option-value"]`).addEventListener(evts[i], e => {
                if (this._callbacks.onSelectOptionValueChanged) {
                    let id = optionEl.getAttribute('data-id');
                    this._callbacks.onSelectOptionValueChanged(this, this.widget, e.target.value, id);
                }
            });
        }
    }

    _cancelDialogHandler() {
        super._cancelDialogHandler();
        // restore radio options previously saved since they're an array (ref object)
        this.widget.selectOptions = this._savedSelectOptions;
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

    _updateControls() {
        super._updateControls();
    }
}