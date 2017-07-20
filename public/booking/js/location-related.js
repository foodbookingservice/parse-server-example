

//新增送餐地點表單送出
$(document).on("click", "#submitLocation", function(event) {
	$('#createLocation').form('submit',{
   	 	onSubmit:function() {
    		var result =  $(this).form('enableValidation').form('validate');
    		if (result) {
    			$('#create_loading').css("display", "block");
    			commit_backend_create();
    		}
    		return result;
    	}
	});
});



function init_datagrid() {
	var dg = $('#dg').datagrid({
        pagination: false,
        remoteFilter: true,
        rownumbers: true,
        striped: true,
        multiSort:true,
        columns:[[
                  {field:'objectId',title:'ID',width:80, hidden:true},
                  {field:'address',title:'送餐地點',halign:'center',width:250,sortable:'true',
                  		editor:{type:'validatebox',
		            			options:{required: true}
		            		}
		            },
	              {field:'action',title:'Action',width:130,align:'center',
	                        formatter:function(value,row,index){
	                            if (row.editing){
	                                var s = '<a href="javascript:void(0)" onclick="saverow(this)">Save</a> | ';
	                                var c = '<a href="javascript:void(0)" onclick="cancelrow(this)">Cancel</a>';
	                                var an = '<div id=loading_' + index + ' style=display:none><image src=ajax-loader.gif></div>';
	                                
	                                return s+c+an;
	                            } else {
	                                var e = '<a href="javascript:void(0)" onclick="editrow(this)">Edit</a> | ';
	                                var d = '<a href="javascript:void(0)" onclick="deleterow(this,\'' + row["objectId"] + '\')">Delete</a>';
	                                return e+d;
	                            }
	                        }
	                    }
              ]],
          onBeforeEdit:function(index,row){
          		row.editing = true;
          		$(this).datagrid('refreshRow', index);
          },
          onAfterEdit:function(index,row){
          		var obj = $(this);
          		commit_backend_update(obj, index, row);
          },
          onCancelEdit:function(index,row){
          		row.editing = false;
          		$(this).datagrid('refreshRow', index);
          }
    });
	 
	loadData();
}


/////
//datagrid row editing-related function
function getRowIndex(target){
    var tr = $(target).closest('tr.datagrid-row');
    return parseInt(tr.attr('datagrid-row-index'));
}
function editrow(target){
    $('#dg').datagrid('beginEdit', getRowIndex(target));
}
function deleterow(target, objectId){
    $.messager.confirm('Confirm','Are you sure?', function(r){
    	if (r){
            $('#dg').datagrid('deleteRow', getRowIndex(target));
            commit_backend_delete(objectId);
        }
    });
}
function saverow(target){
	var idx = getRowIndex(target);
	$('#dg').datagrid('endEdit', idx);
	$('#loading_'+idx).css("display","block");
	
}
function cancelrow(target){
    $('#dg').datagrid('cancelEdit', getRowIndex(target));
}


////

function calculateSinceMidnight(interval) {
	var data = interval.split(":");
	var hour = data[0];
	var minutes = data[1];
	return eval(data[0]) * 60 + eval(minutes);
}


//// backend transaction /////

var objectLocation = "/classes/HBUserAddressBook";

// 撈資料
function loadData() {
	$.ajax({
        url: curlURL + objectLocation,
        headers: jsonDic
    }).then(function(queryResult) {
       $('#dg').datagrid('loadData', queryResult.results);
    }); 	
}

//新增資料
function commit_backend_create(){
	var address = $("#delivery-location").val();
	var dataString = '{ "address" : "' + address + '"}';
	
	$.ajax({
		type: 'POST',
        url: curlURL + objectLocation,
        headers:  jsonDic,
        processData: false,
        data: dataString
    }).then(function(queryResult) {
    	
	   	show_message();
    	$('#create_loading').css("display","none");
       	loadData();
    });
	
}

//更新資料
function commit_backend_update(obj, index, row)  {
	$.ajax({
		type: 'PUT',
        url: curlURL + objectLocation + "/" + row["objectId"],
        headers:  jsonDic,
        processData: false,
        data: '{ "address" : "' + row["address"] + '"}'
    }).then(function(queryResult) {
    	row.editing = false;
       	loadData();
	   	show_message();
    });
}


function commit_backend_delete(objectId)  {
	
	$.ajax({
		type: 'DELETE',
        url: curlURL + objectLocation + "/" + objectId,
        headers:  jsonDic,
        processData: false
    }).then(function(queryResult) {
    	loadData();
	   	show_message();
    });
    
}
