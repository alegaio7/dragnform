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

        this._el = null;
        this._value = null;

        this.columns = fragment.columns ?? 12;
        if (!(this.columns >= 1 && this.columns <= 12))
            throw new Error('Widget columns must be between 1 and 12');
        this.columnsClass = "widget-col-" + this.columns;
        this.id = fragment.id ?? "Widget" + Math.floor(Math.random() * 1000);
        this.label = fragment.label ?? constants.WIDGET_LABEL_DEFAULT_VALUE;
        this.name = fragment.name ?? this.id;
        this.type = type;
        
        this.requiredAttributeSettings = null;
        this.requiredAttributeSettings = fragment.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.position === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.position == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;
        if (!this.requiredAttributeSettings.mark)
            this.requiredAttributeSettings.mark = "*";

        this._globalClasses = fragment.globalClasses ?? {};
        this._validations = fragment.validations ?? [];

        this.widgetClass = 'widget';
        if (fragment.globalClasses && fragment.globalClasses.widget)
            this.widgetClass += ' ' + fragment.globalClasses.widget;
        
        this.tip = fragment.tip;
    }

    // Props begin
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
    render(container, parser, widgetRenderOptions) {
        throw new Error("Child class must implement render method");
    }

    validate() {
        return { result: true };
    }

    static getRegexPattern(name) {
        return constants.WIDGET_VALIDATION_PATTERNS.find(p => p.name === name);
    }

    /// Private methods
    /// Returns a template object containing the sections to be rendered
    _getHTMLTemplate(widgetRenderOptions) {
        if (!widgetRenderOptions)
            widgetRenderOptions = {};
        var cssClass = this.widgetClass + "";
        if (widgetRenderOptions.renderGrip)
            cssClass = "has-grip" + (cssClass ? " " : "") + cssClass;

        var template = {
            openingSection: `<div id="${this.id}" class="${cssClass} ${this.columnsClass}" data-type="${this.type}" data-mode="${widgetRenderOptions.renderMode}">`,
            removeSection:  (widgetRenderOptions.renderGrip && widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN) ? `<div class="widget-remove" title="${Strings.WidgetRemoveButtonTitle}"></div>` : null,
            bodySection: null,
            gripSection: (widgetRenderOptions.renderGrip && widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN) ? `<div class="widget-grip"></div>` : null,
            tipSection:  (widgetRenderOptions.renderTips && (widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN || widgetRenderOptions.renderMode === constants.WIDGET_MODE_RUN)) ? `<div class="widget-tip"></div>` : null,
            validationSection: widgetRenderOptions.renderValidationSection ? `<div class="widget-error" id="error_${this.id}"></div>` : null,
            closingSection: `</div>`
        };
        return template;
    }

    _renderInternal(container, template, parser, widgetRenderOptions) {
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

            if (!widgetRenderOptions)
                widgetRenderOptions = {};

            if (!parser)
                parser = new DOMParser();
            var html = "";
            html += template.openingSection ?? "";
            html += widgetRenderOptions.renderRemove ? (template.removeSection ?? "") : "";
            html += template.bodySection ?? "";
            html += widgetRenderOptions.renderGrip ? (template.gripSection ?? "") : "";
            html += widgetRenderOptions.renderTips ? (template.tipSection ?? "") : "";
            if (widgetRenderOptions.renderMode !== constants.WIDGET_MODE_VIEW)
                html += template.validationSection ?? "";
            html += template.closingSection ?? "";
            var node = parser.parseFromString(html, `text/html`).body.firstElementChild;
            container.appendChild(node);
            this._el = node;
        }

        if (widgetRenderOptions.renderMode === constants.WIDGET_MODE_DESIGN && widgetRenderOptions.renderTips && this.tip) {
            var tipCtl = this._el.querySelector(`.widget-tip`);
            if (tipCtl)
                tipCtl.innerHTML = this.tip;
        }
    }
}
