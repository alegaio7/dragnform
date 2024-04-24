import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetImage extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_IMAGE, fragment);
        this._imageData = fragment.data ?? constants.WIDGET_IMAGE_BLANK;
        this.imageAlign = fragment.imageAlign ?? constants.WIDGET_IMAGE_ALIGN_CENTER;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {height: this.height, imageAlign: this.imageAlign, data: this._imageData};
        Object.assign(json, localProps);
        return json;
    }

    render(container, parser) {
        var template = super._getHTMLTemplate();

        var imageClass = `${this.globalClasses.image ? 'class="' + this.globalClasses.image + '"' : ""}`;
        var bodyhtml = `<img
            ${imageClass}
            id="image_${this.id}"
            alt="${this.label ? this.label : this.id}"
            name="${this.name}"
            src="${this._imageData}"`;
        if (this.height || this.imageAlign) {
            bodyhtml += ` style="`;
            if (this.height)
                bodyhtml += `height: ${this.height}; width: auto;`;
            if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_LEFT)
                bodyhtml += "margin-left: 0; margin-right: auto;";
            else if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_RIGHT)
                bodyhtml += "margin-left: auto; margin-right: 0;";
            else
                bodyhtml += "margin-left: auto; margin-right: auto;";
            bodyhtml += `"`;
        }
        bodyhtml += `>`;

        // images render the same in every mode
        template.designMode.bodySection = bodyhtml;
        template.runMode.bodySection = bodyhtml;
        template.viewMode.bodySection = bodyhtml;

        super._renderDOM(container, template, parser);
    }
}

export default WidgetImage;