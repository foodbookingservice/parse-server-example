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
			$("#select-timeslot").html("");
			
			var template = Handlebars.compile( $("#timeSlot-template").html() );
			var data = [];
			slotsFound.forEach(function(slot, idx) {
				data.push( slot.toJSON() );
			});
			
			$("#select-timeslot").html( template(data) );
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


format = function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };

    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
    });

    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString().slice(-v.length);
    });
};

$(document).on("click", "#search", function(event) {
	//
	var tmpDate = format(new Date(), 'yyyy-MM-dd');
    var dateFrom = new Date(tmpDate);
    var dateTo = new Date(tmpDate);

	// 日期選項
    var slectVal = $("#select-day").val();
    if (slectVal === "today") {
        dateTo.setDate(dateTo.getDate() + 1);
    } else if (slectVal === "yestday") {
        dateFrom.setDate(dateFrom.getDate() - 1);
        dateTo.setDate(dateFrom.getDate() + 1);
    } else if (slectVal === "tomorrow") {
        dateFrom.setDate(dateFrom.getDate() + 1);
        dateTo.setDate(dateFrom.getDate() + 1);
    }
    
    // 時段選項
    var selectedTimeSlot = $("#select-timeslot").val();
    var queryResult = searchOrder(dateFrom, dateTo, selectedTimeSlot);
    
});

// 格式化訂單送出時間
Handlebars.registerHelper("formatDate", function(dateObj) {
	if (dateObj != null) {
		var d = new Date(dateObj.iso);
		var minString = d.getMinutes();
		if (minString == "0") minString = "00";
		
		return (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + minString;
	} else {
		return "";	
	}	 
});

// 格式化訂單送出時間
Handlebars.registerHelper("plus1", function(idx) {
	return idx + 1;	 
});


var searchOrder = function (dateFrom, dateTo, timeSlot) {
	    $("#orderTableBody tr").remove();
	    var HBShoppingCart = Parse.Object.extend("HBShoppingCart");
	    var query = new Parse.Query(HBShoppingCart);
	    query.exists('submittedDate');
		
	    query.greaterThan("ETA", dateFrom);
	    query.lessThan("ETA", dateTo);
	    //if (request.params.timeSlot != "all") {
	    if (timeSlot != "all") {
	    	query.equalTo("timeSlot", timeSlot);
	    }
	    query.ascending("ETA");
	    query.find({
	        success: function (carts) {
	        	var cartDictionary = {};
	        	var cartArray = [];
	        	carts.forEach(function(cart, idx) {
	        		var dummyCart = Parse.Object.extend("HBShoppingCart").createWithoutData(cart.id);
    				cartArray.push(dummyCart);
    				cartDictionary[cart.id] = { cartObj : cart.toJSON(), 
    										   itemsInCart : [] 
    										   };
	        	});
	        	
	        	var HBShoppingItem = Parse.Object.extend("HBShoppingItem");
			    var queryItem = new Parse.Query(HBShoppingItem);
			    queryItem.containedIn("shoppingCart", cartArray);
			    queryItem.include("meal");
			    queryItem.find({
			        success: function (itemsFound) {
			        	var itemsDictionary = {};
			        	itemsFound.forEach(function(item, idx) {
							var tempCart = cartDictionary[item.get("shoppingCart").id];
							tempCart.itemsInCart.push(item.toJSON());
							
														 
							var tempItem = itemsDictionary[item.get("meal").id];
							if (!tempItem) {
								itemValue = {itemName: item.get("meal").get("mealName"),
											sumOfItem : item.get("qty")
														 };
								itemsDictionary[item.get("meal").id] = itemValue;
							} else {
								tempItem.sumOfItem = tempItem.sumOfItem + item.get("qty");
							}
						});
			        	
			        	
			        	$("#orderTableBody").html("");
			        	var template = Handlebars.compile( $("#summaryByBuyer-template").html() );
						$("#orderTableBody").html( template(cartDictionary) );
						
			        	$("#foodCollection").html("");
			        	var template = Handlebars.compile( $("#foodCollection-template").html() );
						$("#foodCollection").html( template(itemsDictionary) );
						
			        	
			
			        }, error: function (e) {
			            console.log(e);
			        }
			
			    });
			    
	        }, error: function (e) {
	            console.log(e);
	        }
	
	    });
	
	};
	
	
function printResult() {
	printDiv('printArea');
}	

function printDiv(divName) {
     var printContents = document.getElementById(divName).innerHTML;
     var originalContents = document.body.innerHTML;

     document.body.innerHTML = printContents;

     window.print();

     document.body.innerHTML = originalContents;
}