$('.selectpicker').selectpicker();
var urlParams = new URLSearchParams(window.location.search);
let selectedArea = urlParams.getAll('selectedArea');
if (selectedArea) {
    $('select[name=selectedArea]').val(selectedArea);
    $('.selectpicker').selectpicker('refresh');
}