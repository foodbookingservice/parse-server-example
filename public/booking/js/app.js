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

function prepareDatePicker() {
	$("#date-start" ).datepicker();
	$("#date-end" ).datepicker();	
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
	
	if ($('input[name=queryDateType]:checked').val() == "shortcut") {
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
	} else {
		dateFrom = new Date($("#date-start").val());
    	dateTo = new Date($("#date-end").val());
    	dateTo.setDate(dateTo.getDate() + 1);
	}
	
	dateFrom.setHours(dateFrom.getHours() + 8);
    dateTo.setHours(dateTo.getHours() + 8);
	
    // 時段選項
    var selectedTimeSlot = $("#select-timeslot").val();
    var queryResult = searchOrder(dateFrom, dateTo, selectedTimeSlot);
    
});




var searchOrder = function (dateFrom, dateTo, timeSlot) {
	Parse.Cloud.run("queryOrder", 
		{	
			dateFrom: dateFrom,
			dateTo: dateTo,
			timeSlot: timeSlot
		}, 
		{
		success: function(results){
			var itemsFound = results[0];
			var cartDictionary = results[1];
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
		},
	 	error: function(error) {
	 		console.log("error:" + error.message);
		}
	});
}; //~end searchOrder
	
	
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


function loadMeals() {
	
	Parse.Cloud.run("getMealsOfFoodStore", 
		{	
			displayAll: true,
			storeId: "R0YAD62ROf"
		}, 
		{
		success: function(foodFound){
			var foods = [];
        	foodFound.forEach(function(food, idx) {
				foods.push(food.toJSON());
			});
        	
        	$("#mealTableBody").html("");
        	var template = Handlebars.compile( $("#mealCollection-template").html() );
			$("#mealTableBody").html( template(foods) );
		},
	 	error: function(error) {
	 		console.log("error:" + error.message);
		}
	});
}


function openModal(obj) {
	console.log($(obj).attr('objId'))	;
	
	$("#foodNameUpdate").val($(obj).attr('food-name'));
	$("#priceUpdate").val($(obj).attr('price'));
	$("#briefUpdate").val($(obj).attr('brief'));
	$("#foodIdUpdate").val($(obj).attr('objectid'));
	
	if ($(obj).attr('online') == "true") {
		$("#onlineUpdate").attr("checked", "checked");
	}
	
	$("#editModal").modal();
}


$(document).on("click", "#saveFood", function(event) {
	//
	var foodId = $("#foodIdUpdate").val();
    var foodName = $("#foodNameUpdate").val();
    var foodPrice = $("#priceUpdate").val();
    var foodBrief = $("#briefUpdate").val();
    var foodOnline = ($('#onlineUpdate').is(":checked"));
    
    Parse.Cloud.run("updateFood", 
		{	
			foodId: foodId,
			foodName: foodName,
			foodPrice: foodPrice,
			foodBrief: foodBrief,
			foodOnline: foodOnline
		}, 
		{
		success: function(foodFound){
			$("#editModal").modal("hide");
			loadMeals();
		},
	 	error: function(error) {
	 		console.log("error:" + error.message);
		}
	});
	
});
