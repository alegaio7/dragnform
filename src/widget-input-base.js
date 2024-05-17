import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetInputBase extends Widget {
    constructor(widgetType, fragment) {
        super(widgetType, fragment);

        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";

        // check common validations
        this._required = false;
        this.requiredValidationMessage = "";
        var v = this._findValidation("required");
        if (v) {
            this._required = !!v.value;
            this.requiredValidationMessage = v.message ?? Strings.WidgetValidation_RequiredMessage;
        }
    }

    get required() { return this._required; }
    set required(value) {
        this._required = value;
        this.refresh();
    }

    /// <summary>
    /// Base rendering logic for input widgets (text, number, etc).
    /// </summary>
    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);
        super.refresh();
        this._updateContols();

        var _t = this;
        var inputs = this._el.querySelectorAll("input"); // input for design mode and run mode.
        if (inputs)
            inputs.forEach(input => {
                input.addEventListener("blur", function(e) {
                    _t.value = e.currentTarget.value;
                });
            });
    }

    _updateContols() {
        // _el can be null if element was not rendered yet
        if (this._el) {
            var inputs = this._el.querySelectorAll("input");
            if (inputs && inputs.length) {
                inputs.forEach(input => {
                    input.value = this.value;
                });
            }

            var viewModeValue = this._el.querySelector(`span[data-part="value"]`);
            if (viewModeValue)
                viewModeValue.innerHTML = this.value;
        }
    }

    _validateInputCtl(input) {
        var r;
        if (!input) {
            r = { result: false, message: `Widget ${this.id}: input control not found` };
        }
        else if (!input.value && this.required) {
            r = { result: false, message: this.requiredValidationMessage };
        }

        if (!r)
            r = { result: true };

        return r;
    }
}

export default WidgetInputBase;