guardLoginPage();

const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
const role = sessionStorage.getItem("role") || localStorage.getItem("role");

console.log('Role:', role); // Debugging log
let placeholderID = 1;
let currentEventID;
let currentEvents = [];

// Load campaigns from server and render them
async function loadEvents() {
    try {
        const parentContainer = document.getElementById('upcomingEvents');
        parentContainer.innerHTML = ''; // Clear existing campaigns
        let response = await fetch(`/events/school/${placeholderID}`);
        
        if (!response.ok) {
            const errorMsg = document.createElement('h2');
            errorMsg.innerText = response.status === 404 ? "No events yet!" : "Error retrieving events!";
            parentContainer.appendChild(errorMsg);
            return;
        }

        currentEvents = await response.json();
        renderEvents();
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// Render campaigns to the DOM
async function renderEvents() {
    let parentContainer;
    document.getElementById('upcomingEvents').innerHTML = ""; // Clear previous cards
    document.getElementById('pastEvents').innerHTML = ""; // Clear previous cards
    
    currentEvents.forEach(async (event) => {
        // Convert event date and today's date to timestamps
        if (new Date(event.date).getTime() <= new Date().getTime()) {
            document.getElementById('pastEventsHeader').style.display = 'inline-block';
            parentContainer = document.getElementById('pastEvents');
        } else {
            document.getElementById('upcomingEventsHeader').style.display = 'inline-block';
            parentContainer = document.getElementById('upcomingEvents');
        }

        const card = document.createElement("div");
        card.classList.add("event-card");
        
        card.innerHTML = `
            <div class="event-content">
                <h3 class="event-title">${event.name}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-date">
                    ${new Date(event.date).toDateString()}
                </div>
                <div class="event-actions">
                    ${new Date(event.date).getTime() <= new Date().getTime() ? 
                        `<button class="action-button view-button" onclick="viewEvent(${event.id})">
                            View
                        </button>` : ''}

                    <button class="action-button delete-button" onclick="openDeletePopup(${event.id})">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </div>
            </div>
        `;
        parentContainer.appendChild(card);
    });
}

// Open Create Popup
function openCreatePopup() {
    document.getElementById("createPopup").classList.add("active");
}

// Close Create Popup
function closeCreatePopup() {
    document.getElementById("createPopup").classList.remove("active");
    document.getElementById("createForm").reset();
}

// Handle create campaign form submission
document.getElementById('createForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const newEventData = {
        school_id: placeholderID,
        name: document.getElementById('eventName').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value
    };

    if (newEventData.date <= (new Date().getDate())) {
        alert("Please enter a date later than today.");
        return;
    }

    try {
        let response = await fetch('/events', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEventData)
        });

        if (!response.ok) throw new Error("Error creating event");

        alert("Event created!");
        closeCreatePopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error creating event. Please try again.");
    }
});

// Open Modify Popup
// function openModifyPopup(id) {
//     currentCampaignID = id;
//     const campaign = currentCampaigns.find(camp => camp.id === currentCampaignID);
//     if (campaign) {
//         document.getElementById("modifyPopup").classList.add("active");
//         document.getElementById('modifyCampaignName').value = campaign.name;
//         document.getElementById('modifyCampaignDescription').value = campaign.description;
//         document.getElementById('modifyCampaignPoints').value = campaign.points;
        
//         // Set the existing image preview if available
//         if (campaign.image) {
//             document.getElementById('modifyImagePreview').src = campaign.image;
//             document.getElementById('modifyImagePreview').style.display = 'block';
//             document.getElementById('modifyImageBase64').value = campaign.image;
//         }
//     }
// }

// // Close Modify Popup
// function closeModifyPopup() {
//     document.getElementById("modifyPopup").classList.remove("active");
//     document.getElementById("modifyForm").reset();
//     document.getElementById('modifyImagePreview').style.display = 'none';
// }

// // Handle modify campaign form submission
// document.getElementById('modifyForm').addEventListener('submit', async function(event) {
//     event.preventDefault();
    
//     const updatedEventData = {
//         id: currentEventID,
//         school_id: placeholderID,
//         name: document.getElementById('modifyEventName').value,
//         description: document.getElementById('modifyEventDescription').value,
//         points: parseInt(document.getElementById('modifyEventDate').value),
//     };

