guardLoginPage();

const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
const role = sessionStorage.getItem("role") || localStorage.getItem("role");

console.log('Role:', role); // Debugging log
placeholderID = 1; //placeholder until school id can be transferred from login
placeholderYear = 2024
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //For labeling of charts
const yearSelect = document.getElementById("yearsFilter")
function getMonthFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.getMonth() + 1; // Adding 1 because JavaScript months are zero-indexed (0 = January, 11 = December)
}


// ==================== Goal Setting ====================
// DOM Elements
const setgoalbtn = document.querySelector('#setGoalButton');
const goalPopup = document.getElementById('goalPopup');
const confirmationPopup = document.getElementById('confirmationPopup');
const cancelButton = document.getElementById('cancelButton');
const goalForm = document.getElementById('goalForm');
const goalSelect = document.getElementById('goalSelect');
const typeSelection = document.getElementById('typeSelection');
const percentageInput = document.getElementById('percentageInput');
const kwhinput = document.getElementById('kwhInput');
const kwhGoal = document.getElementById('goalkwh');
const tonGoal = document.getElementById('goalton');
const toninput = document.getElementById('tonInput');
const yearinput = document.getElementById('goalYear');
const submitgoalbtn = document.querySelector('#submitnewgoalbtn');
const yesConfirmButton = document.getElementById('yesconfirmButton');
const noConfirmButton = document.getElementById('noconfirmButton');
const downloadCsvBtn = document.querySelector('.rightbar-container button[title="Download to CSV"]');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const heatmapSelect = document.getElementById('heatmapType');
const modal = document.getElementById('buildingModal');
const closeBtn = modal.querySelector('.close');

// Close modal when clicking the close button
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

let buildingData = {};
let energyScale;
let carbonScale;
const mockBuildingData = {
    'classroom': {
        name: 'Classroom',
        energyConsumption: 297484,
        carbonEmission: 3.015,
        energyDetails: {
            'HVAC': {
                percentage: 45,
                value: 133867.8
            },
            'Lighting': {
                percentage: 30,
                value: 89245.2
            },
            'Computers': {
                percentage: 25,
                value: 74371
            }
        },
        carbonDetails: {
            'Energy Usage': {
                percentage: 60,
                value: 1.808
            },
            'Food Services': {
                percentage: 20,
                value: 0.603
            },
            'Waste Management': {
                percentage: 15,
                value: 0.452
            },
            'Water Usage': {
                percentage: 5,
                value: 0.151
            }
        }
    },
    'laboratory': {
        name: 'Laboratory',
        energyConsumption: 270378,
        carbonEmission: 2.240,
        energyDetails: {
            'HVAC': {
                percentage: 40,
                value: 108151.2
            },
            'Laboratory Equipment': {
                percentage: 35,
                value: 94632.3
            },
            'Lighting': {
                percentage: 15,
                value: 40556.7
            },
            'Computers': {
                percentage: 10,
                value: 27037.8
            }
        },
        carbonDetails: {
            'Energy Usage': {
                percentage: 50,
                value: 1.120
            },
            'Waste Management': {
                percentage: 25,
                value: 0.560
            },
            'Food Services': {
                percentage: 15,
                value: 0.336
            },
            'Transportation': {
                percentage: 10,
                value: 0.224
            }
        }
    },
    'cafeteria': {
        name: 'Cafeteria',
        energyConsumption: 182442,
        carbonEmission: 2.260,
        energyDetails: {
            'Kitchen Equipment': {
                percentage: 45,
                value: 82098.9
            },
            'Refrigeration': {
                percentage: 30,
                value: 54732.6
            },
            'HVAC': {
                percentage: 15,
                value: 27366.3
            },
            'Lighting': {
                percentage: 10,
                value: 18244.2
            }
        },
        carbonDetails: {
            'Food Services': {
                percentage: 50,
                value: 1.130
            },
            'Energy Usage': {
                percentage: 25,
                value: 0.565
            },
            'Waste Management': {
                percentage: 15,
                value: 0.339
            },
            'Water Usage': {
                percentage: 10,
                value: 0.226
            }
        }
    },
    'gym': {
        name: 'Gym',
        energyConsumption: 150855,
        carbonEmission: 0.982,
        energyDetails: {
            'HVAC': {
                percentage: 40,
                value: 60342
            },
            'Equipment': {
                percentage: 35,
                value: 52799.25
            },
            'Lighting': {
                percentage: 25,
                value: 37713.75
            }
        },
        carbonDetails: {
            'Water Usage': {
                percentage: 40,
                value: 0.393
            },
            'Energy Usage': {
                percentage: 30,
                value: 0.295
            },
            'Transportation': {
                percentage: 20,
                value: 0.196
            },
            'Food Services': {
                percentage: 10,
                value: 0.098
            }
        }
    },
    'office': {
        name: 'Office',
        energyConsumption: 79268,
        carbonEmission: 0.702,
        energyDetails: {
            'Computers': {
                percentage: 45,
                value: 35670.6
            },
            'HVAC': {
                percentage: 30,
                value: 23780.4
            },
            'Lighting': {
                percentage: 25,
                value: 19817
            }
        },
        carbonDetails: {
            'Energy Usage': {
                percentage: 50,
                value: 0.351
            },
            'Transportation': {
                percentage: 25,
                value: 0.175
            },
            'Water Usage': {
                percentage: 15,
                value: 0.105
            },
            'Waste Management': {
                percentage: 10,
                value: 0.070
            }
        }
    },
    'library': {
        name: 'Library',
        energyConsumption: 139254,
        carbonEmission: 0.477,
        energyDetails: {
            'HVAC': {
                percentage: 35,
                value: 48738.9
            },
            'Lighting': {
                percentage: 40,
                value: 55701.6
            },
            'Computers': {
                percentage: 25,
                value: 34813.5
            }
        },
        carbonDetails: {
            'Energy Usage': {
                percentage: 50,
                value: 0.239
            },
            'Water Usage': {
                percentage: 25,
                value: 0.119
            },
            'Waste Management': {
                percentage: 15,
                value: 0.072
            },
            'Transportation': {
                percentage: 10,
                value: 0.048
            }
        }
    },
    'staffroom': {
        name: 'Staff Room',
        energyConsumption: 51401,
        carbonEmission: 0.356,
        energyDetails: {
            'HVAC': {
                percentage: 40,
                value: 20560.4
            },
            'Kitchen Equipment': {
                percentage: 35,
                value: 17990.35
            },
            'Lighting': {
                percentage: 25,
                value: 12850.25
            }
        },
        carbonDetails: {
            'Food Services': {
                percentage: 50,
                value: 0.178
            },
            'Energy Usage': {
                percentage: 25,
                value: 0.089
            },
            'Water Usage': {
                percentage: 15,
                value: 0.053
            },
            'Waste Management': {
                percentage: 10,
                value: 0.036
            }
        }
    },
    'auditorium': {
        name: 'Auditorium',
        energyConsumption: 37275,
        carbonEmission: 0.268,
        energyDetails: {
            'HVAC': {
                percentage: 45,
                value: 16773.75
            },
            'Lighting': {
                percentage: 40,
                value: 14910
            },
            'Audio Equipment': {
                percentage: 15,
                value: 5591.25
            }
        },
        carbonDetails: {
            'Energy Usage': {
                percentage: 50,
                value: 0.134
            },
            'Water Usage': {
                percentage: 25,
                value: 0.067
            },
            'Transportation': {
                percentage: 15,
                value: 0.040
            },
            'Waste Management': {
                percentage: 10,
                value: 0.027
            }
        }
    }
};

