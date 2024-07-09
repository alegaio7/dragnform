import * as constants from './constants.js';
import flyter from 'flyter';
import { createPopper } from '@popperjs/core';
import mustache from 'mustache';
import functions from './functions.js';

export default class Widget {
    static _cachedTemplates = new Map();

    constructor(type, fragment) {
        if (!type)
            throw new Error('type is required');

        if (!fragment)
            fragment = {};

        var validTypes = [
            constants.WIDGET_TYPE_BUTTON,
            constants.WIDGET_TYPE_CHECKBOX,
            constants.WIDGET_TYPE_IMAGE,
            constants.WIDGET_TYPE_LABEL,
            constants.WIDGET_TYPE_NUMBER,
            constants.WIDGET_TYPE_RADIO,
            constants.WIDGET_TYPE_SELECT,
            constants.WIDGET_TYPE_SPACER,
            constants.WIDGET_TYPE_TEXT];

        if (validTypes.indexOf(type) === -1)
            throw new Error('Widget type is invalid');

        if (!fragment.id)
            throw new Error('Widget id is required');

        this._batchUpdating = true; // to avoid repeated calls to refresh while running ctor
        
        this._horizontalAlignment = constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT;
        if (fragment.horizontalAlignment && 
            (fragment.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT || 
            fragment.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER || 
            fragment.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT))
                this._horizontalAlignment = fragment.horizontalAlignment;
                        
        this._verticalAlignment = constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER;
        if (fragment.verticalAlignment && 
            (fragment.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_TOP || 
            fragment.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER || 
            fragment.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM))
                this._verticalAlignment = fragment.verticalAlignment;

        this.columns = fragment.columns ?? 12;
        this._el = null;

        this._fontSize = constants.HTML_DEFAULT_FONT_SIZE;
        if (fragment.fontSize && fragment.fontSize >= constants.HTML_MIN_FONT_SIZE && fragment.fontSize <= constants.HTML_MAX_FONT_SIZE) 
            this._fontSize = fragment.fontSize;

        this._fontUnderline = false;
        if (fragment.fontUnderline === true)
            this._fontUnderline = true;

        this._validFontWeights = [constants.HTML_FONT_SIZE_NORMAL, constants.HTML_FONT_SIZE_BOLD];
        this._fontWeight = constants.HTML_FONT_SIZE_NORMAL;
        if (fragment.fontWeight && this._validFontWeights.includes(fragment.fontWeight))
            this._fontWeight = fragment.fontWeight;
        
        this._inlineEditorChangingLabel = false; // used when updating label from inline editor instead of modal, to avoid modifiying the label and cause a flyter error
        this._globalClasses = fragment.globalClasses ?? {};
        this._prevColClass = "widget-col-" + this.columns; // stores the previous colClass before a column change, to remove it from the classList
        this._renderMode = constants.WIDGET_MODE_DESIGN;
        this._validations = fragment.validations ?? [];
        this._value = null;
        
        if (!(this.columns >= 1 && this.columns <= 12))
            throw new Error('Widget columns must be between 1 and 12');

        // if no height came in the json fragment, set it to a default value but set autoHeight true
        this._autoHeight = fragment.autoHeight ?? false;
        this._height = fragment.height ?? constants.WIDGET_DEFAULT_HEIGHT;
        
        this.id = fragment.id;
        this._inPlaceEditor = false;
        this._label = fragment.label ?? constants.WIDGET_LABEL_DEFAULT_VALUE;
        this._labelEl = null; // filled when rendered
        this.name = fragment.name ?? this.id; // the "name" attribute for input elements
        this.type = type;

        this.widgetRenderOptions = fragment.widgetRenderOptions ?? {};

        this._tip = fragment.tip ?? "";

        this.widgetClass = 'widget';
        if (fragment.globalClasses && fragment.globalClasses.widget)
            this.widgetClass += ' ' + fragment.globalClasses.widget;

        this._batchUpdating = false;
    }

