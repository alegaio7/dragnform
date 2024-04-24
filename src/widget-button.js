import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetButton extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_BUTTON, fragment);
        this.buttonClass = fragment.buttonClass;
        this._button = null;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = { buttonClass: this.buttonClass };
        Object.assign(json, localProps);
        return json;
    }

    registerClickHandler(handler, dettach) {
        dettach = !!dettach;
        if (!handler)
            throw new Error('handler is required');
        if (typeof handler !== 'function')
            throw new Error('handler must be a function');

        if (!this._button)
            this._button = this._el.querySelector(`#button_${this.id}`);    
        if (!dettach)
            this._button.addEventListener('click', handler);
        else {
            this._button.removeEventListener('click', handler);
            this._button = null;
        }
    }

    render(container, parser) {
        var template = super._getHTMLTemplate();

        var buttonClass = `${this.globalClasses.button ? 'class="' + this.globalClasses.button : ""}`; // class missing closing quote...closing below
        if (this.buttonClass) 
            buttonClass += (buttonClass === "" ? 'class="' : " ") + `${this.buttonClass}`;
        if (buttonClass !== "")
            buttonClass += '"';

        var bodyhtml = `<button type="button" 
            ${buttonClass}
            id="button_${this.id}" 
            name="${this.name}">`;
        if (this.label)
            bodyhtml += `<span data-part="label">${this.label}</span>`;
        bodyhtml += `</button>`;

        template.designMode.bodySection = bodyhtml;
        template.runMode.bodySection = bodyhtml;
        template.viewMode.bodySection = "";     // buttons don't render in view mode

        super._renderDOM(container, template, parser);
    }
}

export default WidgetButton;