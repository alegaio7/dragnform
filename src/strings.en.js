// This class is not exported as a module since it must be loaded as an inline script in the HTML file
// in order to provide localization for all resources
class Strings {
    // canvas
    static get Canvas_NewForm_Name() { return "New form"; }

    // Designer
    static get Designer_Validation_Form_Valid () { return 'The form is valid!'; }
    static get Designer_NewForm_Confirm () { return 'Your work is not saved. Do you want to start a new form?'; }

    // patter validation messages
    static get Pattern_Validation_AlphaOnly() { return 'Only letters and spaces are allowed'; }
    static get Pattern_Validation_AlphaAccentsOnly() { return 'Only letters, spaces and accents are allowed'; }
    static get Pattern_Validation_AlphaNumbers() { return 'Only letters and numbers are allowed'; }
    static get Pattern_Validation_AlphaAccentsNumbers() { return 'Only letters, spaces, accents and numbers are allowed'; }
    static get Pattern_Validation_NumbersOnly() { return 'Only numbers are allowed'; }
    static get Pattern_Validation_Address() { return 'Invalid address. Only letters, numbers, spaces, accents, commas, periods and hyphens are allowed'; }
    static get Pattern_Validation_Email() { return 'Invalid email format'; }

    // designer
    static get Toolbar_AddButtonWidget_ButtonLabel() { return 'Button'; }
    static get Toolbar_AddButtonWidget_ButtonTitle() { return 'Add button'; }
    static get Toolbar_AddImageWidget_ButtonLabel() { return 'Image'; }
    static get Toolbar_AddImageWidget_ButtonTitle() { return 'Add an image'; }

    static get Toolbar_RenderModes_Design_ButtonLabel() { return 'Design mode'; }
    static get Toolbar_RenderModes_Run_ButtonLabel() { return 'Run mode'; }
    static get Toolbar_RenderModes_View_ButtonLabel() { return 'View mode'; }
    static get Toolbar_RenderModes_ButtonTitle() { return 'Switch between design and run mode'; }
    static get Toolbar_RenderModes_ValidateForm_ButtonTitle() { return 'Validate form in run mode'; }
    static get Toolbar_RenderModes_ValidateForm_ButtonLabel() { return 'Validate'; }

    static get Toolbar_AddLabelWidget_ButtonLabel() { return 'Label'; }
    static get Toolbar_AddLabelWidget_ButtonTitle() { return 'Add label'; }    
    static get Toolbar_AddCheckboxInputWidget_ButtonLabel() { return 'Checkbox'; }
    static get Toolbar_AddCheckboxInputWidget_ButtonTitle() { return 'Add checkbox'; }

    static get Toolbar_AddDateInputWidget_ButtonLabel() { return 'Date'; }
    static get Toolbar_AddDateInputWidget_ButtonTitle() { return 'Add date field'; }

    static get Toolbar_AddEmailInputWidget_ButtonLabel() { return 'Email'; }
    static get Toolbar_AddEmailInputWidget_ButtonTitle() { return 'Add email field'; }

