let placeholderID = 1;
let currentCampaignID;
let currentcampaigns;
async function loadCurrentCampaigns() {
    let parentcontainer = document.getElementById('campaignparent-container')
    let currentcampaignsresponse = await fetch(`/campaigns/school/${placeholderID}`)
    if (!currentcampaignsresponse.ok){
        let errorcampaignsmsg = document.createElement('h2')
        if (currentcampaignsresponse.status === 404){
            errorcampaignsmsg.innerText = "No campaigns yet!"
        }
        else {
            errorcampaignsmsg.innerText = "There was an error retrieving campaigns!"
        }
        parentcontainer.appendChild(errorcampaignsmsg)
    }
    else {
        currentcampaigns = await currentcampaignsresponse.json()
        currentcampaigns.forEach(element => {
            let card = document.createElement('div')
            card.classList.add('card')
    
            let campaignh2 = document.createElement('h2')
            campaignh2.innerText = element.name;
    
            let campaigndetails = document.createElement('div')
            campaigndetails.classList.add('campaign-details')
    
            let campaignimg = document.createElement('img')
            campaignimg.src = element.image;
            campaignimg.alt = 'Campaign Image'
            campaignimg.classList.add('campaign-image')
    
            let campaigndescp = document.createElement('p')
            campaigndescp.innerText = element.description;
            campaigndescp.classList.add('campaign-description')
    
            let campaignpoints = document.createElement('p')
            campaignpoints.innerText = `Points: ${element.points}`
            campaignpoints.classList.add('campaign-points')
    
            let modifybtn = document.createElement('button')
            modifybtn.textContent = 'Modify Campaign'
            modifybtn.addEventListener('click', () => openModifyPopup(element.id))
            modifybtn.classList.add('btn-set-goal')
    
            let deletebtn = document.createElement('button')
            deletebtn.textContent = 'Delete Campaign'
            deletebtn.addEventListener('click', () => openDeletePopup(element.id))
            deletebtn.classList.add('btn-set-goal')
    
            card.appendChild(campaignh2)
            campaigndetails.appendChild(campaignimg)
            campaigndetails.appendChild(campaigndescp)
            campaigndetails.appendChild(campaignpoints)
            card.appendChild(campaigndetails)
            card.appendChild(modifybtn)
            card.appendChild(deletebtn)
            parentcontainer.append(card)
        });
    }
    
}

//ALWAYS CALL THIS
loadCurrentCampaigns()
// Open Create Popup
function openCreatePopup() {
    document.getElementById("createPopup").style.display = "block";
}

// Close Create Popup
function closeCreatePopup() {
    document.getElementById("createPopup").style.display = "none";
}

// Open Modify Popup
function openModifyPopup(id) {
    currentCampaignID = id;
    document.getElementById("modifyPopup").style.display = "block";
    let modifiedcampaign;
    currentcampaigns.forEach(element => {
        if (element.id == currentCampaignID){
            modifiedcampaign = element;
        }
    });
    document.getElementById('modifyCampaignName').value = modifiedcampaign.name;
    document.getElementById('modifyCampaignDescription').innerText = modifiedcampaign.description;
    document.getElementById('modifyCampaignPoints').value = parseInt(modifiedcampaign.points);
}

// Close Modify Popup
function closeModifyPopup() {
    document.getElementById("modifyPopup").style.display = "none";
}

// Delete Campaign (Placeholder for future functionality)
async function openDeletePopup(id) {
    currentCampaignID = id;
    document.getElementById('deleteConfirmationPopup').style.display = 'block';
    
}

// Close Modify Popup
function closeDeletePopup() {
    document.getElementById("deleteConfirmationPopup").style.display = "none";
}

//create campaign
document.getElementById('submitnewcampaignbtn').addEventListener('click', async function(){
    if (parseInt(document.getElementById('campaignPoints').value) >5 || parseInt(document.getElementById('campaignPoints').value) < 0) {
        alert("Please enter a points value from 1 to 5.")
        return;
    }
    const newCampaignData = {
        school_id: placeholderID,
        name: document.getElementById('campaignName').value,
        description: document.getElementById('campaignDescription').value,
        //for today im gon leave image as blank
        image: "",
        points: parseInt(document.getElementById('campaignPoints').value)
    }

    

    let createResponse = await fetch('/campaigns', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify(newCampaignData)
    })
    if (!createResponse.ok) {throw new Error("Network response to create new campaign was not ok")}
    else {
        alert("Campaign created! Reload to sync changes.")
        document.getElementById("createPopup").style.display = "none";
    }
})

//modify campaign
document.getElementById('submitmodifycampaignbtn').addEventListener('click', async function(){
    if (parseInt(document.getElementById('modifyCampaignPoints').value) >5 || parseInt(document.getElementById('modifyCampaignPoints').value) < 0) {
        alert("Please enter a points value from 1 to 5.")
        return;
    }
    const updatedCampaignData = {
        id: currentCampaignID,
        school_id: placeholderID,
        name: document.getElementById('modifyCampaignName').value,
        description: document.getElementById('modifyCampaignDescription').value,
        //replace ltr
        image: '',
        points: document.getElementById('modifyCampaignPoints').value
    }

    let modifycampaignresponse = await fetch(`/campaigns/${currentCampaignID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify(updatedCampaignData)
    })
    if (!modifycampaignresponse.ok) {throw new Error("Network response to modify campaign was not ok")}
    else{
        alert("Campaign modified! Refresh to sync changes.")
        closeModifyPopup()
    }
})

//delete campaign
document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
    let deletecampaignresponse = await fetch(`/campaigns/${currentCampaignID}`, {
        method: 'DELETE',
    })
    if (!deletecampaignresponse.ok) {throw new Error("Network response to delete campaign was not ok")}
    else {
        alert("Campaign deleted! Refresh to sync changes.")
        closeDeletePopup()
    }
})