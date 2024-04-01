import * as constants from './constants.js';

export const NODE_TYPE_ELEMENT = 1;
export const NODE_TYPE_ATTRIBUTE = 2;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_CDATA_SECTION = 4;
export const NODE_TYPE_ENTITY_REFERENCE = 5;
export const NODE_TYPE_ENTITY = 6;
export const NODE_TYPE_PROCESSING_INSTRUCTION = 7;
export const NODE_TYPE_COMMENT = 8;
export const NODE_TYPE_DOCUMENT = 9;
export const NODE_TYPE_DOCUMENT_TYPE = 10;
export const NODE_TYPE_DOCUMENT_FRAGMENT = 11;
export const NODE_TYPE_NOTATION = 12;

export default class FeatureExtractor {
    constructor() {
        this._colorRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
    }

    exportJson(el, recursive) {
        if (!el)
            throw new Error('Feature extractor: element is required');
        
        if (typeof el !== 'object')
            throw new Error('Feature extractor: element must be an object');

        recursive = !!recursive;
        var json = this._parseTag(el);
        if (!json)
            return null;

        if (recursive)
            el.childNodes.forEach((node) => {
                var nodeJson = this.exportJson(node, recursive);
                if (nodeJson) {
                    if (!json.children)
                        json.children = [];
                        json.children.push(nodeJson);
                }
            });

        return json;
    }

    _parseTag(node) {
        if (!node.getBoundingClientRect) {
            if (node.nodeType === NODE_TYPE_TEXT)
                return { type: 'text', text: node.textContent };
            return null;
        }
        // is parsed element is root (a container), it should be a DIV.
        // In that case, we need its size, and display properties.
        var cs = window.getComputedStyle(node);
        if (cs.display === 'none')
            return null; // do not render non-visible elements
        var json = {};
        json.id = node.id;
        Object.assign(json, this._getBoundingClientRect(node));
        if (node.tagName === 'DIV') {
            json.type = constants.WIDGET_PDF_OBJECT_BOX;
            Object.assign(json, this._getBorderProperties(cs));
        } else if (node.tagName === 'LABEL') {
            json.type = constants.WIDGET_PDF_OBJECT_TYPEFACE;
            // has no innerText or textContent
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'SPAN') {
            json.type = constants.WIDGET_PDF_OBJECT_TYPEFACE;;
            // json.text = node.innerText; // text in spans is obtained from child node text
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'TEXT') {
            json.type = constants.WIDGET_PDF_OBJECT_TEXT;
            json.text = node.textContent;
        } else
            json = null; // unsupported node type

        return json;
    }

    _getBorderProperties(cs, addRadius) {
        addRadius = !!addRadius;
        var json = {};
        var hasBorderInfo = false;
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderLeftWidth = cs.borderLeftWidth;
            json.borderLeftStyle = cs.borderLeftStyle;
            json.borderLeftColor = this._rgbToHex(cs.borderLeftColor);
            hasBorderInfo = true;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderRightWidth = cs.borderRightWidth;
            json.borderRightStyle = cs.borderRightStyle;
            json.borderRightColor = this._rgbToHex(cs.borderRightColor);
            hasBorderInfo = true;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderTopWidth = cs.borderTopWidth;
            json.borderTopStyle = cs.borderTopStyle;
            json.borderTopColor = this._rgbToHex(cs.borderTopColor);
            hasBorderInfo = true;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderBottomWidth = cs.borderBottomWidth;
            json.borderBottomStyle = cs.borderBottomStyle;
            json.borderBottomColor = this._rgbToHex(cs.borderBottomColor);
            hasBorderInfo = true;
        }

        if (addRadius && hasBorderInfo) {
            if (json.borderLeftWidth && json.borderTopWidth)
                json.borderTopLeftRadius = cs.borderTopLeftRadius;
            if (json.borderRightWidth && json.borderTopWidth)
                json.borderTopRightRadius = cs.borderTopRightRadius;
            if (json.borderTopWidth && json.borderBottomWidth)
                json.borderBottomLeftRadius = cs.borderBottomLeftRadius;
            if (json.borderBottomWidth && json.borderRightWidth)
                json.borderBottomRightRadius = cs.borderBottomRightRadius;
        }

        json.hasBorderInfo = hasBorderInfo;
        return json;
    }

    _getFontProperties(cs) {
        var json = {};
        json.fontFamily = cs.fontFamily;
        json.fontSize = cs.fontSize;
        json.fontWeight = cs.fontWeight;
        json.fontStyle = cs.fontStyle;
        json.color = this._rgbToHex(cs.color);
        json.textAlign = cs.textAlign;
        if (cs.textDecoration.style && cs.textDecoration.style !== 'none') {
            json.textDecorationColor = this._rgbToHex(cs.textDecoration.color);
            json.textDecorationLine = cs.textDecoration.line;
            json.textDecorationStyle = cs.textDecoration.style;
        }
        if (cs.textTransform && cs.textTransform !== 'none')
            json.textTransform = cs.textTransform;
        return json;
    }

    _convertToPixels(value) {
        return parseFloat(value.replace('px', ''));
    }

    _getBoundingClientRect = element => { 
        const {top, right, bottom, left, width, height, x, y} = element.getBoundingClientRect()
        //return {top, right, bottom, left, width, height, x, y};
        return {x, y, width, height};
    }

    _getOffset( el ) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    // function that transforms a color text like rgb(0, 0, 0) to a hex color value
    _rgbToHex = (rgb) => {
        var matches = this._colorRegex.exec(rgb);
        return "#" + this._componentToHex(parseInt(matches[1])) + this._componentToHex(parseInt(matches[2])) + this._componentToHex(parseInt(matches[3]));
    }

    _componentToHex = (c) => {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}
