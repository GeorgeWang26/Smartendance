function displayAuthenticationStatus() {
    let formStatus = document.querySelector('.form-status')
    let username = document.querySelector('#usernameInput').value
    let email = document.querySelector('#emailInput').value
    let password = document.querySelector('#passwordInput').value

    if(username.includes('@')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain @"
    } else if (username.includes('_')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain _"
    } else if (email.includes("@") == false) {
        formStatus.style.display = "block"
        formStatus.textContent = "Email not valid"
    } else {

        $.ajax({
            url: "/newUser",
            data: {
                username: username,
                email: email,
                password: password
            },
            dataType: "JSON",
            type: "POST",
            success: function(data){
                if(data.result == "success") {
                    window.location.pathname = "/login";
                } else {
                    formStatus.style.display = "block"
                    formStatus.textContent = data.result
                }
            }
        });

    }
}