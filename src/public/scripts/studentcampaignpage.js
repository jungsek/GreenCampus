let studentID = 11;
let placeholderID = 1; // for school
let currentCampaignID;
let currentcampaigns;
let lastUpdateTime = 0; // Track last update time

async function loadCurrentCampaigns(isInitialLoad = false) {
    const parentContainer = document.getElementById('campaignGrid');
    
    try {
        const currentcampaignsresponse = await fetch(`/campaigns/school/${placeholderID}`);
        
        if (!currentcampaignsresponse.ok) {
            if (isInitialLoad) { // Only show error message on initial load
                const errorcampaignsmsg = document.createElement('h2');
                errorcampaignsmsg.innerText = currentcampaignsresponse.status === 404 
                    ? "No campaigns available yet!" 
                    : "Error retrieving campaigns. Please try again later.";
                errorcampaignsmsg.style.textAlign = 'center';
                errorcampaignsmsg.style.gridColumn = '1 / -1';
                parentContainer.innerHTML = '';
                parentContainer.appendChild(errorcampaignsmsg);
            }
            return;
        }

        const newCampaigns = await currentcampaignsresponse.json();
        
        // Check if there are any changes
        if (JSON.stringify(newCampaigns) === JSON.stringify(currentcampaigns)) {
            return; // No changes, exit function
        }

        // Update current campaigns
        currentcampaigns = newCampaigns;
        
        // Get signed up campaigns
        let signedupcampaigns = [];
        try {
            const signedupcampaignsresponse = await fetch(`/campaigns/student/${studentID}`);
            if (signedupcampaignsresponse.ok) {
                signedupcampaigns = await signedupcampaignsresponse.json();
            }
        } catch (error) {
            console.error("Error fetching signed up campaigns:", error);
        }

        // Prepare new content
        const newContent = document.createDocumentFragment();
        
        // Create campaign cards with new styling
        currentcampaigns.forEach(campaign => {
            const isSignedUp = signedupcampaigns.some(signedCampaign => signedCampaign.id === campaign.id);
            
            const card = document.createElement('div');
            card.classList.add('campaign-card');
            card.dataset.campaignId = campaign.id; // Add data attribute for tracking
            
            card.innerHTML = `
                <div class="campaign-image">
                    <img src="${campaign.image}" alt="${campaign.name}">
                </div>
                <div class="campaign-content">
                    <h3 class="campaign-title">${campaign.name}</h3>
                    <p class="campaign-creator">${campaign.description}</p>
                    <p class="campaign-points">
                        <i class='bx bx-star points-icon'></i>
                        ${campaign.points} Points
                    </p>
                    <button class="signup-btn" 
                            onclick="signUp(${campaign.id}, ${campaign.points})" 
                            ${isSignedUp ? 'disabled' : ''}>
                        ${isSignedUp ? 'Signed Up!' : 'Sign Up'}
                    </button>
                </div>
            `;
            
            newContent.appendChild(card);
        });

        // Smoothly update the content
        const oldCards = parentContainer.children;
        const oldPositions = Array.from(oldCards).map(card => card.getBoundingClientRect());

        // Clear and update content
        parentContainer.innerHTML = '';
        parentContainer.appendChild(newContent);

        // Animate new cards if not initial load
        if (!isInitialLoad) {
            const newCards = parentContainer.children;
            Array.from(newCards).forEach((card, index) => {
                if (index >= oldPositions.length) {
                    // This is a new card, animate it in
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'all 0.3s ease-out';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }
            });
        }

    } catch (error) {
        console.error("Error loading campaigns:", error);
        if (isInitialLoad) { // Only show error message on initial load
            const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error loading campaigns. Please try again later.";
            errorMsg.style.textAlign = 'center';
            errorMsg.style.gridColumn = '1 / -1';
            parentContainer.innerHTML = '';
            parentContainer.appendChild(errorMsg);
        }
    }
}

// Polling function for real-time updates
function startPolling() {
    // Initial load
    loadCurrentCampaigns(true);
    
    // Poll for updates every 5 seconds
    setInterval(() => {
        loadCurrentCampaigns(false);
    }, 5000);
}

async function signUp(id, pts) {
    try {
        const signupresponse = await fetch(`/campaigns/signup/${studentID}/${id}`, {
            method: "POST"
        });
        
        if (!signupresponse.ok) throw new Error("Failed to sign up for campaign");

        // Update points
        const getpointsresponse = await fetch(`/users/student/points/${studentID}`);
        if (!getpointsresponse.ok) throw new Error("Failed to get current points");

        const pointsData = await getpointsresponse.json();
        const totalPoints = pointsData.reduce((sum, item) => sum + item.points, 0) + pts;

        const updatepointsresponse = await fetch(`/users/student/points/${studentID}/${totalPoints}`, {
            method: "PATCH"
        });
        
        if (!updatepointsresponse.ok) throw new Error("Failed to update points");

        // Enhanced success toast
        const toast = document.createElement('div');
        toast.className = 'toast show position-fixed top-0 start-50 translate-middle-x mt-3';
        toast.style.zIndex = '1000';
        toast.style.backgroundColor = '#2E856E';
        toast.style.color = 'white';
        toast.innerHTML = `
            <div class="toast-header" style="background-color: #236857; color: white;">
                <strong class="me-auto">Success!</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                Successfully signed up for the campaign! Points awarded: ${pts}
            </div>
        `;
        document.body.appendChild(toast);

        // Update button state immediately
        const button = event.target;
        button.disabled = true;
        button.innerText = 'Signed Up!';
        button.style.backgroundColor = '#236857';

        // Remove toast after 2 seconds
        setTimeout(() => {
            toast.remove();
            loadCurrentCampaigns(false); // Reload campaigns
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        // Enhanced error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'toast show position-fixed top-0 start-50 translate-middle-x mt-3';
        errorToast.style.zIndex = '1000';
        errorToast.innerHTML = `
            <div class="toast-header bg-danger text-white">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                There was an error signing up for the campaign. Please try again.
            </div>
        `;
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
            errorToast.remove();
        }, 3000);
    }
}

// Initialize with polling
document.addEventListener('DOMContentLoaded', startPolling);