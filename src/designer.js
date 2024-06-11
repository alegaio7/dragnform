import * as constants from './constants.js';
import Canvas from './canvas.js';
import jsPDFExporter from './jspdf-exporter.js';
import Icons from './icons.js';

export default class Designer {
    constructor(options) {
        if (!options)
            throw new Error('options is required');
        if (!options.containerId)
            throw new Error('containerId is required');
        
        this._callbacks = options.callbacks ?? [];
        /* callbacks
            onNewForm
            onExportToJson
            onSavePdf
            onLoadJson
            onLoadJsonCompleted
            onRenderModeChanged
            onDesignModified    <== // TODO implement
        */
        this._actionMappings = [
            { action: 'new-form', widgetType: null},
            { action: 'load-json', widgetType: null},
            { action: 'export-json', widgetType: null},
            { action: 'save-pdf', widgetType: null},
            { action: 'add-label', widgetType: constants.WIDGET_TYPE_LABEL },
            { action: 'add-input-text', widgetType: constants.WIDGET_TYPE_TEXT },
            { action: 'add-input-number', widgetType: constants.WIDGET_TYPE_NUMBER },
            { action: 'add-button', widgetType: constants.WIDGET_TYPE_BUTTON },
            { action: 'add-image', widgetType: constants.WIDGET_TYPE_IMAGE },
            { action: 'add-spacer', widgetType: constants.WIDGET_TYPE_SPACER },
            { action: 'change-render-mode', widgetType: null },
            { action: 'validate-form', widgetType: null },
        ];

        var c = document.getElementById(options.containerId);
        if (!c)
            throw new Error(`No element with containerId '${options.containerId}' found in the DOM`);
        this._container = c;

        this._options = this._getDefaultOptions();

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

        this.renderMode = options.renderMode ?? constants.WIDGET_MODE_DESIGN;
    }

    get canvas() {
        return this._canvas;
    }

    clearCanvas() {
        this._canvas.clearCanvas();
    }

    exportJson() {
        this.renderMode = constants.WIDGET_MODE_DESIGN;
        return this._canvas.exportJson();
    }

    extractFeatures() {
        this.renderMode = constants.WIDGET_MODE_VIEW;
        return this._canvas.extractFeatures();
    }

    /// <summary>
    /// Finds a widget by its id. This is used to attach events to interactive widgets like buttons.
    findWidget(id) {
        return this._canvas.findWidget(id);
    }

    async renderForm(json) {
        this.renderMode = constants.WIDGET_MODE_DESIGN;
        await this._canvas.renderForm(json);
    }

    get renderMode() {
        if (!this._canvas)
            return constants.WIDGET_MODE_DESIGN;
        return this._canvas.renderMode;
    }

    set renderMode(value) {
        this._canvas.renderMode = value;
        this._updateUI();
    }

    validate(validationOptions) {
        if (this.renderMode !== constants.WIDGET_MODE_RUN)
            throw new Error('validate can only be called in run mode');
        return this._canvas.validate(validationOptions);
    }

    get widgets() { 
        return this._canvas._widgets;
    }

