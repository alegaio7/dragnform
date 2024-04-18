import * as constants from './constants.js';
import Canvas from './canvas.js';
import jsPDFExporter from './jspdf-exporter.js';

export default class Designer {
    constructor(options) {
        if (!options)
            throw new Error('options is required');
        if (!options.containerId)
            throw new Error('containerId is required');
        
        this._callbacks = options.callbacks ?? [];
        this._actionMappings = [
            { action: 'new-form', widgetType: null, callback: this._callbacks.onNewForm},
            { action: 'load-json', widgetType: null, callback: this._callbacks.onLoadJson},
            { action: 'export-json', widgetType: null, callback: this._callbacks.onExportToJson},
            { action: 'save-pdf', widgetType: null, callback: this._callbacks.onSavePdf},
            { action: 'add-input-text', widgetType: constants.WIDGET_TYPE_TEXT, callback: this._callbacks.onWidgetAdded },
            { action: 'add-input-number', widgetType: constants.WIDGET_TYPE_NUMBER, callback: this._callbacks.onWidgetAdded },
            { action: 'add-button', widgetType: constants.WIDGET_TYPE_BUTTON, callback: this._callbacks.onWidgetAdded },
            { action: 'add-image', widgetType: constants.WIDGET_TYPE_IMAGE, callback: this._callbacks.onWidgetAdded },
            { action: 'add-spacer', widgetType: constants.WIDGET_TYPE_SPACER, callback: this._callbacks.onWidgetAdded }
        ];

        var c = document.getElementById(options.containerId);
        if (!c)
            throw new Error(`No element with containerId '${options.containerId}' found in the DOM`);
        this._container = c;

        this._options = this._getDefaultOptions();

        this._renderMode = options.renderMode ?? constants.WIDGET_MODE_DESIGN;
        if (constants.validModes.indexOf(this._renderMode) === -1)
            throw new Error(`Invalid designer render mode. Must be one of ${contants.validModes.join(', ')}`);
    
        if (options.toolbar)
            this._options.toolbar = options.toolbar;
        this._options.toolbar.visible = options.toolbar.visible !== true ? false : true;

        if (options.widgetRenderOptions) {
            if (options.widgetRenderOptions.globalClasses)
                this._options.widgetRenderOptions.globalClasses = options.widgetRenderOptions.globalClasses;
            if (options.widgetRenderOptions.requiredAttributeSettings)
                this._options.widgetRenderOptions.requiredAttributeSettings = options.widgetRenderOptions.requiredAttributeSettings;

            this._options.widgetRenderOptions.renderGrip = options.widgetRenderOptions.renderGrip !== true ? false : true;
            this._options.widgetRenderOptions.renderRemove = options.widgetRenderOptions.renderRemove !== true ? false : true;
            this._options.widgetRenderOptions.renderTips = options.widgetRenderOptions.renderTips !== true ? false : true;
        }

        this._setupDesigner(this._options);

        this._designerEl = document.querySelector('.widget-designer');
        this._updateActiveCanvas();
    }

    addWidget(jsonObj) {
        return this._designCanvas.addWidget(jsonObj);
    }

    get canvas() {
        return this._designCanvas;
    }

    clearCanvas() {
        this._designCanvas.clearCanvas();
        this._runCanvas.clearCanvas();
        this._viewCanvas.clearCanvas();
    }

    exportJson() {
        this.renderMode = constants.WIDGET_MODE_DESIGN;
        return this._designCanvas.exportJson();
    }

    extractFeatures() {
        this.renderMode = constants.WIDGET_MODE_VIEW;
        return this._viewCanvas.extractFeatures();
    }

    /// <summary>
    /// Finds a widget by its id. This is used to attach events to interactive widgets like buttons, that's why the current mode should be 'run'.
    findWidget(id) {
        if (this.renderMode !== constants.WIDGET_MODE_RUN)
            throw new Error('findWidget can only be called in run mode');
        return this._runCanvas.findWidget(id);
    }

    renderForm(json) {
        this.renderMode = constants.WIDGET_MODE_DESIGN;
        this._designCanvas.renderForm(json);
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
        this._updateActiveCanvas();
        this._designerEl.setAttribute('data-current-mode', this.renderMode);
    }

    validate() {
        return this._designCanvas.validate();
    }

    get widgets() { 
        return this._designCanvas._widgets;
    }

    /// ********************************************************************************************************************
    /// Private methods
    /// ********************************************************************************************************************

