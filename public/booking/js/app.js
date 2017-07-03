function checkIfUserLoggedIn() {
	var currentUser = Parse.User.current();

	if (currentUser == null) {
	    console.log("user2 = null");
	    alert("請登入");
	    window.open("login.html", "_parent", "", true);
	
	} else {
	    currentUser.fetch({
	        success: function (user) {
	            currentUser = user;
	            console.log("user id = " + user.id);
	            var isQualify = currentUser.get("qualify");
	
	            if (!isQualify) {
	                Parse.User.logOut().then(() => {
	                    console.log("logOut");
	                    var currentUser = Parse.User.current();  // this will now be null
	                    window.open("login.html", "_parent", "", true);
	                });
	            }
	
	        }, error: function (e) {
	            console.log("e = " + e);
	        }
	    });
	}
}

function loadTimeSlot() {
	Parse.Cloud.run("loadTimeSlotOptions", 
		{	
			
		}, 
		{
		success: function(slotsFound){
			var template = Handlebars.compile( $("#timeSlot-template").html() );
			var data = [];
			slotsFound.forEach(function(slot, idx) {
				data.push( JSON.stringify(slot) );
			});
			
			$("#select-timeslot").html( data );
		},
	 	error: function(error) {
	 		console.log("error:" + error.message);
		}
	});
}

var parseLogOut = function () {

    Parse.User.logOut().then(() => {
        console.log("logOut");
        var currentUser = Parse.User.current();  // this will now be null
        window.open("login.html", "_parent", "", true);
    });

}