downloadPdfBtn.addEventListener('click', () => {
    window.location.href = 'generateReport.html';
});
// Function to show goal popup
function showGoalPopup() {
    goalPopup.classList.add('visible');
    resetForm();
}

// Function to hide goal popup
function hideGoalPopup() {
    goalPopup.classList.remove('visible');
    resetForm();
}

// Function to show confirmation popup
function showConfirmationPopup(itemName, itemValue) {
    document.getElementById('itemName').textContent = itemName;
    document.getElementById('itemValue').textContent = itemValue;
    confirmationPopup.classList.add('visible');
}

// Function to hide confirmation popup
function hideConfirmationPopup() {
    confirmationPopup.classList.remove('visible');
}

// Function to reset form
function resetForm() {
    goalForm.reset();
    updateInputVisibility();
}

// Function to update input visibility based on selections
function updateInputVisibility() {
    if (goalSelect.value === 'pctgdecrease') {
        percentageInput.classList.remove('hidden');
        kwhinput.classList.add('hidden');
        toninput.classList.add('hidden');
    } else {
        percentageInput.classList.add('hidden');
        const selectedType = document.querySelector('input[name="type"]:checked');
        if (selectedType) {
            if (selectedType.value === 'energy') {
                kwhinput.classList.remove('hidden');
                toninput.classList.add('hidden');
            } else {
                toninput.classList.remove('hidden');
                kwhinput.classList.add('hidden');
            }
        }
    }
}

// Function to create a new goal
async function createGoal(metric_value, selectedType) {
    const newGoal = {
        school_id: parseInt(placeholderID),
        year: parseInt(yearinput.value),
        goal: goalSelect.value,
        metric: selectedType.value,
        metric_value: metric_value,
    };

    const response = await fetch('/goals', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(newGoal)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    alert("Goal created! Reload to sync changes.");
    hideGoalPopup();
}

// Event Listeners
setgoalbtn.addEventListener('click', showGoalPopup);
cancelButton.addEventListener('click', hideGoalPopup);

goalSelect.addEventListener('change', updateInputVisibility);

typeSelection.addEventListener('change', function() {
    if (goalSelect.value === 'tgtvalue') {
        updateInputVisibility();
    }
});

// Form submission handler
submitgoalbtn.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const selectedType = document.querySelector('input[name="type"]:checked');
    
    // Validation
    if (!selectedType) {
        alert('Please select a type (Energy Usage or Carbon Emissions)');
        return;
    }

    if (!yearinput.value || yearinput.value < 2024 || yearinput.value > 2100) {
        alert('Please enter a valid year between 2024 and 2100');
        return;
    }

    let metric_value;
    if (goalSelect.value === "pctgdecrease") {
        metric_value = parseFloat(document.getElementById('goalPercentage').value);
        if (!metric_value || metric_value < 1 || metric_value > 100) {
            alert('Please enter a valid percentage between 1 and 100');
            return;
        }
    } else {
        if (selectedType.value === 'energy') {
            metric_value = parseFloat(kwhGoal.value);
            if (!metric_value || metric_value < 0) {
                alert('Please enter a valid kWh target value');
                return;
            }
        } else {
            metric_value = parseFloat(tonGoal.value);
            if (!metric_value || metric_value < 0) {
                alert('Please enter a valid tonnes target value');
                return;
            }
        }
    }

    try {
        // Check for existing goals
        const prevCheckresponse = await fetch(`/goals/school/${placeholderID}`);
        let prevdata;
        
        if (prevCheckresponse.status === 404) {
            console.log("No previous goals found.");
            await createGoal(metric_value, selectedType);
            return;
        } else if (prevCheckresponse.ok) {
            prevdata = await prevCheckresponse.json();
        } else {
            throw new Error('Network response to get previous goals was not ok');
        }

        // Check if goal needs override
        const existingGoal = prevdata.find(goal => goal.metric === selectedType.value);
        
        if (existingGoal) {
            const itemValue = selectedType.value === 'energy' ? 'Energy Usage' : 'Carbon Emissions';
            const itemName = goalSelect.value === 'pctgdecrease' ? 'Percentage Decrease' : 'Target Value';
            showConfirmationPopup(itemName, itemValue);

            // Remove existing event listeners
            const newYesButton = yesConfirmButton.cloneNode(true);
            const newNoButton = noConfirmButton.cloneNode(true);
            yesConfirmButton.parentNode.replaceChild(newYesButton, yesConfirmButton);
            noConfirmButton.parentNode.replaceChild(newNoButton, noConfirmButton);

            // Add new event listeners
            newYesButton.addEventListener('click', async () => {
                try {
                    hideConfirmationPopup();
                    
                    // Delete existing goal
                    const deleteResponse = await fetch(`/goals/${existingGoal.id}`, {
                        method: "DELETE"
                    });
                    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete existing goal');
                    }
                    
                    // Create new goal
                    await createGoal(metric_value, selectedType);
                    window.location.reload();
                } catch (error) {
                    console.error('Error in goal deletion/creation:', error);
                    alert('There was an error updating the goal. Please try again.');
                }
            });

            newNoButton.addEventListener('click', () => {
                hideConfirmationPopup();
                hideGoalPopup();
            });
        } else {
            await createGoal(metric_value, selectedType);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again.');
    }
});

// Close popups when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === goalPopup) {
        hideGoalPopup();
    }
    if (e.target === confirmationPopup) {
        hideConfirmationPopup();
    }
});

// Initialize form visibility
updateInputVisibility();


async function fetchEnergyUsageData() {
    let response = await fetch(`/energy-usage/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}

async function fetchCarbonFootprintData() {
    let response = await fetch(`/carbon-footprints/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}

async function fetchGoals() {
    let prevCheckresponse = await fetch(`/goals/school/${placeholderID}`);
    let prevdata;
    if (prevCheckresponse.status === 404) {
        // No previous goals found, continue as needed
        console.log("No previous goals found.");
        return [];
    } else if (prevCheckresponse.ok) {
        // If the response is successful, parse the JSON data
        prevdata = await prevCheckresponse.json();
        return prevdata;
    } else {
        // Handle any other errors (e.g., 500 server errors, etc.)
        throw new Error('Network response to get previous goals was not ok');
    }
}
async function fetchEnergyBreakdownData() {
    let response = await fetch(`/energy-breakdowns/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}
async function fetchCarbonBreakdownData() {
    let response = await fetch(`/carbon-breakdowns/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}


// ==================== Impact Card ====================
document.addEventListener("DOMContentLoaded", () => {
    const defaultYear = 2024;
    initImpactCard(defaultYear);
    initializeHeatmapDropdown();
    initializeHeatmap();
});

// Add event listener for dropdown change
heatmapSelect.addEventListener('change', function() {
    const selectedView = this.value;
    console.log('Selected view:', selectedView);

    
    if (selectedView === 'regular') {
        // Remove all filters and return buildings to original appearance
        const buildings = document.querySelectorAll('.hover-building');
        buildings.forEach(building => {
            building.removeAttribute('filter');
            // Reset any other style changes that might have been applied
            building.style.fill = ''; // Reset fill color if any
            building.style.opacity = ''; // Reset opacity if any
        });
        
        // Hide or reset legend for regular view
        const legendContainer = document.querySelector('.legend');
        if (legendContainer) {
            legendContainer.style.display = 'none';
        }
    } else {
        // Show legend for heatmap views
        const legendContainer = document.querySelector('.legend');
        if (legendContainer) {
            legendContainer.style.display = 'block';
        }
        // Update heatmap for energy or carbon view
        updateHeatmap(selectedView);
    }
});

function initializeHeatmapDropdown() {
    const heatmapSelect = document.getElementById('heatmapType');
    if (!heatmapSelect) {
        console.error('Heatmap select element not found');
        return;
    }

    // Clear existing options
    heatmapSelect.innerHTML = '';

    // Add options
    const options = [
        { value: 'regular', text: 'Regular View' },
        { value: 'energy', text: 'Energy Consumption' },
        { value: 'carbon', text: 'Carbon Footprint' }
    ];

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        heatmapSelect.appendChild(optionElement);
    });

    // Set default value
    heatmapSelect.value = 'regular';
}

