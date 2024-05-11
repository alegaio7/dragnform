import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetImage extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_IMAGE, fragment);
        this._imageData = fragment.data ?? constants.WIDGET_IMAGE_BLANK;
        this.imageAlign = fragment.imageAlign ?? constants.WIDGET_IMAGE_ALIGN_CENTER;

        // if no height came in the json fragment, set it to null so the image shows in its full height
        this.autoHeight = false;
        if (!fragment.height) {
            this.height = null;
            this.autoHeith = true;
        }
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {height: this.height, imageAlign: this.imageAlign, data: this._imageData};
        Object.assign(json, localProps);
        return json;
    }

    async render(container, parser) {
        var widgetClass = this.widgetClass ?? "";
        if (this.widgetRenderOptions.renderGrip)
            widgetClass = "has-grip" + (widgetClass ? " " : "") + widgetClass;

        var imageIdDesign = `img_design_${this.id}`;
        var imageIdRun = `img_run_${this.id}`;
        var imageIdView = `img_view_${this.id}`;

        var imageStyle = "";
        if (this.height || this.imageAlign) {
            if (this.height && !this.autoHeight)
                imageStyle += `height: ${this.height}; width: auto;`;
            if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_LEFT)
                imageStyle += "margin-left: 0; margin-right: auto;";
            else if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_RIGHT)
                imageStyle += "margin-left: auto; margin-right: 0;";
            else
                imageStyle += "margin-left: auto; margin-right: auto;";
        }

        var replacements = {
            colClass: "widget-col-" + this.columns,
            hasImageData: this._imageData ? true : false,
            hasImageStyle: imageStyle ? true : false,
            imageData: this._imageData,
            id: this.id,
            imageClass: this.globalClasses.image ?? "",
            imageIdDesign: imageIdDesign,
            imageIdRun: imageIdRun,
            imageIdView: imageIdView,
            imageStyle: imageStyle,
            label: this.label,
            mode: constants.WIDGET_MODE_DESIGN,
            showGrip: this.widgetRenderOptions.renderGrip,
            showRemove: this.widgetRenderOptions.renderRemove,
            style: this.height ? `height: ${this.height}` : "",
            type: this.type,
            widgetClass: widgetClass,
            widgetPropertiesButtonTitle: Strings.WidgetPropertiesButtonTitle,
            widgetRemoveButtonTitle: Strings.WidgetRemoveButtonTitle,
        };

        var html = await super._loadWidgetTemplate("widget-image", replacements);
        super._renderDOM(container, parser, html);
    }
}

export default WidgetImage;