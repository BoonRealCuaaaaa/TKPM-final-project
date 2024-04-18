
function showEditBoardTypeModal(btn) {
  console.log("button clicked");
  const name = btn.dataset.name;
  const id = btn.dataset.id;
  document.getElementById("idEditModal").value = id;
  document.getElementById("nameEditModal").value = name; // Assuming you have the value you want to set in a variable named newValue
}

const confirmEditButton = document.getElementById("confirm-edit-button");
if (confirmEditButton) {
  confirmEditButton.addEventListener("click", async (e) => {
    e.preventDefault();

    // Lấy dữ liệu từ form bằng FormData
    const formData = new FormData(document.getElementById("editForm"));

    // Chuyển đổi FormData thành đối tượng JavaScript
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Gửi request PUT đến server
    try {
      const res = await fetch("/department/boardTypeManagement", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

function showDeleteBoardTypeModal(btn) {
  const id = btn.dataset.id;
  console.log(id);
  document.getElementById("idDeleteModal").value = id;
}

const confirmDeleteButton = document.getElementById("confirm-delete-button");
if (confirmDeleteButton) {
  confirmDeleteButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const data = {
      boardTypeId: document.getElementById("idDeleteModal").value,
    };
    console.log(data);
    const res = await fetch("/department/boardTypeManagement", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    location.reload();
  });
}
