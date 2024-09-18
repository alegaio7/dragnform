// This class is not exported as a module since it must be loaded as an inline script in the HTML file
// in order to provide localization for all resources
class Strings {
    // canvas
    static get Canvas_NewForm_Name() { return "Nuevo formulario"; }

    // Designer
    static get Designer_Validation_Form_Valid() { return '¡El formulario es válido!'; }
    static get Designer_NewForm_Confirm() { return 'Tu trabajo no está guardado. ¿Deseas comenzar un nuevo formulario?'; }

    // pattern validation messages
    static get Pattern_Validation_AlphaOnly() { return 'Sólo se permiten letras y espacios'; }
    static get Pattern_Validation_AlphaAccentsOnly() { return 'Sólo se permiten letras, espacios y acentos'; }
    static get Pattern_Validation_AlphaNumbers() { return 'Sólo se permiten letras y números'; }
    static get Pattern_Validation_AlphaAccentsNumbers() { return 'Sólo se permiten letras, espacios, acentos y números'; }
    static get Pattern_Validation_NumbersOnly() { return 'Sólo se permiten números'; }
    static get Pattern_Validation_Address() { return 'Dirección inválida. Solo se permiten letras, números, espacios, acentos, comas, puntos y guiones'; }
    static get Pattern_Validation_Email() { return 'Formato de correo electrónico inválido'; }

    // designer
    static get Toolbar_AddButtonWidget_ButtonLabel() { return 'Botón'; }
    static get Toolbar_AddButtonWidget_ButtonTitle() { return 'Agregar botón'; }
    static get Toolbar_AddImageWidget_ButtonLabel() { return 'Imagen'; }
    static get Toolbar_AddImageWidget_ButtonTitle() { return 'Agregar imagen'; }

    static get Toolbar_RenderModes_Design_ButtonLabel() { return 'Modo diseño'; }
    static get Toolbar_RenderModes_Run_ButtonLabel() { return 'Modo ejecución'; }
    static get Toolbar_RenderModes_View_ButtonLabel() { return 'Modo vista'; }
    static get Toolbar_RenderModes_ButtonTitle() { return 'Cambiar modo'; }
    static get Toolbar_RenderModes_ValidateForm_ButtonTitle() { return 'Validar el formulario en modo ejecución'; }
    static get Toolbar_RenderModes_ValidateForm_ButtonLabel() { return 'Validar'; }

    static get Toolbar_AddLabelWidget_ButtonLabel() { return 'Etiqueta'; }
    static get Toolbar_AddLabelWidget_ButtonTitle() { return 'Agregar etiqueta'; }    
    static get Toolbar_AddCheckboxInputWidget_ButtonLabel() { return 'Casilla de verificación'; }
    static get Toolbar_AddCheckboxInputWidget_ButtonTitle() { return 'Agregar casilla de verificación'; }

    static get Toolbar_AddDateInputWidget_ButtonLabel() { return 'Fecha'; }
    static get Toolbar_AddDateInputWidget_ButtonTitle() { return 'Agregar campo de fecha'; }

    static get Toolbar_AddEmailInputWidget_ButtonLabel() { return 'Correo electrónico'; }
    static get Toolbar_AddEmailInputWidget_ButtonTitle() { return 'Agregar campo de correo electrónico'; }

