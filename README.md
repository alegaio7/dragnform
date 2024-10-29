# DragNForm
Yet another form designer, not framework-biased, that can export the rendered form to json and PDF, everything from the frontend and just with javascript.

## Introduction
Tired of not finding the form designer that I needed, or even worse, finding it and seeing it costs a lot, I decided to create my own form designer with these goals in mind: open source, only vanilla javascript, possibility to create a final (rendeded PDF), export to / import from json, and easily customizable.

Maybe this is not the best form designer ever, but I believe it accomplishes those four goals.

## Features
* Add form elements like
    - Labels
    - Inputs: text, number, date, email, paragraph.
    - Images
    - Radio buttons
    - Checkboxes
    - Buttons
    - Invisible spacers to align content
* Drag and drop elements to reorder them
* 12-column layout for better control alignment
* Input validations: min, max, min lenght, max length, etc.
* 3 working modes:
    - Design: allows designing forms
    - Run: allows a user to interact with pre-designed forms
    - View: allows a user to see a readonly version of the form, used also for PDF rendering.
* Export / import from json
* Export as PDF (*)
* Form validation
* Customizable toolbar
* Callbacks for several functions, like new form, save form, export to pdf, design modified, etc.
* Easy widgets customization via CSS (Sass)

(*) PDF Manipulation is done using jsPDF. More info at https://github.com/parallax/jsPDF


## How to use the demo
1. Clone the repository
2. If using VS Code, install the Live Server extension
3. Look for demo.html, right click -> Open with Live Server


## How to use it in other projects
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

Note: Please replace paths and words inside braces according to your own environment!

## Customize widgets

## Convert a font to jsPDF
https://www.devlinpeck.com/content/jspdf-custom-font
https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html
