let studentID = 11; // Example student ID
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
    let currentPointsresponse = await fetch(`/users/${studentID}`)
    if (!currentPointsresponse.ok) {throw new Error("Network response to fetching current student was not ok")}
    else {
        let currentstudentobj =  await currentPointsresponse.json()
        currentPoints = parseInt(currentstudentobj.points);
        if (isNaN(currentPoints)) {
          currentPoints = 0; // Set to default if not a valid number
      }
    }

    
    document.getElementById("current-points").innerText = currentPoints;
    document.getElementById("reward-count").innerText = `${rewards.length} Rewards`;

    let rewardsContainer = document.getElementById('rewards-container');
    rewardsContainer.innerHTML = ''; // Clear previous rewards

    rewards.forEach(reward => {
      let cardElement = document.createElement("div");
      cardElement.classList.add("coupon-card");
    
      let iconElement = document.createElement("div");
      iconElement.classList.add("card-icon");
      iconElement.textContent = "🌟";
      cardElement.appendChild(iconElement);
    
      let titleElement = document.createElement("div");
      titleElement.classList.add("card-title");
      titleElement.innerText = reward.name;
      cardElement.appendChild(titleElement);
    
      let redeemLinkElement = document.createElement("a");
      redeemLinkElement.classList.add("redeem-link");
      redeemLinkElement.href = "#";
      redeemLinkElement.textContent = `REDEEM ● ${reward.points}`;
      redeemLinkElement.addEventListener("click", (e) => {
        e.preventDefault();
        openRedeemModal(reward)
      });
      cardElement.appendChild(redeemLinkElement);

      rewardsContainer.appendChild(cardElement);
    });
}

// Open the Redeem Popup
function openRedeemModal(reward) {
  document.getElementById('redeemPopup').style.display = 'flex';
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
    await loadRewards();
  } else {
    alert("You do not have enough points to redeem this reward.");
  }
}

// Load the rewards when the page loads
window.addEventListener("DOMContentLoaded", () => {
  loadRewards();

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
      const modal = document.getElementById("redeemPopup");
      if (event.target == modal) {
      closeRedeemPopup();
      }
  });
});
