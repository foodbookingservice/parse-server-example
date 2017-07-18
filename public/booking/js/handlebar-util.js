// 
Handlebars.registerHelper("formatDate", function(dateObj) {
	if (dateObj != null) {
		var d = new Date(dateObj);
		var minString = d.getMinutes();
		if (minString == "0") minString = "00";
		
		return (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + minString;
	} else {
		return "";	
	}	 
});

// 
Handlebars.registerHelper("plus1", function(idx) {
	return idx + 1;	 
});


Handlebars.registerHelper("prepareCheckbox", function(food) {
	
    var checkbox = $("#" + food.objectId);
    console.log("checkbox:" + checkbox);
    checkbox.attr('disabled','disabled');
    /*
    checkbox.switchButton({
        labels_placement: "right",
        checked: food.online
    });
      */      
	//return  checkbox;           
            
});

