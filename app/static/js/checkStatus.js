setInterval(() => {
    $.ajax({
        url: "/checkStatus",
        type: "GET",
        success: function(data) {
            if(data.status == true){
                console.log("logged in");
                // user is logged in
                // do nothing here
            }else{
                window.location.pathname = '/login';
                // user is logged out
                // redirect to /login
            }
        }
      });
}, 1000);