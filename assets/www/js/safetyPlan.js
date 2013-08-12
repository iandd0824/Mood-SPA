function planLoader(what) {

  plan_page_number = $('#'+what.id).attr('plan-page');

  safetyPlan.loadPlan(plan_page_number);

  safetyPlan.changeTrigger(plan_page_number);

}


function planGenerator(db) {
  
  this.initial = function() {

    var idList = new Array({ page: 0, data: 'age_type' }, 
                           { page: 1, data: 'warning_1' }, { page: 1, data: 'warning_2' }, 
                           { page: 1, data: 'warning_3' }, 
                           { page: 2, data: 'coping_1' }, { page: 2, data: 'coping_2' }, 
                           { page: 2, data: 'coping_3' },
                           { page: 3, data: 'distraction_1_name' }, { page: 3, data: 'distraction_1_phone' },
                           { page: 3, data: 'distraction_2_name' }, { page: 3, data: 'distraction_2_phone' },
                           { page: 3, data: 'distraction_1_place' }, { page:3, data: 'distraction_2_place' },
                           { page: 4, data: 'ask_1_name' }, { page: 4, data: 'ask_1_phone' },
                           { page: 4, data: 'ask_2_name' }, { page: 4, data: 'ask_2_phone' },
                           { page: 4, data: 'ask_3_name' }, { page: 4, data: 'ask_3_phone' },
                           { page: 5, data: 'agencies_1_name' }, { page:5,data:'agencies_1_phone' },
                           { page: 5, data: 'agencies_1_contact' }, { page: 5, data: 'agencies_2_name' },
                           { page: 5, data: 'agencies_2_phone' }, { page: 5, data: 'agencies_2_contact' },
                           { page: 5, data: 'agencies_3_name' }, { page: 5, data: 'agencies_3_phone' },
                           { page: 5, data: 'agencies_3_address' },
                           { page: 6, data: 'env_1' }, { page: 6,data: 'env_2' },
                           { page: 7, data: 'important_thing' });

    db.transaction(populateDB, errorCB, successCB);

    function populateDB(tx) {
      //tx.executeSql('DROP TABLE IF EXISTS safety_plan');
      tx.executeSql('CREATE TABLE IF NOT EXISTS safety_plan (page, id, value)');
      tx.executeSql("SELECT * FROM safety_plan", [], dataSuccess, errorCB);
      tx.executeSql("SELECT * FROM safety_plan WHERE value != ''", [], checkFirstTime, errorCB);
    }

    function dataSuccess(tx, results) {                     

      if(results.rows.length == 0) {

        db.transaction(dataInsert, errorCB, successCB);

        function dataInsert(tx) {

          for (var i = 0; i < idList.length; i++) {
            tx.executeSql("INSERT INTO safety_plan (page, id) VALUES (" + idList[i].page + ", '" + idList[i].data + "')");
          }

        }
      }

    }

    function checkFirstTime(tx, results) {  

      if(results.rows.length != 0) {

        firstTime_plan = false;
        
        $(document).ready(function(){
          //if($('.footer-plan .footer_plan_save').length == 0) 
          //  $('.footer-plan').append('<a href="#plan_list" class="icon check">Save</a>');
        });
      
      }

    }

  };

  this.loadPlan = function(page) {

    db.transaction(populateDB, errorCB, successCB);

    function populateDB(tx) {
      tx.executeSql("SELECT * FROM safety_plan WHERE page = "+ page , [], querySuccess, errorCB);
    }

    function querySuccess(tx, results) {

      var len = results.rows.length;

      if(len > 0) {

        for (var i = 0; i < len; i++) {

          $('#'+results.rows.item(i).id).val(results.rows.item(i).value);

          if (page == '0') 
            $('#plan_0_'+results.rows.item(i).value).addClass('green'); 
        
        }

      }

      

      
      
    }

  };

  this.changeTrigger = function(page) {

    db.transaction(sqlSavePlan, errorCB, successCB);
    
    function sqlSavePlan(tx) {
      tx.executeSql("SELECT * FROM safety_plan WHERE page = " + page , [], querySuccess, errorCB);
    }

    function querySuccess(tx, results) {

      var len = results.rows.length;

      db.transaction(dataInsert, errorCB, successCB);

      function dataInsert(tx) {

        for (var i = 0; i < len; i++) {

          $('#'+results.rows.item(i).id).bind('keyup', function(){

            if($('#safety_footer_'+page+' .safety-footer-save').length == 0) {

              var prev = parseInt(page) - 1;
              var next = parseInt(page) + 1;

              var footer_content = '<a href="#plan_list" class="icon stack column4">Safety Plan</a>';
                  footer_content +='<a href="#plan_'+prev+'" class="icon left column4">Prev.</a>';

              if(page != 7) {
                  footer_content +='<a href="#plan_'+next+'" class="icon right column4">Next</a>';
              }
              
                  footer_content +='<a class="safety-footer-save column4 icon check">Save</a>';

              $('#safety_footer_'+page).html(footer_content);

              $('.safety-footer-save').click(function(){

                var footer_content = '<a href="#plan_list" class="icon stack column3">Safety Plan</a>';
                    footer_content +='<a href="#plan_'+prev+'" class="icon left column3">Prev.</a>';
                    footer_content +='<a href="#plan_'+next+'" class="icon right column3">Next</a>';

                $('#safety_footer_'+page).html(footer_content);

                safetyPlan.savePlan(page); 

              });
            
            }
          
          });
        }

      }
      
    }

  };

  this.savePlan =  function(page) {

    db.transaction(sqlSavePlan, errorCB, successCB);
    
    function sqlSavePlan(tx) {
      tx.executeSql("SELECT * FROM safety_plan WHERE page = " + page , [], querySuccess, errorCB);
    }

    function querySuccess(tx, results) {

      var len = results.rows.length;

      db.transaction(dataInsert, errorCB, successCB);

      function dataInsert(tx) {

        for (var i = 0; i < len; i++) {

          var planValue = $('#'+results.rows.item(i).id).val();

          tx.executeSql("UPDATE safety_plan SET `value` =  ? WHERE  `id` = '" + results.rows.item(i).id + "'", [planValue]);

        }

      }
      
    }

  };

}