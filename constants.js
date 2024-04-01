export const WIDGET_MODE_DESIGN = 'design';
export const WIDGET_MODE_VIEW = 'view';

export const WIDGET_TYPE_NUMBER = 'number';
export const WIDGET_TYPE_SPACER = 'spacer';
export const WIDGET_TYPE_SUBMIT = 'submit';
export const WIDGET_TYPE_TEXT = 'text';

export const WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE = "beforeLabel";
export const WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER = "afterLabel";

export const WIDGET_PDF_OBJECT_BOX = 'box';
// export const WIDGET_PDF_OBJECT_LABEL = 'label';
export const WIDGET_PDF_OBJECT_TEXT = 'text';
export const WIDGET_PDF_OBJECT_TYPEFACE = 'typeface';

export const WIDGET_TYPE_NUMBER_MAX = 1_000_000;
export const WIDGET_TYPE_TEXT_MAX_LENGTH = 500;

export const WIDGET_VALIDATION_REQUIRED = 'Value is required';
export const WIDGET_VALIDATION_MIN_LENGTH = 'Value is too short';
export const WIDGET_VALIDATION_MIN_VALUE = 'Value is too low';
export const WIDGET_VALIDATION_MAX_LENGTH = 'Value is too long';
export const WIDGET_VALIDATION_MAX_VALUE = 'Value is too high';
export const WIDGET_VALIDATION_PATTERN = 'Value is too long';

export const WIDGET_VALIDATION_ALPHA_ONLY_REGEX = /^[a-zA-Z_\s]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_ACCENTS_ONLY_REGEX = /^[a-zA-ZÑñÁáÉéïíöóüúü_\s]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_NUMBERS_REGEX = /^[a-zA-Z0-9_]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_ACCENTS_AND_NUMBERS_REGEX = /^[a-zA-Z0-9_ÑñÁáÉéïíöóüúü\s]+$/;
export const WIDGET_VALIDATION_ADDRESS_REGEX = /^[a-zA-Z0-9_\-°\.,&ÑñÁáÉéïíöóüúü\s]+$/;
export const WIDGET_VALIDATION_NUMBERS_ONLY_REGEX = /^[0-9]+$/;
export const WIDGET_VALIDATION_EMAIL_REGEX = /^[A-Za-z0-9]+[A-Za-z0-9!#$%&\*\+\._-]*@[A-Za-z0-9]+([.]{0,1}[A-Za-z0-9_-]+)*\.[A-Za-z]{2,6}$/;

// add more custom patterns here, but define first the pattern above
export const WIDGET_VALIDATION_PATTERNS = [
    {name: 'alpha', value: WIDGET_VALIDATION_ALPHA_ONLY_REGEX, validationMessage: 'Only letters and spaces are allowed'},
    {name: 'alpha_accents', value: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_ONLY_REGEX, validationMessage: 'Only letters, spaces and accents are allowed'},
    {name: 'alpha_numbers', value: WIDGET_VALIDATION_ALPHA_AND_NUMBERS_REGEX, validationMessage: 'Only letters and numbers are allowed'},
    {name: 'alpha_accents_numbers', value: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_AND_NUMBERS_REGEX, validationMessage: 'Only letters, spaces, accents and numbers are allowed'},
    {name: 'numbers', value: WIDGET_VALIDATION_NUMBERS_ONLY_REGEX, validationMessage: 'Only numbers are allowed'},
    {name: 'address', value: WIDGET_VALIDATION_ADDRESS_REGEX, validationMessage: 'Invalid address. Only letters, numbers, spaces, accents, commas, periods and hyphens are allowed'},
    {name: 'email', value: WIDGET_VALIDATION_EMAIL_REGEX, validationMessage: 'Invalid email format'}
];