function addBuildingLabel(building, data) {
    const bbox = building.getBBox();
    const computedStyle = window.getComputedStyle(building);
    const transform = computedStyle.transform;
    
    let translateX = 0, translateY = 0;
    if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        translateX = matrix.e;
        translateY = matrix.f;
    }
    
    const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.setAttribute('class', 'building-label-group');
    labelGroup.setAttribute('transform', `translate(${translateX}, ${translateY})`);
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', bbox.x + bbox.width/2);
    text.setAttribute('y', bbox.y + bbox.height/2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#ffffff');
    text.setAttribute('font-size', '14px');
    text.setAttribute('pointer-events', 'none');
    text.setAttribute('class', 'building-label');
    text.textContent = data.name;
    
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const padding = 10;
    const textWidth = text.textContent.length * 8;
    background.setAttribute('x', bbox.x + bbox.width/2 - textWidth/2 - padding);
    background.setAttribute('y', bbox.y + bbox.height/2 - 10);
    background.setAttribute('width', textWidth + padding * 2);
    background.setAttribute('height', '20');
    background.setAttribute('fill', '#000000');
    background.setAttribute('fill-opacity', '0.7');
    background.setAttribute('rx', '3');
    background.setAttribute('ry', '3');
    background.setAttribute('pointer-events', 'none');
    
    labelGroup.appendChild(background);
    labelGroup.appendChild(text);
    document.querySelector('svg').appendChild(labelGroup);
}

// Add heatmap functions
function initializeHeatmap() {
    try {
        buildingData = mockBuildingData;
        
        // Create SVG filters
        const svg = document.querySelector('svg');
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.insertBefore(defs, svg.firstChild);

        // Create filters for all buildings
        Object.keys(buildingData).forEach(buildingId => {
            const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute('id', `colorize-${buildingId}`);
            
            const colorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
            colorMatrix.setAttribute('type', 'matrix');
            colorMatrix.setAttribute('values', '1 0 0 0 0   0 1 0 0 0   0 0 1 0 0  0 0 0 1 0');
            
            filter.appendChild(colorMatrix);
            defs.appendChild(filter);
        });

        // Process buildings
        const buildings = document.querySelectorAll('.hover-building');
        buildings.forEach(building => {
            const buildingId = building.id.toLowerCase();
            const data = buildingData[buildingId];
            
            if (data) {
                // Update click event listener to use showBuildingDetails
                building.onclick = () => showBuildingDetails(buildingId);
                // Add label
                addBuildingLabel(building, data);
            }
        });

        // Start with regular view
        const heatmapSelect = document.getElementById('heatmapType');
        if (heatmapSelect) {
            heatmapSelect.value = 'regular';
        }
        
        // Hide legend initially
        const legendContainer = document.querySelector('.legend');
        if (legendContainer) {
            legendContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('Error initializing heatmap:', error);
    }
}

function updateHeatmap(type) {
    if (!type || type === 'regular') {
        // Remove all filters and reset buildings to original state
        const buildings = document.querySelectorAll('.hover-building');
        buildings.forEach(building => {
            building.removeAttribute('filter');
            building.style.fill = ''; // Reset fill color
            building.style.opacity = ''; // Reset opacity
        });
        return;
    }

    // Rest of your existing updateHeatmap code...
    const energyColorScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(buildingData), d => d.energyConsumption)])
        .range(['#00ff00', '#ff0000']);

    const carbonColorScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(buildingData), d => d.carbonEmission)])
        .range(['#00ff00', '#ff0000']);

    Object.entries(buildingData).forEach(([buildingId, data]) => {
        const building = document.getElementById(buildingId);
        if (!building) return;

        const filter = document.querySelector(`#colorize-${buildingId} feColorMatrix`);
        if (!filter) return;

        let color;
        if (type === 'energy') {
            color = energyColorScale(data.energyConsumption);
        } else if (type === 'carbon') {
            color = carbonColorScale(data.carbonEmission);
        }

        if (color) {
            const rgb = d3.color(color);
            filter.setAttribute('values', `
                ${rgb.r/255} 0 0 0 0
                0 ${rgb.g/255} 0 0 0
                0 0 ${rgb.b/255} 0 0
                0 0 0 1 0
            `);
            building.setAttribute('filter', `url(#colorize-${buildingId})`);
        }
    });

    updateLegend(type);
}


const legendStyles = `
    .legend {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 20px;
    }

    .legend-gradient {
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
    }

    .legend-labels {
        display: flex;
        justify-content: space-between;
        width: 150px;
        margin-top: 4px;
        font-size: 12px;
        color: #666;
    }

    .legend-labels span {
        text-align: center;
    }
`;

// Add styles to document
if (!document.querySelector('#legend-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'legend-styles';
    styleElement.textContent = legendStyles;
    document.head.appendChild(styleElement);
}


function showBuildingDetails(buildingId) {
    const modal = document.getElementById('buildingModal');
    const data = buildingData[buildingId];
    const selectedView = document.getElementById('heatmapType').value;
    
    if (!data) return;

    // Set modal title
    document.getElementById('modalTitle').textContent = data.name;

    // Get the content containers
    const energyDetails = document.getElementById('energyDetails');
    const carbonDetails = document.getElementById('carbonDetails');
    
    // Show/hide sections based on selected view
    switch(selectedView) {
        case 'energy':
            energyDetails.style.display = 'block';
            carbonDetails.style.display = 'none';
            break;
        case 'carbon':
            energyDetails.style.display = 'none';
            carbonDetails.style.display = 'block';
            break;
        default: // regular view
            energyDetails.style.display = 'block';
            carbonDetails.style.display = 'block';
    }

    // Update energy consumption details
    document.getElementById('totalEnergy').textContent = data.energyConsumption.toLocaleString();
    const energyBreakdown = document.getElementById('energyBreakdown');
    energyBreakdown.innerHTML = Object.entries(data.energyDetails)
        .map(([category, info]) => `
            <div class="breakdown-item">
                <span>${category}</span>
                <span>
                    <span class="percentage">${info.percentage}%</span>
                    <span class="value">(${info.value.toLocaleString()} kWh)</span>
                </span>
            </div>
        `).join('');

    // Update carbon footprint details
    document.getElementById('totalCarbon').textContent = data.carbonEmission.toLocaleString();
    const carbonBreakdown = document.getElementById('carbonBreakdown');
    carbonBreakdown.innerHTML = Object.entries(data.carbonDetails)
        .map(([category, info]) => `
            <div class="breakdown-item">
                <span>${category}</span>
                <span>
                    <span class="percentage">${info.percentage}%</span>
                    <span class="value">(${info.value.toLocaleString()} tons)</span>
                </span>
            </div>
        `).join('');

    // Show the modal
    modal.style.display = 'block';
}

// Add event listeners for closing the modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('buildingModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('buildingModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


function updateLegend(type) {
    const legendContainer = document.querySelector('.legend');
    if (!legendContainer) return;

    legendContainer.style.display = type === 'regular' ? 'none' : 'flex';
    
    if (type === 'regular') return;

    let legendSvg = legendContainer.querySelector('.legend-gradient');
    if (!legendSvg) {
        legendSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        legendSvg.setAttribute('class', 'legend-gradient');
        legendSvg.setAttribute('width', '150');
        legendSvg.setAttribute('height', '20');
        legendContainer.insertBefore(legendSvg, legendContainer.firstChild);
    }

    legendSvg.innerHTML = '';
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradient.setAttribute('id', 'legend-gradient');
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('x2', '100%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('y2', '0%');

    // Adjusted gradient stops
    const stops = type === 'energy' ? [
        { offset: '0%', color: '#00ff00' },
        { offset: '33%', color: '#ffff00' },
        { offset: '66%', color: '#ffa500' },
        { offset: '100%', color: '#ff0000' }
    ] : [
        { offset: '0%', color: '#00ff00' },    // 0-1.0 tonnes
        { offset: '33%', color: '#ffa500' },    // 1.0-2.0 tonnes
        { offset: '66%', color: '#ff0000' },    // 2.0-3.0 tonnes
        { offset: '100%', color: '#8b0000' }    // 3.0+ tonnes
    ];

    stops.forEach(stop => {
        const stopEl = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stopEl.setAttribute('offset', stop.offset);
        stopEl.setAttribute('stop-color', stop.color);
        linearGradient.appendChild(stopEl);
    });

    defs.appendChild(linearGradient);
    legendSvg.appendChild(defs);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '150');
    rect.setAttribute('height', '20');
    rect.setAttribute('fill', 'url(#legend-gradient)');
    legendSvg.appendChild(rect);

    // Update labels with new ranges
    const labels = legendContainer.querySelectorAll('.legend-labels span');
    if (labels.length === 3) {
        if (type === 'energy') {
            labels[0].textContent = '0 kWh';
            labels[1].textContent = '150,000 kWh';
            labels[2].textContent = '300,000 kWh';
        } else if (type === 'carbon') {
            labels[0].textContent = '0 tonnes';
            labels[1].textContent = '1.0 tonnes';
            labels[2].textContent = '2.0 tonnes';
        }
    }
}

// Function to toggle dropdown visibility
function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
}

