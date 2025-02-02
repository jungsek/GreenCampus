const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const rememberInput = document.getElementById("remember-me")
const errorMsg = document.getElementById("error-msg")

emailInput.addEventListener("input", inputChanged)
passwordInput.addEventListener("input", inputChanged)

//redirect to home if user is already logged in
guardAlreadyLoginPage()
//hide the error message when the input field is changed
function inputChanged(e){
    errorMsg.style.display = "none"
}

async function login(){
  const response = await post(`/users/login`,{email:emailInput.value, password: passwordInput.value})
  if (response.status == 404){
      passwordInput.value = ""
      errorMsg.style.display = "block"
      return
  }
  
  const token = await response.json();
  const accessToken = token.accessToken;
  const role = token.role

  // Store tokens based on remember me setting
  if (rememberInput.checked) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('role', role);
  } else {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('role', role);
  }
    
  // Role-based redirect
  if (role === 'student') {
      window.location.href = "../studentcampaign.html";
  } else {
      window.location.href = "../dashboard.html";
  }
}
