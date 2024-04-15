import * as constants from './constants.js';
import Canvas from './canvas.js';

export default class Designer {
    constructor(options) {
        if (!options)
            throw new Error('options is required');
        if (!options.containerId)
            throw new Error('containerId is required');
        
        this._addWidgetCallback = options.addWidgetCallback ?? null;

        var c = document.getElementById(options.containerId);
        if (!c)
            throw new Error(`No element with containerId '${options.containerId}' found in the DOM`);
        this._container = c;

        this._options = {
            nullValue: '(null)',
            showToolbar: true,
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

        this._options.renderOptions.renderMode = options.renderOptions.renderMode ?? constants.WIDGET_MODE_DESIGN;
        if (constants.validModes.indexOf(this._options.renderOptions.renderMode) === -1)
            throw new Error(`Invalid render mode. Must be one of ${contants.validModes.join(', ')}`);
    
        this._options.renderOptions.renderGrip = options.renderOptions.renderGrip !== true ? false : true;
        this._options.renderOptions.renderRemove = options.renderOptions.renderRemove !== true ? false : true;
        this._options.renderOptions.renderTips = options.renderOptions.renderTips !== true ? false : true;

        this._options.showToolbar = options.showToolbar !== true ? false : true;

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

    findWidget(id) {
        return this._canvas.findWidget(id);
    }

    renderForm(json) {
        this._canvas.renderForm(json);
    }

    validate() {
        return this._canvas.validate();
    }

    get widgets() { 
        return this._canvas._widgets;
    }

    /// Private methods
    _setupDesigner(options) {
        var html = `<div class="widget-designer">`;
        if (options.showToolbar) {
            html += `<div class="widget-toolbar">
                <button type="button" data-action="add-input-text" title="${Strings.Toolbar_AddTextInputWidget_ButtonTitle}">
                    <i class="${Icons.Toolbar_AddTextInputWidget_Icon}"></i>
                    <span>${Strings.Toolbar_AddTextInputWidget_ButtonLabel}</span>
                </button>
                <button type="button" data-action="add-input-number" title="${Strings.Toolbar_AddNumberInputWidget_ButtonTitle}">
                    <i class="${Icons.Toolbar_AddNumberInputWidget_Icon}"></i>
                    <span>${Strings.Toolbar_AddNumberInputWidget_ButtonLabel}</span>
                </button>
                <button type="button" data-action="add-spacer" title="${Strings.Toolbar_AddSpacerWidget_ButtonTitle}">
                    <i class="${Icons.Toolbar_AddSpacerWidget_Icon}"></i>
                    <span>${Strings.Toolbar_AddSpacerWidget_ButtonLabel}</span>
                </button>                
            </div>`;
        }
        html += `<div class="widget-container"></div>`;
        html += "</div>";

        this._container.innerHTML = html;

        let actionMappings = [
            { action: 'add-input-text', widgetType: constants.WIDGET_TYPE_TEXT },
            { action: 'add-input-number', widgetType: constants.WIDGET_TYPE_NUMBER },
            { action: 'add-input-button', widgetType: constants.WIDGET_TYPE_BUTTON },
            { action: 'add-spacer', widgetType: constants.WIDGET_TYPE_SPACER }
        ];

        document.querySelectorAll(`#${this._container.id} [data-action]`).forEach(b => {
            var am = actionMappings.find(m => m.action === b.getAttribute('data-action'));
            if (!am)
                throw new Error(`Action '${b.getAttribute('data-action')}' not found in actionMappings`);

            b.addEventListener('click', (e) => {
                if (this._addWidgetCallback) {
                    this._addWidgetCallback(widgetType, e);
                    if (e.defaultPrevented)
                        return;
                }
                this.addWidget({ type: am.widgetType });
            });
        });
        var widgetsContainerEl = this._container.querySelector('.widget-container');
        this._canvas = new Canvas(widgetsContainerEl, options.renderOptions);
    }
}