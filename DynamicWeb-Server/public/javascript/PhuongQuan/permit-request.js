function showAddPermitRequestModal(formId, btn) {
  document.querySelector(`${formId} #boardIdEdit`).value = btn.dataset.id;
}

function showAddBoardModal(btn) {
  document.querySelector("#createBoardForm #adsPlacementIdEdit").value = btn.dataset.id;
}

function closeModal() {
  $('.modal').modal('hide');
  $('body').removeClass('modal-open');
  $('.modal-backdrop').remove();
}

function checkValidFirstForm(e) {
  e.preventDefault();
  var thisModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('permitRequestAndCreateBoardModal'));
  thisModal.hide();
  var nextModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('permissionReport-sub'));
  nextModal.show();
}

async function submit2Forms(url) {
  let formData = new FormData(document.getElementById("permitRequestWithNewBoardForm"));

  formData.append("adsPlacementId", document.querySelector('#adsPlacementIdEdit').value);
  formData.append("boardTypeId", document.querySelector('#boardTypeIdEdit').value);
  formData.append("boardSize", document.querySelector('#boardSizeEdit').value);
  formData.append("boardQuantity", document.querySelector('#boardQuantityEdit').value);
  formData.append("content", document.querySelector('#createBoardForm #contentEdit').value);

  const response = await fetch(url,
    {
        body: formData,
        method: "post",
        redirect: 'follow'
    });
    const data = await response.json()
    if (data.redirect) {
      location.reload();
    }
}

function updateCompanyInfo(e, formId) {
  var val = document.querySelector(`${formId} #companyNameEdit`).value;
  var opts = document.querySelector(`${formId} #datalistOptions`).childNodes;

  let companyIdEdit = document.querySelector(`${formId} #companyIdEdit`);
  let emailEdit = document.querySelector(`${formId} #emailEdit`);
  let phoneEdit = document.querySelector(`${formId} #phoneEdit`);
  let address = document.querySelector(`${formId} #addressEdit`);

  for (var i = 0; i < opts.length; i++) {
    if (opts[i].value === val) {

      companyIdEdit.value = opts[i].dataset.id;
      emailEdit.value = opts[i].dataset.email;
      phoneEdit.value = opts[i].dataset.phone;
      address.value = opts[i].dataset.address;

      emailEdit.disabled = true;
      phoneEdit.disabled = true;
      address.disabled = true;

      break;
    }

    if (i == opts.length - 1) {
      companyIdEdit.value = -1;
      emailEdit.value = "";
      phoneEdit.value = "";
      address.value = "";

      emailEdit.disabled = false;
      phoneEdit.disabled = false;
      address.disabled = false;
    }
  }
}