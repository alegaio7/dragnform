export default class FeatureExtractor {
    constructor() {
        
    }

    extract(el, isRoot) {
        if (!el)
            throw new Error('Feature extractor: element is required');
        
        if (typeof el !== 'object')
            throw new Error('Feature extractor: element must be an object');

        if (!(el instanceof HTMLElement))
                throw new Error('Feature extractor: element must be a HTMLElement');

        isRoot = !!isRoot;

        var parent = el.parentElement;

        var nodes = el.childNodes;
    }

    _parseTag(node) {
        // is parsed element is root (a container), it should be a DIV.
        // In that case, we need its size, and display properties.
        var json = node.getBoundingClientRect();
        var cs = window.getComputedStyle(node);
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
            json.type = 'styledText';
            json.text = node.innerText;
            Object.assign(json, this._getBorderProperties(cs));
            Object.assign(json, this._getFontProperties(cs));
        } else if (node.tagName === 'TEXT') {
            json.type = 'text';
            json.text = node.textContent;
        }
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
}
