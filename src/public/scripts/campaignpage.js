guardLoginPage();

const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
const role = sessionStorage.getItem("role") || localStorage.getItem("role");

console.log('Role:', role); // Debugging log
let placeholderID = 1;
let currentCampaignID;
let currentCampaigns = [];

// Load campaigns from server and render them
async function loadCurrentCampaigns() {
    try {
        const parentContainer = document.getElementById('campaignGrid');
        parentContainer.innerHTML = ''; // Clear existing campaigns
        let response = await fetch(`/campaigns/school/${placeholderID}`);
        
        if (!response.ok) {
            const errorMsg = document.createElement('h2');
            errorMsg.innerText = response.status === 404 ? "No campaigns yet!" : "Error retrieving campaigns!";
            parentContainer.appendChild(errorMsg);
            return;
        }

        currentCampaigns = await response.json();
        renderCampaigns();
    } catch (error) {
        console.error("Error loading campaigns:", error);
    }
}

// Render campaigns to the DOM
async function renderCampaigns() {
    const parentContainer = document.getElementById('campaignGrid');
    parentContainer.innerHTML = ""; // Clear previous cards
    currentCampaigns.forEach(async (campaign) => {
        let signups = 0
        let signupresponse = await fetch(`/campaigns/count/${campaign.id}`)
        if (!signupresponse.ok) {throw new Error("Network response to get campaign signups was not ok")}
        else {
            signups = await signupresponse.json()
        }
        const impact = await calculateCarbonImpact(campaign.start_date);
        const card = document.createElement("div");
        card.classList.add("campaign-card");
        if (impact != null){
            card.innerHTML = `
            <img src="${campaign.image}" alt="Campaign Image" class="campaign-image">
            <div class="campaign-content">
                <h3 class="campaign-title">${campaign.name}</h3>
                <p class="campaign-description">${campaign.description}</p>
                <div class="campaign-points">
                    <i class='bx bx-star'></i>
                    ${campaign.points} Points
                </div>
                <div class="campaign-signups">
                    ${signups} Sign-ups
                <div class="impact-summary">
                <h3>Environmental Impact</h3>
                <p>Since this campaign, the net carbon footprint has</p>
                <p class="${impact.improved ? 'positive-impact' : 'negative-impact'}">
                    ${impact.improved ? 'Decreased' : 'Increased'} by ${Math.abs(impact.difference)} tons
                    (${Math.abs(impact.percentage)}%)!
                </p>
            </div>
                <div class="campaign-actions">
                    <button class="action-button edit-button" onclick="openModifyPopup(${campaign.id})">
                        <i class='bx bx-pencil'></i> Edit
                    </button>
                    <button class="action-button delete-button" onclick="openDeletePopup(${campaign.id})">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </div>
            </div>
        `;
        }else{
            card.innerHTML = `
            <img src="${campaign.image}" alt="Campaign Image" class="campaign-image">
            <div class="campaign-content">
                <h3 class="campaign-title">${campaign.name}</h3>
                <p class="campaign-description">${campaign.description}</p>
                <div class="campaign-points">
                    <i class='bx bx-star'></i>
                    ${campaign.points} Points
                </div>
                <div class="campaign-signups">
                    ${signups} Sign-ups
                <div class="impact-summary">
                <h3>Environmental Impact</h3>
                <p>Campaign is too recent - check back in a month for impact data!
                </p>
            </div>
                <div class="campaign-actions">
                    <button class="action-button edit-button" onclick="openModifyPopup(${campaign.id})">
                        <i class='bx bx-pencil'></i> Edit
                    </button>
                    <button class="action-button delete-button" onclick="openDeletePopup(${campaign.id})">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </div>
            </div>
        `;
        }
        
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
    document.getElementById("imagePreview").style.display = "none";
}

// Handle create campaign form submission
document.getElementById('createForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const newCampaignData = {
        school_id: placeholderID,
        name: document.getElementById('campaignName').value,
        description: document.getElementById('campaignDescription').value,
        image: document.getElementById('imageBase64').value || "",
        points: parseInt(document.getElementById('campaignPoints').value)
    };

    if (newCampaignData.points < 1 || newCampaignData.points > 5) {
        alert("Please enter a points value from 1 to 5.");
        return;
    }

    try {
        let response = await fetch('/campaigns', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCampaignData)
        });

        if (!response.ok) throw new Error("Error creating campaign");

        alert("Campaign created!");
        closeCreatePopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error creating campaign. Please try again.");
    }
});

