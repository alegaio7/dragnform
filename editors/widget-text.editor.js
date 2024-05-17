var chkUseMinLength = document.getElementById('chkUseMinLength');
chkUseMinLength.addEventListener('change', function() {
    updateControls();
});

var chkUseMaxLength = document.getElementById('chkUseMaxLength');
chkUseMaxLength.addEventListener('change', function() {
    updateControls();
});

function updateControls() {
    var txtWidgetPropMinLength = document.getElementById('txtWidgetPropMinLength');
    txtWidgetPropMinLength.disabled = !chkUseMinLength.checked;
    if (!chkUseMinLength.checked) {
        txtWidgetPropMinLength.value = "0";
    }

    var txtWidgetPropMaxLength = document.getElementById('txtWidgetPropMaxLength');
    txtWidgetPropMaxLength.disabled = !chkUseMaxLength.checked;
    if (!chkUseMaxLength.checked) {
        txtWidgetPropMaxLength.value = "0";
    }
}