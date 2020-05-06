function displayAuthenticationStatus() {
    console.log("hello");
    let formStatus = document.querySelector('.form-status')
    let username = document.querySelector('#usernameInput').value
    if(username.includes('@')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain @"
    } else if (username.includes('_')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Username cannot contain _"
    } else if ($("#emailInput").contains("@") == false) {
        formStatus.style.display = "block"
        formStatus.textContent = "Email not valid"
    } else {

        console.log($("#emailInput") + "  includes " + $("#emailInput").includes("@") + "    contains " + $("#emailInput").contains("@"));

        $.ajax({
            url: "/newUser",
            data: {
                username: $("#usernameInput"),
                email: $("#emailInput"),
                password: $("#passwordInput")
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