    // Props begin
    get autoHeight() { return this._autoHeight; }
    set autoHeight(value) { 
        this._autoHeight = !!value;
        this.refresh();
    }

    get batchUpdating() { return this._batchUpdating; }
    set batchUpdating(value) { 
        this._batchUpdating = !!value;
        if (!this._batchUpdating)
            this.refresh();
     }

    get columns() { return this._columns; }
    set columns(value) { 
        value = parseInt(value);
        if (isNaN(value) || value < 1 || value > 12)
            value = 12;
        this._columns = value;
        this.refresh();
     }

    get domElement() { return this._el; }
    
    get fontSize() { return this._fontSize; }
    set fontSize(value) { 
        if (value >= constants.HTML_MIN_FONT_SIZE && value <= constants.HTML_MAX_FONT_SIZE) {
            this._fontSize = value;
            this.refresh();
        }
    }

    get fontUnderline() { return this._fontUnderline; }
    set fontUnderline(value) { 
        this._fontUnderline = value;
        this.refresh();
    }

    get fontWeight() { return this._fontWeight; }
    set fontWeight(value) { 
        if (this._validFontWeights.indexOf(value) >= 0) {
            this._fontWeight = value;
            this.refresh();
        }
    }

    get globalClasses() { return this._globalClasses; }
    set globalClasses(value) { this._globalClasses = value; }

    get height() { return this._height; }
    set height(value) { 
        this._height = value;
        this.refresh();
    }

    get horizontalAlignment() { return this._horizontalAlignment; }
    set horizontalAlignment(value) { 
        if (value === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT || 
            value === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER || 
            value === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT) {
            this._horizontalAlignment = value;
            this.refresh();
        }
        else
            throw new Error('Invalid alignment value');
    }

    get label() { return this._label; }
    set label(value) { 
        this._label = value;
        this.refresh();
    }
    
    get labelElement() { return this._labelEl; }
    
    get renderMode() { return this._renderMode; }
    set renderMode(value) { 
        if (value === this._renderMode)
            return;
        this._renderMode = value;
        this.refresh();
     }

     get tip() { return this._tip; }
     set tip(value) { 
        this._tip = value;
        this.refresh();
     }

    get validations() { return this._validations; }
    set validations(value) { this._validations = value; }
    
    get value() { return this._value; }
    // must be implemented by child classes. 
    set value(value) { 
        this._value = value
        this._updateContols();
    }

    get verticalAlignment() { return this._verticalAlignment; }
    set verticalAlignment(value) { 
        if (value === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM || 
            value === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER || 
            value === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_TOP) {
            this._verticalAlignment = value;
            this.refresh();
        }
        else
            throw new Error('Invalid vertical alignment value');
    }    
    // Props end
    
    clearError() {
        this._el.classList.remove(`has-error`);
    }

    enableInPlaceEditor() {
        this._inPlaceEditor = this._attachInlineEditor();
    }

    // exports widget info as json
    exportJson() {
        var json = {
            autoHeight: this.autoHeight,
            columns: this.columns, 
            fontSize: this.fontSize,
            fontWeight: this.fontWeight,
            height: this.autoHeight ? null : (this.height ?? null),
            horizontalAlignment: this.horizontalAlignment,
            id: this.id, 
            label: this.label, 
            type: this.type,
            verticalAlignment: this.verticalAlignment,
        };
        return json;
    }

