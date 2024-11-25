# DragNForm
Of course, yet another form designer! But this is not framework-biased, it can export the rendered form to json and PDF, and everything is done in the frontend, just with love and javascript.

## Introduction
Tired of not finding the form designer that fit my needs (or even worse, finding something just to realize it costs a lot, or it relies in some backend libraries), I decided to create my own form designer with these goals in mind: 
* open source
* only vanilla javascript
* export a final (rendeded) PDF
* export to / import from json
* easily customizable
* allows input validation

Maybe this is not the best form designer ever, but I believe it accomplishes those goals.


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
* Input validations: min, max, min lenght, max length, etc.
* 3 working modes:
    - Design: allows designing forms
    - Run: allows a user to interact with pre-designed forms
    - View: allows a user to see a readonly version of the form, used also for PDF rendering.
* Export / import from json
* Export as PDF (2)
* Form validation
* Customizable toolbar
* Callbacks for several functions, like new form, save form, export to pdf, design modified, etc.
* Easy widgets customization via CSS (Sass)

(1) Buttons are used in Run mode (i.e. to allow some custom interaction), but are not rendered in View mode.
(2) PDF Manipulation is done using jsPDF. More info at https://github.com/parallax/jsPDF

## How to use
### How to use the demo
1. Clone the repository
2. If using VS Code, install the Live Server extension
3. Look for demo.html, right click -> Open with Live Server


### How to use it in other projects
1. Copy dragnform.min.js, dnf-icons.min.js, dnf-strings.en.js | dnf-strings.es.js and dnf-functions.js to your JS folder.
2. Copy widgets-theme-dark.min.css | widgets-theme-light.min.css to your CSS folder.
2. Add the following tags to the page where you want to use the form editor:

```
<link href="[css folder]/widgets-theme-[light|dark].min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="[js folder]/dnf-strings.[language].min.js"></script>
<script src="[js folder]/dnf-icons.min.js"></script>
<script src="[js folder]/dragnform.js"></script>
```

Then, create an instance of DragNForm inside a script tag:

```
var designer = new dragnform.Designer({
    containerId: "formDesignerDiv",
    toolbar: {
        visible: false
    },
    widgetPaths: {
        widgetTemplates: "/lib/dragnform/widgets",
        widgetFormEditors: "/lib/dragnform/editors"
    },
    widgetRenderOptions: {
        disableInlineEditor: true,
        renderGrip: false,
        renderRemove: false,
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
```

Note: Please replace paths and keywords inside braces according to your own environment!

## Customization
### Customizing widgets appearance
If you want to edit the appearance of widgets or the designer itself, start from widgets.scss where you'll find mostly sizing/spacing sass variables, font family and some screen breakpoint rules (you'll need a sass compiler like Live Sass Compiler).

If you want to customize colors, then modify either widgets-theme-light.scss or widgets-theme-dark.scss.


### Font used in generated PDFs
The pdf file created by calling *exportPdf* uses the Poppins font. PDF files must include all non-standard fonts inside the file, otherwise it won't show properly.

If you want to use other fonts, you'll have to get the resource (font) and convert it to a base64 string (check poppins.normal.js for example). See the section [Convert a font for jsPDF](#convert-a-font-for-jspdf) below.

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
https://www.devlinpeck.com/content/jspdf-custom-font
https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html


## How PDF rendering works
### Feature extraction
Rendering PDFs from HTML pages is a very tricky task.
To start with, HTML is naturally a flow layout, where you barely use absolute coordinates to position content.
On the other hand, not only does PDF use an absolute coordinate system but also has the content's origin at the bottom of the page, instead of being at the top.

Making things that look a certain way in HTML to look the same -or at least, similar- in PDF comes with other difficulties, like:
- Use of the same fonts
- HTML native controls aspect
- HTML styling in general (usually, delegated to CSS stylesheets)
- Content positioning

For the font problem, we must select which fonts we want to use for PDF and embed them into the generated PDF documents, then follow the approach described above in order to incorporate those resources into the project.

For some native HTML controls, like checkboxes and radio buttons, the DragNForm renderer component must draw them manually in the PDF canvas.

