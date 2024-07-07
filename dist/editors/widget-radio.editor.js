import WidgetCommonPropertiesEditor from"./widget-common.editor.js";export default class WidgetRadioPropertiesEditor extends WidgetCommonPropertiesEditor{constructor(t){super(t),this._radioOptions=t.widget.radioOptions,this.chkHorizontalDisposition=this._dialogContainer.querySelector("#chkWidgetPropRadioHorizontal");var i=this;this.chkHorizontalDisposition&&this._callbacks.onHorizontalDispositionChanged&&this.chkHorizontalDisposition.addEventListener("change",(function(){i._callbacks.onHorizontalDispositionChanged(i,i.widget,this.checked)})),this._setupRadioOptions(),this._dialogContainer.querySelector('[data-action="add"]').addEventListener("click",(t=>{var i=this._addRadioOption();if(this._callbacks.onRadioOptionAdd){var e=this._callbacks.onRadioOptionAdd(this,this.widget,{title:"",value:""});i.setAttribute("data-id",e.id)}}))}init(){super.init(),this._updateControls()}_addRadioOption(t,i){t||(t=this._radioOptions.length+1);var e=this._dialogContainer.querySelector('[data-part="radio-options-container"]'),o=e.querySelector('.widget-radio-option[data-index="1"]').cloneNode(!0);o.setAttribute("data-index",t);let a=o.querySelector("#txtRadioOptionTitle1");a.setAttribute("id",`txtRadioOptionTitle${t}`),a.value=i?i.title:"";let d=o.querySelector("#txtRadioOptionValue1");return d.setAttribute("id",`txtRadioOptionValue${t}`),d.value=i?i.value:"",o.querySelector('[data-action="remove"]').removeAttribute("style"),e.appendChild(o),this._attachHandlers(o),o}_attachHandlers(t){var i=t.getAttribute("data-index");t.querySelector('[data-action="remove"]').addEventListener("click",(e=>{confirm(Strings.WidgetEditor_Radio_Confirm_Remove_Option_Message)&&(t.remove(),this._callbacks.onRadioOptionRemove&&this._callbacks.onRadioOptionRemove(this,this.widget,i))}));for(var e=["change","input"],o=0;o<e.length;o++)t.querySelector(`#txtRadioOptionTitle${i}`).addEventListener(e[o],(t=>{this._callbacks.onRadioOptionTitleChanged&&this._callbacks.onRadioOptionTitleChanged(this,this.widget,t.target.value,i-1)})),t.querySelector(`#txtRadioOptionValue${i}`).addEventListener(e[o],(t=>{this._callbacks.onRadioOptionValueChanged&&this._callbacks.onRadioOptionValueChanged(this,this.widget,t.target.value,i-1)}))}_setupRadioOptions(){for(var t=this._dialogContainer.querySelector('[data-part="radio-options-container"]'),i=0;i<this._radioOptions.length;i++){var e=i+1;if(e<=2){let o=t.querySelector(`.widget-radio-option[data-index="${e}"]`);o.setAttribute("data-id",this._radioOptions[i].id),o.querySelector(`#txtRadioOptionTitle${e}`).value=this._radioOptions[i].title,o.querySelector(`#txtRadioOptionValue${e}`).value=this._radioOptions[i].value,o.querySelector('[data-action="remove"]').setAttribute("style","display: none"),this._attachHandlers(o)}else this._addRadioOption(e,this._radioOptions[i])}}_updateControls(){super._updateControls()}}