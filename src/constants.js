// pdf
export const DEFAULT_PDF_DPI = 72;              // default PDF DPI
export const DEFAULT_PDF_FONT_SIZE = 16;        // default PDF DPI
export const DEFAULT_PDF_FONT_SCALING_ADJUSTMENT = 0.8;    // adjust this to fix font size as seen in screen vs in rendered PDF
export const DEFAULT_SCREEN_DPI = 96;           // default screen DPI

// html
export const HTML_DEFAULT_FONT_SIZE = 16;
export const HTML_DEFAULT_FONT_WEIGHT = 400;
export const HTML_DEFAULT_LABEL_COLOR = "#000000";
export const HTML_DEFAULT_TEXT_COLOR = "#000000";
export const HTML_MIN_FONT_SIZE = 6;
export const HTML_MAX_FONT_SIZE = 96;
export const HTML_FONT_SIZE_NORMAL = "normal";
export const HTML_FONT_SIZE_BOLD = "bold";
export const HTML_FONT_STYLE_NORMAL = "normal";
export const HTML_FONT_STYLE_ITALIC = "italic";

export const FORMS_DESIGNER_VERSION = "1.0.0";

export const PAPER_SIZE_A4_WIDTH = 595.28;      // in pixels, at 72dpi
export const PAPER_SIZE_A4_HEIGHT = 841.89;     // in pixels

export const TEXT_TRANSFORM_NONE = "none";
export const TEXT_TRANSFORM_UPPERCASE = "uppercase";
export const TEXT_TRANSFORM_LOWERCASE = "lowercase";
export const TEXT_TRANSFORM_TITLECASE = "titlecase";

export const WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_LEFT = 'left';
export const WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_CENTER = 'center';
export const WIDGET_CONTENT_ALIGNMENT_HORIZONTAL_RIGHT = 'right';
export const WIDGET_CONTENT_ALIGNMENT_VERTICAL_TOP = 'top';
export const WIDGET_CONTENT_ALIGNMENT_VERTICAL_CENTER = 'center';
export const WIDGET_CONTENT_ALIGNMENT_VERTICAL_BOTTOM = 'bottom';

export const WIDGET_DEFAULT_HEIGHT = "80px";
export const WIDGET_DEFAULT_PARAGRAPH_HEIGHT = "160px";

export const WIDGET_LABEL_DEFAULT_VALUE = "(New label)";
export const WIDGET_LABEL_REQUIRED_MARK_POSITION_BEFORE = "beforeLabel";
export const WIDGET_LABEL_REQUIRED_MARK_POSITION_AFTER = "afterLabel";

export const WIDGET_MODE_DESIGN = 'design';     // mode for designing forms
export const WIDGET_MODE_RUN = 'run';           // mode for rendering widgets and allow user input
export const WIDGET_MODE_VIEW = 'view';         // mode for rendering widget inputs and show readonly controls (previous to a PDF export)

export const textTransformations = [TEXT_TRANSFORM_NONE, TEXT_TRANSFORM_UPPERCASE, TEXT_TRANSFORM_LOWERCASE, TEXT_TRANSFORM_TITLECASE];
export const validModes = [WIDGET_MODE_DESIGN, WIDGET_MODE_RUN, WIDGET_MODE_VIEW];

export const WIDGET_TYPE_BUTTON = 'button';
export const WIDGET_TYPE_CHECKBOX = 'checkbox';
export const WIDGET_TYPE_DATE = 'date';
export const WIDGET_TYPE_EMAIL = 'email';
export const WIDGET_TYPE_IMAGE = 'image';
export const WIDGET_TYPE_LABEL = 'label';
export const WIDGET_TYPE_NUMBER = 'number';
export const WIDGET_TYPE_PARAGRAPH = 'paragraph';
export const WIDGET_TYPE_RADIO = 'radio';
export const WIDGET_TYPE_SELECT = 'select';
export const WIDGET_TYPE_SPACER = 'spacer';
export const WIDGET_TYPE_TEXT = 'text';

export const WIDGET_PDF_OBJECT_BOX = 'box';
// export const WIDGET_PDF_OBJECT_LABEL = 'label';
export const WIDGET_PDF_OBJECT_CHECKBOX = 'checkbox';
export const WIDGET_PDF_OBJECT_IMAGE = 'image';
export const WIDGET_PDF_OBJECT_RADIO = 'radio';
export const WIDGET_PDF_OBJECT_SIMPLE_TEXT = 'simpletext';
export const WIDGET_PDF_OBJECT_STYLED_TEXT = 'styledtext';

export const WIDGET_TYPE_NUMBER_MAX = 1_000_000;
export const WIDGET_TYPE_TEXT_MAX_LENGTH = 500;

export const WIDGET_VALIDATION_ALPHA_ONLY_REGEX = /^[a-zA-Z_\s]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_ACCENTS_ONLY_REGEX = /^[a-zA-ZÑñÁáÉéïíöóüúü_\s]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_NUMBERS_REGEX = /^[a-zA-Z0-9_]+$/;
export const WIDGET_VALIDATION_ALPHA_AND_ACCENTS_AND_NUMBERS_REGEX = /^[a-zA-Z0-9_ÑñÁáÉéïíöóüúü\s]+$/;
export const WIDGET_VALIDATION_ADDRESS_REGEX = /^[a-zA-Z0-9_\-°\.,&ÑñÁáÉéïíöóüúü\s]+$/;
export const WIDGET_VALIDATION_NUMBERS_ONLY_REGEX = /^[0-9]+$/;
export const WIDGET_VALIDATION_EMAIL_REGEX = /^[A-Za-z0-9]+[A-Za-z0-9!#$%&\*\+\._-]*@[A-Za-z0-9]+([.]{0,1}[A-Za-z0-9_-]+)*\.[A-Za-z]{2,6}$/;

// add more custom patterns here, but define first the pattern above
export const WIDGET_VALIDATION_PATTERNS = [
    {name: 'alpha', regex: WIDGET_VALIDATION_ALPHA_ONLY_REGEX, validationMessage: Strings.Pattern_Validation_AlphaOnly},
    {name: 'alpha_accents', regex: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_ONLY_REGEX, validationMessage: Strings.Pattern_Validation_AlphaAccentsOnly},
    {name: 'alpha_numbers', regex: WIDGET_VALIDATION_ALPHA_AND_NUMBERS_REGEX, validationMessage: Strings.Pattern_Validation_AlphaNumbers},
    {name: 'alpha_accents_numbers', regex: WIDGET_VALIDATION_ALPHA_AND_ACCENTS_AND_NUMBERS_REGEX, validationMessage: Strings.Pattern_Validation_AlphaAccentsNumbers},
    {name: 'numbers', regex: WIDGET_VALIDATION_NUMBERS_ONLY_REGEX, validationMessage: Strings.Pattern_Validation_NumbersOnly},
    {name: 'address', regex: WIDGET_VALIDATION_ADDRESS_REGEX, validationMessage: Strings.Pattern_Validation_Address},
    {name: 'email', regex: WIDGET_VALIDATION_EMAIL_REGEX, validationMessage: Strings.Pattern_Validation_Email}
];

export const WIDGET_IMAGE_BLANK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVFhH7c4xAQAwDASh+jf91cCW4VDA20m1RC1RS9QStUQtUUvUErVELVFL1BK1RC1RS9QStUQtUUvUErVELVFL1BInW9sHBi0waLd0FpsAAAAASUVORK5CYII=";
