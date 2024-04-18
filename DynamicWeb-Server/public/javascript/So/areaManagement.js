const handleEditButton = (e) => {
  const { id, ward, district } = e.target.dataset;
  document.querySelector('#path').value=window.location.href
  document.querySelector("#edit-id").value = parseInt(id);
  document.querySelector("#edit-district-field").firstElementChild.value =
    district;
  document.querySelector("#edit-ward-field").firstElementChild.value = ward;
};
