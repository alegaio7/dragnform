import * as constants from './constants.js';
import WidgetButton from './widget-button.js';
import WidgetCheckbox from './widget-checkbox.js';
import WidgetDate from './widget-date.js';
import WidgetEmail from './widget-email.js';
import WidgetImage from './widget-image.js';
import WidgetLabel from './widget-label.js';
import WidgetNumber from './widget-number.js';
import WidgetParagraph from './widget-paragraph.js';
import WidgetRadio from './widget-radio.js';
import WidgetSpacer from './widget-spacer.js';
import WidgetSelect from './widget-select.js';
import WidgetText from './widget-text.js';
import FeatureExtractor from './feature-extractor.js';
import Sortable from 'sortablejs';
import flyter, {
    withPopupRenderer,
    withInlineRenderer,
    withTextType,
    withSelectType,
    withCheckboxType,
    withRadioType,
  } from 'flyter';
import mustache from 'mustache';

export default class Canvas {
    constructor(options) {
        if (!options)
            throw new Error('options are required');

        if (!options.widgetsContainerEl)
            throw new Error('options.widgetsContainerEl is required');
        if (!options.widgetEditorsContainerEl)
            throw new Error('options.widgetEditorsContainerEl is required');

        this._domParser = new DOMParser();
        this._featureExtractor = null;
        
        this._renderMode = options.renderMode ?? constants.WIDGET_MODE_DESIGN;
        if (constants.validModes.indexOf(this._renderMode) === -1)
            throw new Error(`Invalid designer render mode. Must be one of ${constants.validModes.join(', ')}`);
    
        this._container = options.widgetsContainerEl; 
        this._editorsContainer = options.widgetEditorsContainerEl;
        this._editorTemplates = new Map();
        this.liveEditsPreview = options.liveEditsPreview ?? false;
        this._modified = false;
        this._onModifiedCallback = options.onModified ?? null;
        this._widgetRenderOptions = options.widgetRenderOptions ?? {};
        this._widgetPaths = options.widgetPaths ?? {};

        // keeps some settings of the last edited widget, to copy it to new widgets
        // this is a map of maps, where the key is the widget type and the value is a map of properties
        this._rememberedProperties = new Map(); 

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
        var m = this._rememberedProperties.get(jsonObj.type);
        if (m) {
            m.forEach((v, k) => {
                jsonObj[k] = v;
            });
        } else
            this._setRememberedProperties(jsonObj.type);

        var w = this.createWidget(jsonObj);
        if (this.findWidget(w.id))
            throw new Error(`widget with id ${w.id} already exists.`);
        w.setWidgetPaths(this._widgetPaths);

        this._widgets.push(w);
        this.modified = true;
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
        this._editorTemplates.clear();
        this.modified = false;
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
            case constants.WIDGET_TYPE_CHECKBOX:
                w = new WidgetCheckbox(o);
                break;
            case constants.WIDGET_TYPE_DATE:
                w = new WidgetDate(o);
                break;
            case constants.WIDGET_TYPE_EMAIL:
                w = new WidgetEmail(o);
                break;
            case constants.WIDGET_TYPE_IMAGE:
                w = new WidgetImage(o);
                break;
            case constants.WIDGET_TYPE_LABEL:
                w = new WidgetLabel(o);
                break;
            case constants.WIDGET_TYPE_NUMBER:
                w = new WidgetNumber(o);
                break;
            case constants.WIDGET_TYPE_PARAGRAPH:
                w = new WidgetParagraph(o);
                break;
            case constants.WIDGET_TYPE_RADIO:
                w = new WidgetRadio(o);
                break                
            case constants.WIDGET_TYPE_SPACER:
                w = new WidgetSpacer(o);
                break
            case constants.WIDGET_TYPE_SELECT:
                w = new WidgetSelect(o);
                break
            case constants.WIDGET_TYPE_TEXT:
                w = new WidgetText(o);
                break;
            default:
                throw new Error(`widget type ${o.type} not found.`);
        }

        w.disableInlineEditor = this._widgetRenderOptions.disableInlineEditor;
        w.globalClasses = this._widgetRenderOptions.globalClasses;

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