//     if (updatedCampaignData.points < 1 || updatedCampaignData.points > 5) {
//         alert("Please enter a points value from 1 to 5.");
//         return;
//     }

//     try {
//         let response = await fetch(`/campaigns/${currentCampaignID}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(updatedCampaignData)
//         });

//         if (!response.ok) throw new Error("Error modifying campaign");

//         alert("Campaign modified!");
//         closeModifyPopup();
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Error modifying campaign. Please try again.");
//     }
// });

// // Add image handling for modify form
// document.getElementById('modifyCampaignImage').addEventListener('change', async function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB
//             alert('File is too large. Please select an image under 5MB.');
//             return;
//         }

//         const img = new Image();
//         img.src = URL.createObjectURL(file);
//         await new Promise(resolve => img.onload = resolve);

//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         const maxDimension = 800;

//         let width = img.width;
//         let height = img.height;

//         if (width > height && width > maxDimension) {
//             height = (height * maxDimension) / width;
//             width = maxDimension;
//         } else if (height > maxDimension) {
//             width = (width * maxDimension) / height;
//             height = maxDimension;
//         }

//         canvas.width = width;
//         canvas.height = height;
//         ctx.drawImage(img, 0, 0, width, height);

//         const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
//         document.getElementById('modifyImageBase64').value = compressedBase64;
//         document.getElementById('modifyImagePreview').src = compressedBase64;
//         document.getElementById('modifyImagePreview').style.display = 'block';

//         URL.revokeObjectURL(img.src);
//     }
// });

// // Close Modify Popup
// function closeModifyPopup() {
//     document.getElementById("modifyPopup").classList.remove("active");
//     document.getElementById("modifyForm").reset();
// }

// // Handle modify campaign form submission
// document.getElementById('modifyForm').addEventListener('submit', async function(event) {
//     event.preventDefault();
    
//     const updatedCampaignData = {
//         id: currentCampaignID,
//         school_id: placeholderID,
//         name: document.getElementById('modifyCampaignName').value,
//         description: document.getElementById('modifyCampaignDescription').value,
//         points: parseInt(document.getElementById('modifyCampaignPoints').value)
//     };

//     if (updatedCampaignData.points < 1 || updatedCampaignData.points > 5) {
//         alert("Please enter a points value from 1 to 5.");
//         return;
//     }

//     try {
//         let response = await fetch(`/campaigns/${currentCampaignID}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(updatedCampaignData)
//         });

//         if (!response.ok) throw new Error("Error modifying campaign");

//         alert("Campaign modified!");
//         closeModifyPopup();
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Error modifying campaign. Please try again.");
//     }
// });

// Open Delete Popup
function openDeletePopup(id) {
    currentEventID = id;
    document.getElementById('deleteConfirmationPopup').classList.add("active");
}

// Close Delete Popup
function closeDeletePopup() {
    document.getElementById("deleteConfirmationPopup").classList.remove("active");
}

// Delete campaign
document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
    try {
        let response = await fetch(`/events/${currentEventID}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Error deleting event");

        alert("Event deleted!");
        closeDeletePopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error deleting event. Please try again.");
    }
});

// // Image handling for compression and preview
// document.getElementById('eventImage').addEventListener('change', async function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB
//             alert('File is too large. Please select an image under 5MB.');
//             return;
//         }

//         const img = new Image();
//         img.src = URL.createObjectURL(file);
//         await new Promise(resolve => img.onload = resolve);

//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         const maxDimension = 800;

//         let width = img.width;
//         let height = img.height;

//         if (width > height && width > maxDimension) {
//             height = (height * maxDimension) / width;
//             width = maxDimension;
//         } else if (height > maxDimension) {
//             width = (width * maxDimension) / height;
//             height = maxDimension;
//         }

//         canvas.width = width;
//         canvas.height = height;
//         ctx.drawImage(img, 0, 0, width, height);

//         const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
//         document.getElementById('imageBase64').value = compressedBase64;
//         document.getElementById('imagePreview').src = compressedBase64;
//         document.getElementById('imagePreview').style.display = 'block';

//         URL.revokeObjectURL(img.src);
//     }
// });

// Initialize by loading campaigns
loadEvents();