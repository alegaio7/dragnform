import * as constants from './constants.js';
import flyter from 'flyter';
import { createPopper } from '@popperjs/core';

export default class Widget {
    constructor(type, fragment) {
        if (!type)
            throw new Error('type is required');

        if (!fragment)
            fragment = {};

        var validTypes = [
            constants.WIDGET_TYPE_BUTTON,
            constants.WIDGET_TYPE_IMAGE,
            constants.WIDGET_TYPE_NUMBER,
            constants.WIDGET_TYPE_SPACER,
            constants.WIDGET_TYPE_TEXT];

        if (validTypes.indexOf(type) === -1)
            throw new Error('Widget type is invalid');

        if (!fragment.id)
            throw new Error('Widget id is required');

        this._renderMode = constants.WIDGET_MODE_DESIGN;
        this._el = null;
        this._globalClasses = fragment.globalClasses ?? {};
        this._validations = fragment.validations ?? [];
        this._value = null;

        this.columns = fragment.columns ?? 12;
        
        if (!(this.columns >= 1 && this.columns <= 12))
            throw new Error('Widget columns must be between 1 and 12');
        this.columnsClass = "widget-col-" + this.columns;

        var h = fragment.height ?? constants.WIDGET_DEFAULT_HEIGHT;
        this.height = h;
        
        this.id = fragment.id;
        this._inPlaceEditor = false;
        this._label = fragment.label ?? constants.WIDGET_LABEL_DEFAULT_VALUE;
        this._labelEl = null; // filled when rendered
        this.name = fragment.name ?? this.id;
        this.type = type;

        this.widgetRenderOptions = fragment.widgetRenderOptions ?? {};

        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";
        
        this.tip = fragment.tip;

        this.widgetClass = 'widget';
        if (fragment.globalClasses && fragment.globalClasses.widget)
            this.widgetClass += ' ' + fragment.globalClasses.widget;
    }

    // Props begin
    get domElement() { return this._el; }

    get label() { return this._label; }
    set label(value) { 
        this._label = value;
        this._updateUI();
    }
    
    get labelElement() { return this._labelEl; }
    
    get renderMode() { return this._renderMode; }
    set renderMode(value) { 
        if (value === this._renderMode)
            return;
        this._renderMode = value;
        this._updateUI();
     }

    get globalClasses() { return this._globalClasses; }
    set globalClasses(value) { this._globalClasses = value; }
    get validations() { return this._validations; }
    set validations(value) { this._validations = value; }
    