        var json = this._featureExtractor.extractFeatures(this._container, {
            recursive: false,           // not recursive for container, each widget will handle its children
            skipScrollOffset: true,
            isRootContainer: true       // when true, loads the relative offset of the root container in json.relOffsetX and json.relOffsetY
        }); 
        json.container = true;
        json.widgetFeatures = [];
        var _t = this;
        this._widgets.forEach(w => {
            var j = w.extractFeatures(_t._featureExtractor, {
                recursive: true,
                relOffsetX: json.relOffsetX,
                relOffsetY: json.relOffsetY
            });
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

    get modified() {
        return this._modified;
    }

    set modified(value) {
        this._modified = value;
        if (this._onModifiedCallback)
            this._onModifiedCallback(value);
    }

    removeWidget(id) {
        var w = this.findWidget(id);
        if (w) {
            this._removeWidgetInternal(w);
            this._setupSortable();
            this.modified = true;
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
        this.modified = false;
    }

    get renderMode() {
        return this._renderMode;
    }

    set renderMode(value) {
        if (value === this._renderMode)
            return;
        if (constants.validModes.indexOf(value) === -1)
            throw new Error(`Invalid designer render mode. Must be one of ${constants.validModes.join(', ')}`);
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
        w.registerDoubleClickHandler(this._showWidgetProperties.bind(this), false);

        if (!this._widgetRenderOptions.disableInlineEditor)
            w.enableInPlaceEditor();

        w.refresh();
    }

    /// <summary>
    /// Renders the widgets in the configured container
    /// </summary>
    async _renderWidgets() {
        for (const w of this._widgets) {
            await this._renderSingleWidget(w, this._domParser);
        }
    }

    _setDefaultMapValues(m, additionalProps) {
        m.set("autoHeight", false);
        m.set("columns", 12);
        m.set("height", constants.WIDGET_DEFAULT_HEIGHT);

        if (additionalProps && additionalProps.indexOf("fontSize") >= 0)
            m.set("fontSize", constants.HTML_DEFAULT_FONT_SIZE);
        if (additionalProps && additionalProps.indexOf("fontWeight") >= 0)
            m.set("fontWeight", constants.HTML_DEFAULT_FONT_WEIGHT);
        if (additionalProps && additionalProps.indexOf("fontUnderline") >= 0)
            m.set("fontUnderline", false);
        if (additionalProps && additionalProps.indexOf("horizontalAlignment") >= 0)
            m.set("horizontalAlignment", constants.WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT);
        if (additionalProps && additionalProps.indexOf("required") >= 0)
            m.set("required", false);
        if (additionalProps && additionalProps.indexOf("valueRequiredValidationMessage") >= 0)
            m.set("valueRequiredValidationMessage", "");
        if (additionalProps && additionalProps.indexOf("verticalAlignment") >= 0)
            m.set("verticalAlignment", constants.WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER);
    }

    _setRememberedProperties(type) {
        this._rememberedProperties.set(type, new Map());

        var m = this._rememberedProperties.get(type);
        if (type === constants.WIDGET_TYPE_BUTTON)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "horizontalAlignment", "verticalAlignment", "textColor"]);
        else if (type === constants.WIDGET_TYPE_CHECKBOX)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "valueRequiredValidationMessage", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_IMAGE)
            this._setDefaultMapValues(m, ["horizontalAlignment", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_LABEL)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_NUMBER)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "textColor", "valueRequiredValidationMessage", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_PARAGRAPH)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "textColor", "valueRequiredValidationMessage", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_RADIO)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "textColor", "valueRequiredValidationMessage", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_SELECT)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "textColor", "valueRequiredValidationMessage", "verticalAlignment"]);
        else if (type === constants.WIDGET_TYPE_SPACER)
            this._setDefaultMapValues(m, []);
        else if (type === constants.WIDGET_TYPE_TEXT)
            this._setDefaultMapValues(m, ["fontSize", "fontWeight", "fontUnderline", "labelColor", "horizontalAlignment", "required", "textColor", "valueRequiredValidationMessage", "verticalAlignment"]);
    }

    _setupSortable() {
        if (this._sortable) {
            this._sortable.destroy();
            this._sortable = null;
        }

        if (Sortable)
            this._sortable = Sortable.create(this._container, {
                animation: 150, 
                handle: '[data-part="widget-grip"]',
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
        if (this.renderMode !== constants.WIDGET_MODE_DESIGN)
            return;
        var editorData, editorHtml;
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
        var _t = this;
        var savedModified = this.modified;

        // check if the dialog has an associated script. If so, load it
        var propEditorWithScript = this._editorsContainer.querySelector(".widget-properties-editor[has-script]");
        if (propEditorWithScript) {
            var scriptName = propEditorWithScript.getAttribute("has-script");
            if (!scriptName)
                scriptName = (this._widgetPaths.widgetFormEditors ?? "./editors") + "/" + editorData.baseName + ".editor.js";

            import(/* webpackIgnore: true */ scriptName).then(module => {
                if (module && module.default) {
                    var requiredCallbacks =  {
                        onAccept: function(dlg, changedProps) {
                            _t.modified = true;
                            if (changedProps) {
                                var m = _t._rememberedProperties.get(sender.type); // get the map of remembered props for the widget type
                                if (m) {
                                    changedProps.forEach(p => {
                                        if (m.has(p))
                                            m.set(p, dlg.widget[p]);
                                    });
                                }
                            }
                            modal.close();
                        },
                        onCancel: function(dlg) {
                            _t.modified = savedModified;
                            modal.close();
                        },
                    };

                    var optionalCallbacks = {
                        onAutoHeightChanged: function(dlg, widget, value) {
                            widget.autoHeight = value;
                        },

                        onColumnsChanged: function(dlg, widget, value) {
                            widget.columns = value;
                        },
                        onFontSizeChanged: function(dlg, widget, value) {
                            widget.fontSize = value;
                        },
                        onFontUnderlineChanged: function(dlg, widget, value) {
                            widget.fontUnderline = value;
                        },                            
                        onFontWeightChanged: function(dlg, widget, value) {
                            widget.fontWeight = value;
                        },                      
                        onHeightChanged: function(dlg, widget, value) {
                            widget.height = value;
                        },
                        onHorizontalAlignmentChanged: function(dlg, widget, value) {
                            widget.horizontalAlignment = value;
                        },
                        onLabelChanged: function(dlg, widget, value) {
                            widget.label = value;
                        },
                        onRadioOptionsChanged: function(dlg, widget, radioOptions) {
                            widget.radioOptions = radioOptions;
                        },
                        onRadioOptionTitleChanged: function(dlg, widget, value, id) {
                            var options = widget.radioOptions;
                            var ro = options.find(r => r.id === id);
                            if (ro)
                                ro.title = value;
                            widget.radioOptions = options;
                        },
                        onRadioOptionValueChanged: function(dlg, widget, value, id) {
                            var options = widget.radioOptions;
                            var ro = options.find(r => r.id === id);
                            if (ro)
                                ro.value = value;
                            widget.radioOptions = options;
                        },
                        onRequiredChanged: function(dlg, widget, value) {
                            widget.required = value;
                        },
                        onSelectOptionsChanged: function(dlg, widget, selectOptions) {
                            widget.selectOptions = selectOptions;
                        },
                        onSelectOptionTitleChanged: function(dlg, widget, value, id) {
                            var options = widget.selectOptions;
                            var ro = options.find(r => r.id === id);
                            if (ro)
                                ro.title = value;
                            widget.selectOptions = options;
                        },
                        onSelectOptionValueChanged: function(dlg, widget, value, id) {
                            var options = widget.selectOptions;
                            var ro = options.find(r => r.id === id);
                            if (ro)
                                ro.value = value;
                            widget.selectOptions = options;
                        },
                        onTipChanged: function(dlg, widget, value) {
                            widget.tip = value;
                        },
                        onVerticalAlignmentChanged: function(dlg, widget, value) {
                            widget.verticalAlignment = value;
                        },
                        onHorizontalDispositionChanged: function(dlg, widget, value) {
                            widget.horizontalDisposition = value;
                        }
                    };

                    var options = {
                        widget: sender,
                        callbacks: !this.liveEditsPreview ? requiredCallbacks : Object.assign(optionalCallbacks, requiredCallbacks),
                        dialogContainer: this._editorsContainer
                    };
                    var editor = new module.default(options);
                    editor.init();
                }
            });
        }

        var modal = this._editorsContainer.querySelector('.widget-properties-editor');
        modal.showModal();
    }
}