// Add event listener for year change to update heatmap
yearSelect.addEventListener('change', () => {
    initializeHeatmap();
});

function getTotalCarbonFootprint(data, selectedYear) {
    const filteredData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // calculate all the carbon footprint for that particular year
    const totalCarbonFootprint = filteredData.reduce((total, item) => {
        return total + (item.total_carbon_tons); 
    }, 0);

    return totalCarbonFootprint;
}

function getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear) {
    // Filter energy usage data for the selected year
    const filteredEnergyUsage = energyUsageData.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // Calculate the total energy usage by summing energy_kwh without considering the percentage breakdown
    const totalEnergyUsage = filteredEnergyUsage.reduce((total, item) => {
        return total + item.energy_kwh;
    }, 0);

    return totalEnergyUsage;
}


function getTopContributors(data, selectedYear) {
    // filter the data for the selected year
    const filteredData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // calculate the total energy usage for the selected year
    const totalEnergyUsage = filteredData.reduce((total, item) => total + item.energy_usage, 0);

    // calculate the percentage contribution for each category
    const categoriesWithPercentage = filteredData.map(item => ({
        category: item.category,
        percentage: (item.percentage / totalEnergyUsage) * 100
    }));

    // sort by percentage in descending order and get the top 2 categories
    const topCategories = categoriesWithPercentage
        .sort((a, b) => b.percentage - a.percentage) // Sort by highest percentage
        .slice(0, 2) // Get the top 2 categories
        .map(item => item.category); // Extract the category names

    return topCategories;
}



function percentageChangeCF(data, selectedYear) {
    // Filter data for the selected year and the previous year
    const currentYearData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });
    
    const previousYearData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear - 1;
    });

    // Sum carbon footprint values for the selected year and the previous year
    const currentYearTotal = currentYearData.reduce((total, item) => total + item.total_carbon_tons, 0);
    const previousYearTotal = previousYearData.reduce((total, item) => total + item.total_carbon_tons, 0);

    // Calculate percentage change
    if (previousYearTotal === 0) {
        return 0; // Avoid division by zero if previous year total is 0
    }
    const change = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;

    return change.toFixed(1); // one dp
}

function percentageChangeEU(energyUsageData, breakdownData, selectedYear) {
    // Get the total energy usage for the current and previous year
    const currentYearTotal = getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear);
    const previousYearTotal = getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear - 1);

    // Calculate percentage change
    if (previousYearTotal === 0) {
        return "No data"; // Indicate that we cannot calculate a change
    }
    const change = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;

    return change.toFixed(2); // two decimal places
}



async function initImpactCard(placeholderYear) {
    const carbonFootprintData = await fetchCarbonFootprintData();
    const energyUsageData = await fetchEnergyUsageData();
    const topContributorsData = await fetchEnergyBreakdownData();

    const totalCarbonFootprint = getTotalCarbonFootprint(carbonFootprintData, placeholderYear);
    const totalEnergyUsage = getTotalEnergyUsage(energyUsageData, topContributorsData, placeholderYear);
    const topContributors = getTopContributors(topContributorsData, placeholderYear);
    
    const carbonFootprintChange = percentageChangeCF(carbonFootprintData, placeholderYear);
    const energyUsageChange = percentageChangeEU(energyUsageData, topContributorsData, placeholderYear);

    const yearElement = document.querySelector(".impact-card .title");
    const totalCarbonFootprintElement = document.querySelector(".metric-value1");
    const totalEnergyUsageElement = document.querySelector(".metric-value2");
    const topContributorsElement = document.querySelector(".metric-value3");
    const carbonFootprintChangeElement = document.querySelector(".trend1");
    const energyUsageChangeElement = document.querySelector(".trend2");

    if (yearElement) {
        yearElement.innerText = `${placeholderYear}'s Impact`;
    }

    if (totalCarbonFootprintElement) {
        totalCarbonFootprintElement.innerText = `${totalCarbonFootprint.toFixed(2)} tonnes`;
    }

    if (totalEnergyUsageElement) {
        totalEnergyUsageElement.innerText = `${totalEnergyUsage.toFixed(2)} kWh`;
    }

    if (topContributorsElement) {
        topContributorsElement.innerText = topContributors.join(", "); 
    }

    if (carbonFootprintChangeElement) {
        // Check if carbonFootprintChange is "No data" or NaN
        if (isNaN(carbonFootprintChange) || carbonFootprintChange === "No data") {
            carbonFootprintChangeElement.innerHTML = "No data available from last year";
            carbonFootprintChangeElement.style.color = "grey"; // Default color for no data
        } else if (Math.abs(carbonFootprintChange) == 0.0) {
            // No change case (near zero)
            carbonFootprintChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            carbonFootprintChangeElement.style.color = "black"; // Blue color for no change
        } else {
            // Set up icon and color based on increase or decrease
            const iconClass = carbonFootprintChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = carbonFootprintChange < 0 ? 'rgb(37 99 235)' : 'rgb(220 38 38)';
            
            carbonFootprintChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(carbonFootprintChange)}% from last year`;
            carbonFootprintChangeElement.style.color = color; // Apply color based on trend
        }
    }
    
    if (energyUsageChangeElement) {
        // Check if energyUsageChange is "No data" or NaN
        if (isNaN(energyUsageChange) || energyUsageChange === "No data") {
            energyUsageChangeElement.innerHTML = "No data available from last year";
            energyUsageChangeElement.style.color = "grey"; // Default color for no data
        } else if (Math.abs(energyUsageChange) == 0.0) {
            // No change case (near zero)
            energyUsageChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            energyUsageChangeElement.style.color = "blue"; // Blue color for no change
        } else {
            // Set up icon and color based on increase or decrease
            const iconClass = energyUsageChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = energyUsageChange < 0 ? 'rgb(37 99 235)' : 'rgb(220 38 38)';
            
            energyUsageChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(energyUsageChange)}% from last year`;
            energyUsageChangeElement.style.color = color; // Apply color based on trend
        }
    }
}


