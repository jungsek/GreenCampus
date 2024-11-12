let studentID = 6;
let placeholderID = 1; // for school
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
        currentcampaigns.forEach(async (element) => {
            let signedupcampaigns;
            let signedupcampaignsresponse = await fetch(`/campaigns/student/${studentID}`)
            if (!signedupcampaignsresponse.ok) {
                if (signedupcampaignsresponse.status == 404) {
                    console.log("Student has not signed up for any campaigns")
                }
                else {
                    throw new Error("Network response to get signed up campaigns for student was not ok")
                }
            }
            else {
                signedupcampaigns = await signedupcampaignsresponse.json()
            }
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
    
            let signupbtn = document.createElement('button')
            signupbtn.textContent = 'Sign Up'
            signupbtn.addEventListener('click', () => signUp(element.id))
            signupbtn.classList.add('btn-set-goal')
            if (signedupcampaigns){
                signedupcampaigns.forEach(campaign => {
                    if (campaign.id === element.id) {
                        signupbtn.textContent = 'Signed Up!'
                        signupbtn.setAttribute("disabled", true)
                    }
                });
            }

            card.appendChild(campaignh2)
            campaigndetails.appendChild(campaignimg)
            campaigndetails.appendChild(campaigndescp)
            campaigndetails.appendChild(campaignpoints)
            card.appendChild(campaigndetails)
            card.appendChild(signupbtn)
            parentcontainer.append(card)
        });
    }
    
}

//ALWAYS CALL THIS
loadCurrentCampaigns()

async function signUp(id) {
    signupresponse = await fetch(`/campaigns/signup/${studentID}/${id}`, {
        method: "POST"
    })
    if (!signupresponse.ok) {throw new Error("Network response to sign up for campaign was not ok")}
    else {
        alert("Signed up for campaign! Refresh to sync changes.")
        
    }
}