import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetInputBase extends Widget {
    constructor(widgetType, fragment) {
        super(widgetType, fragment);

        // check common validations
        var vals = this.validations;
        if (vals.length) {
            vals.forEach(v => {
                if (v.type === "required") {
                    v.value = !!v.value;
                    v.message = v.message ?? constants.WIDGET_VALIDATION_REQUIRED;
                }
            });
        }
    }

    /// <summary>
    /// Base rendering logic for input widgets (text, number, etc).
    /// </summary>
    _renderDOM(container, parser, html) {
        super._renderDOM(container, parser, html);
        super._updateUI();
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
            r = { result: false, message: this.requiredMessage };
        }

        if (!r)
            r = { result: true };

        return r;
    }
}

export default WidgetInputBase;