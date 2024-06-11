import * as constants from './constants.js';
import { Poppins } from './poppins-normal.js';
import { Poppins_bold } from './poppins-bold.js';
import { Poppins_italic } from './poppins-italic.js';
import { Poppins_bold_italic } from './poppins-bold-italic.js';

export default class jsPDFExporter {
    constructor(options) {
        if (!options)
            options = {};

        this.options = options;

        this._validFontWeights = [constants.HTML_FONT_SIZE_NORMAL, constants.HTML_FONT_SIZE_BOLD];
        this._validFontStyles = [constants.HTML_FONT_STYLE_NORMAL, constants.HTML_FONT_STYLE_ITALIC];

        if (!this.options.font)
            this.options.font = {};
        if (!this.options.font.weightMappings) {
            this.options.font.weightMappings = [];
            this.options.font.weightMappings.push({ fontWeight: 100, pdfFontWeight: 'normal' });
            this.options.font.weightMappings.push({ fontWeight: 200, pdfFontWeight: 'normal' });
            this.options.font.weightMappings.push({ fontWeight: 300, pdfFontWeight: 'normal' });
            this.options.font.weightMappings.push({ fontWeight: 400, pdfFontWeight: 'normal' });
            this.options.font.weightMappings.push({ fontWeight: 500, pdfFontWeight: 'bold' });
            this.options.font.weightMappings.push({ fontWeight: 600, pdfFontWeight: 'bold' });
            this.options.font.weightMappings.push({ fontWeight: 700, pdfFontWeight: 'bold' });
            this.options.font.weightMappings.push({ fontWeight: 800, pdfFontWeight: 'bold' });
            this.options.font.weightMappings.push({ fontWeight: 900, pdfFontWeight: 'bold' });
        }

        if (!this.options.font.defaultFontWeight)
            this.options.font.defaultFontWeight = "normal";
        if (!this.options.font.defaultFamily)
            this.options.font.defaultFamily = 'Poppins';
        if (!this.options.cssToPdfScaling)
            this.options.cssToPdfScaling = constants.DEFAULT_PDF_DPI / constants.DEFAULT_SCREEN_DPI;
        if (!this.options.devicePixelScaling)
            this.options.devicePixelScaling = window.devicePixelRatio;  // TODO Implement this in the future

        if (!this.options.pageSize) {
            this.options.pageSize = {
                width: constants.PAPER_SIZE_A4_WIDTH,
                height: constants.PAPER_SIZE_A4_HEIGHT
            };
        }

        if (!this.options.pageSize.width)
            this.options.pageSize.width = constants.PAPER_SIZE_A4_WIDTH;
        if (!this.options.pageSize.height)
            this.options.pageSize.height = constants.PAPER_SIZE_A4_HEIGHT;

        this._yNewPageOffset = 72;
        /*if (!this.options.margins) {
            this.options.margins = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };
        }*/

        this.options.renderContainerBox = !!this.options.renderContainerBox;

        this._pageCount = 0;
        this._lastStateInfo = null;
        this._renderState = [];
    }

