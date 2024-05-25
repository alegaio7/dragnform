import * as constants from './constants.js';
import WidgetButton from './widget-button.js';
import WidgetImage from './widget-image.js';
import WidgetNumber from './widget-number.js';
import WidgetSpacer from './widget-spacer.js';
import WidgetText from './widget-text.js';
import WidgetLabel from './widget-label.js';
import FeatureExtractor from './feature-extractor.js';
import Sortable, { create } from 'sortablejs';
import flyter, {
    withPopupRenderer,
    withInlineRenderer,
    withTextType,
    withSelectType,
    withCheckboxType,
    withRadioType,
  } from 'flyter';
import mustache from 'mustache';
import Widget from './widget-base.js';

export default class Canvas {
    constructor(widgetsContainerEl, widgetEditorsContainerEl, widgetRenderOptions, renderMode) {
        this._domParser = new DOMParser();
        this._featureExtractor = null;

        this._renderMode = renderMode ?? constants.WIDGET_MODE_DESIGN;
        if (constants.validModes.indexOf(this._renderMode) === -1)
            throw new Error(`Invalid designer render mode. Must be one of ${contants.validModes.join(', ')}`);
    
        this._widgetRenderOptions = widgetRenderOptions ?? {};
        this._container = widgetsContainerEl; 
        this._editingWidgetInfo = null;
        this._editorsContainer = widgetEditorsContainerEl;
        this._editorTemplates = new Map();
        
        this._rememberedProperties = new Map(); // keeps some settings of the last edited widget, to copy it to new widgets
        this._rememberedProperties.set("columns", 12);

        this._sourceJson = {
            name: Strings.Canvas_NewForm_Name,
            version: constants.FORMS_DESIGNER_VERSION,
            description: ""
        };
        this._widgets = [];

        // flyter inline editor setup BEGIN
        withPopupRenderer(); // Load the popup renderer
        // withInlineRenderer(); // Load the inline renderer
        withTextType();     // Load the text type
        // flyter inline editor setup END
    }

    async addWidget(jsonObj) {
        if (!jsonObj)
            throw new Error('json object is required');

        // patches the json object with the remembered properties
        this._rememberedProperties.forEach((v, k) => {
            jsonObj[k] = v;
        });

        var w = this.createWidget(jsonObj);
        if (this.findWidget(w.id))
            throw new Error(`widget with id ${w.id} already exists.`);
        this._widgets.push(w);
        await this._renderSingleWidget(w, this._domParser);
        this._setupSortable();
        return w;
    }

    /// <summary>
    /// Clears the container, the widgets array and the sortable object
    /// </summary>
    clearCanvas() {
        this._setupSortable();
        if (this._widgets && this._widgets.length)
            this._widgets.forEach(w => w.removeFromDom());
        this._widgets = [];
        this._container.innerHTML = '';
    }