    get value() { return this._value; }
    // must be implemented by child classes. 
    set value(value) { 
        this._value = value
        this._updateContols();
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
            columns: this.columns, 
            id: this.id, 
            label: this.label, 
            type: this.type
        };
        return json;
    }

    // extract widget features using a injected extractor.
    extractFeatures(featureExtractor, recursive) {
        if (!featureExtractor)
            throw new Error('featureExtractor is required');
        if (!this._el)
            return; // some widgets may not be rendered, like submit buttons.
        recursive = recursive ?? true;
        var viewEl = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_VIEW}"]`);
        if (viewEl)
            return featureExtractor.extractFeatures(viewEl, recursive);
    }
    
    setError(r) {
        var error = this._el.querySelector('.widget-error');
        error.innerHTML = r.message;
        this._el.classList.add('has-error');
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
            this._widgetPropertiesBtn = this._el.querySelector('.widget-properties');
        if (!this._widgetPropertiesBtn)
            return;
        if (!dettach)
            this._widgetPropertiesBtn.addEventListener('click', (e) => {
                handler(this, e);
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
            this._removeWidgetBtn = this._el.querySelector('.widget-remove');
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
        if (this._flyter) {
            this._flyter.getRendeder().destroy();
            this._flyter.destroy();
        }
        if (this._el)
            this._el.remove();
    }

    /// <summary>
    /// Base class only parses the container parameter and returns a DOM reference
    /// </summary>
    render(container, parser) {
        throw new Error("Child class must implement render method");
    }

    validate() {
        return { result: true };
    }

    static getRegexPattern(name) {
        return constants.WIDGET_VALIDATION_PATTERNS.find(p => p.name === name);
    }

    /// *******************************************************************************
    /// Private methods
    /// *******************************************************************************

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
                    _t.label = value;
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

    /// <summary>
    /// Returns a template object containing the sections to be rendered by the widget.
    /// Each widget must suply logic to render itself in 3 modes: design, run and view.
    /// Every widget must begin with a heading and end with a footer.
    /// The rendering process itself is carried on by each widget.
    /// </summary>
    _getHTMLTemplate() {
        var cssClass = this.widgetClass + "";
        if (this.widgetRenderOptions.renderGrip)
            cssClass = "has-grip" + (cssClass ? " " : "") + cssClass;

        var h = "";
        if (this.height)
            h = `style="height: ${this.height}"`;
        var template = {
            heading: `<div id="${this.id}" class="${cssClass} ${this.columnsClass}" data-type="${this.type}" data-mode="${constants.WIDGET_MODE_DESIGN}" ${h}>`,
            designMode: {
                openingSection: `<div data-show-when="${constants.WIDGET_MODE_DESIGN}">`,
                designControlSection: `<div class="widget-properties" title="${Strings.WidgetPropertiesButtonTitle}"></div>` +
                    (this.widgetRenderOptions.renderRemove ? `<div class="widget-remove" title="${Strings.WidgetRemoveButtonTitle}"></div>` : ""),
                bodySection: null,
                gripSection: this.widgetRenderOptions.renderGrip ? `<div class="widget-grip"></div>` : null,
                tipSection: this.widgetRenderOptions.renderTips ? `<div class="widget-tip"></div>` : null,
                validationSection: `<div class="widget-error""></div>`,
                closingSection: `</div>`
            },
            runMode: {
                openingSection: `<div data-show-when="${constants.WIDGET_MODE_RUN}">`,
                designControlSection: null,
                bodySection: null,
                gripSection: null,
                tipSection: this.widgetRenderOptions.renderTips ? `<div class="widget-tip"></div>` : null,
                validationSection: `<div class="widget-error""></div>`,
                closingSection: `</div>`
            },
            viewMode: {
                openingSection: `<div data-show-when="${constants.WIDGET_MODE_VIEW}">`,
                bodySection: null,
                closingSection: `</div>`
            },
            footer: `</div>`
        };
        return template;
    }

    /// <summary>
    /// Renders the widget elements into the container and creates the element (DOM) reference
    /// </summary>
    _renderDOM(container, template, parser) {
        if (!this._el) {
            if (!container)
                throw new Error('container is required');
            if (!template)
                throw new Error('template is required');
            if (typeof template !== 'object')
                throw new Error('template must be an object');

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

            var html = template.heading;                        // not optional
            // design mode parts
            html += template.designMode.openingSection;         // not optional
            html += template.designMode.designControlSection ?? "";
            html += template.designMode.bodySection ?? "";
            html += template.designMode.gripSection ?? "";
            html += template.designMode.tipSection ?? "";
            html += template.designMode.validationSection ?? "";
            html += template.designMode.closingSection;         // not optional

            // run mode parts
            html += template.runMode.openingSection;            // not optional
            html += template.runMode.designControl ?? "";
            html += template.runMode.bodySection ?? "";
            html += template.runMode.gripSection ?? "";
            html += template.runMode.tipSection ?? "";
            html += template.runMode.validationSection ?? "";
            html += template.runMode.closingSection;            // not optional

            // view mode parts
            html += template.viewMode.openingSection;           // not optional
            html += template.viewMode.bodySection ?? "";
            html += template.viewMode.closingSection;           // not optional

            html += template.footer;                            // not optional

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

    _updateUI() {
        if (!this._el)
            return;
        if (this.widgetRenderOptions.renderTips && this.tip) {
            var tipCtls = this._el.querySelectorAll(`.widget-tip`);
            if (tipCtls && tipCtls.length)
                tipCtls.forEach(t => t.innerHTML = this.tip);
        }

        this._el.setAttribute('data-mode', this.renderMode);

        // only modify label's markup if not using in-place editor, since this editor changes the original markup
        if (this._labelEl && !this._inPlaceEditor)
            this._labelEl.innerHTML = this.label;

        // update the labels in the other views
        var rmLabel = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_RUN}"] [data-part="label"]`);
        if (rmLabel)
            rmLabel.innerHTML = this.label;
        var vwLabel = this._el.querySelector(`[data-show-when="${constants.WIDGET_MODE_VIEW}"] [data-part="label"]`);
        if (vwLabel)
            vwLabel.innerHTML = this.label;
    }
}
