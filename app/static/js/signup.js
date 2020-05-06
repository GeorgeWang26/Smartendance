function displayAuthenticationStatus() {
    console.log('hello')
    let formStatus = document.querySelector('.form-status')
    let username = document.querySelector('#usernameInput').value
    if(username.includes('@')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain @"
    } else if (username.includes('_')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain _"
    } else {

        //Ajax request here 

        if(data.result == "success") {
            location.href = "/login"
        } else {
            formStatus.style.display = "block"
            formStatus.textContent = data.result
        }
    }
}