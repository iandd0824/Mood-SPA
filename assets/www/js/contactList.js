

function loadContact() {
	contactList.initial();
}


function contactGenerator(db) {

	this.initial = function() {

		var sel_id = ['distraction_1_name', 'distraction_1_tel', 'distraction_2_name', 'distraction_2_tel',
									'ask_1_name', 'ask_1_phone', 'ask_2_name', 'ask_2_phone', 'ask_3_name', 'ask_3_phone',
									'agencies_1_name', 'agencies_1_phone', 'agencies_2_name', 'agencies_2_phone',
									'agencies_3_name', 'agencies_3_phone'];

		db.transaction(queryMood, errorCB, successCB);

    function queryMood(tx) {

      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['distraction_1%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['distraction_2%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['ask_1%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['ask_2%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['ask_3%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['agencies_1%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['agencies_2%'], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE id LIKE ?" , ['agencies_3%'], dataSuccess, errorCB);

    }

    function dataSuccess(tx, results) {                     

      var len = results.rows.length;

      if(len > 0) {

      	var contactName;
      	
      	for (var i = 0; i < len; i++) {

      		var splitID = results.rows.item(i).id.split("_");
      		
      		var value = results.rows.item(i).value;
      		
      		if(splitID[2] == 'name') {
      			contactName = value;
      		}
      		else if((splitID[2] == 'phone')&&(value != '')&&(value != null)) {

      			var idType = splitID[0] + '_' + splitID[1] + '_';

      			$('#call_' + idType + 'phone').attr('href', 'tel:'+value);
      			$('#call_' + idType + 'name').html(contactName); 

      			$('#call_' + idType + 'icon').removeClass('add'); 
            
            if(idType != 'agencies_3_') 
      			 $('#call_' + idType + 'icon').addClass('user'); 
      			else
             $('#call_' + idType + 'icon').addClass('phone');  		
      		}

      	}

      }

     }

	};	
}