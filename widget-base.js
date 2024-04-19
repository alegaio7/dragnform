import * as constants from './constants.js';

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

        this._renderMode = constants.WIDGET_MODE_DESIGN;
        this._el = null;
        this._globalClasses = fragment.globalClasses ?? {};
        this._validations = fragment.validations ?? [];
        this._value = null;

        this.columns = fragment.columns ?? 12;
        if (!(this.columns >= 1 && this.columns <= 12))
            throw new Error('Widget columns must be between 1 and 12');
        this.columnsClass = "widget-col-" + this.columns;
        this.id = fragment.id ?? "Widget" + Math.floor(Math.random() * 1000);
        this.label = fragment.label ?? constants.WIDGET_LABEL_DEFAULT_VALUE;
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
    // Props end

    // must be implemented by child classes. 
    setValue(value) { 
        this._value = value
    } 

    clearError() {
        this._el.classList.remove(`has-error`);
    }

    // exports widget info as json
    exportJson() {
        var json = {columns: this.columns, id: this.id, label: this.label, type: this.type};
        return json;
    }

    // extract widget features using a injected extractor.
    extractFeatures(featureExtractor, recursive) {
        if (!featureExtractor)
            throw new Error('featureExtractor is required');
        if (!this._el)
            return; // some widgets may not be rendered, like submit buttons.
        recursive = recursive ?? true;
        return featureExtractor.extractFeatures(this._el, recursive);
    }
    
    setError(r) {
        var error = this._el.querySelector('.widget-error');
        error.innerHTML = r.message;
        this._el.classList.add('has-error');
    }

    /// <summary>
    /// Registers a handler for the remove button
    /// </summary>
    registerRemoveHandler(handler, dettach) {
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
        if (this._el) {
            this._el.remove();
        }
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

    /// Private methods
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

        var template = {
            heading: `<div id="${this.id}" class="${cssClass} ${this.columnsClass}" data-type="${this.type}" data-mode="${constants.WIDGET_MODE_DESIGN}">`,
            designMode: {
                openingSection: `<div data-show-when="${constants.WIDGET_MODE_DESIGN}">`,
                removeSection: this.widgetRenderOptions.renderRemove ? `<div class="widget-remove" title="${Strings.WidgetRemoveButtonTitle}"></div>` : null,
                bodySection: null,
                gripSection: this.widgetRenderOptions.renderGrip ? `<div class="widget-grip"></div>` : null,
                tipSection: this.widgetRenderOptions.renderTips ? `<div class="widget-tip"></div>` : null,
                validationSection: `<div class="widget-error""></div>`,
                closingSection: `</div>`
            },
            runMode: {
                openingSection: `<div data-show-when="${constants.WIDGET_MODE_RUN}">`,
                removeSection: null,
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
    /// Renders the widget elements into the container and creates the element reference
    /// </summary>
    _renderInternal(container, template, parser) {
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
            html += template.designMode.removeSection ?? "";
            html += template.designMode.bodySection ?? "";
            html += template.designMode.gripSection ?? "";
            html += template.designMode.tipSection ?? "";
            html += template.designMode.validationSection ?? "";
            html += template.designMode.closingSection;         // not optional

            // run mode parts
            html += template.runMode.openingSection;            // not optional
            html += template.runMode.removeSection ?? "";
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

            this._updateUI();
        }
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
    }
}