    /// <summary>
    /// Creates a widget from a JSON object
    /// </summary>
    createWidget(o) {
        if (!o)
            throw new Error('json object is required');
        if (!o.type)
            throw new Error("widget found with no type property.");

        if (!o.id) {
            var tmpId;
            while (true) {
                tmpId = "Widget" + Math.floor(Math.random() * 1000);
                if (!this.findWidget(tmpId)) {
                    o.id = tmpId;
                    break;
                }
            }
        }

        var w;
        switch(o.type) {
            case constants.WIDGET_TYPE_BUTTON:
                w = new WidgetButton(o);
                break;
            case constants.WIDGET_TYPE_LABEL:
                w = new WidgetLabel(o);
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

        // if json does not specify any global classes, use the ones passed in the widgetRenderOptions
        var globalClasses = o.globalClasses ? o.globalClasses : this._widgetRenderOptions.globalClasses;
        w.globalClasses = globalClasses;

        // idem with the required attribute settings
        var requiredAttributeSettings = o.requiredAttributeSettings ? o.requiredAttributeSettings : this._widgetRenderOptions.requiredAttributeSettings;
        w.requiredAttributeSettings = requiredAttributeSettings;

        // idem with the widget rendering options
        var widgetRenderOptions = o.widgetRenderOptions ? o.widgetRenderOptions : this._widgetRenderOptions;
        w.widgetRenderOptions = widgetRenderOptions;
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
        json.widgetRenderOptions = this._widgetRenderOptions;
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

        this._featureExtractor.setScrollOffset(this._container.scrollTop);

        var json = this._featureExtractor.extractFeatures(this._container, false, true); // not recursive for container, each widget will handle its children
        json.container = true;
        json.widgetFeatures = [];
        var _t = this;
        this._widgets.forEach(w => {
            var j = w.extractFeatures(_t._featureExtractor, true);
            if (j) {
                json.widgetFeatures.push(j);
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
        if (w) {
            this._removeWidgetInternal(w);
            this._setupSortable();
        }
    }

    /// <summary>
    /// Renders a form from a json-serialized form object
    /// </summary>
    async renderForm(json) {
        this.clearCanvas();
        this._parseJson(json);
        await this._renderWidgets();
        this._setupSortable();
    }

    get renderMode() {
        return this._renderMode;
    }

    set renderMode(value) {
        if (value === this._renderMode)
            return;
        if (constants.validModes.indexOf(value) === -1)
            throw new Error(`Invalid designer render mode. Must be one of ${contants.validModes.join(', ')}`);
        this._renderMode = value;

        // update widgets to show the new render mode
        this._widgets.forEach(w => {
            w.renderMode = value;
        });
    }

    /// <summary>
    /// Validates the form widgets. Each widget implements its own validation mechanisms.
    /// Returns an object with a result property indicating if the form is valid and if not, a validations property containing an array of not-passed validations.
    /// </summary>
    validate(validationOptions) {
        if (!this._widgets || !this._widgets.length)
            return false;

        if (!validationOptions)
            validationOptions = {}

        var validations = [];
        this._widgets.forEach(w => {
            let r = w.validate(validationOptions);
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
        if (o.widgetRenderOptions) {
            if (o.widgetRenderOptions.globalClasses)
                this._widgetRenderOptions.globalClasses = o.widgetRenderOptions.globalClasses;
            if (o.widgetRenderOptions.requiredAttributeSettings)
                this._widgetRenderOptions.requiredAttributeSettings = o.widgetRenderOptions.requiredAttributeSettings;
        }

        o.widgets.forEach(fragment => {
            var e = this.createWidget(fragment);
            if (this.findWidget(e.id))
                throw new Error(`widgets collection contains duplicate ids in json object: ${e.id}`);
            e.value = fragment.value;
            this._widgets.push(e);
        });

        if (this._sourceJson.widgetRenderOptions)
            delete this._sourceJson.widgetRenderOptions;
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

    async _renderSingleWidget(w, p) {
        await w.render(this._container, p);
        if (this._widgetRenderOptions.renderRemove)
            w.registerRemoveButtonHandler(this._removeWidgetInternal.bind(this), false);
        
        w.registerPropertiesButtonHandler(this._showWidgetProperties.bind(this), false);

        if (this._widgetRenderOptions.enableInPlaceEditor)
            w.enableInPlaceEditor();
    }

    /// <summary>
    /// Renders the widgets in the configured container
    /// </summary>
    async _renderWidgets() {
        for (const w of this._widgets) {
            await this._renderSingleWidget(w, this._domParser);
        }
    }

    _setupSortable() {
        if (this._sortable) {
            this._sortable.destroy();
            this._sortable = null;
        }

        if (Sortable)
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

    /// <summary>
    /// Shows the properties editor for a widget. Editor template data is cached, once per widget type.
    /// </summary>
    async _showWidgetProperties(sender, e) {
        var editorData, editorHtml, editorProps;
        if (this._editorTemplates.has(sender.type)) {
            editorData = this._editorTemplates.get(sender.type);
            editorHtml = editorData.html;
        } else {
            editorData = await sender.getPropertiesEditorTemplate();
            // once editor template data is obtained, replace the placeholders with the actual values
            if (!editorData.replacements)
                editorData.replacements = {};
            editorData.replacements.labelAccept = Strings.WidgetEditor_Common_Accept;
            editorData.replacements.labelCancel = Strings.WidgetEditor_Common_Cancel;
            editorHtml = mustache.render(editorData.template, editorData.replacements);
            editorData.html = editorHtml;
            this._editorTemplates.set(sender.type, editorData);
        }

        this._editorsContainer.innerHTML = editorHtml;

        // check if the dialog has an associated script. If so, load it
        var propEditorWithScript = this._editorsContainer.querySelector(".widget-properties-editor[has-script]");
        if (propEditorWithScript) {
            var scriptName = propEditorWithScript.getAttribute("has-script");
            if (!scriptName)
                scriptName = "/editors/" + editorData.baseName + ".editor.js";

            import(/* webpackIgnore: true */ scriptName).then(module => {
                if (module && module.default) {
                    var options = { 
                        callbacks: {
                            onAutoHeightChanged: function(dlg, value) {
                                sender.autoHeight = value;
                            },
                            onColumnsChanged: function(dlg, value) {
                                sender.columns = value;
                            },
                            onHeightChanged: function(dlg, value) {
                                sender.height = value;
                            },
                            onHorizontalAlignmentChanged: function(dlg, value) {
                                sender.horizontalAlignment = value;
                            },
                            onLabelChanged: function(dlg, value) {
                                sender.label = value;
                            },
                            onRequiredChanged: function(dlg, value) {
                                sender.required = value;
                            },
                            onVerticalAlignmentChanged: function(dlg, value) {
                                sender.verticalAlignment = value;
                            },
                        },
                        dialogContainer: this._editorsContainer
                    };
                    var editor = new module.default(options);
                    editor.init();
                }
            });
        }

        // update modal control properties
        editorProps = sender.getEditorProperties();
        if (editorProps) {
            editorProps.forEach(p => {
                if (p.elementId) {
                    var el = document.getElementById(p.elementId);
                    if (el) {
                        if (p.readonly)
                            el.innerHTML = p.value;
                        else {
                            if (p.type === "boolean")
                                el.checked = p.value;
                            else if (p.type === "number" || p.type === "string")
                                el.value = p.value;
                        }
                    }
                } else if (p.elementIds) { // used for properties that are bound to multiple elements like radio buttons
                    p.elementIds.forEach(eId => {
                        var el = document.getElementById(eId);
                        if (el) {
                            if (el.value === p.value)
                                el.checked = true;
                            else
                                el.checked = false;
                        }
                    });
                }
            });
        }

        // attach handlers to buttons
        var _t = this;
        var modal = this._editorsContainer.querySelector('.widget-properties-editor');

        var acceptButton = this._editorsContainer.querySelector('[data-action="accept"]');
        if (acceptButton)
            acceptButton.onclick = function() {
                _t._updateWidgetPropertiesFromEditor(_t._editingWidgetInfo, modal);
            }.bind(this);

        var cancelButton = this._editorsContainer.querySelector('[data-action="cancel"]');
        if (cancelButton)
            cancelButton.onclick = function() {
                modal.close();
            }.bind(this);
    
        this._editingWidgetInfo = {widget: sender, properties: editorProps};
        modal.showModal();
    }

    /// <summary>
    /// Updates the widget properties from the editor modal
    /// </summary>
    _updateWidgetPropertiesFromEditor(widgetInfo, modal) {
        widgetInfo.widget.batchUpdating = true;
        if (widgetInfo.properties) {
            widgetInfo.properties.forEach(p => {
                if (p.elementId) {
                    if (p.readonly)
                        return;
                    if (p.name in widgetInfo.widget) {
                        var el = document.getElementById(p.elementId);
                        if (el) {
                            if (p.type === "boolean")
                                widgetInfo.widget[p.name] = el.checked;
                            else
                                widgetInfo.widget[p.name] = el.value;
                            if (this._rememberedProperties.has(p.name))
                                this._rememberedProperties.set(p.name, widgetInfo.widget[p.name]); // don't use the element's value since its string. use the parsed value instead
                        }
                    }
                } else if (p.elementIds) {
                    p.elementIds.forEach(eId => { 
                        var el = document.getElementById(eId);
                        if (el && el.checked) {
                            widgetInfo.widget[p.name] = el.value;
                            if (this._rememberedProperties.has(p.name))
                                this._rememberedProperties.set(p.name, widgetInfo.widget[p.name]);
                        }
                    });
                }
            });
        }
        widgetInfo.widget.batchUpdating = false;
        // widgetInfo.widget.refresh(); // not needed since setting batchUpdating = false; will trigger a refresh
        modal.close();
    }
}
