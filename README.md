# DragNForm
Of course, yet another form designer! But this is not framework-biased, it can export the rendered form to json and PDF, and everything is done in the frontend, just with love and javascript.

There's a blob post about this component that you can find [here](https://www.alexgaio.com/post/drag-n-form-a-pure-javascript-forms-designer-with-direct-pdf-export)

## Background
I was tired of searching and not finding the forms designer that fit my needs. Everyone I've found had one or more of this dissapointing issues:
* it's expensive
* has some unwanted dependencies (like jQuery)
* needed a backend 
* didn't have the right type of controls (like email, dates, etc.)

So I decided to create my own forms designer from scratch with these goals in mind:
* open source
* only vanilla javascript
* allow exporting a rendeded form to PDF
* export to / import from json
* easily customizable
* input data validation

Maybe this is not the best form designer out there, but I believe it achieves those goals.


## Features
* Add form elements like
    - Labels
    - Inputs: text, number, date, email, paragraph.
    - Images
    - Radio buttons
    - Checkboxes
    - Buttons (1)
    - Invisible spacers to align content
* Drag and drop elements to reorder them
* 12-column layout for better control alignment
* Input validations: min, max, min length, max length, etc.
* 3 working modes:
    - Design: allows creating/editiing forms
    - Run: allows a user to interact with a form by filling the fields and trigger validations (vía code)
    - View: allows a user to see a readonly, rendered version of the form (used when exporting to PDF).
* Export / import form definition to/from json
* Export as PDF (2)
* Customizable toolbar (text and icons)
* Localized to english and spanish. Extensible to other languages.
* Callbacks for several functions, like new form, save form, export to pdf, widgets modified, etc.
* Easy widget customization via CSS (Sass)

(1) Buttons are used/displayed only in Run mode (i.e. to allow some custom user interaction with the form), but are not rendered in View mode.
(2) PDF Manipulation is done using jsPDF. More info at https://github.com/parallax/jsPDF

### What's pending
I wanted to add some pattern validation to the text widget, but because I had to wrap things up, I left that for a future version.

## How to use
### Using the demo
1. Clone the repository
2. If using VS Code, install the Live Server extension
3. Look for demo.html in the root folder, right click -> Open with Live Server


### How to use it in other projects
1. Copy dragnform.min.js, dnf-icons.min.js, [dnf-strings.en.js | dnf-strings.es.js] and dnf-functions.js to your JS folder.
2. Copy widgets-theme-dark.min.css | widgets-theme-light.min.css to your CSS folder.
3. Add the following tags to the page where you want to use the form editor:

```
<link href="[css folder]/widgets-theme-[light|dark].min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="[js folder]/dnf-strings.[language].min.js"></script>
<script src="[js folder]/dnf-icons.min.js"></script>
<script src="[js folder]/dragnform.js"></script>
```

Then, create an instance of DragNForm inside a script tag:

```
<script type="text/javascript">
var designer = new dragnform.Designer({
    containerId: "formDesignerDiv",
    toolbar: {
        visible: true,
        compact: false,
        buttons: {
            button: true,
            checkbox: true,
            dateField: true,
            emailField: true,
            export: true,
            image: true,
            label: true,
            load: true,
            new: true,
            numberField: true,
            paragraph: true,
            radio: true,
            renderCurrentMode: true,
            renderValidateForm: true,
            savepdf: true,
            select: true,
            spacer: true,
            textField: true,
        }
    },
    widgetPaths: {
        widgetTemplates: "/lib/dragnform/widgets",
        widgetFormEditors: "/lib/dragnform/editors"
    },
    widgetRenderOptions: {
        enableInlineEditor: false,
        renderGrip: true,
        renderRemove: true,
        renderTips: true,
        globalClasses: {
            button: "widget-button",
            checkbox: "custom-control-input",
            checkboxLabel: "custom-control-label",
            input: "form-control",
            inputLabel: "widget-label",
            radio: "custom-control-input",
            radioLabel: "custom-control-label",
            select: "form-control",
            textarea: "form-control",
            valueControl: "widget-value",
        },
    },
    renderMode: dragnform.constants.WIDGET_MODE_RUN
});
</script>
```

Note: Please replace paths and keywords inside braces according to your own environment!

## Customization
### Customizing widget's appearance
If you want to modify the appearance of widgets or the designer itself, start from widgets.scss where you'll find mostly sizing/spacing _sass variables_, font family and some screen breakpoint rules (you'll need a sass compiler like Live Sass Compiler).

If you want to customize colors, then modify either widgets-theme-light.scss or widgets-theme-dark.scss.

**Advise!**: I've provided the dark-theme version just for fun. But considering this is a form designer, and most likely the final result of a form would be a rendered PDF, I strongly recommend using the light theme. It's ackward to see a textbox (or any other control) with dark background and light text in a PDF file.

