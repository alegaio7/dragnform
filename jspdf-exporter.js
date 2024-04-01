import * as constants from './constants.js';
import { Poppins } from './poppins-normal.js';
import { Poppins_bold } from './poppins-bold.js';
import { Poppins_italic } from './poppins-italic.js';
import { Poppins_bold_italic } from './poppins-bold-italic.js';

export default class jsPDFExporter {
    constructor(options) {
        this.options = options;
    }

    exportPDF(json) {
        if (!json)
            throw new Error('json is required');

        if (!json.widgets)
            throw new Error('Widgets is required in json object');

        if (json.widgets.length === 0)
            throw new Error('widgets collection has no elements in json object');

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

        doc.setFont('Poppins', 'normal');
        doc.text("HOLA! En Poppins!", 50, 50);

        doc.setFont('Poppins', 'bold');
        doc.text("Poppins bold!", 50, 100);

        doc.setFont('Poppins', 'italic');
        doc.text("Poppins italic!", 50, 150);

        doc.setFont('Poppins', 'bolditalic');
        doc.text("Poppins bold italic!", 50, 200);


        doc.save("test.pdf");

        /* json.widgets.forEach(w => {
            this._renderWidget(w, doc);
        }); */
    }

    _renderWidget(w, doc) {
        if (w.type === constants.WIDGET_PDF_OBJECT_BOX) {
            this._renderBox(w, doc);
        } else if (w.type === constants.WIDGET_PDF_OBJECT_TYPEFACE) {
            this._renderTypefaceChange(w, doc);
        }
    }

    _renderBox(w, doc) {
        if (w.hasBorderInfo) {
            doc.rect(w.x, w.y, w.width, w.height);
        }
    }

    _renderTypefaceChange(w, doc) {
        doc.setFont('Poppins-normal', 'normal');
    }
}