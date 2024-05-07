const myModalEl = document.getElementById('createModal')
myModalEl.addEventListener('hidden.bs.modal', function (event) {
    const invalidFeedbacks = document.querySelectorAll(".invalid-feedback");
    invalidFeedbacks.forEach((feedback) => feedback.remove());

    const createAlertMessage = document.querySelector("#create-alert-container");
    if (createAlertMessage) {
        createAlertMessage.remove();
    }

    const inputElements = document.querySelectorAll(".form-control");
    inputElements.forEach((inputElement) => {
        if (inputElement.classList.contains("is-invalid")) {
        inputElement.classList.remove("is-invalid");
        }
    })
})

function districtSelectChange(accountTypeSelect, districtSelect, wardSelect, callback) {
    if (accountTypeSelect.value === 'Phuong') {
      fetch(`/department/accountManagement/api/wards?district=${districtSelect.value}`)
      .then((res) => res.json())
      .then((data) => {
        wardSelect.innerHTML = "";
        let option = document.createElement("option");
        option.setAttribute("value", "");
        option.textContent = "Phường";
        wardSelect.appendChild(option);
        console.log(">>>wards::: ", data);

        for (let i = 0; i < data.length; i++) {
          option = document.createElement("option");
          option.setAttribute("value", data[i].ward);
          option.textContent = data[i].ward;
          wardSelect.appendChild(option);
        }
        wardSelect.disabled = false;
        if (callback) {
          callback();
        }
      })
      .catch(err => console.error(err));
      }
}

function selectAccountType(e, districtSelect, wardSelect) {
    districtSelect.disabled = true;
    wardSelect.disabled = true;
    wardSelect.value = "";
    districtSelect.value = "";

    accountType = e.target.value;
    if (accountType === 'Phuong') {
      districtSelect.disabled = false;
    } else if (accountType === 'Quan') {
      districtSelect.disabled = false;
    } else {
      wardSelect.value = "";
      districtSelect.value = "";
    }
}

function showEditAccountModal(btn) {
    const id = btn.dataset.id;
    const accountType = btn.dataset.type;
    const district = btn.dataset.district;
    const ward = btn.dataset.ward;
    
    const accountTypeSelect = document.getElementById("accountTypeSelectEditModal");
    const districtSelect = document.getElementById("districtSelectEditModal");
    const wardSelect = document.getElementById("wardSelectEditModal");
    accountTypeSelect.value = accountType;
    if (accountType === 'Quan') {
      districtSelect.disabled = false;
      districtSelect.value = district;
    } else if (accountType === 'Phuong') {
      districtSelect.disabled = false;
      districtSelect.value = district;

      districtSelectChange(accountTypeSelect, districtSelect, wardSelect, () => {
        wardSelect.disabled = false;
        wardSelect.value = ward;
      }); 
    }
    document.getElementById("idEditModal").value = id;
}

const confirmEditButton = document.getElementById("confirm-edit-button");
if (confirmEditButton) {
  confirmEditButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData(document.getElementById("editForm"));
    const data = Object.fromEntries(formData.entries());
    const res = await fetch("/department/accountManagement", {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    });
    location.reload();
})
}

function showDeleteAccountModal(btn) {
  const id = btn.dataset.id;
  document.getElementById("idDeleteModal").value = id;
}

const confirmDeleteButton = document.getElementById("confirm-delete-button");
if (confirmDeleteButton) {
  confirmDeleteButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const data = {
      accountId: document.getElementById("idDeleteModal").value
    }
    console.log(data);
    const res = await fetch("/department/accountManagement", {
        method: "DELETE",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    });
    location.reload();
})
}


