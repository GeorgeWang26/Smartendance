function displayAuthenticationStatus() {
    let formStatus = document.querySelector('.form-status')
    if(data.result == "success") {
        location.href = "/userhome"
    } else {
        formStatus.style.display = "block"
        formStatus.textContent = data.result
    }
}