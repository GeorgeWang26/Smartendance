setInterval(() => {
    $.ajax({
        url: "/checkStatus",
        type: "GET",
        success: function(data) {
            if (data.status == true) {
                console.log("logged in");
                // user is logged in
                var path = window.location.pathname
                if (path == undefined || path == "/signup" || path == "/login") {
                    window.location.pathname = "/userhome";
                }
            } else {
                if (path != undefined  && path != "/signup" && path != "/login") {
                    window.location.pathname = "/userhome";
                }
                // user is logged out
                // redirect to /login
            }
        }
      });
}, 1000);