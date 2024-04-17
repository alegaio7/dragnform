import * as constants from './constants.js';
import WidgetButton from './widget-button.js';
import WidgetImage from './widget-image.js';
import WidgetNumber from './widget-number.js';
import WidgetSpacer from './widget-spacer.js';
import WidgetText from './widget-text.js';
import FeatureExtractor from './feature-extractor.js';

export default class Canvas {
    constructor(widgetsContainerEl, renderOptions) {
        this._domParser = new DOMParser();
        this._featureExtractor = null;

        if (!renderOptions)
            renderOptions = {};
        if (!renderOptions.renderMode)
            renderOptions.renderMode = constants.WIDGET_MODE_DESIGN;

        this._container = widgetsContainerEl; 
        this._renderOptions = renderOptions;
        this._sourceJson = {
            name: Strings.Canvas_NewForm_Name,
            version: constants.FORMS_DESIGNER_VERSION,
            description: ""
        };
        this._widgets = [];
    }

    addWidget(jsonObj) {
        if (!jsonObj)
            throw new Error('json object is required');
        var w = this.createWidget(jsonObj);
        if (this.findWidget(w.id))
            throw new Error(`widget with id ${w.id} already exists.`);
        this._widgets.push(w);
        this._renderSingleWidget(w, this._domParser);
        return w;
    }

    /// <summary>
    /// Clears the container, the widgets array and the sortable object
    /// </summary>
    clearCanvas() {
        if (this._sortable) {
            this._sortable.destroy();
            this._sortable = null;
        }
        this._container.innerHTML = '';

        this._renderOptions.renderMode = constants.WIDGET_MODE_DESIGN;

        this._widgets = [];
    }

    /// <summary>
    /// Creates a widget from a JSON object
    /// </summary>
    createWidget(o) {
        if (!o)
            throw new Error('json object is required');
        if (!o.type)
            throw new Error("widget found with no type property.");

        var w;
        switch(o.type) {
            case constants.WIDGET_TYPE_BUTTON:
                w = new WidgetButton(o);
                break;
            case constants.WIDGET_TYPE_IMAGE:
                w = new WidgetImage(o);
                break;
            case constants.WIDGET_TYPE_NUMBER:
                w = new WidgetNumber(o);
                break;
            case constants.WIDGET_TYPE_TEXT:
                w = new WidgetText(o);
                break;
            case constants.WIDGET_TYPE_SPACER:
                w = new WidgetSpacer(o);
                break
            default:
                throw new Error(`widget type ${o.type} not found.`);
        }

        // if json does not specify any global classes, use the ones passed in the renderOptions
        var globalClasses = o.globalClasses ? o.globalClasses : this._renderOptions.globalClasses;
        w.globalClasses = globalClasses;

        // idem with the required attribute settings
        var requiredAttributeSettings = o.requiredAttributeSettings ? o.requiredAttributeSettings : this._renderOptions.requiredAttributeSettings;
        w.requiredAttributeSettings = requiredAttributeSettings;

        return w;
    }

    get widgets() { 
        return this._widgets;
    }

    exportJson() {
        if (!this._container)
            throw new Error('container not set');

        if (!this._widgets)
            throw new Error('Must render the form first');

        var json = this._sourceJson ?? {};
        json.renderOptions = this._renderOptions;
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
    /// Renders a form from a json-serialized form object
    /// </summary>
    renderForm(json, renderMode) {
        this.clearCanvas();
        this._parseJson(json, renderMode);
        this._renderWidgets();

        if (window.Sortable)
            this._sortable = Sortable.create(this._container, {
                animation: 150, 
                handle: '.widget-grip',
                onUpdate: function (evt) {
                    var w = this._widgets[evt.oldIndex];
                    this._widgets.splice(evt.oldIndex, 1);
                    this._widgets.splice(evt.newIndex, 0, w);
                }.bind(this)
            });
    }

    get renderMode() {
        return this._renderOptions.renderMode;
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
    /// Parses a JSON object and creates widgets. Widgets are stored in the _widgets array.
    /// </summary>
    _parseJson(json, renderMode) {
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
        if (o.renderOptions) {
            if (o.renderOptions.globalClasses)
                this._renderOptions.globalClasses = o.renderOptions.globalClasses;
            if (o.renderOptions.requiredAttributeSettings)
                this._renderOptions.requiredAttributeSettings = o.renderOptions.requiredAttributeSettings;
        }
        
        if (!renderMode)
            renderMode = constants.WIDGET_MODE_DESIGN;
        this._renderOptions.renderMode = renderMode;

        o.widgets.forEach(fragment => {
            var e = this.createWidget(fragment);
            if (this.findWidget(e.id))
                throw new Error(`widgets collection contains duplicate ids in json object: ${e.id}`);
            e.setValue(fragment.value);
            this._widgets.push(e);
        });

        if (this._sourceJson.renderOptions)
            delete this._sourceJson.renderOptions;
        if (this._sourceJson.widgets)
            delete this._sourceJson.widgets;
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

    _renderSingleWidget(w, p) {
        w.render(this._container, p, this._renderOptions);
        if (this._renderOptions.renderRemove && this._renderOptions.renderMode === constants.WIDGET_MODE_DESIGN) {
            w.registerRemoveHandler(this._removeWidgetInternal.bind(this), false);
        }
    }

    /// <summary>
    /// Renders the widgets in the configured container
    /// </summary>
    _renderWidgets() {
        this._widgets.forEach(w => {
            this._renderSingleWidget(w, this._domParser);
        });
    }
}
