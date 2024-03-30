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
        
    }

    extract(el) {
        if (!el)
            throw new Error('Feature extractor: element is required');
        
        if (typeof el !== 'object')
            throw new Error('Feature extractor: element must be an object');

        /*if (!(el instanceof HTMLElement))
                throw new Error('Feature extractor: element must be a HTMLElement');*/

        var json = this._parseTag(el);
        if (!json)
            return null;

        el.childNodes.forEach((node) => {
            var nodeJson = this.extract(node);
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
        Object.assign(json, node.getBoundingClientRect());
        if (node.tagName === 'DIV') {
            json.type = 'container';
            json.display = cs.display;
            Object.assign(json, this._getBorderProperties(cs));
        } else if (node.tagName === 'LABEL') {
            json.type = 'textContainer';
            json.display = cs.display;
            // has no innerText or textContent
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'SPAN') {
            json.type = 'textSpan';
            json.text = node.innerText;
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'TEXT') {
            json.type = 'text';
            json.text = node.textContent;
        } else
            json = null; // unsupported node type

        return json;
    }

    _getBorderProperties(cs, addRadius) {
        addRadius = !!addRadius;
        var json = {};
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderLeftWidth = cs.borderLeftWidth;
            json.borderLeftStyle = cs.borderLeftStyle;
            json.borderLeftColor = cs.borderLeftColor;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderRightWidth = cs.borderRightWidth;
            json.borderRightStyle = cs.borderRightStyle;
            json.borderRightColor = cs.borderRightColor;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderTopWidth = cs.borderTopWidth;
            json.borderTopStyle = cs.borderTopStyle;
            json.borderTopColor = cs.borderTopColor;
        }
        if (this._convertToPixels(cs.borderLeftWidth)) {
            json.borderBottomWidth = cs.borderBottomWidth;
            json.borderBottomStyle = cs.borderBottomStyle;
            json.borderBottomColor = cs.borderBottomColor;
        }
        if (addRadius) {
            if (json.borderLeftWidth && json.borderTopWidth)
                json.borderTopLeftRadius = cs.borderTopLeftRadius;
            if (json.borderRightWidth && json.borderTopWidth)
                json.borderTopRightRadius = cs.borderTopRightRadius;
            if (json.borderTopWidth && json.borderBottomWidth)
                json.borderBottomLeftRadius = cs.borderBottomLeftRadius;
            if (json.borderBottomWidth && json.borderRightWidth)
                json.borderBottomRightRadius = cs.borderBottomRightRadius;
        }
        return json;
    }

    _getFontProperties(cs) {
        var json = {};
        json.fontFamily = cs.fontFamily;
        json.fontSize = cs.fontSize;
        json.fontWeight = cs.fontWeight;
        json.fontStyle = cs.fontStyle;
        json.color = cs.color;
        json.textAlign = cs.textAlign;
        json.textDecoration = cs.textDecoration;
        json.textTransform = cs.textTransform;
        return json;
    }

    _convertToPixels(value) {
        return parseFloat(value.replace('px', ''));
    }

    getOffset( el ) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }
}
