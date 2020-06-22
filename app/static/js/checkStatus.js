setInterval(() => {
    $.ajax({
        url: "/checkStatus",
        type: "GET",
        success: function(data) {
            var path = window.location.pathname
            if (data.status == true) {
                console.log("logged in");
                if (path == "/" || path == "/signup" || path == "/login") {
                    window.location.pathname = "/userhome";
                }

            } else {
                console.log("loged out")
                if (path != "/"  && path != "/signup" && path != "/login") {
                    window.location.pathname = "/login";
                }

            }
        }
      });
}, 5000);