// ==================== Goal Progress Chart ====================
async function initBarCharts() {
    let sumEnergy;
    let sumEnergyNow;
    let metricValue; 
    let sumCarbon;
    let sumCarbonNow;
    const fetchedData = await fetchGoals();
    const fetchedEnergyData = await fetchEnergyUsageData();

    //sumEnergy value
    const fetchedCarbonFootprintData = await fetchCarbonFootprintData();
    function filterDataById(fetchedData, selectedId, placeholderYear, type) {
        let filteredData = fetchedData.filter(item => 
            item.school_id === selectedId && 
            new Date(item.timestamp).getFullYear() === placeholderYear
        );

        let total = 0;
        if (type == 'energy'){
            filteredData.forEach(row => {
                total += row.energy_kwh;
            });
        }
        else {
            filteredData.forEach(row => {
                total += row.total_carbon_tons;
            });
        }
        
        return total;
    }


    sumEnergy = filterDataById(fetchedEnergyData, placeholderID, placeholderYear - 1, 'energy');
    sumEnergyNow = filterDataById(fetchedEnergyData, placeholderID, placeholderYear, 'energy');

    sumCarbon = filterDataById(fetchedCarbonFootprintData, placeholderID, placeholderYear - 1, 'carbon')
    sumCarbonNow = filterDataById(fetchedCarbonFootprintData, placeholderID, placeholderYear, 'carbon')
    
    const energyGoal = fetchedData.find(item => item.metric === 'energy');
    updateChart('energy', energyGoal, sumEnergyNow, 'kWh');

    const carbonGoal = fetchedData.find(item => item.metric === 'carbon');
    updateChart('carbon', carbonGoal, sumCarbonNow, 'tonnes CO₂e');

    // Update trend indicator
    /*
    const energyProgressChangeElement = document.querySelector('.etrend');
    if (energyProgressChangeElement) {
        const percentageChange = (((sumEnergyNow - sumEnergy)/sumEnergy) * 100).toFixed(2);
        
        if (isNaN(percentageChange) || percentageChange === "No data") {
            energyProgressChangeElement.innerHTML = "No data available from last year";
            energyProgressChangeElement.style.color = "grey";
        } else if (Math.abs(percentageChange) == 0.0) {
            energyProgressChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            energyProgressChangeElement.style.color = "blue";
        } else {
            const iconClass = percentageChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = percentageChange < 0 ? 'rgb(25, 176, 25)' : 'red';
            
            energyProgressChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(percentageChange)}% from last year`;
            energyProgressChangeElement.style.color = color;
        }
    }*/
}

function updateChart(type, targetGoal, currentValue, unit) {
    const elements = {
      noGoal: document.getElementById(`${type}NoGoalMessage`),
      barContainer: document.getElementById(`${type}UsageBar`).parentElement,
      usageBar: document.getElementById(`${type}UsageBar`),
      targetContainer: document.getElementById(`${type}TargetContainer`),
      utilizedValue: document.getElementById(`${type}UtilizedValue`),
      goalValue: document.getElementById(`${type}GoalValue`)
    };
  
    if (!targetGoal) {
      elements.noGoal.style.display = 'block';
      elements.barContainer.style.display = 'none';
      elements.utilizedValue.style.display = 'none';
      elements.goalValue.style.display = 'none';
      return;
    }
  
    let goalValue;
    if (targetGoal.goal === 'tgtvalue') {
      goalValue = targetGoal.metric_value;
    } else {
      goalValue = currentValue * ((100 - targetGoal.metric_value)/100);
    }
  
    const maxValue = currentValue * (0.7 + Math.random() * (0.9-0.5) + 0.9);
    
    // Calculate excess/progress towards goal
    const difference = currentValue - goalValue;
    const percentageDifference = ((difference) / goalValue * 100).toFixed(1);
    
    // Create status message based on progress
    let statusMessage = '';
    if (difference > 0) {
      statusMessage = `Exceeded by ${Math.abs(difference).toFixed(2)} ${unit} (${Math.abs(percentageDifference)}%)`;
    } else if (difference < 0) {
      statusMessage = `Under by ${Math.abs(difference).toFixed(2)} ${unit} (${Math.abs(percentageDifference)}%)`;
    } else {
      statusMessage = 'Exactly at goal';
    }
  
    // Update the display values
    document.getElementById(`goalTitle${type}`).innerText += ` by ${targetGoal.year}`;
    elements.utilizedValue.innerHTML = `Utilized: ${currentValue.toFixed(2)} / ${goalValue} ${unit}<br><span class="status-message ${difference > 0 ? 'excess' : 'under'}">${statusMessage}</span>`;
  
    // Update the bar and target line positions
    const usagePercentage = (currentValue / maxValue) * 100;
    const targetPercentage = (goalValue / maxValue) * 100;
    
    elements.usageBar.style.width = `${usagePercentage}%`;
    
    // Update the target container position
    elements.targetContainer.style.left = `${targetPercentage}%`;
    elements.targetContainer.style.display = 'block'; // Ensure the target container is visible
  
    // Add the traffic light logic for colors
    if (currentValue <= goalValue) {
      // Under or at goal (green)
      elements.usageBar.classList.remove('yellow', 'red');
      elements.usageBar.classList.add('green');
    } else if (difference/goalValue * 100 <= 20) {
      // Exceeded by up to 20% (yellow)
      elements.usageBar.classList.remove('green', 'red');
      elements.usageBar.classList.add('yellow');
    } else {
      // Exceeded by more than 20% (red)
      elements.usageBar.classList.remove('green', 'yellow');
      elements.usageBar.classList.add('red');
    }
  }


initBarCharts();


// ==================== Bar + Line Graph ====================
let energyTemperatureChart;
let backgroundColor = Array(12).fill('rgba(255, 159, 64, 0.5)');
let selectedIndex = null;
let selectedMonth = null;
const monthPicker = document.getElementById('monthPicker');

