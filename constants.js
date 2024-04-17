export const DEFAULT_PDF_DPI = 72;              // default PDF DPI
export const DEFAULT_PDF_FONT_SIZE = 16;              // default PDF DPI
export const DEFAULT_SCREEN_DPI = 96;           // default screen DPI

export const FORMS_DESIGNER_VERSION = "1.0.0";

export const PAPER_SIZE_A4_WIDTH = 595.28;      // in pixels, at 72dpi
export const PAPER_SIZE_A4_HEIGHT = 841.89;     // in pixels

export const WIDGET_IMAGE_ALIGN_CENTER = 'center';
export const WIDGET_IMAGE_ALIGN_LEFT = 'left';
export const WIDGET_IMAGE_ALIGN_RIGHT = 'right';

export const WIDGET_LABEL_DEFAULT_VALUE = "(New label)";
export const WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE = "beforeLabel";
export const WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER = "afterLabel";

export const WIDGET_MODE_DESIGN = 'design';     // mode for designing forms
export const WIDGET_MODE_RUN = 'run';           // mode for rendering widgets and allow user input
export const WIDGET_MODE_VIEW = 'view';         // mode for rendering widget inputs and show readonly controls (previous to a PDF export)

export const validModes = [WIDGET_MODE_DESIGN, WIDGET_MODE_RUN, WIDGET_MODE_VIEW];

export const WIDGET_TYPE_BUTTON = 'button';
export const WIDGET_TYPE_IMAGE = 'image';
export const WIDGET_TYPE_NUMBER = 'number';
export const WIDGET_TYPE_SPACER = 'spacer';
export const WIDGET_TYPE_TEXT = 'text';



export const WIDGET_PDF_OBJECT_BOX = 'box';
// export const WIDGET_PDF_OBJECT_LABEL = 'label';
export const WIDGET_PDF_OBJECT_SIMPLE_TEXT = 'simpletext';
export const WIDGET_PDF_OBJECT_STYLED_TEXT = 'styledtext';
export const WIDGET_PDF_OBJECT_IMAGE = 'image';

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
    {name: 'alpha', regex: WIDGET_VALIDATION_ALPHA_ONLY_REGEX, validationMessage: 'Only letters and spaces are allowed'},
    {name: 'alpha_accents', regex: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_ONLY_REGEX, validationMessage: 'Only letters, spaces and accents are allowed'},
    {name: 'alpha_numbers', regex: WIDGET_VALIDATION_ALPHA_AND_NUMBERS_REGEX, validationMessage: 'Only letters and numbers are allowed'},
    {name: 'alpha_accents_numbers', regex: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_AND_NUMBERS_REGEX, validationMessage: 'Only letters, spaces, accents and numbers are allowed'},
    {name: 'numbers', regex: WIDGET_VALIDATION_NUMBERS_ONLY_REGEX, validationMessage: 'Only numbers are allowed'},
    {name: 'address', regex: WIDGET_VALIDATION_ADDRESS_REGEX, validationMessage: 'Invalid address. Only letters, numbers, spaces, accents, commas, periods and hyphens are allowed'},
    {name: 'email', regex: WIDGET_VALIDATION_EMAIL_REGEX, validationMessage: 'Invalid email format'}
];

export const WIDGET_IMAGE_BLANK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVFhH7c4xAQAwDASh+jf91cCW4VDA20m1RC1RS9QStUQtUUvUErVELVFL1BK1RC1RS9QStUQtUUvUErVELVFL1BInW9sHBi0waLd0FpsAAAAASUVORK5CYII=";