    static get Toolbar_AddNumberInputWidget_ButtonLabel() { return 'Número'; }
    static get Toolbar_AddNumberInputWidget_ButtonTitle() { return 'Agregar campo de número'; }
    static get Toolbar_AddParagraphInputWidget_ButtonLabel() { return 'Párrafo'; }
    static get Toolbar_AddParagraphInputWidget_ButtonTitle() { return 'Agregar campo de párrafo'; }
    static get Toolbar_AddRadioInputWidget_ButtonLabel() { return 'Radio'; }
    static get Toolbar_AddRadioInputWidget_ButtonTitle() { return 'Agregar opciones de radio'; }
    static get Toolbar_AddSpacerWidget_ButtonLabel() { return 'Espaciador'; }
    static get Toolbar_AddSpacerWidget_ButtonTitle() { return 'Agregar espaciador'; }
    static get Toolbar_AddSelectInputWidget_ButtonLabel() { return 'Selector'; }
    static get Toolbar_AddSelectnputWidget_ButtonTitle() { return 'Agregar selector desplegable'; }
    static get Toolbar_AddTextInputWidget_ButtonLabel() { return 'Texto'; }
    static get Toolbar_AddTextInputWidget_ButtonTitle() { return 'Agregar campo de texto'; }
    static get Toolbar_ExportJson_ButtonLabel() { return 'Exportar'; }
    static get Toolbar_ExportJson_ButtonTitle() { return 'Exportar formulario a json'; }
    static get Toolbar_ImportJson_ButtonLabel() { return 'Importar'; }
    static get Toolbar_ImportJson_ButtonTitle() { return 'Importar formulario desde archivo json'; }
    static get Toolbar_NewForm_ButtonLabel() { return 'Nuevo'; }
    static get Toolbar_NewForm_ButtonTitle() { return 'Iniciar un nuevo formulario'; }
    static get Toolbar_SavePdf_ButtonLabel() { return 'Guardar en PDF'; }
    static get Toolbar_SavePdf_ButtonTitle() { return 'Guardar el formulario en PDF'; }

    static get Toolbar_Widgets_GroupTitle() { return 'Widgets'; }
    static get Toolbar_File_GroupTitle() { return 'Archivo'; }
    static get Toolbar_Layout_GroupTitle() { return 'Diseño'; }
    static get Toolbar_RenderMode_GroupTitle() { return 'Modo actual'; }

    // widgets
    static get WidgetPropertiesButtonTitle() { return 'Propiedades del widget'; }
    static get WidgetRemoveButtonTitle() { return 'Eliminar widget'; }
    static get WidgetRemoveConfirmationMessage() { return '¿Deseas eliminar el widget "{0}"?'; }
    static get WidgetValidation_PatternMessage() { return 'El valor no coincide con el patrón'; }
    static get WidgetValidation_RequiredMessage() { return 'Este campo requiere un valor'; }

    static get Widget_Date_Default_Date_Format() { return 'yyyy/mm/dd'; }
    static get Widget_Date_Invalid_Date_Format() { return 'El formato de fecha es inválido.'; }

    static get Widget_Email_Invalid_Email_Format() { return 'El formato de correo electrónico es inválido.'; }

    static get Widget_Radio_Default_Option1_Title() { return 'Opción 1'; }
    static get Widget_Radio_Default_Option2_Title() { return 'Opción 2'; }
    static get Widget_Radio_Options_Label_Title() { return 'Título'; }
    static get Widget_Radio_Options_Label_Value() { return 'Valor'; }
    static get Widget_Radio_Options_Title() { return 'Opciones de radio'; }

    static get Widget_Select_Default_Option1_Title() { return 'Opción 1'; }
    static get Widget_Select_Default_Option2_Title() { return 'Opción 2'; }
    static get Widget_Select_Options_Label_Title() { return 'Título'; }
    static get Widget_Select_Options_Label_Value() { return 'Valor'; }
    static get Widget_Select_Options_Title() { return 'Opciones de selector'; }

    static get Widget_Text_Text_Transformations() { return 'Transformaciones de texto'; }
    static get Widget_Text_Text_TransformationsNone() { return 'Ninguna'; }
    static get Widget_Text_Text_TransformationsUpper() { return 'Mayúsculas'; }
    static get Widget_Text_Text_TransformationsLower() { return 'Minúsculas'; }
    static get Widget_Text_Text_TransformationsTitle() { return 'Título'; }
    