### Font used in exported PDFs
The pdf file created by calling **exportPdf** uses the _Poppins_ font. PDF files must include all non-standard fonts inside the file, otherwise they won't show properly.

If you want to use other fonts, you'll have to get the resources (font files) and convert them to a base64 string (check poppins.normal.js for example). See the section [Convert a font for jsPDF](#convert-a-font-for-jspdf) below.

Once you get the js files with the encoded fonts, update **jspdf-exporter.js** to reference them:
* Update the *imports* at the top of the file
* Update the method *exportPDF* to reference the new font:
```
doc.addFileToVFS('MyCuteFont-normal.ttf', MyCuteFont)
doc.addFont('MyCuteFont-normal.ttf', 'MyCuteFont', 'normal')
doc.addFileToVFS('MyCuteFont-bold.ttf', MyCuteFont_bold)
doc.addFont('MyCuteFont-bold.ttf', 'MyCuteFont', 'bold')
doc.addFileToVFS('MyCuteFont-italic.ttf', MyCuteFont_italic)
doc.addFont('MyCuteFont-italic.ttf', 'MyCuteFont', 'italic')
doc.addFileToVFS('MyCuteFont-bold-italic.ttf', MyCuteFont_bold_italic)
doc.addFont('MyCuteFont-bold-italic.ttf', 'MyCuteFont', 'bolditalic')
```

You can omit the styles that you won't need, for instance bold-italic, etc.

After updating jspdf-exporter.js, go to **widgets.scss** and update the $font-familiy variable at the top of the file.

#### Convert a font for jsPDF
Check these online resources for more information on converting fonts for use with jsPdf.
https://www.devlinpeck.com/content/jspdf-custom-font
https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html


## How PDF rendering works
### Feature extraction
Rendering PDFs from HTML pages is a very tricky task.
To start with, HTML is naturally a flow layout, where you'd barely use absolute coordinates to position content.
On the other hand, not only does PDF use an absolute coordinate system but also has the content's origin at the bottom of the page, instead of being at the top.

Making a HTML layout look the same -or at least, similar- in PDF comes with other difficulties, like:
- Use of (the same) fonts
- HTML native controls aspect: radio buttons, checkboxes, etc.
- HTML styling in general (usually, delegated to CSS stylesheets)
- Content positioning

For the font problem, we must select which fonts we want to use for PDF and embed them into the generated PDF documents, then follow the approach described above in order to incorporate those resources into the rendering process.

For some native HTML controls, like checkboxes and radio buttons, the DragNForm renderer component must draw them manually in the PDF canvas, so depending on which browser/OS you use, they might not look exactly the same in a page as in the PDF file.

HTML styling (and cascading) is also handled by the renderer, which must take into account every html element's parent in order to know how to render the corresponding item in PDF.

Finally, content positioning: for this process, the renderer relies in a feature-extractor component which reads all the elements in the designer's DOM and extracts their features like:
- Bounding rectangle (aka: position and size)
- Scroll offset
- Style

All of those features are obtained with native web apis like element.getBoundingClientRect() or window.getComputedStyle(), and converted to a json definition that's then passed to the renderer.

### JsPDF
Once a json representation of the form is built, a pdf exporter component is used, which internally relies on the jsPDF library.

The pdf exporter component is also responsible of detecting whether contents exceed the default page size (which is set to 8.5" x 11") and adds a new page to the PDF document when needed.

For every rendered widget, the positioning and styling is considered as described in the json definition.

## Integration in other projects
### Designer constructor parameters
The designer constructor accepts an 'options' parameter with the following properties:

#### containerId
The element Id in the DOM where the designer will be placed.

#### liveEditsPreview
When true, property changes made in a widget editor dialog is shown live in the designer. Otherwise, the changes are applied only when the dialog is accepted.

#### renderMode
The initial rendering mode for the designer. The renderMode value can be one of these:
- dragnform.constants.WIDGET_MODE_DESIGN: allows designing forms.
- dragnform.constants.WIDGET_MODE_RUN: allows a user to interact with the form, by filling the fields.
- dragnform.constants.WIDGET_MODE_VIEW: allows a user to see a readonly (rendered) version of the form, used also when exporting to PDF.

#### toolbar
Allows configuring the designer's toolbar.
- buttonClass: the CSS class used to style the toolbar buttons
- compact: true for showing a more compact toolbar
- visible: true for showing the toolbar in the designer
- buttons: a collection of the buttons that should be rendered:
    - button: true | false
    - checkbox: true | false
    - dateField: true | false
    - emailField: true | false
    - export: true | false
    - image: true | false
    - label: true | false
    - load: true | false
    - new: true | false
    - numberField: true | false
    - paragraph: true | false
    - radio: true | false
    - renderCurrentMode: true | false
    - renderValidateForm: true | false
    - savepdf: true | false
    - select: true | false
    - spacer: true | false
    - textField: true | false