    exportPDF(features, options) {
        if (!features)
            throw new Error('features is required');

        if (!features.widgetFeatures)
            throw new Error('widgetFeatures is required in features object');

        if (features.widgetFeatures.length === 0)
            throw new Error('widgetFeatures collection has no elements in json object');

        if (!options)
            options = {saveToFile: true, filename: "form.pdf"};

        if (options.saveToFile && !options.filename)
            options.filename = "form.pdf";

        var mergedOptions = {};
        Object.assign(mergedOptions, this.options);
        Object.assign(mergedOptions, options);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ 
            unit: 'pt',
            format: [mergedOptions.pageSize.width, mergedOptions.pageSize.height],
            hotfixes: ["px_scaling"]
         }); // create jsPDF object
    
        this._pageCount = 1;

        // start rendering widgets until the end of the page
        // if end of page is reached, create a new page and continue rendering
    
        doc.addFileToVFS('Poppins-normal.ttf', Poppins)
        doc.addFont('Poppins-normal.ttf', 'Poppins', 'normal')
        doc.addFileToVFS('Poppins-bold.ttf', Poppins_bold)
        doc.addFont('Poppins-bold.ttf', 'Poppins', 'bold')
        doc.addFileToVFS('Poppins-italic.ttf', Poppins_italic)
        doc.addFont('Poppins-italic.ttf', 'Poppins', 'italic')
        doc.addFileToVFS('Poppins-bold-italic.ttf', Poppins_bold_italic)
        doc.addFont('Poppins-bold-italic.ttf', 'Poppins', 'bolditalic')

        this._wRatio = constants.PAPER_SIZE_A4_WIDTH / features.width;
        // to calculate height proportions, since HTML is a flow layout with no fixed height, we take the proportional width of the container
        // and multiply it by the A4 paper proportion (height / width) which is roughly 1.4142
        this._hRatio = constants.PAPER_SIZE_A4_HEIGHT / (features.width * (constants.PAPER_SIZE_A4_HEIGHT / constants.PAPER_SIZE_A4_WIDTH));

        if (mergedOptions.renderContainerBox) {
            doc.saveGraphicsState();
            doc.setDrawColor(255, 0, 0);
            this._renderBox(features, doc, null);       // render container box
            doc.restoreGraphicsState();
        }

        features.widgetFeatures.forEach(wf => {
            this._renderWidgetFeatures(wf, doc, null);
        });

        if (mergedOptions.saveToFile)
            doc.save(mergedOptions.filename);
        else
            return doc.output("blob");
    }

    /// ********************************************************************************************************************
    /// Private methods
    /// ********************************************************************************************************************

    _adjustRect(r) { 
        if (isNaN(r.x) || isNaN(r.y) || isNaN(r.width) || isNaN(r.height))
            return r;

        var pn = this._pageCount - 1;
        return {
            x: r.x * this._wRatio, 
            y: (r.y * this._hRatio) - (pn * this.options.pageSize.height) + (pn * this._yNewPageOffset), 
            width: r.width * this._wRatio, 
            height: r.height * this._hRatio
        };
    }

    _checkNewPage(w, doc) {
        var r = this._adjustRect(w);

        if (r.y + r.height > this.options.pageSize.height) {
            doc.addPage([this.options.pageSize.width, this.options.pageSize.height]);
            this._pageCount++;
        }
    }

    _copyFromParentBox(w, parent) {
        if (!parent)
            return;
        if (isNaN(w.x))
            w.x = parent.x;
        if (isNaN(w.y))
            w.y = parent.y;
        if (isNaN(w.width))
            w.width = parent.width;
        if (isNaN(w.height))
            w.height = parent.height;
    }

    _copyFromParentFont(w, parent) {
        if (!parent)
            return;
        if (!w.fontFamily)
            w.fontFamily = parent.fontFamily;
        if (!w.fontStyle)
            w.fontStyle = parent.fontStyle;
        if (!w.fontWeight)
            w.fontWeight = parent.fontWeight;
        if (!w.fontUnderline)
            w.fontUnderline = parent.fontUnderline;
    }

    _getFontInfo(wf, parent) {
        var ff, fw, fs;
        this._copyFromParentFont(wf, parent);

        // name
        ff = wf.fontFamily;
        if (!ff)
            ff = this.options.font.defaultFamily;

        // style
        if (wf.fontStyle && this._validFontStyles.includes(wf.fontStyle))
            fs = wf.fontStyle;
        if (!fs)
            fs = constants.HTML_FONT_STYLE_NORMAL;

        // weight
        if (!this._validFontWeights.includes(wf.weight)) {
            if (wf.fontWeight)
                fw = parseInt(wf.fontWeight);
            
            if (this.options.font.weightMappings && fw) {
                var fwm = this.options.font.weightMappings.find(x => x.fontWeight === fw);
                if (fwm)
                    fw = fwm.pdfFontWeight;
            }
        }
        
        if (!fw)
            fw = this.options.font.defaultFontWeight;

        var fn = parseInt(wf.fontSize, 10);
        if (!fn)
            fn = constants.DEFAULT_PDF_FONT_SIZE;
        fn *= this._hRatio * this.options.cssToPdfScaling;
        return {name: ff, style: fs, size: fn, weight: fw, color: wf.color, underline: wf.fontUnderline };
    }

    _renderBox(w, doc, parent) {
        if (w.hasBorderInfo) {
            this._copyFromParentBox(w, parent);
            var r = this._adjustRect(w);
            doc.rect(r.x, r.y, r.width, r.height, 'S');
        }
        else
            this._copyFromParentFont(w, parent);
    }

    _renderWidgetFeatures(wf, doc, parent) {
        this._checkNewPage(wf, doc);

        if (wf.type === constants.WIDGET_PDF_OBJECT_BOX) {
            this._renderBox(wf, doc, parent);
        } else if (wf.type === constants.WIDGET_PDF_OBJECT_STYLED_TEXT) {
            if (this._lastStateInfo)
                this._saveState(this._getFontInfo(this._lastStateInfo));
            
            this._lastStateInfo = wf;

            console.log(`Rendering styled widget font:${wf.fontFamily}, size:${wf.fontSize}, style:${wf.fontStyle}, weight:${wf.fontWeight}, underline: ${wf.fontUnderline}`);
            this._setStyledText(wf, doc, parent);

        } else if (wf.type === constants.WIDGET_PDF_OBJECT_SIMPLE_TEXT) {
            this._renderSimpleText(wf, doc, parent);
        } else if (wf.type === constants.WIDGET_PDF_OBJECT_IMAGE) {
            this._renderImage(wf, doc, parent);
        }

        if (wf.children && wf.children.length) {
            wf.children.forEach(c => {
                this._renderWidgetFeatures(c, doc, wf);
            });
        }

        if (wf.type === constants.WIDGET_PDF_OBJECT_STYLED_TEXT && this._renderState.length)
            this._lastStateInfo = this._restoreState(doc);
    }

    _setStyledText(wf, doc, parent) {
        var fi = this._getFontInfo(wf, parent);
        doc.setFont(fi.name, fi.style, fi.weight);
        doc.setFontSize(fi.size);
        doc.setTextColor(fi.color);
    }

    _renderSimpleText(wf, doc, parent) {
        var fi = this._getFontInfo(wf, parent);
        var r = this._adjustRect(wf);
        var y = r.y + r.height;
        doc.text(wf.text, r.x, y);
        if (fi.underline) {
            const textWidth = doc.getTextWidth(wf.text);
            doc.line(r.x, r.y + r.height, r.x + textWidth, r.y + r.height);
        }
    }

    _renderImage(w, doc, parent) {
        if (!w.data)
            return;
        if (typeof w.data !== "string")
            throw new Error("Image data must be of string format");
        var data;
        if (w.data.startsWith("data:image")) {
            var c = w.data.indexOf(",");
            data = w.data.substring(c + 1);
        } else
            data = w.data;

        var r = this._adjustRect(w);
        doc.addImage(data, r.x, r.y, r.width, r.height);
    }

    _restoreState(doc) {
        if (this._renderState.length === 0)
            throw new Error("Unbalanced calls to saveState and restoreState");
        var r = this._renderState.pop();
        doc.setFont(r.name, r.style, r.weight);
        doc.setFontSize(r.size);
        doc.setTextColor(r.color);
        console.log(`Popped: ${r}`);
        return r;
    }

    _saveState(r) {
        //var r = { name: w.fontFamily, size: w.fontSize, style: w.fontStyle, weight: w.fontWeight };
        this._renderState.push(r);
        console.log(`Pushing: ${r}`);
    }
}