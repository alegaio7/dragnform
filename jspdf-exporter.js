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

        if (!this.options.font.defaultWeight)
            this.options.font.defaultWeight = 300;
        if (!this.options.font.defaultFamily)
            this.options.font.defaultFamily = 'Poppins';
        if (!this.options.cssToPdfScaling)
            this.options.cssToPdfScaling = constants.DEFAULT_PDF_DPI / constants.DEFAULT_SCREEN_DPI;
        if (!this.options.devicePixelScaling)
            this.options.devicePixelScaling = window.devicePixelRatio;  // TODO Implement this in the future

        this._lastStateInfo = null;
        this._renderState = [];
    }

    exportPDF(json, options) {
        if (!json)
            throw new Error('json is required');

        if (!json.widgets)
            throw new Error('Widgets is required in json object');

        if (json.widgets.length === 0)
            throw new Error('widgets collection has no elements in json object');

        if (!options)
            options = {saveToFile: true, filename: "form.pdf"};

        if (options.saveToFile && !options.filename)
            options.filename = "form.pdf";

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ 
            unit: 'px',
            hotfixes: ["px_scaling"]
         }); // create jsPDF object
    
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

        /*
        doc.setFont('Poppins', 'normal');
        doc.text("HOLA! En Poppins!", 50, 50);

        doc.setFont('Poppins', 'bold');
        doc.text("Poppins bold!", 50, 100);

        doc.setFont('Poppins', 'italic');
        doc.text("Poppins italic!", 50, 150);

        doc.setFont('Poppins', 'bolditalic');
        doc.text("Poppins bold italic!", 50, 200);
        */
        
        this._wRatio = constants.PAPER_SIZE_A4_WIDTH / json.width;
        // to calculate height proportions, since HTML is a flow layout with no fixed height, we take the proportional width of the container
        // and multiply it by the A4 paper proportion (height / width) which is roughly 1.4142
        this._hRatio = constants.PAPER_SIZE_A4_HEIGHT / (json.width * (constants.PAPER_SIZE_A4_HEIGHT / constants.PAPER_SIZE_A4_WIDTH));

        this._renderBox(json, doc, null);       // render container box

        json.widgets.forEach(w => {
            this._renderWidget(w, doc, null);
        });

        if (options.saveToFile)
            doc.save(options.filename);
        else
            return doc.output("blob");
    }

    _renderWidget(w, doc, parent) {
        if (w.type === constants.WIDGET_PDF_OBJECT_BOX) {
            this._renderBox(w, doc, parent);
        } else if (w.type === constants.WIDGET_PDF_OBJECT_STYLED_TEXT) {
            if (this._lastStateInfo)
                this._saveState(this._getFontInfo(this._lastStateInfo));
            
            this._lastStateInfo = w;

            console.log(`Rendering styled widget font:${w.fontFamily}, size:${w.fontSize}, style:${w.fontStyle}, weight:${w.fontWeight}`);
            this._renderStyledText(w, doc, parent);

        } else if (w.type === constants.WIDGET_PDF_OBJECT_SIMPLE_TEXT) {
            this._renderSimpleText(w, doc, parent);
        } else if (w.type === constants.WIDGET_PDF_OBJECT_IMAGE) {
            this._renderImage(w, doc, parent);
        }

        if (w.children && w.children.length) {
            w.children.forEach(c => {
                this._renderWidget(c, doc, w);
            });
        }

        if (w.type === constants.WIDGET_PDF_OBJECT_STYLED_TEXT && this._renderState.length)
            this._lastStateInfo = this._restoreState(doc);
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
    }

    _getFontInfo(w, parent) {
        var ff, fw, fs;
        this._copyFromParentFont(w, parent);

        // name
        ff = w.fontFamily;
        if (!ff)
            ff = this.options.font.defaultFamily;

        // style
        if (w.fontStyle && "italic normal".indexOf(w.fontStyle) >= 0)
            fs = w.fontStyle;
        if (!fs)
            fs = 'normal';

        // weight
        if (!("normal bold bolder".indexOf(w.fontWeight) >=0)) {
            if (w.fontWeight)
                fw = parseInt(w.fontWeight);
            
            if (this.options.font.weightMappings) {
                var fwm = this.options.font.weightMappings.find(x => x.fontWeight === fw);
                if (fwm)
                    fw = fwm.pdfFontWeight;
            }
        }
        
        if (!fw)
            fw = this.options.font.defaultWeight;

        var fn = parseInt(w.fontSize, 10);
        if (!fn)
            fn = constants.DEFAULT_PDF_FONT_SIZE;
        fn *= this._hRatio * this.options.cssToPdfScaling;

        return {name: ff, style: fs, size: fn, weight: fw, color: w.color};
    }

    _renderBox(w, doc, parent) {
        if (w.hasBorderInfo) {
            this._copyFromParentBox(w, parent);
            if (isNaN(w.x) || isNaN(w.y) || isNaN(w.width) || isNaN(w.height))
                return;
            doc.rect(w.x * this._wRatio, w.y * this._hRatio, w.width * this._wRatio, w.height * this._hRatio);
        }
        this._copyFromParentFont(w, parent);
    }

    _renderStyledText(w, doc, parent) {
        var fi = this._getFontInfo(w, parent);
        doc.setFont(fi.name, fi.style, fi.weight);
        doc.setFontSize(fi.size);
        doc.setTextColor(fi.color);
    }

    _renderSimpleText(w, doc, parent) {
        // this._copyFromParentBox(w, parent); // text nodes don't
        if (isNaN(w.x) || isNaN(w.y) || isNaN(w.width) || isNaN(w.height))
            return;
        var x = w.x * this._wRatio;
        var y = w.y * this._hRatio + (w.height * this._hRatio);
        doc.text(w.text, x, y);
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

        var x = w.x * this._wRatio;
        var y = w.y * this._hRatio;
        var width = w.width * this._wRatio;
        var height = w.height * this._hRatio;
        doc.addImage(data, x, y, width, height);
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