#### widgetPaths
- widgetTemplates: the folder where the widget templates are stored. Each widget relies on a template file which contains the html definition of the control.
- widgetFormEditors: the folder where the widget dialog editors are stored.

#### widgetRenderOptions
- enableInlineEditor (\*): true if the flyter inline editor is enabled. Flyter is used to allow for widget label editing without opening the widget editor dialog. For more info on flyter, check https://github.com/ovesco/flyter. 
(\*) This feature is experimental.
- renderGrip: true if the 'grip' element is rendered on widgets. The grip element allows the user to drag-and-drop widgets in the canvas.
- renderRemove: true if the 'X' button is rendered on widgets. The 'X' button allows elements to be removed from the canvas.
- renderTips: true if widget tips are rendered. Tips are help texts that some widgets accept in order to give clues to the user.
- globalClasses: an object that defines custom CSS class names that widgets will use when rendered. If no custom class names are specified, the original styles defined in the DragNFrom stylesheets will be used. Classes can be defined for:
    - button
    - checkbox
    - checkboxLabel
    - input
    - inputLabel
    - radio
    - radioLabel
    - select
    - textarea
    - validationError: used to style a widget when it doesn't pass a validation check.
    - valueControl: used when rendering the value of input controls (i.e. textbox, dates, numbers) in VIEW mode, usually as SPANs.


### Callbacks
The designer supports a few callbacks that allow the caller to handle these events:
- onNewForm: called when the 'New form' toolbar button is clicked. Use the preventDefault() method from the event to avoid creating a new form.
- onExportToJson: called when the 'Export form to json' button is clicked. If the event is not prevented, a dialog will be shown to select the destination of the exported file. The event also contains a parameter with the json definition.
- onLoadJson: called when the 'Import form from json' button is clicked. This event gives the caller an oportunity to load json contents from an external source and return it to the designer using the e.json event property.
- onDesignModified: this event occurrs whenever a change is made to a widget inside the designer. The 'value' property of the event contains a bool value indicating whether the designer was modified (true) or when the canvas is cleared (false).
- onLoadJsonCompleted: called when the designer completed rendering the form. The json contents used for rendering are sent as an event parameter.
- onRenderModeChanged: called when the 'change design mode' button is clicked. The event sends a parameter with a property named 'intendedMode' that tells the event handler which mode the designer will change to if the event is not prevented.
- onWidgetAdd: this event occurrs whenever a new widget is added to the canvas. It contains the new widget as a parameter.
- onWidgetDelete: this event occurrs whenever a widget is about to be deleted from the canvas. The event contains a reference the widget and an event parameter that, when preventDefault() is called, cancels the delete widget operation.

### Designer properties
#### canvas get
Returns a reference to the underlying canvas used by the designer to render widgets. The designer is just a wrapper with added functionality over the canvas (i.e. the designer provides the toolbar, but the rendering and widget's management happens in the canvas).

#### renderMode get/set
This property allows setting or reading the current rendering mode. As stated before, the designer supports 3 modes:
- Design: used by the person who wants to **create or edit** new forms. It allows adding, removing or updating widgets.
- Run: used by the users that will **fill** a form.
- View: used by the designer component when a form is filled and it has to be **rendered to a PDF file**. The designer converts all editable widgets to their 'view' version and starts the feature extraction and json export process that will be sent to jsPDF for PDF creation.

#### widgets get
Returns a reference to the widgets collection. It's recommended that you don't modify this collection directly, but instead use the canvas-provided methods like addWidget, clearCanvas, removeWidget, etc.

### Designer methods
#### clearCanvas
This method removes all widgets from the canvas and resets the _modified_ property to false.

#### exportJson
This methods turns the designer to _design_ mode temporarily in order to allow extracting widget properties, then returns the designer back to whatever mode it was before.

The result is a json object that can be used to realod a form from it in a later time.

#### extractFeatures
You can use this method to inspect the json definition that contains a representation of the widgets suitable for rendering a PDF. _Please note that this definition is different from what *exportJson* returns_. 

#### exportPdf(saveTofile)
This method creates a PDF from the form. The _saveToFile_ parameter will tell the designer whether to just return the PDF blob (false) or to trigger a save file dialog (true).

#### findWidget(id)
Returns a widget by passing its Id.

#### loadForm(json)
This method will load a form from a previously exported json object.

#### validate
Validates the widgets in the form.
This method requires that the designer is switched to _run_ mode in order to be able to validate the widgets.

Validation will loop though the widgets collection and, for those that have configured validations (like min/max for number field, or required, or min length for text fields), the proper validation will be checked.

If a widget property fails its validation, the result of this call will be an object with a _result_ property set to false, and a _validations_ array filled with the failed validations information.