async function calculateCarbonImpact(campaignDate) {
    const campaignMonth = new Date(campaignDate).getMonth() + 1;
    const campaignYear = new Date(campaignDate).getFullYear();
    const currentDate = new Date();
    
    // Only calculate for campaigns at least 1 month old
    if (currentDate - new Date(campaignDate) < 2592000000) { // 30 days in milliseconds
        return null;
    }

    try {
        // Fetch carbon data for campaign month
        const baselineResponse = await fetch(`/api/carbon-footprint/${placeholderID}}/${campaignYear}/${campaignMonth}`);
        const baselineData = await baselineResponse.json();

        // Fetch current month's data
        const currentResponse = await fetch(`/api/carbon-footprint/${placeholderID}/2024/11`);
        const currentData = await currentResponse.json();

        const difference = currentData.total - baselineData.total;
        console.log(baselineData.total)
        return {
            difference: difference.toFixed(2),
            percentage: ((difference / baselineData.total) * 100).toFixed(1),
            improved: difference < 0
        };
    } catch (error) {
        console.error('Error calculating carbon impact:', error);
        return null;
    }
}


// Open Modify Popup
function openModifyPopup(id) {
    currentCampaignID = id;
    const campaign = currentCampaigns.find(camp => camp.id === currentCampaignID);
    if (campaign) {
        document.getElementById("modifyPopup").classList.add("active");
        document.getElementById('modifyCampaignName').value = campaign.name;
        document.getElementById('modifyCampaignDescription').value = campaign.description;
        document.getElementById('modifyCampaignPoints').value = campaign.points;
        
        // Set the existing image preview if available
        if (campaign.image) {
            document.getElementById('modifyImagePreview').src = campaign.image;
            document.getElementById('modifyImagePreview').style.display = 'block';
            document.getElementById('modifyImageBase64').value = campaign.image;
        }
    }
}

// Close Modify Popup
function closeModifyPopup() {
    document.getElementById("modifyPopup").classList.remove("active");
    document.getElementById("modifyForm").reset();
    document.getElementById('modifyImagePreview').style.display = 'none';
}

// Handle modify campaign form submission
document.getElementById('modifyForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const updatedCampaignData = {
        id: currentCampaignID,
        school_id: placeholderID,
        name: document.getElementById('modifyCampaignName').value,
        description: document.getElementById('modifyCampaignDescription').value,
        points: parseInt(document.getElementById('modifyCampaignPoints').value),
        image: document.getElementById('modifyImageBase64').value || currentCampaigns.find(camp => camp.id === currentCampaignID).image // Keep existing image if no new one is uploaded
    };

    if (updatedCampaignData.points < 1 || updatedCampaignData.points > 5) {
        alert("Please enter a points value from 1 to 5.");
        return;
    }

    try {
        let response = await fetch(`/campaigns/${currentCampaignID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCampaignData)
        });

        if (!response.ok) throw new Error("Error modifying campaign");

        alert("Campaign modified!");
        closeModifyPopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error modifying campaign. Please try again.");
    }
});

// Add image handling for modify form
document.getElementById('modifyCampaignImage').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File is too large. Please select an image under 5MB.');
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(resolve => img.onload = resolve);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDimension = 800;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
        } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        document.getElementById('modifyImageBase64').value = compressedBase64;
        document.getElementById('modifyImagePreview').src = compressedBase64;
        document.getElementById('modifyImagePreview').style.display = 'block';

        URL.revokeObjectURL(img.src);
    }
});

// Close Modify Popup
function closeModifyPopup() {
    document.getElementById("modifyPopup").classList.remove("active");
    document.getElementById("modifyForm").reset();
}

// Handle modify campaign form submission
document.getElementById('modifyForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const updatedCampaignData = {
        id: currentCampaignID,
        school_id: placeholderID,
        name: document.getElementById('modifyCampaignName').value,
        description: document.getElementById('modifyCampaignDescription').value,
        points: parseInt(document.getElementById('modifyCampaignPoints').value)
    };

    if (updatedCampaignData.points < 1 || updatedCampaignData.points > 5) {
        alert("Please enter a points value from 1 to 5.");
        return;
    }

    try {
        let response = await fetch(`/campaigns/${currentCampaignID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCampaignData)
        });

        if (!response.ok) throw new Error("Error modifying campaign");

        alert("Campaign modified!");
        closeModifyPopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error modifying campaign. Please try again.");
    }
});

// Open Delete Popup
function openDeletePopup(id) {
    currentCampaignID = id;
    document.getElementById('deleteConfirmationPopup').classList.add("active");
}

// Close Delete Popup
function closeDeletePopup() {
    document.getElementById("deleteConfirmationPopup").classList.remove("active");
}

// Delete campaign
document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
    try {
        let response = await fetch(`/campaigns/${currentCampaignID}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Error deleting campaign");

        alert("Campaign deleted!");
        closeDeletePopup();
    } catch (error) {
        console.error("Error:", error);
        alert("Error deleting campaign. Please try again.");
    }
});

// Image handling for compression and preview
document.getElementById('campaignImage').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File is too large. Please select an image under 5MB.');
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(resolve => img.onload = resolve);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDimension = 800;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
        } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        document.getElementById('imageBase64').value = compressedBase64;
        document.getElementById('imagePreview').src = compressedBase64;
        document.getElementById('imagePreview').style.display = 'block';

        URL.revokeObjectURL(img.src);
    }
});

// Initialize by loading campaigns
loadCurrentCampaigns();