import Widget from './widget-base.js';
import * as constants from './constants.js';
import WidgetNumber from './widget-number.js';
import WidgetSpacer from './widget-spacer.js';
import WidgetSubmit from './widget-submit.js';
import WidgetText from './widget-text.js';
import FeatureExtractor from './feature-extractor.js';

export default class Renderer {
    constructor() {
        this._container = null;
        this._widgets = [];
        this._featureExtractor = null;
    }

    /// <summary>
    /// Creates a widget from a JSON object
    /// </summary>
    createWidget(o) {
        if (!o.type)
            throw new Error("widget found with no type property.");

        switch(o.type) {
            case constants.WIDGET_TYPE_NUMBER:
                return new WidgetNumber(o);
            case constants.WIDGET_TYPE_TEXT:
                return new WidgetText(o);
            case constants.WIDGET_TYPE_SUBMIT:
                return new WidgetSubmit(o);
            case constants.WIDGET_TYPE_SPACER:
                return new WidgetSpacer(o);
            default:
                throw new Error(`widget type ${o.type} not found.`);
        }
    }

    get widgets() { 
        return this._widgets;
    }

    exportJson() {
        if (!this._container)
            throw new Error('container not set');

        if (!this._widgets)
            throw new Error('Must render the form first');

        if (!this._featureExtractor)
            this._featureExtractor = new FeatureExtractor();

        var json = this._featureExtractor.exportJson(this._container, false); // not recursive for container, each widget will handle its children
        json.container = true;
        json.widgets = [];
        var _t = this;
        this._widgets.forEach(w => {
            var j = w.exportJson(_t._featureExtractor, true);
            if (j) {
                json.widgets.push(j);
            }
        });

        return json;
    }

    findWidget(id) {
        if (!this._widgets || !this._widgets.length)
            return null;
        return this._widgets.find(w => w.id === id);
    }

    /// <summary>
    /// Renders a form from a JSON object
    /// </summary>
    renderForm(container, json, renderOptions) {
        if (!container)
            throw new Error('container is required');
        if (typeof container === 'string') {
            var c = document.getElementById(container);
            if (!c)
                throw new Error('container not found');
            container = c;
        }
        if (!renderOptions)
            renderOptions = {};
        if (renderOptions.renderMode !== constants.WIDGET_MODE_DESIGN && renderOptions.renderMode !== constants.WIDGET_MODE_VIEW)
            throw new Error(`Invalid render mode. Must be ${constants.WIDGET_MODE_DESIGN} or ${constants.WIDGET_MODE_VIEW}`);
        this._container = container;

        if (renderOptions.clear !== false)
            this._clearContainer();
        this._parseJson(json, renderOptions);
        this._renderWidgets(renderOptions);

        this._sortable = Sortable.create(container, {animation: 150, handle: '.widget-grip'});
    }

    validate(options) {
        if (!this._widgets || !this._widgets.length)
            return false;

        if (!options)
            options = {}

        var validations = [];
        this._widgets.forEach(w => {
            let r = w.validate(options);
            if (!r.result) {
                validations.push(r);
            }
        });
        return {result: validations.length === 0 ? true : false, validations: validations};
    }

    /// ********************************************************************************************************************
    /// Private methods
    /// ********************************************************************************************************************
    _clearContainer() {
        if (this._sortable) {
            this._sortable.destroy();
            this._sortable = null;
        }
        this._container.innerHTML = '';
        this._widgets = [];
    }

    _parseJson(json, options) {
        if (!json)
            throw new Error('json is required');

        var o;
        if (typeof json === 'string')
            o = JSON.parse(json);
        else
            o = json;

        if (!o.name)
            throw new Error('name is required in json object');

        if (!o.version)
            throw new Error('version is required in json object');

        if (!o.widgets)
            throw new Error('widgets is required in json object');

        if (!o.widgets.length)
            throw new Error('widgets collection has no elements in json object');

        var _t = this;
        o.widgets.forEach(w => {
            if (o.globalClasses)
                w.globalClasses = o.globalClasses;
            if (o.requiredAttributeSettings)
                w.requiredAttributeSettings = o.requiredAttributeSettings;
            var e = _t.createWidget(w);
            if (_t.findWidget(e.id))
                throw new Error(`widgets collection contains duplicate ids in json object: ${e.id}`);
            e.setValue(w.value);
            _t._widgets.push(e);
        });
    }

    _renderWidgets(options) {
        if (!options)
            options = {};
        var _t = this;
        var p = new DOMParser()
        this._widgets.forEach(w => {
            w.render(_t._container, p, options);
        });
    }
}
