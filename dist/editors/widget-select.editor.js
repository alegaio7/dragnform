import functions from"../jfi-functions.js";import WidgetCommonPropertiesEditor from"./widget-common.editor.js";export default class WidgetSelectPropertiesEditor extends WidgetCommonPropertiesEditor{constructor(t){super(t);t=t.widget.selectOptions??[];this._selectOptions=[...t],this._savedSelectOptions=[...t],this._setupSelectOptions(),this._setupOrderButtons(),this._dialogContainer.querySelector('[data-action="add"]').addEventListener("click",(t=>{var e=this._addSelectOption(),i=functions.uuidv4();e.setAttribute("data-id",i),this._selectOptions.push({id:i,title:"",value:""}),this._setupOrderButtons(),this._callbacks.onSelectOptionsChanged&&this._callbacks.onSelectOptionsChanged(this,this.widget,this._selectOptions);var a=e.querySelector('[data-part="option-title"]');a&&a.focus()}))}init(){super.init(),this._updateControls()}_acceptDialogHandler(){this.widget.selectOptions=this._selectOptions,super._acceptDialogHandler()}_addSelectOption(t,e){t||(t=this._selectOptions.length+1);var i=this._dialogContainer.querySelector('[data-part="select-options-container"]'),a=i.querySelector('.widget-select-option[data-index="1"]').cloneNode(!0);a.setAttribute("data-index",t),a.setAttribute("data-id",""),e&&a.setAttribute("data-id",e.id);let s=a.querySelector('[data-part="option-title"]');s.setAttribute("id",`txtSelectOptionTitle${t}`),s.value=e?e.title:"";let o=a.querySelector('[data-part="option-value"]');return o.setAttribute("id",`txtSelectOptionValue${t}`),o.value=e?e.value:"",a.querySelector('[data-action="remove"]').removeAttribute("style"),i.appendChild(a),this._attachHandlers(a),a}_attachHandlers(t){t.querySelector('[data-action="remove"]').addEventListener("click",(e=>{if(confirm(Strings.WidgetEditor_Select_Confirm_Remove_Option_Message)){t.remove();let e=t.getAttribute("data-id");for(var i=0;i<this._selectOptions.length;i++)if(this._selectOptions[i].id===e){this._selectOptions.splice(i,1);break}this._callbacks.onSelectOptionsChanged&&this._callbacks.onSelectOptionsChanged(this,this.widget,this._selectOptions)}})),t.querySelector('[data-part="option-title"]').addEventListener("blur",(e=>{var i=t.querySelector('[data-part="option-value"]');i&&!i.value&&(i.value=e.target.value)}));for(var e=["change","input"],i=0;i<e.length;i++)t.querySelector('[data-part="option-title"]').addEventListener(e[i],(e=>{let i=t.getAttribute("data-id");this._selectOptions.find((t=>t.id===i)).title=e.target.value,this._callbacks.onSelectOptionTitleChanged&&this._callbacks.onSelectOptionTitleChanged(this,this.widget,e.target.value,i)})),t.querySelector('[data-part="option-value"]').addEventListener(e[i],(e=>{let i=t.getAttribute("data-id");this._selectOptions.find((t=>t.id===i)).value=e.target.value,this._callbacks.onSelectOptionValueChanged&&this._callbacks.onSelectOptionValueChanged(this,this.widget,e.target.value,i)}));t.querySelector('[data-action="move-up"]').addEventListener("click",(e=>{this._moveSelectOption(t,-1)})),t.querySelector('[data-action="move-down"]').addEventListener("click",(e=>{this._moveSelectOption(t,1)}))}_cancelDialogHandler(){super._cancelDialogHandler(),this.widget.selectOptions=this._savedSelectOptions}_moveSelectOption(t,e){var i,a,s,o=this._dialogContainer.querySelector('[data-part="select-options-container"]'),l=o.querySelectorAll(".widget-select-option"),n=parseInt(t.getAttribute("data-index")),r=n+e;r<1||r>l.length||(e>0?(i=t,a=o.querySelector(`.widget-select-option[data-index="${r}"]`)):(i=o.querySelector(`.widget-select-option[data-index="${r}"]`),a=t),o.insertBefore(a,i),s=this._selectOptions[n-1],this._selectOptions[n-1]=this._selectOptions[r-1],this._selectOptions[r-1]=s,this._setupOrderButtons(),this._callbacks.onSelectOptionsChanged&&this._callbacks.onSelectOptionsChanged(this,this.widget,this._selectOptions))}_setupOrderButtons(){for(var t=this._dialogContainer.querySelectorAll('[data-part="select-options-container"] .widget-select-option'),e=0;e<t.length;e++){var i=t[e];i.setAttribute("data-index",e+1);var a=i.querySelector('[data-action="move-up"]'),s=i.querySelector('[data-action="move-down"]');a.removeAttribute("disabled"),s.removeAttribute("disabled");let o=i.querySelector('[data-action="remove"]');o.classList.remove("widget-hide"),0===e&&a.setAttribute("disabled","disabled"),e===t.length-1&&s.setAttribute("disabled","disabled"),e<2&&o.classList.add("widget-hide")}}_setupSelectOptions(){for(var t=this._dialogContainer.querySelector('[data-part="select-options-container"]'),e=0;e<this._selectOptions.length;e++){var i=e+1;if(i<=2){var a=this._selectOptions[e];let s=t.querySelector(`.widget-select-option[data-index="${i}"]`);s.setAttribute("data-id",a.id),s.querySelector('[data-part="option-title"]').value=this._selectOptions[e].title,s.querySelector('[data-part="option-value"]').value=this._selectOptions[e].value,s.querySelector('[data-action="remove"]').classList.add("widget-hide"),this._attachHandlers(s)}else this._addSelectOption(i,this._selectOptions[e])}}}