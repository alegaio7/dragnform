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
            this._button = this._el.querySelector(`#btn_run_${this.id}`);    
        if (!dettach)
            this._button.addEventListener('click', handler);
        else {
            this._button.removeEventListener('click', handler);
            this._button = null;
        }
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var buttonIdDesign = `btn_design_${this.id}`;
        var buttonIdRun = `btn_run_${this.id}`;

        // this.globalClasses.button is a generic class applies to all buttons
        // this.buttonClass is a class specific to this button instance
        var buttonClass = this.globalClasses.button ?? ""
        if (this.buttonClass) 
            buttonClass += (buttonClass === "" ? "" : " ") + `${this.buttonClass}`;

        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasName: this.name ? true : false,
            id: this.id,
            buttonClass: buttonClass,
            buttonIdDesign: buttonIdDesign,
            buttonIdRun: buttonIdRun,
            hasLabel: this.label ? true : false,
            label: this.label,
            mode: constants.WIDGET_MODE_DESIGN,
            name: this.name,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            style: this._buildStyleAttribute(), 
            type: this.type,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-button", replacements);
        super._renderDOM(container, parser, html);
    }
}

export default WidgetButton;