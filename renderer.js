import * as constants from './constants.js';
import WidgetNumber from './widget-number.js';
import WidgetSpacer from './widget-spacer.js';
import WidgetSubmit from './widget-submit.js';
import WidgetText from './widget-text.js';
import FeatureExtractor from './feature-extractor.js';

export default class Renderer {
    constructor() {
        this._container = null;
        this._domParser = new DOMParser();
        this._featureExtractor = null;
        this._lastRenderOptions = { renderMode: constants.WIDGET_MODE_DESIGN };
        this._widgets = [];
    }

    addWidget(o) {
        var w = this.createWidget(o);
        if (this.findWidget(w.id))
            throw new Error(`widget with id ${w.id} already exists.`);
        this._widgets.push(w);
        this._renderSingleWidget(w, this._domParser, this._lastRenderOptions);
        return w;
    }

    /// <summary>
    /// Creates a widget from a JSON object
    /// </summary>
    createWidget(o) {
        if (!o)
            throw new Error('json object is required');
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

        var json = this._sourceJson;
        json.widgets = [];
        this._widgets.forEach(w => {
            var j = w.exportJson();
            if (j) {
                json.widgets.push(j);
            }
        });

        return json;
    }

    extractFeatures() {
        if (!this._container)
            throw new Error('container not set');

        if (!this._widgets)
            throw new Error('Must render the form first');

        if (!this._featureExtractor)
            this._featureExtractor = new FeatureExtractor();

        var json = this._featureExtractor.extractFeatures(this._container, false); // not recursive for container, each widget will handle its children
        json.container = true;
        json.widgets = [];
        var _t = this;
        this._widgets.forEach(w => {
            var j = w.extractFeatures(_t._featureExtractor, true);
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

    removeWidget(id) {
        var w = this.findWidget(id);
        if (w)
            this._removeWidgetInternal(w);
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
        let validModes = [constants.WIDGET_MODE_DESIGN, constants.WIDGET_MODE_RUN, constants.WIDGET_MODE_VIEW];
        if (validModes.indexOf(renderOptions.renderMode) === -1)
            throw new Error(`Invalid render mode. Must be one of ${validModes.join(', ')}`);
        this._container = container;
        this._clearContainer();
        this._parseJson(json);
        this._renderWidgets(renderOptions);

        if (window.Sortable)
            this._sortable = Sortable.create(container, {
                animation: 150, 
                handle: '.widget-grip',
                onUpdate: function (evt) {
                    var w = this._widgets[evt.oldIndex];
                    this._widgets.splice(evt.oldIndex, 1);
                    this._widgets.splice(evt.newIndex, 0, w);
                }.bind(this)
            });
    }

    /// <summary>
    /// Validates the form widgets. Each widget implements its own validation mechanisms.
    /// Returns an object with a result property indicating if the form is valid and if not, a validations property containing an array of not-passed validations.
    /// </summary>
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
    
    /// <summary>
    /// Clears the container, the widgets array and the sortable object
    /// </summary>
    _clearContainer() {
        if (this._sortable) {
            this._sortable.destroy();
            this._sortable = null;
        }
        this._container.innerHTML = '';
        this._widgets = [];
    }

    /// <summary>
    /// Parses a JSON object and creates widgets. Widgets are stored in the _widgets array.
    /// </summary>
    _parseJson(json) {
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

        this._sourceJson = o;
        o.widgets.forEach(w => {
            if (o.globalClasses)
                w.globalClasses = o.globalClasses;
            if (o.requiredAttributeSettings)
                w.requiredAttributeSettings = o.requiredAttributeSettings;
            var e = this.createWidget(w);
            if (this.findWidget(e.id))
                throw new Error(`widgets collection contains duplicate ids in json object: ${e.id}`);
            e.setValue(w.value);
            this._widgets.push(e);
        });
    }

    _removeWidgetInternal(sender, e) {
        var s = sender.label ? sender.label : sender.id;
        var n = confirm(Strings.WidgetRemoveConfirmationMessage.replace("{0}", s));
        if (!n)
            return;
        var i = this._widgets.indexOf(sender);
        if (i === -1)
            throw new Error('widget not found in widgets array');
        this._widgets.splice(i, 1);
        sender.removeFromDom();
    }

    _renderSingleWidget(w, p, renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        w.render(this._container, p, renderOptions);
        if (renderOptions.renderRemove && renderOptions.renderMode === constants.WIDGET_MODE_DESIGN) {
            w.registerRemoveHandler(this._removeWidgetInternal.bind(this), false);
        }
    }

    /// <summary>
    /// Renders the widgets in the configured container
    /// </summary>
    _renderWidgets(renderOptions) {
        if (!renderOptions)
            renderOptions = {};
        Object.assign(this._lastRenderOptions, renderOptions);
        this._widgets.forEach(w => {
            this._renderSingleWidget(w, this._domParser, renderOptions);
        });
    }
}
