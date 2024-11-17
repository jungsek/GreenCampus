
const navSearchBarForm = document.getElementById("nav-search-bar-form")
const navSearchBarDiv = document.getElementById("nav-search-bar")
const navSearchBar = document.querySelector("#nav-search-bar input")

async function loadNavBar(){
    //check if the user is logged in, if they are, display profile icon, else display login button (by triggering logout)
    const loggedIn = await isLoggedIn()
    if (loggedIn){
        document.getElementById("profile").style.display = "block";
        document.getElementById("login").style.display = "none";
        document.getElementById("nav-profile-img").src = "./assets/profile/default-profile-picture.jpg";
        console.log("AccessToken:", accessToken);
        console.log("LoggedIn:", loggedIn);

    }else{
        logout(false)
    }
}

function searchBar(){
    for (const x of document.getElementsByClassName("search-bar-hide")){
        x.style.display = "none"
    }
    //show the search bar
    navSearchBarForm.style.display = "flex"
    //trigger the animation
    navSearchBarDiv.classList.add("active")
    navSearchBar.focus()

}

function hideSearchBar(){
    //hide the search bar
    navSearchBarForm.style.display = "none"
    //remove the class (so it can be triggered again)
    navSearchBarDiv.classList.remove("active")
    //also clear the text
    navSearchBar.value = ""
    //note: only 1 li element uses flex, but its fine to force display to flex instead of block since its just text
    for (const x of document.getElementsByClassName("search-bar-hide")){
        x.style.display = "flex"
    }
}


loadNavBar()



async function goToProfile(){
    //get user id
    const userID = (await (await get("/users/decodejwt")).json()).userId
    location.href = `../profile.html?user=${userID}`
}

function logout(redirect=true){
    //show login button and hide profile icon
    document.getElementById("login").style.display = "block"
    document.getElementById("profile").style.display = "none" 
    //remove access token 
    localStorage.removeItem("accessToken")
    sessionStorage.removeItem("accessToken")
    //remove role
    localStorage.removeItem("role")
    sessionStorage.removeItem("role")
    if (redirect) window.location.href = "../login.html"

}

//add listener to trigger when submitted
document.getElementById("nav-search-bar-form").addEventListener('submit', event => {
    //stop reloading behaviour
    event.preventDefault()
    //redirect to search page with query
    window.location.href = `../search.html?q=${navSearchBar.value}`
    return false
})
    
  