    // extract widget features using a injected extractor.
    extractFeatures(featureExtractor, options) {
        if (!featureExtractor)
            throw new Error('featureExtractor is required');
        if (!this._el)
            return; // some widgets may not be rendered, like submit buttons.
        if (!options)
            options = {};
        options.recursive = options.recursive ?? true;
        var viewEl = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_VIEW}"]`);
        if (viewEl)
            return featureExtractor.extractFeatures(viewEl, options);
    }
    
    getEditorProperties() {
        return [
            { name: "autoHeight", type: "boolean", elementId: "chkWidgetPropAutoHeight", value: this.autoHeight },
            { name: "columns", type: "number", elementId: "txtWidgetPropColumns", value: this.columns },
            { name: "fontSize", type: "number", elementId: "txtWidgetFontSize", value: this.fontSize },
            { name: "fontUnderline", type: "boolean", elementId: "chkWidgetPropFontUnderline", value: this.fontUnderline },
            { name: "fontWeight", type: "multiple", elementIds: ["optFontWeightNormal", "optFontWeightBold"], value: this.fontWeight },
            { name: "height", type: "number", elementId: "txtWidgetPropHeight", value: functions.convertToPixels(this.height) },
            { name: "horizontalAlignment", type: "multiple", elementIds: ["optAlignHLeft", "optAlignHCenter", "optAlignHRight"], value: this.horizontalAlignment },
            { name: "id", type: "string", elementId: "lblWidgetId", value: Strings.WidgetEditor_Common_Widget_Properties.replace("{0}", this.id), readonly: true },
            { name: "label", type: "string", elementId: "txtWidgetPropLabel", value: this.label },
            { name: "tip", type: "string", elementId: "txtWidgetPropTip", value: this.tip },
            { name: "verticalAlignment", type: "multiple", elementIds: ["optAlignVTop", "optAlignVCenter", "optAlignVBottom"], value: this.verticalAlignment },
        ];
    }

    async getPropertiesEditorTemplate() {
        return await this._getPropertiesEditorTemplateCore("widget-common", "WidgetCommonPropertiesEditor");
    }

    async _getPropertiesEditorTemplateCore(baseName, baseClass) {
        var html = await (await fetch(`/editors/${baseName}.editor.html`)).text();
        return {
            baseName: baseName,
            handlingClassName: baseClass,
            replacements: this._getCommonEditorPropertyReplacements(),
            template: html
        };
    }

    setError(r) {
        var error = this._el.querySelector('[data-part="widget-error"]');
        if (error)
            error.innerHTML = r.message;
        this._el.classList.add('has-error');
    }

    refresh() {
        if (!this._el || this._batchUpdating)
            return;

        // update alignments
        var sections = this._el.querySelectorAll(`[data-show-when]`);
        if (sections && sections.length)
            sections.forEach(s => {
                s.classList.remove("widget-h-align-start");
                s.classList.remove("widget-h-align-center");
                s.classList.remove("widget-h-align-end");
                s.classList.remove("widget-v-align-start");
                s.classList.remove("widget-v-align-center");
                s.classList.remove("widget-v-align-end");
                if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_TOP)
                    s.classList.add("widget-v-align-start");
                else if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER)
                    s.classList.add("widget-v-align-center");
                else if (this.verticalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM)
                    s.classList.add("widget-v-align-end");

                if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT)
                    s.classList.add("widget-h-align-start");
                else if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER)
                    s.classList.add("widget-h-align-center");
                else if (this.horizontalAlignment === constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT)
                    s.classList.add("widget-h-align-end");
            });

        // update columns
        this._el.classList.remove(this._prevColClass);
        var colClass = "widget-col-" + this.columns;
        this._el.classList.add(colClass);
        this._prevColClass = colClass;
        
        if (this.widgetRenderOptions.renderTips && this.tip) {
            var tipCtls = this._el.querySelectorAll(`[data-part="widget-tip"]`);
            if (tipCtls && tipCtls.length)
                tipCtls.forEach(t => t.innerHTML = this.tip);
        }

        // update style
        var style = this._buildOuterStyleAttribute();
        this._el.setAttribute('style', style);

        this._el.setAttribute('data-mode', this.renderMode);

        if (this._labelEl) {
            if (!this._inlineEditorChangingLabel) {
                if (this._flyter)
                    this._flyter.setValue(this.label);
                else
                    this._labelEl.innerHTML = this.label;
            }
        }

        // update the labels in the other views
        var rmLabel = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_RUN}"] [data-part="label"]`);
        if (rmLabel)
            rmLabel.innerHTML = this.label;
        var vwLabel = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_VIEW}"] [data-part="label"]`);
        if (vwLabel)
            vwLabel.innerHTML = this.label;
    }

    /// <summary>
    /// Registers a handler for the 'widget properties' button
    /// </summary>
    registerDoubleClickHandler(handler, dettach) {
        if (!this._el)
            throw new Error('widget not rendered');
        dettach = !!dettach;
        if (!handler)
            throw new Error('handler is required');
        if (typeof handler !== 'function')
            throw new Error('handler must be a function');
        if (!dettach)
            this._el.addEventListener('dblclick', async (e) => {
                await handler(this, e);
            });
        else {
            this._el.removeEventListener('dblclick', handler);
        }
    }

    /// <summary>
    /// Registers a handler for the 'widget properties' button
    /// </summary>
    registerPropertiesButtonHandler(handler, dettach) {
        if (!this._el)
            throw new Error('widget not rendered');
        dettach = !!dettach;
        if (!handler)
            throw new Error('handler is required');
        if (typeof handler !== 'function')
            throw new Error('handler must be a function');

        if (!this._widgetPropertiesBtn) 
            this._widgetPropertiesBtn = this._el.querySelector('[data-part="widget-properties"]');
        if (!this._widgetPropertiesBtn)
            return;
        if (!dettach)
            this._widgetPropertiesBtn.addEventListener('click', async (e) => {
                await handler(this, e);
            });
        else {
            this._widgetPropertiesBtn.removeEventListener('click', handler);
            this._widgetPropertiesBtn = null;
        }
    }

    /// <summary>
    /// Registers a handler for the remove button
    /// </summary>
    registerRemoveButtonHandler(handler, dettach) {
        if (!this._el)
            throw new Error('widget not rendered');
        dettach = !!dettach;
        if (!handler)
            throw new Error('handler is required');
        if (typeof handler !== 'function')
            throw new Error('handler must be a function');

        if (!this._removeWidgetBtn) 
            this._removeWidgetBtn = this._el.querySelector('[data-part="widget-remove"]');
        if (!this._removeWidgetBtn)
            return;
        if (!dettach)
            this._removeWidgetBtn.addEventListener('click', (e) => {
                handler(this, e);
            });
        else {
            this._removeWidgetBtn.removeEventListener('click', handler);
            this._removeWidgetBtn = null;
        }
    }

    removeFromDom() {
        if (this._flyter)
            this._flyter.destroy();
        if (this._el)
            this._el.remove();
    }

    /// <summary>
    /// Base class only parses the container parameter and returns a DOM reference
    /// </summary>
    async render(container, parser) {
        throw new Error("Child class must implement render method");
    }

    validate(validationOptions) {
        return { result: true };
    }

    static getRegexPattern(name) {
        return constants.WIDGET_VALIDATION_PATTERNS.find(p => p.name === name);
    }

    // *******************************************************************************
    // Private methods
    // *******************************************************************************

    _addValidation(name, value) {
        var v = this._findValidation(name);
        if (!v) {
            v = { type: name, value: value };
            this._validations.push(v);
        }
        return v;
    }

    /// <summary>
    /// Attaches an inline editor (flyter) to the widget's label, so it can be editted in place.
    /// </summary>
    _attachInlineEditor() {
        var _t = this;
        if (this.labelElement) {
            this._flyter = flyter.attach(this.labelElement, { 
                type: {
                    name: 'text'
                },
                okButton: {
                    text: Strings.Flyter_OkButtonText,
                },
                cancelButton: {
                    text: Strings.Flyter_CancelButtonText,
                },
                initialValue: this.label,
                onSubmit: async function(value, instance) {
                    _t._inlineEditorChangingLabel = true;
                    _t.label = value;
                    _t._inlineEditorChangingLabel = false;
                },
                renderer: {
                    name: 'popup',
                    config: {
                        popper: createPopper,
                        closeOnClickOutside: false,
                        onShow: async function(renderer) {
                            var inp = renderer.getMarkup().querySelector('input');
                            if (inp) {
                                inp.focus();
                                inp.select();
                                inp.addEventListener("keydown", function(e) {
                                    if (e.key === "Escape") {
                                        renderer.getSession().cancel();
                                        inp.removeEventListener("keydown", this);
                                    }
                                });
                            }
                        }
                    }
                },
                submitOnEnter: true
            });

            return true;
        }

        return false;
    }

    _buildSectionsStyleAttribute() {
        var style = "";
        if (this.fontSize)
            style += `font-size: ${this.fontSize}px;`;
        if (this.fontWeight)
            style += `font-weight: ${this.fontWeight};`;
        if (this.fontUnderline)
            style += `text-decoration: underline;`;
        return style;
    }

    _buildOuterStyleAttribute() {
        var style = "";
        if (this.height && !this.autoHeight)
            style += `height: ${this.height};`;

       return style;
    }

    _findValidation(name) {
        return this.validations.find(v => v.type === name);
    }

    _getCommonEditorPropertyReplacements() { 
        return {
            labelAlignHLeft: Strings.WidgetEditor_Common_Align_H_Left,
            labelAlignHCenter: Strings.WidgetEditor_Common_Align_H_Center,
            labelAlignHRight: Strings.WidgetEditor_Common_Align_H_Right,
            labelAlignVBottom: Strings.WidgetEditor_Common_Align_V_Bottom,
            labelAlignVCenter: Strings.WidgetEditor_Common_Align_V_Center,
            labelAlignVTop: Strings.WidgetEditor_Common_Align_V_Top,
            labelAutoHeight: Strings.WidgetEditor_Common_AutoHeight,
            labelColumns: Strings.WidgetEditor_Common_Columns,
            labelFontProperties: Strings.WidgetEditor_Common_FontProperties,
            labelFontSize: Strings.WidgetEditor_Common_FontSize,
            labelFontUnderline: Strings.WidgetEditor_Common_FontUnderline,
            labelFontWeight: Strings.WidgetEditor_Common_FontWeight,
            labelFontWeightBold: Strings.WidgetEditor_Common_FontWeight_Bold,
            labelFontWeightNormal: Strings.WidgetEditor_Common_FontWeight_Normal,
            labelHeight: Strings.WidgetEditor_Common_Height,
            labelHorizontalAlignment: Strings.WidgetEditor_Common_HorizontalAlignment,
            labelRequired: Strings.WidgetEditor_Common_Required,
            labelVerticalAlignment: Strings.WidgetEditor_Common_VerticalAlignment,
            labelWidgetLabel: Strings.WidgetEditor_Common_Label,
            labelWidgetTip: Strings.WidgetEditor_Common_Tip,
        };
    }

    async _loadWidgetTemplate(name, replacements) {
        var template;
        if (Widget._cachedTemplates.has(name))
            template = Widget._cachedTemplates.get(name);
        else {
            template = await (await fetch(`/widgets/${name}.html`)).text();
            Widget._cachedTemplates.set(name, template);
        }
        var html = mustache.render(template, replacements);
        return html;
    }

    /// <summary>
    /// Renders the widget elements into the container and creates the element (DOM) reference
    /// </summary>
    _renderDOM(container, parser, html) {
        if (!this._el) {
            if (!container)
                throw new Error('container is required');

            if (typeof container === 'string') {
                var c = document.getElementById(container);
                if (!c)
                    throw new Error('container not found');
                container = c;
            } else
                if (!(container instanceof HTMLElement))
                    throw new Error('container must be a string or HTMLElement');

            if (!parser)
                parser = new DOMParser();

            var node = parser.parseFromString(html, `text/html`).body.firstElementChild;
            container.appendChild(node);
            this._el = node;

            // creates a reference for the widget label
            // be aware that not all widgets have labels, i.e. Images, spacers, etc.
            this._labelEl = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_DESIGN}"] [data-part="label"]`);
        }
    }

    _updateContols() {
        // implemented in child classes
    }
}
