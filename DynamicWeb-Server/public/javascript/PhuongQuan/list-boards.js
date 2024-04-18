function showEditBoardModal(btn) {
    document.querySelector('#boardIdEdit').value = btn.dataset.id;
    document.querySelector('#typeEdit').value = btn.dataset.type;
    document.querySelector('#sizeEdit').value = btn.dataset.size;
    document.querySelector('#quantityEdit').value = btn.dataset.quantity;
}

function showPermitRequestDetails(btn) {
    document.querySelector('#viewBoardID').innerHTML = btn.dataset.boardId;
    document.querySelector('#viewPermitRequestID').innerHTML = btn.dataset.permitRequestId;
    document.querySelector('#viewCompanyName').value = btn.dataset.companyName;
    document.querySelector('#viewEmail').value = btn.dataset.email;
    document.querySelector('#viewAddress').value = btn.dataset.address;
    document.querySelector('#viewPhone').value = btn.dataset.phone;
    document.querySelector('#viewStartDate').value = btn.dataset.startDate;
    document.querySelector('#viewEndDate').value = btn.dataset.endDate;
    document.querySelector('#viewImage').src = btn.dataset.img;
    document.querySelector('#viewContent').innerHTML = btn.dataset.content;
}