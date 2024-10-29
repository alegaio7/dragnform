import WidgetCommonPropertiesEditor from "./widget-common.editor.js";
import functions from "../dnf-functions.js";

export default class WidgetTextPropertiesEditor extends WidgetCommonPropertiesEditor {
    constructor(options) {
        super(options);
    }

    init() {
        super.init();
        this._updateControls();

        var dateFormat = this._dialogContainer.querySelector('#txtWidgetPropDateFormat');
        if (dateFormat) {
            var events = ['change', 'blur'];
            events.forEach(event => {
                dateFormat.addEventListener(event, e => {
                    if (e.currentTarget.value) {
                        if (!functions.validateDateFormat(e.currentTarget.value)) {
                            alert(Strings.Widget_Date_Invalid_Date_Format);
                            e.currentTarget.value = Strings.Widget_Date_Default_Date_Format;
                            return;
                        }
                        this.widget.dateFormat = dateFormat.value;
                    }
                });
            });
        }
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************    
    _updateControls() {
        super._updateControls();
    }
}