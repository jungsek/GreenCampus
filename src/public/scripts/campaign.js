placeholderID = 1;

// Open Create Popup
function openCreatePopup() {
    document.getElementById("createPopup").style.display = "block";
}

// Close Create Popup
function closeCreatePopup() {
    document.getElementById("createPopup").style.display = "none";
}

// Open Modify Popup
function openModifyPopup() {
    document.getElementById("modifyPopup").style.display = "block";
}

// Close Modify Popup
function closeModifyPopup() {
    document.getElementById("modifyPopup").style.display = "none";
}

// Delete Campaign (Placeholder for future functionality)
function deleteCampaign() {
    const deleteBtn = document.querySelector('.btn-set-goal');
    deleteBtn.addEventListener('click', async () => {
        popupText.textContent = 'Are you sure you want to delete this campaign?'
        popup.style.display = 'flex'; // Show the popup
    });
    alert("Campaign deleted!");
}
