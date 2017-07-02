var prop = require("./app_properties.js");
var _ = require("underscore");
/*
Parse.Cloud.afterSave("setCheckoutTime", function(request) {
	var query = new Parse.Query("HBShoppingCart");
	query.get(request.params.cartId, {
	  	success: function(cartFound) {
	  		cartFound.set("checkoutLimit", request.params.checkoutAfter);
	  		var current = new Date();
			cartFound.set("checkoutLimitDate", eval(request.params.shippingFee));
 		    cartFound.set("lineModeEnable", true);
 		    cartFound.save()
			response.success(cartFound.get("checkoutLimitDate"));				
	 	},
	  	error: function(object, err) {
	    	console.error("setCheckoutTime failed" + err.code + "," + err.message);
			response.error("ShoppingCart failed." + err.code + "," + err.message);
	  	}
	});	
});
*/

// Installation
Parse.Cloud.beforeSave(Parse.Installation, function(request, response) {
	request.object.set("pushId", request.object.get("installationId"));
	response.success();
});


var mailFrom = "app@hungrybee.net";
var mailToAllMembers = "info@hungrybee.net";
var mailCC = "avery.hou@gmail.com";

//[外送小蜜蜂] 送出預約單
var mail = require("./mail_service.js");
Parse.Cloud.afterSave("HBTrainingBooking", function(request) {
	
	if (request.object.get("bookingSubmitted")) {  
		
		var queryUser = new Parse.Query(Parse.User)
		queryUser.get(request.object.get("user").id, {
			success: function(userFound) {
	    		
				var query = new Parse.Query("HBLob");
				query.equalTo("owner", userFound);
				query.containedIn("category", ["person", "motor", "drive_license", "permit_license_front", "permit_license_rear"]);
				query.find({
					success: function(results) {
						
						var htmlBody = "申請人:" + userFound.get("contact");
						htmlBody += "<BR>聯絡電話:" + userFound.get("phone");
						htmlBody += "<BR>email:" + userFound.getEmail();
						htmlBody += "<BR>車牌號碼:" + userFound.get("licenseNo");
						htmlBody += "<table border=1>";
						
						for(var i=0 ; i<results.length ; i++) {
							var onerow = results[i];
							var category = onerow.get("category");
							var urlLink = onerow.get("data").url();
							if (category == "person") {
								htmlBody += "<tr><td width=10%>大頭照</td><td>" + urlLink + "</td></tr>";
							}
							if (category == "motor") {
								htmlBody += "<tr><td>機車照片</td><td>" + urlLink + "</td></tr>";
							}
							if (category == "drive_license") {
								htmlBody += "<tr><td>機車駕照</td><td>" + urlLink + "</td></tr>";
							}
							if (category == "permit_license_front") {
								htmlBody += "<tr><td>行照正面</td><td>" + urlLink + "</td></tr>";
							}
							if (category == "permit_license_rear") {
								htmlBody += "<tr><td>行照反面</td><td>" + urlLink + "</td></tr>";
							}	
						}
						htmlBody += "</table>";
						console.log("htmlbody:" + htmlBody);
						
						var subject = "[小蜜蜂申請單]申請人:" + userFound.get("contact") + "(" + userFound.get("phone") + ")";
					  		
						mail.send_notify(prop.mail_cc(), prop.mail_cc(), subject, htmlBody);
						
						
					},
					error: function(err) {
						console.error("afterSave HBTrainingBooking failed" + JSON.stringify(err));
				  	  	mail.send_error(mail.subject("afterSave HBTrainingBooking", "hblob query failed"), err);
					}
				});
	    	},
	    	error: function(err) {
	    		console.error("afterSave user lookup failed" + JSON.stringify(err));
				mail.send_error(mail.subject("afterSave HBTrainingBooking", "user lookup failed"), err);
	      	}	
			
		});
	}
});

//送出購物車
Parse.Cloud.afterSave("HBShoppingCart", function(request, response) {
	
	console.log("============= db_trigger.js afterSave HBShoppingCart =============");
	console.log("status:" + request.object.get("status"));
	console.log("qrcode:" + (request.object.get("qrcode") !=null));
	console.log("bee is undefined:" + ( (typeof request.object.get("bee")) === 'undefined'));
	
	if (request.object.get("status") == "preparing" && 
		request.object.get("bidCount") == '1') {
		var currentTime1 = new Date();							  
		var currentTime2 = new Date();
	    currentTime2.setHours ( currentTime1.getHours() + 8 );
		var printMsg = currentTime2.getFullYear() + "/" + (currentTime2.getMonth() + 1) + "/" + currentTime2.getDate() + " " + 
	    				currentTime2.getHours() + ":" + currentTime2.getMinutes() + ":" + currentTime2.getSeconds();
		var etd = request.object.get("ETD");
		var eta = request.object.get("ETA");
		
		var minutesString = eta.getMinutes();
		if (minutesString == "0") minutesString = "00";
		
		var body = "<Html><body>訂單產生時間: " + printMsg + "<BR>";
		body += "訂單金額: $" + request.object.get("totalPrice") + "<BR><BR>";
		body += "送餐時段: " + (eta.getMonth() + 1) + "/" + eta.getDate() + " " + (eta.getHours()+8) + ":" + minutesString + "<BR>";
		body += "<h1><a href='" + prop.order_url() + "'>查詢訂單</a></h1>";
		body += "</body></html>";
		
	  	var subject = "有一筆新訂單產生，訂單編號 " + request.object.id;
	  	mail.send_notify(prop.admin_mail(), "", subject, body);
    	
		
	} else if (request.object.get("status") == "ongoing" && request.object.get("deliveryOrder") && (request.object.get("bee") != null)) {
		
	}
	console.log("============= END db_trigger.js afterSave HBShoppingCart =============");
});

