import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetButton extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_BUTTON, fragment);

        if (!fragment.horizontalAlignment)
            this._horizontalAlignment = constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER;
        
        this.buttonClass = fragment.buttonClass;
        this._button = null;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = { 
            buttonClass: this.buttonClass
        };
        Object.assign(json, localProps);
        return json;
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;
        super.refresh();
        var style = this._buildSectionsStyleAttribute();
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length) {
            sections.forEach(s => {
                var label = s.querySelector("[data-part='label']");
                if (label)
                    label.setAttribute("style", style);
            });
        }
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

        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasName: this.name ? true : false,
            id: this.id,
            buttonClass: this.globalClasses.button ?? "",
            buttonIdDesign: buttonIdDesign,
            buttonIdRun: buttonIdRun,
            hasLabel: this.label ? true : false,
            label: this.label,
            mode: constants.WIDGET_MODE_DESIGN,
            name: this.name,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            style: this._buildOuterStyleAttribute(), 
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