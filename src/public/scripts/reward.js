let studentID = 6; // Example student ID
let currentPoints = 0;
// Example rewards
const rewards = [
  {
    id: 1,
    name: "Free Coffee",
    description: "Enjoy a free cup of coffee at the campus café.",
    points: 1,
    image: "https://via.placeholder.com/150"
  },
  {
    id: 2,
    name: "Extra Credit",
    description: "Get 10 points extra credit for any subject.",
    points: 80,
    image: "https://via.placeholder.com/150"
  }
];

async function updateStudentPoints(pts) {
    const updatestudentresponse = await fetch(`/users/student/points/${parseInt(studentID)}/${parseInt(pts)}`, {
        method: "PATCH"
    })
    if (!updatestudentresponse.ok) {
        throw new Error("Network response to update student points was not ok");
    }
}

// Load the student's current points and the available rewards
async function loadRewards() {
    if (sessionStorage.getItem("pointsUpdated") === null){
        let initcurrentPointsresponse = await fetch(`/users/student/points/${studentID}`)
        if (!initcurrentPointsresponse.ok) {
        throw new Error("Network response to get student's current points was not ok");
        } else {
            let currentpointsjson = await initcurrentPointsresponse.json();
            currentpointsjson.forEach(element => {
                currentPoints += parseInt(element.points);
            });
            await updateStudentPoints(currentPoints);
            }
            sessionStorage.setItem("pointsUpdated", 'true');
    }
    else {
        let currentPointsresponse = await fetch(`/users/${studentID}`)
        if (!currentPointsresponse.ok) {throw new Error("Network response to fetching current student was not ok")}
        else {
            let currentstudentobj =  await currentPointsresponse.json()
            currentPoints = currentstudentobj.points
        }
    }
    
    document.getElementById("current-points").innerText = currentPoints;

    let rewardsContainer = document.getElementById('rewards-container');
    rewardsContainer.innerHTML = ''; // Clear previous rewards

    rewards.forEach(reward => {
        let card = document.createElement('div');
        card.classList.add('card');

        let rewardName = document.createElement('h2');
        rewardName.innerText = reward.name;

        let rewardDesc = document.createElement('p');
        rewardDesc.innerText = reward.description;

        let rewardPoints = document.createElement('p');
        rewardPoints.innerText = `Points: ${reward.points}`;

        let redeemBtn = document.createElement('button');
        redeemBtn.innerText = 'Redeem';
        redeemBtn.classList.add('btn-set-goal');
        redeemBtn.addEventListener('click', () => openRedeemPopup(reward));

        card.appendChild(rewardName);
        card.appendChild(rewardDesc);
        card.appendChild(rewardPoints);
        card.appendChild(redeemBtn);

        rewardsContainer.appendChild(card);
    });
}

// Open the Redeem Popup
function openRedeemPopup(reward) {
  document.getElementById("redeemPopup").style.display = "block";
  document.getElementById("reward-name").innerText = reward.name;
  document.getElementById("reward-points").innerText = `Points: ${reward.points}`;

  document.getElementById("confirm-redeem").onclick = () => redeemReward(reward);
}

// Close the Redeem Popup
function closeRedeemPopup() {
  document.getElementById("redeemPopup").style.display = "none";
}

// Redeem a reward
async function redeemReward(reward) {
  if (currentPoints >= reward.points) {
    currentPoints -= reward.points;
    await updateStudentPoints(currentPoints); // Wait for the points to be updated in the database
    alert(`You have redeemed "${reward.name}"!`);
    closeRedeemPopup();
  } else {
    alert("You do not have enough points to redeem this reward.");
  }
}

// Load the rewards when the page loads
window.onload = loadRewards;
