import * as constants from './constants.js';
import Canvas from './canvas.js';

export default class Designer {
    constructor(options) {
        if (!options)
            throw new Error('options is required');
        if (!options.containerId)
            throw new Error('containerId is required');
        
        // callbacks: onWidgetAdded, onWidgetRemoved, onWidgetsMoved
        // onExportToJson, onLoadJson
        this._callbacks = options.callbacks ?? [];
        this._actionMappings = [
            { action: 'new-form', widgetType: null, callback: this._callbacks.onNewForm},
            { action: 'load-json', widgetType: null, callback: this._callbacks.onLoadJson},
            { action: 'export-json', widgetType: null, callback: this._callbacks.onExportToJson},
            { action: 'add-input-text', widgetType: constants.WIDGET_TYPE_TEXT, callback: this._callbacks.onWidgetAdded },
            { action: 'add-input-number', widgetType: constants.WIDGET_TYPE_NUMBER, callback: this._callbacks.onWidgetAdded },
            { action: 'add-input-button', widgetType: constants.WIDGET_TYPE_BUTTON, callback: this._callbacks.onWidgetAdded },
            { action: 'add-spacer', widgetType: constants.WIDGET_TYPE_SPACER, callback: this._callbacks.onWidgetAdded }
        ];

        var c = document.getElementById(options.containerId);
        if (!c)
            throw new Error(`No element with containerId '${options.containerId}' found in the DOM`);
        this._container = c;

        this._options = this._getDefaultOptions();

        this._options.renderOptions.renderMode = options.renderOptions.renderMode ?? constants.WIDGET_MODE_DESIGN;
        if (constants.validModes.indexOf(this._options.renderOptions.renderMode) === -1)
            throw new Error(`Invalid render mode. Must be one of ${contants.validModes.join(', ')}`);
    
        this._options.renderOptions.renderGrip = options.renderOptions.renderGrip !== true ? false : true;
        this._options.renderOptions.renderRemove = options.renderOptions.renderRemove !== true ? false : true;
        this._options.renderOptions.renderTips = options.renderOptions.renderTips !== true ? false : true;

        if (options.toolbar)
            this._options.toolbar = options.toolbar;
        this._options.toolbar.visible = options.toolbar.visible !== true ? false : true;

        if (options.renderOptions) {
            if (options.renderOptions.globalClasses)
                this._options.renderOptions.globalClasses = options.renderOptions.globalClasses;
            if (options.renderOptions.requiredAttributeSettings)
                this._options.renderOptions.requiredAttributeSettings = options.renderOptions.requiredAttributeSettings;
        }

        this._setupDesigner(this._options);
    }

    addWidget(jsonObj) {
        return this._canvas.addWidget(jsonObj);
    }

    get canvas() {
        return this._canvas;
    }

    clearCanvas() {
        this._options = this._getDefaultOptions();
        this._canvas.clearCanvas(this._options.renderOptions);
    }

    findWidget(id) {
        return this._canvas.findWidget(id);
    }

    renderForm(json, renderMode) {
        this._canvas.renderForm(json, renderMode);
    }

    get renderMode() {
        return this._canvas.renderMode;
    }

    validate() {
        return this._canvas.validate();
    }

    get widgets() { 
        return this._canvas._widgets;
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
            renderOptions: {
                renderGrip: true,
                renderRemove: true,
                renderTips: true,
                renderMode: constants.WIDGET_MODE_DESIGN,
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

    _setupDesigner(options) {
        var html = `<div class="widget-designer">`;
        if (options.toolbar.visible) {          // TODO Parse buttons
            var fileGroup = options.toolbar.buttons && (
                options.toolbar.buttons.new || options.toolbar.buttons.load || options.toolbar.buttons.export
            );
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
                html += `</div>`;
            }
            html += `
                <div class="widget-toolbar-group">
                    <div class="widget-toolbar-group-title">${Strings.Toolbar_Fields_GroupTitle}</div>
                    <button type="button" data-action="add-input-text" title="${Strings.Toolbar_AddTextInputWidget_ButtonTitle}">
                        <i class="${Icons.Toolbar_AddTextInputWidget_Icon}"></i>
                        <span>${Strings.Toolbar_AddTextInputWidget_ButtonLabel}</span>
                    </button>
                    <button type="button" data-action="add-input-number" title="${Strings.Toolbar_AddNumberInputWidget_ButtonTitle}">
                        <i class="${Icons.Toolbar_AddNumberInputWidget_Icon}"></i>
                        <span>${Strings.Toolbar_AddNumberInputWidget_ButtonLabel}</span>
                    </button>
                </div>
                <div class="widget-toolbar-group">
                    <div class="widget-toolbar-group-title">${Strings.Toolbar_Layout_GroupTitle}</div>
                    <button type="button" data-action="add-spacer" title="${Strings.Toolbar_AddSpacerWidget_ButtonTitle}">
                        <i class="${Icons.Toolbar_AddSpacerWidget_Icon}"></i>
                        <span>${Strings.Toolbar_AddSpacerWidget_ButtonLabel}</span>
                    </button>
                </div>
            </div>`;
        }
        html += `<div class="widget-container"></div>`;
        html += "</div>";

        this._container.innerHTML = html;

        document.querySelectorAll(`#${this._container.id} [data-action]`).forEach(b => {
            b.addEventListener('click', (e) => {
                this._handleToolbarActions(b.getAttribute('data-action'), e);
            });
        });

        var widgetsContainerEl = this._container.querySelector('.widget-container');
        this._canvas = new Canvas(widgetsContainerEl, options.renderOptions);
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
                var json = this._canvas.exportJson();
                if (am.callback)
                    am.callback(json);
            } else if (am.action === "load-json") {
                var json;
                if (am.callback) {
                    json = am.callback(e);
                    if (e.defaultPrevented)
                        return;
                }

                // if callback returns json, render it
                if (json) {
                    _t.renderForm(json, this.renderMode);
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
                            var json = JSON.parse(e3.target.result);
                            _t.renderForm(json, _t.renderMode);
                        };
                        reader.readAsText(file);
                        inp.value = null;
                    };
                }
                inp.click();
            }
        }
    }
}