    static get Toolbar_AddNumberInputWidget_ButtonLabel() { return 'Number'; }
    static get Toolbar_AddNumberInputWidget_ButtonTitle() { return 'Add number field'; }
    static get Toolbar_AddParagraphInputWidget_ButtonLabel() { return 'Paragraph'; }
    static get Toolbar_AddParagraphInputWidget_ButtonTitle() { return 'Add paragraph field'; }
    static get Toolbar_AddRadioInputWidget_ButtonLabel() { return 'Radio'; }
    static get Toolbar_AddRadioInputWidget_ButtonTitle() { return 'Add radio options'; }
    static get Toolbar_AddSpacerWidget_ButtonLabel() { return 'Spacer'; }
    static get Toolbar_AddSpacerWidget_ButtonTitle() { return 'Add spacer'; }
    static get Toolbar_AddSelectInputWidget_ButtonLabel() { return 'Select'; }
    static get Toolbar_AddSelectnputWidget_ButtonTitle() { return 'Add dropdown selector'; }
    static get Toolbar_AddTextInputWidget_ButtonLabel() { return 'Text'; }
    static get Toolbar_AddTextInputWidget_ButtonTitle() { return 'Add text field'; }
    static get Toolbar_ExportJson_ButtonLabel() { return 'Export'; }
    static get Toolbar_ExportJson_ButtonTitle() { return 'Export form to json'; }
    static get Toolbar_ImportJson_ButtonLabel() { return 'Import'; }
    static get Toolbar_ImportJson_ButtonTitle() { return 'Import form from json file'; }
    static get Toolbar_NewForm_ButtonLabel() { return 'New'; }
    static get Toolbar_NewForm_ButtonTitle() { return 'Start a new form'; }
    static get Toolbar_SavePdf_ButtonLabel() { return 'Save to PDF'; }
    static get Toolbar_SavePdf_ButtonTitle() { return 'Save the form to PDF'; }

    static get Toolbar_Widgets_GroupTitle() { return 'Widgets'; }
    static get Toolbar_File_GroupTitle() { return 'File'; }
    static get Toolbar_Layout_GroupTitle() { return 'Layout'; }
    static get Toolbar_RenderMode_GroupTitle () { return 'Current mode'; }

    // widgets
    static get WidgetPropertiesButtonTitle() { return 'Widget properties'; }
    static get WidgetRemoveButtonTitle() { return 'Remove widget'; }
    static get WidgetRemoveConfirmationMessage() { return 'Remove widget "{0}"?'; }
    static get WidgetValidation_PatternMessage() { return 'Value does not match the pattern'; }
    static get WidgetValidation_RequiredMessage() {return 'A value for this field is required'; }

    static get Widget_Date_Default_Date_Format() { return 'yyyy/mm/dd'; }
    static get Widget_Date_Invalid_Date_Format() { return 'The date format is invalid.'; }

    static get Widget_Email_Invalid_Email_Format() { return 'The email format is invalid.'; }

    static get Widget_Radio_Default_Option1_Title() { return 'Option 1'; }
    static get Widget_Radio_Default_Option2_Title() { return 'Option 2'; }
    static get Widget_Radio_Options_Label_Title() { return 'Title'; }
    static get Widget_Radio_Options_Label_Value() { return 'Value'; }
    static get Widget_Radio_Options_Title() { return 'Radio options'; }

    static get Widget_Select_Default_Option1_Title() { return 'Option 1'; }
    static get Widget_Select_Default_Option2_Title() { return 'Option 2'; }
    static get Widget_Select_Options_Label_Title() { return 'Title'; }
    static get Widget_Select_Options_Label_Value() { return 'Value'; }
    static get Widget_Select_Options_Title() { return 'Select options'; }

    static get Widget_Text_Text_Transformations() { return 'Text tansformations'; }
    static get Widget_Text_Text_TransformationsNone() { return 'None'; }
    static get Widget_Text_Text_TransformationsUpper() { return 'Upper case'; }
    static get Widget_Text_Text_TransformationsLower() { return 'Lower case'; }
    static get Widget_Text_Text_TransformationsTitle() { return 'Title case'; }
    