    /// ********************************************************************************************************************
    /// Private methods
    /// ********************************************************************************************************************

    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'form.json';
        document.body.appendChild(a);
        const clickHandler = (e) => {
            setTimeout(() => {
                URL.revokeObjectURL(url);
                removeEventListener('click', clickHandler);
            }, 150);
        };
        a.addEventListener('click', clickHandler, false);
        a.click();
        a.remove();
    }

    _getDefaultOptions() {
        return {
            nullValue: '(null)',
            toolbar: {
                visible: true
            },
            widgetRenderOptions: {
                enableInPlaceEditor: true,
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
            // if there's widgetType, let's create a widget
            if (am.widgetType) {
                if (am.widgetType === constants.WIDGET_TYPE_IMAGE) {
                    var _t = this;
                    if (!this._loadImageInputEl) {
                        this._loadImageInputEl = this._container.querySelector('[data-action="add-image"] + input[type="file"]');
                        if (!this._loadImageInputEl.onchange) {
                            this._loadImageInputEl.onchange = function(e2) {
                                var file = e2.target.files[0];
                                var reader = new FileReader();
                                reader.onload = async function(e3) {
                                    await _t._canvas.addWidget({ 
                                        type: am.widgetType, 
                                        data: e3.target.result
                                     });
                                };
                                reader.readAsDataURL(file);
                                _t._loadImageInputEl.value = null;
                            };
                        }
                    }
                    this._loadImageInputEl.click();
                    return;
                }

                this._canvas.addWidget({ type: am.widgetType });
                return;
            }

            // check for other actions
            if (am.action === "new-form") {
                if (this._callbacks.onNewForm && this._callbacks.onNewForm.call(this, e) && e.defaultPrevented)
                    return;
                this.clearCanvas();
            } else if (am.action === "export-json") {
                var json = this.exportJson();
                if (this._callbacks.onExportToJson) {
                    this._callbacks.onExportToJson.call(this, json, e);
                    if (e.defaultPrevented)
                        return;
                }
                const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
                this._downloadBlob(blob, 'form.json');
            } else if (am.action === "save-pdf") {
                this.renderMode = constants.WIDGET_MODE_VIEW;
                var features = this.extractFeatures();
                var exp = new jsPDFExporter();
                if (this._callbacks.onSavePdf) {
                    var pdfdata = exp.exportPDF(features, { 
                        saveToFile: false,
                        renderContainerBox: false
                    }); // save to blob
                    this._callbacks.onSavePdf.call(this, {
                        features: features, 
                        pdfdata: pdfdata
                        }, e);
                    if (e.defaultPrevented)
                        return;
                } 
                exp.exportPDF(features, { 
                    saveToFile: true,
                    renderContainerBox: false
                 }); // save to file
            } else if (am.action === "load-json") {
                var json;
                if (this._callbacks.onLoadJson) {
                    json = this._callbacks.onLoadJson.call(this, e);
                    if (e.defaultPrevented)
                        return;
                }

                // if callback returns json, render it
                if (json) {
                    _t.renderForm(json).then(() => {
                        if (this._callbacks.onLoadJsonCompleted)
                            this._callbacks.onLoadJsonCompleted.call(this, json);
                        });
                    return;
                }

                // otherwise, trigger load file action
                var _t = this;
                if (!this._loadJsonInputEl) {
                    this._loadJsonInputEl = this._container.querySelector('[data-action="load-json"] + input[type="file"]');
                    if (!this._loadJsonInputEl.onchange) {
                        this._loadJsonInputEl.onchange = function(e2) {
                            var file = e2.target.files[0];
                            var reader = new FileReader();
                            reader.onload = async function(e3) {
                                var j2 = JSON.parse(e3.target.result);
                                await _t.renderForm(j2);
                                if (_t._callbacks.onLoadJsonCompleted)
                                    _t._callbacks.onLoadJsonCompleted.call(_t, j2);
                            };
                            reader.readAsText(file);
                            _t._loadJsonInputEl.value = null;
                        };
                    }
                }
                this._loadJsonInputEl.click();
            } else if (am.action === "change-render-mode") {
                var current = constants.validModes.indexOf(this.renderMode);
                current++;
                if (current >= constants.validModes.length)
                    current = 0;
                var newMode = constants.validModes[current];
                if (this._callbacks.onRenderModeChanged && this._callbacks.onRenderModeChanged.call(this, {intendedMode: newMode}, e) && e.defaultPrevented)
                    return;
                this.renderMode = newMode;
            } else if (am.action === "validate-form") {
                if (this.renderMode !== constants.WIDGET_MODE_RUN)
                    throw new Error('validate can only be called in run mode');
                var r = this.validate({showErrors: true});
                if (r.result)
                    alert(Strings.Validation_Form_Valid);
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
                options.toolbar.buttons.textField || options.toolbar.buttons.numberField || options.toolbar.buttons.spacer || 
                options.toolbar.buttons.button || options.toolbar.buttons.label || options.toolbar.buttons.image
            );
            var renderModeGroup = options.toolbar.buttons && (
                options.toolbar.buttons.renderCurrentMode && options.toolbar.buttons.renderValidateForm
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
                    html +=`<button type="button" data-action="load-json" title="${Strings.Toolbar_ImportJson_ButtonTitle}">
                            <i class="${Icons.Toolbar_LoadJson_Icon}"></i>
                            <span>${Strings.Toolbar_ImportJson_ButtonLabel}</span>
                        </button>
                        <input type="file" style="display: none;" accept="application/json" />`;
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

            if (renderModeGroup) {
                html += `<div class="widget-toolbar-group">
                    <div class="widget-toolbar-group-title">${Strings.Toolbar_RenderMode_GroupTitle}</div>`;
                if (options.toolbar.buttons.renderCurrentMode)
                    html += `<button type="button" data-action="change-render-mode" title="${Strings.Toolbar_RenderModes_ButtonTitle}">
                            <span data-render-mode="design">
                                <i class="${Icons.Toolbar_DesignMode_Icon}"></i>
                                <span>${Strings.Toolbar_RenderModes_Design_ButtonLabel}</span>                            
                            </span>
                            <span data-render-mode="run">
                                <i class="${Icons.Toolbar_RunMode_Icon}"></i>
                                <span>${Strings.Toolbar_RenderModes_Run_ButtonLabel}</span>
                            </span>
                            <span data-render-mode="view">
                                <i class="${Icons.Toolbar_ViewMode_Icon}"></i>
                                <span>${Strings.Toolbar_RenderModes_View_ButtonLabel}</span>
                            </span>                            
                        </button>`;

                if (options.toolbar.buttons.renderValidateForm)
                    html += `<button type="button" disabled data-action="validate-form" title="${Strings.Toolbar_RenderModes_ValidateForm_ButtonTitle}">
                                <i class="${Icons.Toolbar_ValidateForm_Icon}"></i>
                                <span>${Strings.Toolbar_RenderModes_ValidateForm_ButtonLabel}</span>
                            </button>`;                        
                html += `</div>`;
            }

            if (widgetsGroup) {
                html += `<div class="widget-toolbar-group">
                        <div class="widget-toolbar-group-title">${Strings.Toolbar_Widgets_GroupTitle}</div>`;
                if (options.toolbar.buttons.label)
                    html += `<button type="button" data-action="add-label" title="${Strings.Toolbar_AddLabelWidget_ButtonTitle}">
                            <i class="${Icons.Toolbar_AddLabelWidget_Icon}"></i>
                            <span>${Strings.Toolbar_AddLabelWidget_ButtonLabel}</span>
                        </button>`;                        
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
                        </button>
                        <input type="file" style="display: none;" accept="image/png,image/jpeg" />`; 
                html += `</div>`;
            }

            html += `</div>`;
        }
        html += `<div class="widget-container"></div>`;
        html += "</div>";
        html += `<div class="widget-editors-container"></div>`;
        html += "</div>";
        this._container.innerHTML = html;

        document.querySelectorAll(`#${this._container.id} [data-action]`).forEach(b => {
            b.addEventListener('click', (e) => {
                this._handleToolbarActions(b.getAttribute('data-action'), e);
            });
        });

        var el = this._container.querySelector('.widget-container');
        var editorsEl = this._container.querySelector('.widget-editors-container');
        this._canvas = new Canvas(el, editorsEl, options.widgetRenderOptions, constants.WIDGET_MODE_DESIGN);
    }

    _updateUI() {
        this._designerEl.setAttribute('data-current-mode', this.renderMode);
        var validateBtn = this._container.querySelector('[data-action="validate-form"]');
        if (validateBtn)
            validateBtn.disabled = this.renderMode === constants.WIDGET_MODE_RUN ? false : true;

        var widgetButtons = this._container.querySelectorAll('[data-action^="add-"]');
        widgetButtons.forEach(b => {
            b.disabled = this.renderMode === constants.WIDGET_MODE_DESIGN ? false : true;
        });
    }
}