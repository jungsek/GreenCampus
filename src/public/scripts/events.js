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

// Open Create Popup
async function viewEvent(id) {
    let response = await fetch(`/events/${id}`)
    if (!response.ok){
        const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error retrieving event!";
            document.getElementById('viewPopupContent').appendChild(errorMsg);
            return;
    }
    let currentevent = await response.json();
    let carbonfootprintresponse = await fetch(`/carbon-footprints/${currentevent.carbonfootprint_id}`)
    if (!carbonfootprintresponse.ok){
        const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error retrieving event's carbon footprint!";
            document.getElementById('viewPopupContent').appendChild(errorMsg);
            return;
    }
    let eventcf = await carbonfootprintresponse.json();
    let energyusageresponse = await fetch(`/energy-usage/${currentevent.energyusage_id}`)
    if (!energyusageresponse.ok){
        const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error retrieving event's energy usage!";
            document.getElementById('viewPopupContent').appendChild(errorMsg);
            return;
    }
    let eventeu = await energyusageresponse.json();
    let carbonbreakdownresponse = await fetch(`/carbon-breakdowns/footprint/${currentevent.carbonfootprint_id}`)
    if (!carbonbreakdownresponse.ok){
        const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error retrieving event's carbon breakdown!";
            document.getElementById('viewPopupContent').appendChild(errorMsg);
            return;
    }
    let eventcb = await carbonbreakdownresponse.json();
    let energybreakdownresponse = await fetch(`/energy-breakdowns/usage/${currentevent.energyusage_id}`)
    if (!energybreakdownresponse.ok){
        const errorMsg = document.createElement('h2');
            errorMsg.innerText = "Error retrieving event's energy breakdown!";
            document.getElementById('viewPopupContent').appendChild(errorMsg);
            return;
    }
    let eventeb = await energybreakdownresponse.json();
    document.getElementById("eventTitle").innerText = currentevent.name;
    document.getElementById("eventDate").innerText = new Date(currentevent.date).toDateString();
    document.getElementById("totalEnergyNum").innerText = eventeu.energy_kwh;
    document.getElementById("totalCarbonNum").innerText = eventcf.total_carbon_tons;
    initPieChart(eventeb, eventcb);

    document.getElementById("viewPopup").classList.add("active");
}




//PIECHARTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
let energyPieChart = null;
let carbonPieChart = null;
let uniqueLocations = [];
let uniqueCategories = []; // Store unique categories for button visibility
let uniqueCarbonCategories = [];
let prepended = false;
const colorMapping = {
    "Lighting": "#3498db",
    "Computers": "#5bc7a0",
    "HVAC": "#9b59b6",
    "Equipment": "#f1c40f",
    "Refrigeration": "#ff7f50",
    "Appliances": "#e74c3c",
    "Food Waste Management": "#FFC0CB",
    "Sound Equipment": "#c5c6c7"
};
const colorMapCarbon = {
    "Water Usage": "#1F77B4", // Blue (e.g., Transportation)
    "Energy Usage": "#FF7F0E", // Orange (e.g., Energy Consumption)
    "Food Services": "#2CA02C", // Green (e.g., Renewable Energy)
    "Transportation": "#D62728", // Red (e.g., Industrial Emissions)
    "Waste Management": "#9467BD"  // Purple (e.g., Waste Management)
}
function initPieChart(fetchedData, fetchedCarbonData) {
    // TO POPULATE DROPDOWN-------------------------
    
    fetchedData.forEach(data => {
        if (!uniqueLocations.includes(data.location)) {
            uniqueLocations.push(data.location);
        }
        if (!uniqueCategories.includes(data.category)) {
            uniqueCategories.push(data.category);
        }
    });
    fetchedCarbonData.forEach(data => {
        if (!uniqueCarbonCategories.includes(data.category)) {
            uniqueCarbonCategories.push(data.category);
        }
    });

    // Adding "All Locations" to the dropdown
    if (!prepended) {
        uniqueLocations.unshift("all_locations"); // Prepend "all_locations" option
        prepended = true;
    }

    const locationDropdown = document.getElementById('locationSelect');

    locationDropdown.innerHTML = '';
    uniqueLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location; // Set the value to the location
        option.textContent = location === "all_locations" ? "All Locations" : location; // Set display text
        locationDropdown.appendChild(option);
    });

    // Function to filter data by location
    function filterDataByLocation(fetchedData, selectedLocation) {
        if (selectedLocation === "all_locations") {
            return fetchedData;
        }
        return fetchedData.filter(item => item.location === selectedLocation);
    }


    // Function to aggregate data for a specific year
    function aggregateData(filteredData) {
        const aggregated = {};
        
        filteredData.forEach(item => {
            if (!aggregated[item.category]) {
                aggregated[item.category] = item.percentage;
            }
        });

        return {
            Label: Object.keys(aggregated),
            Percentage: Object.values(aggregated)
        };
    }


    // Function to initialize the pie chart
    function initializePieChart(currentData) {
        if (energyPieChart) {
            energyPieChart.destroy();
        }
        const backgroundColors = currentData.Label.map(category => colorMapping[category] || '#c5c6c7');
    
        const chartDataPie = {
            labels: currentData.Label,
            datasets: [{
                data: currentData.Percentage,
                backgroundColor: backgroundColors
            }]
        };
    
        const pieChartOptions = {
            responsive: false,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'right',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const currentValue = tooltipItem.raw;
                            const category = currentData.Label[tooltipItem.dataIndex];
                        }
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        };
    
        const pieCtx = document.getElementById('energyBreakdownChart').getContext('2d');
        energyPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: chartDataPie,
            options: pieChartOptions,
            plugins: [ChartDataLabels]
        });
    
        showHideLegendButtons(currentData.Label);
    }
    

    // Function to show/hide legend buttons
    function showHideLegendButtons(currentLabels) {
        if (!currentLabels) return; // Guard clause to prevent undefined errors
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach(button => {
            const category = button.getAttribute('data-segment');
            button.style.display = currentLabels.includes(category) ? 'inline-block' : 'none';
        });
    }

    function initializeCarbonPieChart(currentData) {
        if (carbonPieChart) {
            carbonPieChart.destroy();
        }
    
        const backgroundColors = currentData.Label.map(category => colorMapCarbon[category] || '#c5c6c7');
    
        const chartDataPie = {
            labels: currentData.Label,
            datasets: [{
                data: currentData.Percentage,
                backgroundColor: backgroundColors
            }]
        };
    
        const pieChartOptions = {
            responsive: false,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'right',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const currentValue = tooltipItem.raw;
                            const category = currentData.Label[tooltipItem.dataIndex];
                        }
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        };
    
        const pieCtx = document.getElementById('carbonBreakdownChart').getContext('2d');
        carbonPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: chartDataPie,
            options: pieChartOptions,
            plugins: [ChartDataLabels]
        });
    
        showHideCarbonLegendButtons(currentData.Label)
    }
    

    // Function to show/hide legend buttons
    function showHideCarbonLegendButtons(currentLabels) {
        if (!currentLabels) return; // Guard clause to prevent undefined errors
        
        const legendButtons = document.querySelectorAll('#legendButtons2 button');
        legendButtons.forEach(button => {
            const category = button.getAttribute('data-segment');
            button.style.display = currentLabels.includes(category) ? 'inline-block' : 'none';
        });
    }

    // Function to update the pie chart
    function updatePieChart() {
        const selectedLocation = locationDropdown.value;
        let filteredData = filterDataByLocation(fetchedData, selectedLocation);
        let filteredCarbonData = filterDataByLocation(fetchedCarbonData, selectedLocation);

        const aggregatedCurrentCarbonData = aggregateData(filteredCarbonData);
        const aggregatedCurrentData = aggregateData(filteredData);
        initializePieChart(aggregatedCurrentData);
        initializeCarbonPieChart(aggregatedCurrentCarbonData);
    }

    // Initialize with default data
    let allData = filterDataByLocation(fetchedData, "all_locations");
    let allCarbonData = filterDataByLocation(fetchedCarbonData, "all_locations");
    const aggregatedCurrentData = aggregateData(allData);
    const aggregatedCurrentCarbonData = aggregateData(allCarbonData);
    initializePieChart(aggregatedCurrentData);
    initializeCarbonPieChart(aggregatedCurrentCarbonData);
    
    // Event listeners
    locationDropdown.addEventListener('change', updatePieChart);
}
// Close Create Popup
function closeViewPopup() {
    document.getElementById("viewPopup").classList.remove("active");
}

// Render campaigns to the DOM
async function renderEvents() {
    let parentContainer;
    document.getElementById('upcomingEvents').innerHTML = ""; // Clear previous cards
    document.getElementById('pastEvents').innerHTML = ""; // Clear previous cards
    
    currentEvents.forEach(async (event) => {
        const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
        const todayDate = new Date().setHours(0, 0, 0, 0);

        if (eventDate <= todayDate) {  // Past events (including today)
            document.getElementById('pastEventsHeader').style.display = 'inline-block';
            parentContainer = document.getElementById('pastEvents');
        } else {  // Future events
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