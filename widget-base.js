import * as constants from './constants.js';

export default class Widget {
    constructor(type, o) {
        if (!type)
            throw new Error('type is required');

        if (!o)
            o = {};

        var validTypes = [
            constants.WIDGET_NUMBER, 
            constants.WIDGET_SPACER, 
            constants.WIDGET_SUBMIT, 
            constants.WIDGET_TEXT];

        if (validTypes.indexOf(type) === -1)
            throw new Error('type is invalid');

        this._el = null;

        this.columns = o.columns ?? 12;
        if (!(this.columns >= 1 && this.columns <= 12))
            throw new Error('columns must be between 1 and 12');
        this.columnsClass = "widget-col-" + this.columns;
        this.id = o.id ?? "Widget" + Math.floor(Math.random() * 1000);
        this.name = o.name ?? this.id;
        this.label = o.label ?? 'New widget';
        this.required = o.required ?? false;
        this.requiredAttributeSettings = null;
        this.requiredMessage = constants.WIDGET_VALIDATION_REQUIRED;
        this.requiredAttributeSettings = o.requiredAttributeSettings ?? {};
        if (!this.requiredAttributeSettings.requiredMarkPosition === constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER)
            this.requiredAttributeSettings.requiredMarkPosition == constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE;

        this.type = type;
        this.widgetClass = 'widget' + (o.widgetClass ??  '');
        if (o.globalClasses && o.globalClasses.widget)
            this.widgetClass += ' ' + o.globalClasses.widget;
        this._options = o;
    }

    clearError() {
        this._el.classList.remove(`has-error`);
    }

    setError(r) {
        var error = this._el.querySelector('.widget-error');
        error.innerHTML = r.message;
        this._el.classList.add('has-error');
    }

    get options() {
        return this._options;
    }

    /// <summary>
    /// Base class only parses the container parameter and returns a DOM reference
    /// </summary>
    render(container, parser, renderOptions) {
        throw new Error("Child class must implement render method");
    }

    _renderBase(container, template, parser, renderOptions) {
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

        if (!renderOptions)
            renderOptions = {};

        if (!parser)
            parser = new DOMParser();
        var html = "";
        html += template.openingSection ?? "";
        html += template.bodySection ?? "";
        html += renderOptions.renderGrip ? (template.gripSection ?? "") : "";
        html += template.validationSection ?? "";
        html += template.closingSection ?? "";
        var node = parser.parseFromString(html, `text/html`).body.firstElementChild;
        container.appendChild(node);
        this._el = node;
    }

    validate() {
        return { result: true };
    }

    static getRegexPattern(name) {
        return constants.WIDGET_VALIDATION_PATTERNS.find(p => p.name === name);
    }

    /// Private methods
    /// Returns a template object containing the sections to be rendered
    _getHTMLTemplate(options) {
        if (!options)
            options = {};
        var cssClass = this.widgetClass + "";
        if (options.renderGrip)
            cssClass = "has-grip" + (cssClass ? " " : "") + cssClass;

        var modeAttr = `data-mode='${options.designMode ? "design" : "view"}'`;
        var template = {
            openingSection: `<div id="${this.id}" class="${cssClass} ${this.columnsClass}" data-type="${this.type}" ${modeAttr}>`,
            bodySection: null,
            gripSection: options.renderGrip ? `<div class="widget-grip"></div>` : "",
            validationSection: options.renderValidationSection ? `<div class="widget-error" id="error_${this.id}"></div>` : null,
            closingSection: `</div>`
        };
        return template;
    }
}
