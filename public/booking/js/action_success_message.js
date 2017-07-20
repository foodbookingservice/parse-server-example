function show_message() {
		/*
  		$.messager.show({
            title:'Remind',
            msg:'action successfully executed',
            showType:'slide',
            timeout:1500,
            style:{
                right:'',
                top:document.body.scrollTop+document.documentElement.scrollTop,
                bottom:''
            }
        });
  		*/
	
		$.messager.show({
	        title:'Action Result',
	        msg:'action successfully executed',
	        timeout:1500,
	        showType:'slide'
	    });
  	}