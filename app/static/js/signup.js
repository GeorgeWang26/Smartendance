function addNewUser() {
    let formStatus = document.querySelector('.form-status')
    let username = document.querySelector('#usernameInput').value
    let email = document.querySelector('#emailInput').value
    let password = document.querySelector('#passwordInput').value

    // string restriction

    if(username == "") {
        formStatus.style.display = "block"
        formStatus.textContent = "Username is empty!"

    } else if (email == "") {
        formStatus.style.display = "block"
        formStatus.textContent = "Email is empty!"

    } else if (password == "") {
        formStatus.style.display = "block"
        formStatus.textContent = "Password is empty!"

    } else if(username.includes("@")) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot include @"

    } else if (username.includes("_")) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot include _"

    } else if (username.includes(" ")) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot include space"

    } else if (email.includes("@") == false) {
        formStatus.style.display = "block"
        formStatus.textContent = "Email not valid"

    } else if (email.includes(" ")) {
        formStatus.style.display = "block"
        formStatus.textContent = "Email cannot include space"

    } else if (password.includes(" ")) {
        formStatus.style.display = "block"
        formStatus.textContent = "Password cannot include space"

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