    // widget editors
    static get WidgetEditor_Common_Accept() { return 'Accept'; }
    static get WidgetEditor_Common_Align_H_Left() { return 'Left'; }
    static get WidgetEditor_Common_Align_H_Center() { return 'Center'; }
    static get WidgetEditor_Common_Align_H_Right() { return 'Right'; }
    static get WidgetEditor_Common_Align_V_Bottom() { return 'Bottom'; }
    static get WidgetEditor_Common_Align_V_Center() { return 'Center'; }
    static get WidgetEditor_Common_Align_V_Top() { return 'Top'; }
    static get WidgetEditor_Common_AutoHeight() { return 'Auto height'; }
    static get WidgetEditor_Common_Cancel() { return 'Cancel'; }
    static get WidgetEditor_Common_Columns() { return 'Width'; }
    static get WidgetEditor_Common_FontProperties() { return 'Font properties'; }
    static get WidgetEditor_Common_FontSize() { return 'Font size'; }
    static get WidgetEditor_Common_FontUnderline() { return 'Underline'; }
    static get WidgetEditor_Common_FontWeight() { return 'Font weight'; }
    static get WidgetEditor_Common_FontWeight_Bold() { return 'Bold'; }
    static get WidgetEditor_Common_FontWeight_Normal() { return 'Normal'; }
    static get WidgetEditor_Common_Height() { return 'Height'; }
    static get WidgetEditor_Common_HorizontalAlignment() { return 'Horizontal alignment';}
    static get WidgetEditor_Common_Label() { return 'Label'; }
    static get WidgetEditor_Common_LabelColor() { return 'Label color'; }
    static get WidgetEditor_Common_MoveDownButtonTitle() { return 'Move down'; }
    static get WidgetEditor_Common_MoveUpButtonTitle() { return 'Move up'; }
    static get WidgetEditor_Common_Required() { return 'Required'; }
    static get WidgetEditor_Common_TextColor() { return 'Text color'; }
    static get WidgetEditor_Common_Tip() { return 'Help text'; }
    static get WidgetEditor_Common_VerticalAlignment() { return 'Vertical alignment';}
    static get WidgetEditor_Common_Widget_Properties() { return 'Widget properties ({0})'; }
    static get WidgetEditor_Common_Widget_ValueRequiredMessage() { return 'Validation message'; }
    static get WidgetEditor_Common_Window_Hide_Icon_Title() { return 'Hide window on hover'; }

    static get WidgetEditor_Date_Widget_DateFormat() { return 'Date format'; }
    static get WidgetEditor_Date_Widget_DateFormatTip() { return 'Must be 10 characters in length. Only yyyy, mm, dd, [- or /] are allowed.'; }

    static get WidgetEditor_Number_Widget_MinValue() { return 'Min.'; }
    static get WidgetEditor_Number_Widget_MinValueValidationMessage() { return 'Validation message'; }
    static get WidgetEditor_Number_Widget_MaxValue() { return 'Max.'; }
    static get WidgetEditor_Number_Widget_MaxValueValidationMessage() { return 'Validation message'; }
    
    static get WidgetEditor_Radio_Widget_Horizontal() { return 'Horizontal disposition'; }
    static get WidgetEditor_Radio_Add_Option_Button_Title() { return 'Add new option'; }
    static get WidgetEditor_Radio_Remove_Option_Button_Title() { return 'Remove option'; }
    static get WidgetEditor_Radio_Confirm_Remove_Option_Message() { return 'Are you sure you want to remove this option?'; }

    static get WidgetEditor_Select_Add_Option_Button_Title() { return 'Add new option'; }
    static get WidgetEditor_Select_Remove_Option_Button_Title() { return 'Remove option'; }
    static get WidgetEditor_Select_Confirm_Remove_Option_Message() { return 'Are you sure you want to remove this option?'; }

    static get WidgetEditor_Text_Widget_MinLength() { return 'Min. length'; }
    static get WidgetEditor_Text_Widget_MinLengthValidationMessage() { return 'Validation message'; }
    static get WidgetEditor_Text_Widget_MaxLengthValidationMessage() { return 'Validation message'; }
    static get WidgetEditor_Text_Widget_MaxLength() { return 'Max. length'; }
    static get WidgetEditor_Text_Widget_ValueRequiredMessage() { return 'Validation message'; }

    // flyter
    static get Flyter_CancelButtonText() { return 'Cancel'; }
    static get Flyter_OkButtonText() { return 'Accept'; }
}
