import * as constants from './constants.js';
import functions from './functions.js';

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
        this._range = document.createRange();
        this._scrollOffset = 0;
        this._relOffsetX = 0;
        this._relOffsetY = 0;
    }

    extractFeatures(el, options) {
        if (!el)
            throw new Error('Feature extractor: element is required');
        
        if (typeof el !== 'object')
            throw new Error('Feature extractor: element must be an object');

        if (!options)
            options = {};

        options.recursive = !!options.recursive;
        options.skipScrollOffset = !!options.skipScrollOffset;
        options.isRootContainer = !!options.isRootContainer;
        
        var relOffsetX, relOffsetY;

        var json = this._parseTag(el, options.skipScrollOffset);
        if (!json)
            return null;

        // keep track of container's relative position, we'll need to to substitute the absolute position of children
        if (options.isRootContainer) {
            json.relOffsetX = json.x;
            json.relOffsetY = json.y;
            relOffsetX = json.x;
            relOffsetY = json.y;
            json.x = 0;
            json.y = 0;
        } else {
            relOffsetX = 0;
            relOffsetY = 0;
            if (options.relOffsetX)
                relOffsetX = options.relOffsetX;
            if (options.relOffsetY)
                relOffsetY = options.relOffsetY;

            json.x -= relOffsetX;
            json.y -= relOffsetY;
        }

        if (options.recursive)
            el.childNodes.forEach((node) => {
                var childJson = this.extractFeatures(node, options);
                if (childJson) {
                    if (!json.children)
                        json.children = [];
                    json.children.push(childJson);
                    /*if (childJson.type === constants.WIDGET_PDF_OBJECT_SIMPLE_TEXT) {
                        // text nodes don't have bounding rectangle, and parent nodes don't have text since it's a prop from a child node
                        // so we just copy the text from the child node to the parent, to simplify json structure
                        json.text = childJson.text;
                    } else {
                        if (!json.children)
                            json.children = [];
                        json.children.push(childJson);
                    }*/
                }
            });

        return json;
    }

    setScrollOffset(value) {
        this._scrollOffset = value;
    }

    _parseTag(node, skipScrollOffset) {
        var json = {};

         if (node.nodeType === NODE_TYPE_TEXT) {
            if (!node.textContent || node.textContent.trim() === '')
                return null;
            this._range.selectNode(node);
            json = {type: constants.WIDGET_PDF_OBJECT_SIMPLE_TEXT, text: node.textContent };
            Object.assign(json, this._getBoundingClientRect(this._range, skipScrollOffset));    
            return json;
        }

        // is parsed element is root (a container), it should be a DIV.
        // In that case, we need its size, and display properties.
        var cs = window.getComputedStyle(node);
        if (cs.display === 'none')
            return null; // do not render non-visible elements
        json.id = node.id;
        Object.assign(json, this._getBoundingClientRect(node, skipScrollOffset));
        if (node.tagName === 'DIV') {
            json.type = constants.WIDGET_PDF_OBJECT_BOX;
            Object.assign(json, this._getBorderProperties(cs));
        } else if (node.tagName === 'LABEL' || node.tagName === 'SPAN') {
            json.type = constants.WIDGET_PDF_OBJECT_STYLED_TEXT;
            // has no innerText or textContent
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'IMG') {
            json.type = constants.WIDGET_PDF_OBJECT_IMAGE;
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
            json.data = node.src;
        } else if (node.tagName === 'INPUT' && node.type === 'checkbox') {
            json.type = constants.WIDGET_PDF_OBJECT_CHECKBOX;
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
            json.checked = node.checked;
            json.fieldName = node.name ? node.name : node.id;
        } else
            json = null; // unsupported node type

        return json;
    }

    _getBorderProperties(cs, addRadius) {
        addRadius = !!addRadius;
        var json = {};
        var hasBorderInfo = false;
        if (functions.convertToPixels(cs.borderLeftWidth)) {
            json.borderLeftWidth = cs.borderLeftWidth;
            json.borderLeftStyle = cs.borderLeftStyle;
            json.borderLeftColor = this._rgbToHex(cs.borderLeftColor);
            hasBorderInfo = true;
        }
        if (functions.convertToPixels(cs.borderLeftWidth)) {
            json.borderRightWidth = cs.borderRightWidth;
            json.borderRightStyle = cs.borderRightStyle;
            json.borderRightColor = this._rgbToHex(cs.borderRightColor);
            hasBorderInfo = true;
        }
        if (functions.convertToPixels(cs.borderLeftWidth)) {
            json.borderTopWidth = cs.borderTopWidth;
            json.borderTopStyle = cs.borderTopStyle;
            json.borderTopColor = this._rgbToHex(cs.borderTopColor);
            hasBorderInfo = true;
        }
        if (functions.convertToPixels(cs.borderLeftWidth)) {
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
        json.fontSize = functions.convertToPixels(cs.fontSize);
        json.fontWeight = cs.fontWeight;
        json.fontStyle = cs.fontStyle;
        json.fontUnderline = cs.textDecorationLine === 'underline';
        json.color = this._rgbToHex(cs.color);
        if (cs.textDecoration.style && cs.textDecoration.style !== 'none') {
            json.textDecorationColor = this._rgbToHex(cs.textDecoration.color);
            json.textDecorationLine = cs.textDecoration.line;
            json.textDecorationStyle = cs.textDecoration.style;
        }
        if (cs.textTransform && cs.textTransform !== 'none')
            json.textTransform = cs.textTransform;
        return json;
    }

    _getBoundingClientRect = (element, skipScrollOffset) => { 
        const {top, right, bottom, left, width, height, x, y} = element.getBoundingClientRect()
        //return {top, right, bottom, left, width, height, x, y};
        var so = skipScrollOffset ? 0 : this._scrollOffset;
        return {x, y: y + so, width, height};
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