HTML styling (and cascading) is also handled by the renderer, which must take into account every html element's parent in order to know how to render the corresponding item in PDF.

Finally, content positioning: for this process, the renderer relies in a feature-extractor component which reads all the elements in the designer's DOM and extracts their features like:
- Bounding rectangle (aka: position and size)
- Scroll offset
- Style

All of those features are obtained with native web apis like element.getBoundingClientRect() or window.getComputedStyle(), and converted to json structured that are then passed to the renderer.

### JsPDF
Once a json representation of the form is built, a pdf exported component is used, which internally relies on the jsPDF library.

The pdf exporter component is also responsible of detecting whether contents exceed the page size and adds a new page to the PDF document.

For every rendered component, the positioning and styling is considered as described in the json structure.

## Integration
### Designer constructor parameters
The designer constructor accepts an 'options' parameter with the following properties:

#### containerId
The element Id in the DOM where the designer will be placed.

#### liveEditsPreview
When true, the property changes made in widget editor dialogs are shown live in the designer. Otherwise, the changes are applied only when the dialog is accepted.

#### renderMode
The initial rendering mode for the designer. The renderMode value can be one of these:
- dragnform.constants.WIDGET_MODE_DESIGN: allows designing forms.
- dragnform.constants.WIDGET_MODE_RUN: allows a user to interact with the form, by filling the controls.
- dragnform.constants.WIDGET_MODE_VIEW: allows a user to see a readonly version of the form, used also for PDF rendering.

#### toolbar
Allows configuring the designer's toolbar.
- buttonClass: the CSS class used to render the toolbar buttons
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
- widgetTemplates: the folder where the widget templates are stored.
- widgetFormEditors: the folder where the widget dialog editors are stored.

#### widgetRenderOptions
- disableInlineEditor: true if the flyter inline editor has to be disabled. Flyter is used to allow for widget label editing without opening the widget editor dialog.
- renderGrip: true if the 'grip' element is rendered in widgets. The grip element allows the dran-and-drop functionality to rearrange widgets in the canvas.
- renderRemove: true if the 'X' button is rendered in widgers. The 'X' button allows elements to be removed from the canvas.
- renderTips: true if the widget tips are rendered. Tips are help texts that some widgets accept in order to give clues to the users.
- globalClasses: an object that define custom CSS class names that the widgets will use when rendered. If no custom class names are specified, the original styles defined in the DragNFrom stylesheets will be used. Classes can be defined for:
    - button
    - checkbox
    - checkboxLabel
    - input
    - inputLabel
    - radio
    - radioLabel
    - select
    - textarea
    - valueControl: used when rendering the value of input controls (i.e. textbox, dates, numbers) in VIEW mode, usually as SPANs.


### Callbacks
The designer supports a few callbacks that allow the caller to handle these events:
- onNewForm: called when the 'New form' toolbar button is clicked. Use the preventDefault() method from the event to avoid creating a new form.
- onExportToJson: called when the 'Export form to json' button is clicked. If the event is not prevented, a dialog will be shown to select the destination of the exported file. The event also contains a parameter with the json exported contents.
- onLoadJson: called when the 'Import form from json' button is clicked. This event gives the caller an oportunity to grab json contents from an external source and return it to the designer using the e.json event property.
- onDesignModified: this event occurrs whenever a change is made to a widget inside the designer. The 'value' property of the event contains a bool value indicating whether the designer was modified (true) or when the canvas is cleared (false).
- onLoadJsonCompleted: called when the designer completed rendering the form. The json contents used for rendering are sent as an event parameter.
- onRenderModeChanged: called when the change design mode button is clicked. The event sends a parameter with a property named 'intendedMode' that tells which mode the designer will change to if the event is not prevented.
- onWidgetAdd: this event occurrs whenever a new widget is added to the canvas. It contains the new widget as a parameter.
- onWidgetDelete: this event occurrs whenever a widget is about to be deleted from the canvas. The event contains a reference the widget and an event parameter that, when preventDefault() is called, cancels the delete widget operation.

### Designer properties
#### canvas get
renderMode get/set
widgets get

### Designer methods
#### clearCanvas
#### exportJson
extractFeatures
exportPdf
findWidget
renderForm
validate
