//this file stores common functions to be used in other scripts

//load the navbar html into the class
$(".nav-placeholder").load(".index.html", () => {
  // This code will execute after the navbar is loaded

  // Toggle dark and light mode
  const body = document.querySelector("body"),
    modeToggle = document.querySelector(".dark-light"),

    nav = document.querySelector("nav"),
    navMenuBtn = document.getElementById('navMenuIcon'),
    sideMenuBtn = document.getElementById('sideMenuIcon'),
    
    login = document.getElementById('login'),
    userBtn = document.getElementById('userIcon'),
    loginClose = document.getElementById('loginClose'),
    loginLink = document.getElementById('loginLink'),
    
    signUp = document.getElementById('signUp'),
    signUpClose = document.getElementById('signUpClose'),
    signUpLink = document.getElementById('signUpLink'),
    
    loggedUser = document.getElementById('loggedUser'),
    loggedUserClose = document.getElementById('loggedUserClose');


    modeToggle.addEventListener("click", () => {
        modeToggle.classList.toggle("active");
        body.classList.toggle("dark");
    });

    // Show sidebar
    navMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    // Hide sidebar
    sideMenuBtn.addEventListener('click', () => {
        nav.classList.remove('open');
    });

    // Show login form
    userBtn.addEventListener('click', () => {
        login.classList.add('showLogin');
    });

    // Hide login form
    loginClose.addEventListener('click', () => {
        login.classList.remove('showLogin');
    });

    // Handle "Login" link click
    loginLink.addEventListener('click', () => {
        signUp.classList.remove('showSignUp'); // Hide sign-up form
        login.classList.add('showLogin'); // Show login form
    });

    // Handle "Sign Up" link click
    signUpLink.addEventListener('click', () => {
        login.classList.remove('showLogin'); // Hide login form
        signUp.classList.add('showSignUp'); // Show sign-up form
    });

    // Hide sign-up form
    signUpClose.addEventListener('click', () => {
        signUp.classList.remove('showSignUp');
    });

    // Hide loggedUser form
    loggedUserClose.addEventListener('click', () => {
        loggedUser.classList.remove('showLoggedUser'); // Hide loggedUser form
    });
});

//load the footer html into the class
$(".footer-placeholder").load("./commonHTML/footer.html")

//load the header for course-view pages
$(".course-header-placeholder").load("./commonHTML/course-header.html")

// Get the access token and role
const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
const userRole =  localStorage.getItem("role") || sessionStorage.getItem("role");

//returns a string with title-casing
function title(str) {
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}


//get the value of the url parameter of the current address
function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return decodeURI(sParameterName[1]);
        }
    }
}

//api functions
async function post(url, jsondata){
    let settings = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cache-control": "no-cache",
        "authorization": `Bearer ${accessToken}`
      },
  
      body: JSON.stringify(jsondata)
    }
    return await fetch(url, settings)
    
}

async function get(url){
    let settings = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${accessToken}`
      }
    }
    return await fetch(url, settings)
  
}

async function put(url, jsondata){
  let settings = {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
      "authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(jsondata)
  }

  return await fetch(url, settings)
  
}

//check if user is logged in 
async function isLoggedIn(){
  if (accessToken === null) return false
  //make sure the jwt is valid
  const response = await get("/users/decodejwt")
  return (response.status == 200)
}

//ensures the user is logged in before accessing the page, else they get redirected to login page
async function guardLoginPage(){
  if (!await isLoggedIn()) location.href = "login.html"
}

//opposite of guardLoginPage, redirect user to home (course) page if they are logged in
async function guardAlreadyLoginPage(){
  if (await isLoggedIn()) location.href = "courses.html"
}

//returns the user id stored in local/session storage
function getUserID(){
  //a jwt is split into three parts seperated by a .
  //the json object is stored in the 2nd part
  //so split by ., get the json object and use atob to decode it (since its in base64)
  //use json.parse to turn it into an object and return its userId

  //ensure that accessToken exists
  if (!accessToken) return null
  return  
}


//to be called when content is done loading
//shows the content and hides the loading animation
function loadContent(){
  document.getElementById("loading-main").style.display = "block"
  document.getElementById("loading-screen").style.display = "none"
}

//prevent reloading page when form submitted
document.addEventListener("DOMContentLoaded", function () {
  //get all forms
  const forms = document.getElementsByTagName("form")
  //add listener to trigger when submitted
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      //stop reloading behaviour
      event.preventDefault()
    }, false)
  })

})