async function initEnergyTempChart() {
    const fetchedData = await fetchEnergyUsageData();
    let goalkwh = 0;
    
    // Check for goal data
    const goalData = await fetchGoals();
    if (goalData && goalData.length > 0) {
        for (const goal of goalData) {
            if (goal.metric === 'energy') {
                if (goal.goal === 'tgtvalue') {
                    goalkwh = goal.metric_value/12;
                } else {
                    try {
                        const currentkwhresponse = await fetch(`/energy-usage/school/${placeholderID}`);
                        if (!currentkwhresponse.ok) {
                            throw new Error("Network response to get energy usage was not OK");
                        }
                        let currentkwhdata = await currentkwhresponse.json();
                        let currentkwhtotal = 0;
                        currentkwhdata = currentkwhdata.filter(item => 
                            new Date(item.timestamp).getFullYear() === new Date().getFullYear()
                        );
                        currentkwhdata.forEach(item => {
                            currentkwhtotal += item.energy_kwh;
                        });
                        currentkwhtotal = (1 - (goal.metric_value / 100)) * currentkwhtotal;
                        goalkwh = currentkwhtotal / 12;
                    } catch (error) {
                        console.error('Error fetching current energy usage:', error);
                    }
                }
                break; // Exit loop after finding energy goal
            }
        }
    }

    function filterDataById(fetchedData, selectedId) {
        let filteredData = fetchedData.filter(item => 
            item.school_id === selectedId && 
            new Date(item.timestamp).getFullYear() === placeholderYear
        );

        let kwhtotal = 0;
        let temptotal = 0;
        filteredData.forEach(row => {
            kwhtotal += row.energy_kwh;
            temptotal += row.avg_temperature_c;
        });
        const monthlyEnergyData = {};
        const monthlyTempData = {};

        filteredData.forEach(item => {
            const monthIndex = getMonthFromTimestamp(item.timestamp) - 1;
            
            if (!monthlyEnergyData[monthIndex]) {
                monthlyEnergyData[monthIndex] = 0;
            }
            monthlyEnergyData[monthIndex] += item.energy_kwh;
            
            if (!monthlyTempData[monthIndex]) {
                monthlyTempData[monthIndex] = 0;
            }
            monthlyTempData[monthIndex] += item.avg_temperature_c;
        });

        return {
            labels: monthNames,
            totalEnergy: Array(12).fill(0).map((_, i) => monthlyEnergyData[i] || 0),
            totalTemp: Array(12).fill(0).map((_, i) => monthlyTempData[i] || 0)
        };
    }

    const filteredEnergyTempData = filterDataById(fetchedData, placeholderID);

    const energyData = filteredEnergyTempData.totalEnergy;
    const temperatureData = filteredEnergyTempData.totalTemp;

    //to calculate sum of energy/temperature
    const sumEnergy = energyData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sumTemp = temperatureData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Destroy the existing chart if it exists
    if (energyTemperatureChart) {
        energyTemperatureChart.destroy();
    }

    // Prepare datasets array
    const datasets = [
        {
            label: 'Energy (kWh)',
            type: 'bar',
            data: filteredEnergyTempData.totalEnergy,
            backgroundColor: backgroundColor,
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            yAxisID: 'y1',
        },
        {
            label: 'Temperature (°C)',
            type: 'line',
            data: filteredEnergyTempData.totalTemp,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            yAxisID: 'y2'
        }
    ];

    // Add goal line dataset if goal exists
    if (goalkwh > 0) {
        datasets.push({
            label: 'Goal Line (kWh)',
            type: 'line',
            data: Array(12).fill(goalkwh), // All months will have the same value for the goal line
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1',
            pointRadius: 0,
            lineTension: 0
        });
    }

    const energyTemperatureConfig = {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y1: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    max: Math.max(2000, goalkwh * 1.2), // Adjust max to accommodate goal line
                    ticks: {
                        callback: function(value) {
                            return value + ' kWh';
                        }
                    }
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                }
            },
            onClick: (e) => {
                const element = energyTemperatureChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                if (element.length) {
                    const index = element[0].index;

                    if (selectedIndex === index) {
                        backgroundColor[index] = 'rgba(255, 159, 64, 0.5)';
                        selectedIndex = null;
                        selectedMonth = null;
                    } else {
                        backgroundColor.fill('rgba(255, 159, 64, 0.5)');
                        backgroundColor[index] = 'rgba(255, 99, 132, 1)';
                        selectedIndex = index;
                        selectedMonth = index;
                    }

                    energyTemperatureChart.data.datasets[0].backgroundColor = backgroundColor;
                    energyTemperatureChart.update();

                    const event = new Event('change', {
                        bubbles: true,
                        cancelable: true
                    });
                    monthPicker.dispatchEvent(event);
                }
            }
        }
    };

    //calculate average energy usage and temperature
    const avgEnergyTemp = document.querySelector('.barChart-info')
    avgEnergyTemp.innerHTML = `<p>Energy consumption:<br><strong> ${(sumEnergy/12).toFixed(2)} kWh/month</strong></p>
                            <p>Average Temperature:<br><strong>${(sumTemp/12).toFixed(1)}°C</strong></p>`

    // Initialize the energy vs. temperature chart
    const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
    energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
}

