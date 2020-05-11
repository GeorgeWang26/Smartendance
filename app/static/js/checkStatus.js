setInterval(() => {
    $.ajax({
        url: "/checkStatus",
        type: "GET",
        success: function(data) {
            if (data.status == true) {
                console.log("logged in");
                // user is logged in
                var path = window.location.pathname
                if (path == "/" || path == "/signup" || path == "/login") {
                    window.location.pathname = "/userhome";
                }
            } else {
                if (path != "/"  && path != "/signup" && path != "/login") {
                    window.location.pathname = "/login";
                }
                // user is logged out
                // redirect to /login
            }
        }
      });
}, 1000);