    // widget editors
    static get WidgetEditor_Common_Accept() { return 'Aceptar'; }
    static get WidgetEditor_Common_Align_H_Left() { return 'Izquierda'; }
    static get WidgetEditor_Common_Align_H_Center() { return 'Centro'; }
    static get WidgetEditor_Common_Align_H_Right() { return 'Derecha'; }
    static get WidgetEditor_Common_Align_V_Bottom() { return 'Abajo'; }
    static get WidgetEditor_Common_Align_V_Center() { return 'Centro'; }
    static get WidgetEditor_Common_Align_V_Top() { return 'Arriba'; }
    static get WidgetEditor_Common_AutoHeight() { return 'Altura automática'; }
    static get WidgetEditor_Common_Cancel() { return 'Cancelar'; }
    static get WidgetEditor_Common_Columns() { return 'Ancho'; }
    static get WidgetEditor_Common_FontProperties() { return 'Propiedades de fuente'; }
    static get WidgetEditor_Common_FontSize() { return 'Tamaño de fuente'; }
    static get WidgetEditor_Common_FontUnderline() { return 'Subrayado'; }
    static get WidgetEditor_Common_FontWeight() { return 'Peso de fuente'; }
    static get WidgetEditor_Common_FontWeight_Bold() { return 'Negrita'; }
    static get WidgetEditor_Common_FontWeight_Normal() { return 'Normal'; }
    static get WidgetEditor_Common_Height() { return 'Altura'; }
    static get WidgetEditor_Common_HorizontalAlignment() { return 'Alineación horizontal';}
    static get WidgetEditor_Common_Label() { return 'Etiqueta'; }
    static get WidgetEditor_Common_LabelColor() { return 'Color de etiqueta'; }
    static get WidgetEditor_Common_MoveDownButtonTitle() { return 'Mover abajo'; }
    static get WidgetEditor_Common_MoveUpButtonTitle() { return 'Mover arriba'; }
    static get WidgetEditor_Common_Required() { return 'Requerido'; }
    static get WidgetEditor_Common_TextColor() { return 'Color de texto'; }
    static get WidgetEditor_Common_Tip() { return 'Texto de ayuda'; }
    static get WidgetEditor_Common_VerticalAlignment() { return 'Alineación vertical';}
    static get WidgetEditor_Common_Widget_Properties() { return 'Propiedades del widget ({0})'; }
    static get WidgetEditor_Common_Widget_ValueRequiredMessage() { return 'Mensaje de validación'; }
    static get WidgetEditor_Common_Window_Hide_Icon_Title() { return 'Ocultar ventana al pasar el ratón'; }

    static get WidgetEditor_Date_Widget_DateFormat() { return 'Formato de fecha'; }
    static get WidgetEditor_Date_Widget_DateFormatTip() { return 'Debe tener 10 caracteres de longitud. Sólo se permiten yyyy, mm, dd, [- o /].'; }
 
    static get WidgetEditor_Number_Widget_MinValue() { return 'Mín.'; }
    static get WidgetEditor_Number_Widget_MinValueValidationMessage() { return 'Mensaje de validación'; }
    static get WidgetEditor_Number_Widget_MaxValue() { return 'Máx.'; }
    static get WidgetEditor_Number_Widget_MaxValueValidationMessage() { return 'Mensaje de validación'; }
    
    static get WidgetEditor_Radio_Widget_Horizontal() { return 'Disposición horizontal'; }
    static get WidgetEditor_Radio_Add_Option_Button_Title() { return 'Agregar nueva opción'; }
    static get WidgetEditor_Radio_Remove_Option_Button_Title() { return 'Eliminar opción'; }
    static get WidgetEditor_Radio_Confirm_Remove_Option_Message() { return '¿Estás seguro de que deseas eliminar esta opción?'; }

    static get WidgetEditor_Select_Add_Option_Button_Title() { return 'Agregar nueva opción'; }
    static get WidgetEditor_Select_Remove_Option_Button_Title() { return 'Eliminar opción'; }
    static get WidgetEditor_Select_Confirm_Remove_Option_Message() { return '¿Estás seguro de que deseas eliminar esta opción?'; }

    static get WidgetEditor_Text_Widget_MinLength() { return 'Long. mín.'; }
    static get WidgetEditor_Text_Widget_MinLengthValidationMessage() { return 'Mensaje de validación'; }
    static get WidgetEditor_Text_Widget_MaxLengthValidationMessage() { return 'Mensaje de validación'; }
    static get WidgetEditor_Text_Widget_MaxLength() { return 'Long. máx.'; }
    static get WidgetEditor_Text_Widget_ValueRequiredMessage() { return 'Mensaje de validación'; }

    // flyter
    static get Flyter_CancelButtonText() { return 'Cancelar'; }
    static get Flyter_OkButtonText() { return 'Aceptar'; }
}