initEnergyTempChart();


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
async function initPieChart() {
    const fetchedData = await fetchEnergyBreakdownData();
    const fetchedCarbonData = await fetchCarbonBreakdownData();
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
    const yearDropdown = document.getElementById('yearsFilter'); // Assuming you have a year filter

    locationDropdown.innerHTML = '';
    uniqueLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location; // Set the value to the location
        option.textContent = location === "all_locations" ? "All Locations" : location; // Set display text
        locationDropdown.appendChild(option);
    });

    // Function to filter data by year
    function filterDataByYear(fetchedData, selectedYear) {
        return fetchedData.filter(item => new Date(item.timestamp).getFullYear() === selectedYear);
    }

    // Function to filter data by month
    function filterDataByMonth(fetchedData, selectedYear, selectedMonth) {
        return fetchedData.filter(item => {
            const date = new Date(item.timestamp);
            return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
        });
    }

    // Function to filter data by location
    function filterDataByLocation(fetchedData, selectedLocation) {
        if (selectedLocation === "all_locations") {
            return fetchedData;
        }
        return fetchedData.filter(item => item.location === selectedLocation);
    }

    // Function to get previous year's data for comparison
    function getPreviousYearData(fetchedData, selectedLocation, year, month) {
        let previousYearData;
        if (selectedLocation === "all_locations") {
            previousYearData = fetchedData.filter(item => new Date(item.timestamp).getFullYear() === year - 1);
        } else {
            previousYearData = fetchedData.filter(item => item.location === selectedLocation && new Date(item.timestamp).getFullYear() === year - 1);
        }

        if (month !== null) {
            previousYearData = previousYearData.filter(item => new Date(item.timestamp).getMonth() === month);
        }

        return previousYearData;
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
    function initializePieChart(currentData, previousData) {
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
                            const previousValue = previousData.Percentage[previousData.Label.indexOf(category)] || 0;
                            if (previousValue) {
                                const change = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
                                return `${category}: ${currentValue}% (${change >= 0 ? '+' : ''}${change}% from last year)`;
                            }
                            return `${category}: ${currentValue}% (last year's data unavailable)`;
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
    
        const pieCtx = document.getElementById('pieChart').getContext('2d');
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

    function initializeCarbonPieChart(currentData, previousData) {
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
                            const previousValue = previousData.Percentage[previousData.Label.indexOf(category)] || 0;
                            if (previousValue) {
                                const change = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
                                return `${category}: ${currentValue}% (${change >= 0 ? '+' : ''}${change}% from last year)`;
                            }
                            return `${category}: ${currentValue}% (last year's data unavailable)`;
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
    
        const pieCtx = document.getElementById('pieChart2').getContext('2d');
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
        const selectedYear = placeholderYear;
        

        let filteredData = filterDataByLocation(fetchedData, selectedLocation);
        let filteredCarbonData = filterDataByLocation(fetchedCarbonData, selectedLocation);
        let previousYearData;
        let previousCarbonData;
        if (selectedMonth !== null) {
            filteredData = filterDataByMonth(filteredData, selectedYear, selectedMonth);
            filteredCarbonData = filterDataByMonth(filteredCarbonData, selectedYear, selectedMonth);
            previousYearData = getPreviousYearData(fetchedData, selectedLocation, selectedYear, selectedMonth);
            previousCarbonData = getPreviousYearData(fetchedCarbonData, selectedLocation, selectedYear, selectedMonth);
        } else {
            filteredData = filterDataByYear(filteredData, selectedYear);
            previousYearData = getPreviousYearData(fetchedData, selectedLocation, selectedYear, null);
            filteredCarbonData = filterDataByYear(filteredCarbonData, selectedYear);
            previousCarbonData = getPreviousYearData(fetchedCarbonData, selectedLocation, selectedYear, null);
        }

        const aggregatedCurrentCarbonData = aggregateData(filteredCarbonData);
        const aggregatedPreviousCarbonData = aggregateData(previousCarbonData);
        const aggregatedCurrentData = aggregateData(filteredData);
        const aggregatedPreviousData = aggregateData(previousYearData);
        
        initializePieChart(aggregatedCurrentData, aggregatedPreviousData);
        initializeCarbonPieChart(aggregatedCurrentCarbonData, aggregatedPreviousCarbonData);
    }

    // Initialize with default data
    let allData = filterDataByLocation(fetchedData, "all_locations");
    allData = filterDataByYear(allData, placeholderYear);
    const previousYearData = getPreviousYearData(fetchedData, "all_locations", placeholderYear, null);
    let allCarbonData = filterDataByYear(fetchedCarbonData, placeholderYear);
    const previousYearCarbonData = getPreviousYearData(fetchedData, "all_locations", placeholderYear, null);
    const aggregatedCurrentData = aggregateData(allData);
    const aggregatedPreviousData = aggregateData(previousYearData);
    const aggregatedCurrentCarbonData = aggregateData(allCarbonData);
    const aggregatedPreviousCarbonData = aggregateData(previousYearCarbonData);
    initializePieChart(aggregatedCurrentData, aggregatedPreviousData);
    initializeCarbonPieChart(aggregatedCurrentCarbonData, aggregatedPreviousCarbonData);
    
    // Event listeners
    locationDropdown.addEventListener('change', updatePieChart);
    yearDropdown.addEventListener('change', updatePieChart);
    monthPicker.addEventListener('change', updatePieChart);
}

// Convert hex color to RGBA format
function hexToRGBA(hex, opacity) {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Unified popup functions
function showPopup(category) {
    const modal = document.getElementById('popupModal');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');

    if (popupMessages[category]) {
        title.textContent = popupMessages[category].title;

        const content = `
            ${popupMessages[category].message}
            <div class="recommendations-container" id="recommendations-${category}" style="display: none;">
                <div class="recommendations-content">
                    <!-- Recommendations will be populated dynamically -->
                </div>
            </div>
            <div class="recommendations-btn-container">
                <button 
                    class="show-recommendations-btn" 
                    onclick="toggleRecommendations('${category}')"
                >
                    <span class="button-text">Generate AI Recommendations</span>
                </button>
                <div class="animation-container" style="display: none;">
                    <dotlottie-player 
                        src="./assets/general/Animation - 1705413706609.json" 
                        background="transparent" 
                        speed="1" 
                        loop 
                        autoplay
                        style="width: 50px; height: 50px;">
                    </dotlottie-player>
                </div>
            </div>
        `;

        message.innerHTML = content;
        modal.style.display = 'flex';
    } else {
        console.error(`No popup message found for category: ${category}`);
    }
}

async function toggleRecommendations(category) {
    const recommendationsContainer = document.getElementById(`recommendations-${category}`);
    const recommendationsContent = recommendationsContainer.querySelector('.recommendations-content');
    const btnContainer = document.querySelector('.recommendations-btn-container');
    const button = btnContainer.querySelector('.show-recommendations-btn');
    const animationContainer = btnContainer.querySelector('.animation-container');

    // Hide button and show animation
    button.style.display = 'none';
    animationContainer.style.display = 'flex';

    try {
        let apiUrl;

        // Determine the correct API endpoint based on the category
        if (['EnergyUsage', 'FoodServices', 'Transportation', 'WasteManagement', 'WaterUsage'].includes(category)) {
            apiUrl = `/api/CFrecommendations/${category}`; // Carbon footprint
        } else {
            apiUrl = `/api/EBrecommendations/${category}`; // Energy breakdown
        }

        // Fetch recommendations from the API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                categoryData: {
                    title: popupMessages[category]?.title || 'Unknown Category',
                    message: popupMessages[category]?.message || 'No message available',
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recommendations for category: ${category}`);
        }

        const data = await response.json();

        // Populate recommendations content
        recommendationsContent.innerHTML = `
            ${data.recommendations}
        `;

        // Show recommendations and hide animation after a short delay
        setTimeout(() => {
            recommendationsContainer.style.display = 'block';
            animationContainer.style.display = 'none';
        }, 1000);

    } catch (error) {
        console.error('Error generating recommendations:', error);

        // Handle errors gracefully
        animationContainer.style.display = 'none';
        button.style.display = 'block';
        button.innerHTML = '<span class="button-text">Error - Try Again</span>';
    }
}



function closePopup() {
    const modal = document.getElementById('popupModal');
    modal.style.display = 'none';
}

function highlightSegment(category) {
    showPopup(category);
}




initPieChart();
// ==================== Line Graph ====================
let carbonFootprintChart;
async function initCarbonFootprintChart() {
    const fetchedData = await fetchCarbonFootprintData();
    let goalton = 0;
    
    // Check for goal data
    const goalData = await fetchGoals();
    if (goalData && goalData.length > 0) {
        for (const goal of goalData) {
            if (goal.metric === 'carbon') {
                if (goal.goal === 'tgtvalue') {
                    goalton = goal.metric_value / 12;
                } else {
                    try {
                        const currenttonresponse = await fetch(`/carbon-footprints/school/${placeholderID}`);
                        if (!currenttonresponse.ok) {
                            throw new Error("Network response to get carbon footprint was not OK");
                        }
                        let currenttondata = await currenttonresponse.json();
                        let currenttontotal = 0;
                        currenttondata = currenttondata.filter(item => 
                            new Date(item.timestamp).getFullYear() === new Date().getFullYear()
                        );
                        currenttondata.forEach(item => {
                            currenttontotal += item.total_carbon_tons;
                        });
                        currenttontotal = (1 - (goal.metric_value / 100)) * currenttontotal;
                        goalton = currenttontotal / 12;
                    } catch (error) {
                        console.error('Error fetching current carbon footprint:', error);
                    }
                }
                break; // Exit loop after finding carbon goal
            }
        }
    }

    function filterDataByIdandMonth(fetchedData, selectedId) {
        const monthlyData = {};
        const yearlyData = {};
        let filteredData = fetchedData.filter(item => item.school_id === selectedId);

        // Determine which filtering is needed based on the dropdown value
        const selection = document.getElementById('yearMonthSelect').value;

        if (selection === 'months') {
            // Filter to only include data for the specified placeholderYear
            filteredData = filteredData.filter(item => new Date(item.timestamp).getFullYear() === placeholderYear);
        }

        filteredData.forEach(item => {
            const date = new Date(item.timestamp);
            const monthIndex = getMonthFromTimestamp(item.timestamp) - 1;
            const year = date.getFullYear();

            if (!monthlyData[monthIndex]) {
                monthlyData[monthIndex] = 0;
            }
            monthlyData[monthIndex] += item.total_carbon_tons;

            if (!yearlyData[year]) {
                yearlyData[year] = 0;
            }
            yearlyData[year] += item.total_carbon_tons;
        });

        return {
            labels: Object.keys(monthlyData).map(monthIndex => monthNames[monthIndex]),
            yearLabels: Object.keys(yearlyData),
            totalCarbonTons: Object.values(monthlyData),
            totalCarbonYear: Object.values(yearlyData)
        };
    }

    function filterData() {
        const selection = document.getElementById('yearMonthSelect').value;
        let filteredLabels;
        let filteredData;
        let adjustedGoalton = goalton;

        if (selection === 'years') {
            // Use the full fetched data to filter for all years
            const yearlyData = {};
            fetchedData.filter(item => item.school_id === placeholderID).forEach(item => {
                const year = new Date(item.timestamp).getFullYear();
                if (!yearlyData[year]) {
                    yearlyData[year] = 0;
                }
                yearlyData[year] += item.total_carbon_tons;
            });

            filteredLabels = Object.keys(yearlyData);
            filteredData = Object.values(yearlyData);
            adjustedGoalton = goalton * 12; // Adjust goalton for yearly view
        } else if (selection === 'months') {
            const updatedFilteredData = filterDataByIdandMonth(fetchedData, placeholderID);
            filteredLabels = updatedFilteredData.labels;
            filteredData = updatedFilteredData.totalCarbonTons;
            adjustedGoalton = goalton; // Use monthly goalton
        }

        updateChart(filteredLabels, filteredData, adjustedGoalton);
    }

    function updateChart(labels, data, currentGoalton) {
        const maxDataValue = Math.max(...data);
        const dynamicMax = Math.ceil(maxDataValue * 1.1);

        const datasets = [
            {
                label: 'Carbon Footprint (tonnes)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: true,
                borderWidth: 2,
                yAxisID: 'y1'
            }
        ];

        // Add goal line if goalton exists
        if (currentGoalton > 0) {
            datasets.push({
                label: 'Goal Line (tonnes)',
                type: 'line',
                data: Array(labels.length).fill(currentGoalton),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1',
                pointRadius: 0,
                lineTension: 0
            });
        }

        if (carbonFootprintChart) {
            carbonFootprintChart.data.labels = labels;
            carbonFootprintChart.data.datasets = datasets;
            carbonFootprintChart.options.scales.y1.max = dynamicMax;
            carbonFootprintChart.update();
        } else {
            createChart(labels, datasets, dynamicMax);
        }
    }

    function createChart(labels, datasets, dynamicMax) {
        if (carbonFootprintChart) {
            carbonFootprintChart.destroy();
        }

        const carbonFootprintConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        max: dynamicMax,
                        ticks: {
                            callback: function(value) {
                                return value + ' tonnes';
                            }
                        }
                    }
                }
            }
        };

        const carbonCtx = document.getElementById('carbonFootprintGraph').getContext('2d');
        carbonFootprintChart = new Chart(carbonCtx, carbonFootprintConfig);
    }

    // Initialize the chart with the default data
    const filteredCarbonData = filterDataByIdandMonth(fetchedData, placeholderID);
    const initialDatasets = [
        {
            label: 'Carbon Footprint (tonnes)',
            data: filteredCarbonData.totalCarbonTons,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: true,
            borderWidth: 2,
            yAxisID: 'y1'
        }
    ];

    if (goalton > 0) {
        initialDatasets.push({
            label: 'Goal Line (tonnes)',
            type: 'line',
            data: Array(filteredCarbonData.labels.length).fill(goalton),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1',
            pointRadius: 0,
            lineTension: 0
        });
    }

    createChart(
        filteredCarbonData.labels,
        initialDatasets,
        Math.ceil(Math.max(...filteredCarbonData.totalCarbonTons) * 1.1)
    );

    // Add event listener to the dropdown
    const yearMonthSelect = document.getElementById('yearMonthSelect');
    yearMonthSelect.addEventListener('change', filterData);
}

// Call the function to initialize everything
initCarbonFootprintChart();


yearSelect.addEventListener('change', function() {
    placeholderYear = parseInt(this.value);
    initEnergyTempChart();
    initCarbonFootprintChart(); 

    initImpactCard(placeholderYear);

    // Reset the location filter to its default value
    const locationDropdown = document.getElementById('locationSelect');
    locationDropdown.value = 'all_locations'; // Change this to your default value
});


document.querySelectorAll('.analyse-chart-btn1, .analyse-chart-btn2').forEach(button => {
    button.addEventListener('click', () => {
        const chartType = button.getAttribute('data-chart-type');
        const selectedYear = parseInt(yearSelect.value) || new Date().getFullYear();
        const schoolId = placeholderID;

        console.log(`Button clicked: ${chartType}, Year: ${selectedYear}, School ID: ${schoolId}`); // Debug

        // Redirect to the analyseChart page with query parameters
        window.location.href = `analyseChart.html?chartType=${chartType}&year=${selectedYear}&schoolId=${schoolId}`;
    });
});

function downloadDashboardDataAsCsv() {
    const selectedYear = parseInt(document.getElementById('yearsFilter').value);

    // Create temporary tables to hold the data
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';

    // Create Energy Usage Table
    const energyTable = document.createElement('table');
    energyTable.id = 'tempEnergyUsageTable';

    // Create Carbon Footprint Table
    const carbonTable = document.createElement('table');
    carbonTable.id = 'tempCarbonFootprintTable';

    // Create Energy Breakdown Table
    const breakdownTable = document.createElement('table');
    breakdownTable.id = 'tempEnergyBreakdownTable';

    // Add tables to container
    tempContainer.appendChild(energyTable);
    tempContainer.appendChild(carbonTable);
    tempContainer.appendChild(breakdownTable);
    document.body.appendChild(tempContainer);

    // Fetch all necessary data
    Promise.all([
        fetch(`/api/energy-usage/${placeholderID}/monthly/${selectedYear}`),
        fetch(`/api/carbon-footprint/${placeholderID}/year/${selectedYear}`),
        fetch(`/api/energy-breakdown/${placeholderID}/year/${selectedYear}`)
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([energyData, carbonData, breakdownData]) => {
        // Populate Energy Usage Table
        energyTable.innerHTML = `
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Energy Usage (kWh)</th>
                    <th>Average Temperature (°C)</th>
                </tr>
            </thead>
            <tbody>
                ${energyData.map(item => {
                    return `
                        <tr>
                            <td>${item.month}</td>
                            <td>${item.energy_kwh.toFixed(2)}</td>
                            <td>${item.avg_temperature_c.toFixed(1)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;

        // Populate Carbon Footprint Table
        carbonTable.innerHTML = `
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Total Carbon Emissions (tons)</th>
                </tr>
            </thead>
            <tbody>
                ${carbonData.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleString('default', { month: 'long' })}</td>
                        <td>${item.total_carbon_tons.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        // Populate Energy Breakdown Table
        breakdownTable.innerHTML = `
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Percentage (%)</th>
                </tr>
            </thead>
            <tbody>
                ${breakdownData.map(item => `
                    <tr>
                        <td>${item.month}</td>
                        <td>${item.location}</td>
                        <td>${item.category}</td>
                        <td>${item.percentage}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        // Create CSV content using the same function as viewData.js
        const energyUsageData = tableToCsv('tempEnergyUsageTable');
        const carbonFootprintData = tableToCsv('tempCarbonFootprintTable');
        const energyBreakdownData = tableToCsv('tempEnergyBreakdownTable');

        // Combine data
        const csvContent = `Energy Usage\n${energyUsageData}\n\nCarbon Footprint\n${carbonFootprintData}\n\nEnergy Breakdown\n${energyBreakdownData}`;

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `Dashboard_Data_${selectedYear}.csv`;
        downloadLink.click();
        URL.revokeObjectURL(url);

        // Clean up temporary elements
        document.body.removeChild(tempContainer);
    })
    .catch(error => {
        console.error('Error downloading CSV:', error);
        alert('An error occurred while downloading the CSV file.');
        // Clean up temporary elements in case of error
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    });
}
function tableToCsv(tableId) {
    const table = document.getElementById(tableId);
    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => {
            // Escape commas and quotes
            let data = col.innerText.replace(/"/g, '""');
            if (data.indexOf(',') > -1 || data.indexOf('"') > -1) {
                data = `"${data}"`;
            }
            rowData.push(data);
        });
        csv += rowData.join(',') + '\n';
    });
    return csv.trim();
}

// Add event listener for the CSV download button
downloadCsvBtn.addEventListener('click', downloadDashboardDataAsCsv);