    _getDefaultOptions() {
        return {
            nullValue: '(null)',
            toolbar: {
                visible: true
            },
            widgetRenderOptions: {
                renderGrip: true,
                renderRemove: true,
                renderTips: true,
                globalClasses: {
                    label: 'widget-label',
                    widget: 'widget',
                    input: 'widget-input'
                },
                requiredAttributeSettings: {
                    position: constants.WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE,
                    mark: '*'
                }
            }
        };
    }

    _handleToolbarActions(action, e) {
        let am = this._actionMappings.find(m => m.action === action);

        // check if action is to create a new widget
        if (am) {
            // if there's widgetType, there could be a widgetAdded callback
            if (am.widgetType) {
                if (am.callback) {
                    am.callback({ widgetType: am.widgetType, e: e });
                    if (e.defaultPrevented)
                        return;
                }
                this.addWidget({ type: am.widgetType });
                return;
            }

            // check for other actions
            if (am.action === "new-form") {
                if (am.callback && am.callback(e) && e.defaultPrevented)
                    return;
                this.clearCanvas();
            } else if (am.action === "export-json") {
                var json = this.exportJson();
                if (am.callback)
                    am.callback(json, e);
            } else if (am.action === "save-pdf") {
                this.renderMode = constants.WIDGET_MODE_VIEW;
                var features = this.extractFeatures();
                var exp = new jsPDFExporter();
                if (am.callback) {
                    var pdfdata = exp.exportPDF(features, { saveToFile: false }); // save to blob
                    am.callback({
                        features: features, 
                        pdfdata: pdfdata
                    }, e);
                    if (e.defaultPrevented)
                        return;
                } 
                exp.exportPDF(features, { saveToFile: true }); // save to file
            } else if (am.action === "load-json") {
                var json;
                if (am.callback) {
                    json = am.callback(e);
                    if (e.defaultPrevented)
                        return;
                }

                // if callback returns json, render it
                if (json) {
                    _t.renderForm(json);
                    return;
                }

                // otherwise, trigger load file action
                var inp = this._container.querySelector('[data-action="load-json"] + input[type="file"]');
                var _t = this;
                if (!inp.onchange) {
                    inp.onchange = function(e2) {
                        var file = e2.target.files[0];
                        var reader = new FileReader();
                        reader.onload = function(e3) {
                            var j2 = JSON.parse(e3.target.result);
                            _t.renderForm(j2);
                        };
                        reader.readAsText(file);
                        inp.value = null;
                    };
                }
                inp.click();
            }
        }
    }

