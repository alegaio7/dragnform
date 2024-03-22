import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetSubmit extends Widget {
    constructor(options) {
        super(constants.WIDGET_SUBMIT, options);
        this._button = null;
    }

    registerClick(handler, dettach) {
        dettach = !!dettach;
        if (!handler)
            throw new Error('handler is required');
        if (typeof handler !== 'function')
            throw new Error('handler must be a function');

        if (!this._button)
            this._button = document.getElementById(`button_${this.id}`);    
        if (!dettach)
            this._button.addEventListener('click', handler);
        else
            this._button.removeEventListener('click', handler);
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        renderOptions.renderValidationSection = false;
        var template = super._getHTMLTemplate(renderOptions);
        var buttonClass = ""
        if (this.options.globalClasses) {
            if (this.options.globalClasses.button)
                buttonClass = `class="${this.options.globalClasses.button}`;
        }
        if (this.options.submitClass) {
            buttonClass += (buttonClass === "" ? `class="` : " ") + `${this.options.submitClass}`;
            buttonClass += `"`;
        }
        
        var inputHtml = `<button type="button" ${buttonClass} id="button_${this.id}" name="${this.name}">`;
        if (this.label)
            inputHtml += `<span>${this.label}</span>`;
        inputHtml += `</button>`;
        template.bodySection = inputHtml;

        super._renderBase(container, template, parser, renderOptions);
    }
}

export default WidgetSubmit;