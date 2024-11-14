let studentID = 11; // Example student ID
let currentPoints = 0;
// Example rewards
const rewards = [
  {
    id: 1,
    name: "Free Coffee",
    description: "Enjoy a free cup of coffee at the campus café.",
    points: 1,
    icon: "☕"
  },
  {
    id: 2,
    name: "Extra Credit",
    description: "Get 10 points extra credit for any subject.",
    points: 80,
    icon: "➕"
  },
  {
    id: 3,
    name: "Discount on Textbooks",
    description: "Get a 10% discount on your next textbook purchase at the campus bookstore.",
    points: 100,
    icon: "📚"
  },
  {
    id: 4,
    name: "Gym Access",
    description: "Free one-day pass to the campus gym and facilities.",
    points: 10,
    icon: "💪"
  },
  {
    id: 5,
    name: "Movie Night Ticket",
    description: "Redeem for a ticket to the next on-campus movie night.",
    points: 30,
    icon: "🎬"
  },
  {
    id: 6,
    name: "Library Late Fee Waiver",
    description: "Waive one late fee on a borrowed library book.",
    points: 25,
    icon: "📖"
  },
  {
    id: 7,
    name: "Priority Class Registration",
    description: "Get early access to class registration for the next term.",
    points: 30,
    icon: "🏫"
  },
  {
    id: 8,
    name: "Campus Hoodie",
    description: "Redeem for an official campus hoodie from the bookstore.",
    points: 120,
    icon: "👕"
  },
  {
    id: 9,
    name: "Meal Voucher",
    description: "Enjoy a free meal at the campus cafeteria.",
    points: 8,
    icon: "🍽️"
  },
  {
    id: 10,
    name: "Reserved Study Room",
    description: "Reserve a private study room for a 2-hour slot.",
    points: 20,
    icon: "📚"
  },
  {
    id: 11,
    name: "Free Printing Credits",
    description: "Redeem 20 free pages for printing at the campus print center.",
    points: 15,
    icon: "🖨️"
  },
  {
    id: 12,
    name: "Campus Tour Guide",
    description: "Become a campus tour guide for a day and earn extra volunteer credits.",
    points: 10,
    icon: "🌍"
  },
  {
    id: 13,
    name: "Field Trip Participation",
    description: "Join an upcoming field trip with transport and tickets included.",
    points: 120,
    icon: "🚌"
  },
  {
    id: 14,
    name: "Mentor Lunch with Professor",
    description: "Enjoy a lunch meeting with a professor of your choice for guidance.",
    points: 85,
    icon: "🍲"
  },
  {
    id: 15,
    name: "Concert Ticket",
    description: "Redeem a ticket to the upcoming campus concert or show.",
    points: 100,
    icon: "🎶"
  },
  {
    id: 16,
    name: "Eco-Friendly Gift",
    description: "Receive a set of eco-friendly stationery items.",
    points: 35,
    icon: "🌱"
  },
  {
    id: 17,
    name: "Bicycle Rental",
    description: "Get a free one-day campus bicycle rental.",
    points: 20,
    icon: "🚲"
  },
  {
    id: 18,
    name: "Study Snacks Pack",
    description: "Redeem a snacks pack for a late-night study session.",
    points: 10,
    icon: "🍿"
  },
  {
    id: 19,
    name: "Coffee with a Mentor",
    description: "Spend an hour with a senior student mentor for guidance.",
    points: 60,
    icon: "☕"
  },
  {
    id: 20,
    name: "Volunteer Certificate",
    description: "Earn a volunteer certificate for your resume.",
    points: 50,
    icon: "🏅"
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
      iconElement.textContent = reward.icon;
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
  document.querySelector(".modal-icon").innerText = reward.icon;
  document.getElementById("reward-name").innerText = reward.name;
  document.getElementById("reward-description").innerText = reward.description;
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