    _setupDesigner(options) {
        var html = `<div class="widget-designer" data-current-mode="${this.renderMode}">`;
        if (options.toolbar.visible) {          // TODO Parse buttons
            var fileGroup = options.toolbar.buttons && (
                options.toolbar.buttons.new || options.toolbar.buttons.load || options.toolbar.buttons.export || options.toolbar.buttons.savepdf
            );
            var widgetsGroup = options.toolbar.buttons && (
                options.toolbar.buttons.textField || options.toolbar.buttons.numberField || options.toolbar.buttons.spacer
            );
            // var layoutGroup = options.toolbar.buttons && (
            //     options.toolbar.buttons.spacer
            // );
            html += `<div class="widget-toolbar">`;
            if (fileGroup) {
                html += `<div class="widget-toolbar-group">
                    <div class="widget-toolbar-group-title">${Strings.Toolbar_File_GroupTitle}</div>`;
                if (options.toolbar.buttons.new)
                    html +=`<button type="button" data-action="new-form" title="${Strings.Toolbar_NewForm_ButtonTitle}">
                            <i class="${Icons.Toolbar_NewForm_Icon}"></i>
                            <span>${Strings.Toolbar_NewForm_ButtonLabel}</span>
                        </button>`;
                if (options.toolbar.buttons.load)
                    html +=`<button type="button" data-action="load-json" title="${Strings.Toolbar_LoadJson_ButtonTitle}">
                            <i class="${Icons.Toolbar_LoadJson_Icon}"></i>
                            <span>${Strings.Toolbar_LoadJson_ButtonLabel}</span>
                        </button>
                        <input type="file" style="display: none;" />`;
                if (options.toolbar.buttons.export)
                    html +=`<button type="button" data-action="export-json" title="${Strings.Toolbar_ExportJson_ButtonTitle}">
                            <i class="${Icons.Toolbar_ExportJson_Icon}"></i>
                            <span>${Strings.Toolbar_ExportJson_ButtonLabel}</span>
                        </button>`;
                if (options.toolbar.buttons.savepdf)
                    html +=`<button type="button" data-action="save-pdf" title="${Strings.Toolbar_SavePdf_ButtonTitle}">
                            <i class="${Icons.Toolbar_SavePdf_Icon}"></i>
                            <span>${Strings.Toolbar_SavePdf_ButtonLabel}</span>
                        </button>`;                        
                html += `</div>`;
            }

            if (widgetsGroup) {
                html += `<div class="widget-toolbar-group">
                        <div class="widget-toolbar-group-title">${Strings.Toolbar_Widgets_GroupTitle}</div>`;
                if (options.toolbar.buttons.textField)
                    html += `<button type="button" data-action="add-input-text" title="${Strings.Toolbar_AddTextInputWidget_ButtonTitle}">
                                <i class="${Icons.Toolbar_AddTextInputWidget_Icon}"></i>
                                <span>${Strings.Toolbar_AddTextInputWidget_ButtonLabel}</span>
                            </button>`;
                if (options.toolbar.buttons.numberField)
                    html += `<button type="button" data-action="add-input-number" title="${Strings.Toolbar_AddNumberInputWidget_ButtonTitle}">
                                <i class="${Icons.Toolbar_AddNumberInputWidget_Icon}"></i>
                                <span>${Strings.Toolbar_AddNumberInputWidget_ButtonLabel}</span>
                            </button>`;
                if (options.toolbar.buttons.button)
                    html += `<button type="button" data-action="add-button" title="${Strings.Toolbar_AddButtonWidget_ButtonTitle}">
                            <i class="${Icons.Toolbar_AddButtonWidget_Icon}"></i>
                            <span>${Strings.Toolbar_AddButtonWidget_ButtonLabel}</span>
                        </button>`;                            
                if (options.toolbar.buttons.spacer)
                    html += `<button type="button" data-action="add-spacer" title="${Strings.Toolbar_AddSpacerWidget_ButtonTitle}">
                            <i class="${Icons.Toolbar_AddSpacerWidget_Icon}"></i>
                            <span>${Strings.Toolbar_AddSpacerWidget_ButtonLabel}</span>
                        </button>`;
                if (options.toolbar.buttons.image)
                    html += `<button type="button" data-action="add-image" title="${Strings.Toolbar_AddImageWidget_ButtonTitle}">
                            <i class="${Icons.Toolbar_AddImageWidget_Icon}"></i>
                            <span>${Strings.Toolbar_AddImageWidget_ButtonLabel}</span>
                        </button>`; 
                html += `</div>`;
            }

            // if (layoutGroup) {
            //     html += `<div class="widget-toolbar-group">
            //         <div class="widget-toolbar-group-title">${Strings.Toolbar_Layout_GroupTitle}</div>`;

            //     html += `</div>`;
            // }
            html += `</div>`;
        }
        html += `<div class="widget-container" data-mode="design"></div>`;
        html += `<div class="widget-container" data-mode="run"></div>`;
        html += `<div class="widget-container" data-mode="view"></div>`;
        html += "</div>";

        this._container.innerHTML = html;

        document.querySelectorAll(`#${this._container.id} [data-action]`).forEach(b => {
            b.addEventListener('click', (e) => {
                this._handleToolbarActions(b.getAttribute('data-action'), e);
            });
        });

        var el = this._container.querySelector('.widget-container[data-mode="design"]');
        this._designCanvas = new Canvas(el, options.widgetRenderOptions, constants.WIDGET_MODE_DESIGN);

        el = this._container.querySelector('.widget-container[data-mode="run"]');
        this._runCanvas = new Canvas(el, options.widgetRenderOptions, constants.WIDGET_MODE_RUN);

        el = this._container.querySelector('.widget-container[data-mode="view"]');
        this._viewCanvas = new Canvas(el, options.widgetRenderOptions, constants.WIDGET_MODE_VIEW);
    }

    _updateActiveCanvas() {
        // if render mode is design, do nothing
        if (this.renderMode === constants.WIDGET_MODE_DESIGN)
            return;

        // if render mode is run, render the form in run mode copying info from the design mode canvas
        if (this.renderMode === constants.WIDGET_MODE_RUN) {
            var json = this._designCanvas.exportJson();
            this._runCanvas.renderForm(json);
        } else if (this.renderMode === constants.WIDGET_MODE_VIEW) {
            var json = this._designCanvas.exportJson();
            this._runCanvas.renderForm(json);
            var json = this._runCanvas.exportJson();
            this._viewCanvas.renderForm(json);
        }
    }
}