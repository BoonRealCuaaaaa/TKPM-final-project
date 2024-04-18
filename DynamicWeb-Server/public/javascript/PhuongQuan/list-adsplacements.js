function showEditAdsplacementModal(btn) {
    document.querySelector('#adsplacementIdEdit').value = btn.dataset.id;
    document.querySelector('#addressEdit').value = btn.dataset.address;
    document.querySelector('#areaEdit').value = btn.dataset.area;
    document.querySelector('#adsTypeEdit').value = btn.dataset.adsType;
    document.querySelector('#locationTypeEdit').value = btn.dataset.locationType;
    document.querySelector('#statusEdit').value = btn.dataset.status;
}