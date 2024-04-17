import Widget from "./widget-base.js";
import * as constants from './constants.js';

class WidgetImage extends Widget {
    constructor(fragment) {
        super(constants.WIDGET_TYPE_IMAGE, fragment);
        this._imageData = fragment.data ?? constants.WIDGET_IMAGE_BLANK;

        this.height = fragment.height ?? "";
        this.imageAlign = fragment.imageAlign ?? constants.WIDGET_IMAGE_ALIGN_CENTER;
    }

    exportJson() {
        var json = super.exportJson();
        var localProps = {height: this.height, imageAlign: this.imageAlign, data: this._imageData};
        Object.assign(json, localProps);
        return json;
    }

    render(container, parser, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        renderOptions.renderValidationSection = false;
        var template = super._getHTMLTemplate(renderOptions);
        var imageClass = `${this.globalClasses.image ? 'class="' + this.globalClasses.image + '"' : ""}`;
        var html = `<img
            ${imageClass}
            id="image_${this.id}"
            alt="${this.label ? this.label : this.id}"
            name="${this.name}"
            src="${this._imageData}"`;
        if (this.height || this.imageAlign) {
            html += ` style="`;
            if (this.height)
                html += `height: ${this.height}; width: auto;`;
            if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_LEFT)
                html += "margin-left: 0; margin-right: auto;";
            else if (this.imageAlign === constants.WIDGET_IMAGE_ALIGN_RIGHT)
                html += "margin-left: auto; margin-right: 0;";
            else
                html += "margin-left: auto; margin-right: auto;";
            html += `"`;
        }
        html += `>`;
        template.bodySection = html;
        super._renderInternal(container, template, parser, renderOptions);
    }
}

export default WidgetImage;