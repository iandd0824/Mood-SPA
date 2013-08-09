
var mood_no_q = 'none';
var mood_status = 'add';
var mood_load_id = 0;
var mood_last_id = 0;
var mood_first_id = 0;

var moodList;

function moodLoadList(what) {
  $.ui.slideSideMenu = false;
  moodTracker.loadList();
}

function loadMoodView() { $.ui.slideSideMenu = false; moodTracker.loadMood('view'); }

function loadMoodNew() { 
  $.ui.slideSideMenu = false;
  $('#emoji_value').val("none"); 
  moodTracker.loadQuestion(); 
}

function loadMoodEdit() { $.ui.slideSideMenu = false; moodTracker.loadMood('edit'); }

function loadMood() {

  if(mood_status == 'edit')
    moodTracker.loadMood(mood_status);
  else if(mood_status == 'view')
    moodTracker.loadMood(mood_status);
  else 
    moodTracker.loadQuestion();

}

function unloadMood() {
  $('.edit-emoji').removeClass('moji-press'); 
  $('.emoji').removeClass('moji-press'); 
}

function trackerGenerator(db) {

  this.questionList = new Array("I hope ",
                                "I will ",
                                "I am happy when ",
                                "I am comfortable when ",
                                "I am confident when ");
  
  this.initial = function() {

    for (var i = 0; i < this.questionList.length; i++) {
      $('#mood_list .list').append('<li><a class="mood_question" no-q="'+i+'">'+this.questionList[i]+'...</a></li>');
    }

    $('#mood_list .list').append('<li><a href="#mood_new" class="mood_question" no-q="c">Blank note</a></li>');

    db.transaction(initDB, errorCB, successCB);

    function initDB(tx) {
      //tx.executeSql('DROP TABLE IF EXISTS mood_tracker');
      tx.executeSql('CREATE TABLE IF NOT EXISTS mood_tracker (\'_id\' INTEGER PRIMARY KEY AUTOINCREMENT, content text, created_time VARCHAR(22), face VARCHAR(5), mood VARCHAR(5))');

    }

    // Mood new note - sample note list

    $('.mood_question').click(function(){

      mood_no_q = $(this).attr('no-q');
      mood_status = 'add';

      $.ui.loadContent("#mood_new",false,false,"slide"); 

    });

    // Mood new note - save content

    $('#foot_mood_new_save').bind('click', function(event) {

      if($('#emoji_value').val() == "none") {
        alert("Please select a face for this note.");
        return 0;
      }

      mood_no_q = 'none';

      moodTracker.saveNote($('.mood_new_content').val(), $('#emoji_value').val());

    });

    $('#foot_mood_edit_save').bind('click', function(event) {

      mood_no_q = 'none';

      moodTracker.updateNote($('.mood_edit_content').val(), $('#edit_emoji_value').val());

    });

    // Mood new note - emoji selector

    $('.emoji').bind('click', function(event) { 

      var thisID = $(this).attr('id');
      var compID;
      
      for(var i = 0; i < 6; i++) {

        compID = 'emoji_' + i.toString();

        if(thisID == compID) {
          $('#'+compID).addClass('moji-press'); 
          $('#emoji_value').val(i);
        }
        else 
          $('#'+compID).removeClass('moji-press'); 
      }

    });

    // Mood new note - dynamic text area

    $('#mood_new_container').on( 'keyup', 'textarea', function (e){
      $(this).css('height', 'auto' );
      $(this).height( this.scrollHeight );
    });

    $('#mood_new_container').find( 'textarea' ).keyup();

    // Mood edit note - emoji selector

    $('.edit-emoji').bind('click', function(event) { 

      var thisID = $(this).attr('id');
      var compID;
      
      for(var i = 0; i < 6; i++) {

        compID = 'edit_emoji_' + i.toString();

        if(thisID == compID) {
          $('#'+compID).addClass('moji-press'); 
          $('#edit_emoji_value').val(i);
        }
        else 
          $('#'+compID).removeClass('moji-press'); 
      }

    });

    // Mood new note - dynamic text area

    $('#mood_edit_container').on( 'keyup', 'textarea', function (e){
      $(this).css('height', 'auto' );
      $(this).height( this.scrollHeight );
    });

    $('#mood_edit_container').find( 'textarea' ).keyup();


  };

  this.loadQuestion = function() {

    if(mood_no_q != 'c')
      $('.mood_new_content').val(this.questionList[mood_no_q]);
    else 
      $('.mood_new_content').val('');

  };

  this.loadMood = function(status) {

    db.transaction(queryMood, errorCB, successCB);

    function queryMood(tx) {

      tx.executeSql("SELECT * FROM mood_tracker WHERE _id = " + moodList.item(mood_load_id).data, [], dataSuccess, errorCB);

    }

    function dataSuccess(tx, results) {                     

      var len = results.rows.length;

      if(len > 0) {

        var mood_date_time = new Date(results.rows.item(0).created_time.split(' '));

        if(status == 'view') {

          $('.mood_view_content').html(nl2br(results.rows.item(0).content));

          var mood_month =  monthNames[mood_date_time.getMonth()].toUpperCase();
          var mood_day = weekday[mood_date_time.getDay()].toUpperCase();
          var mood_date = mood_date_time.getDate();
          var mood_year = mood_date_time.getFullYear();

          var bottom = '<span class="view-time">'+displayTime(mood_date_time)+'</span> '+mood_day+', '+mood_month+' '+mood_date+', '+mood_year;

          $('.mood-view-datetime').html(bottom);

          $('.mood-view-icon img').attr('src', 'images/emoji-small-' + results.rows.item(0).face + '.png');

          moodTracker.viewFooter();

        }
        else if(status == 'edit') {

          var face = results.rows.item(0).face;

          $('.mood_edit_content').val(results.rows.item(0).content);
          $('#edit_emoji_value').val(face);
          $('#edit_emoji_' + face).addClass('moji-press');

          $('.mood_edit_content').css('height', 'auto' );
          $('.mood_edit_content').height( $('.mood_edit_content').prop('scrollHeight') );

        }

      }

    }

  };

  this.loadList = function() {

    db.transaction(queryMood, errorCB, successCB);

    function queryMood(tx) {
      tx.executeSql("SELECT * FROM mood_tracker ORDER by created_time DESC", [], dataSuccess, errorCB);
    }

    function dataSuccess(tx, results) {                     

      var len = results.rows.length;

      moodList = new DoublyLinkedList();

      var content = '';

      var current_month = '';

      if(len > 0) {

        for (var i = 0; i < len; i++) {

          moodList.add(results.rows.item(i)._id);

          var mood_id = results.rows.item(i)._id;

          var mood_date_time = new Date(results.rows.item(i).created_time.split(' '));

          var mood_time = displayTime(mood_date_time);

          var mood_date = mood_date_time.getDate();

          if(current_month != mood_date_time.getFullYear() + '-' + mood_date_time.getMonth()) {

            content += '<li class="divider" style="text-align: center; padding-right: 0px;">'; 
            content +=    monthNames[mood_date_time.getMonth()] + ' ' + mood_date_time.getFullYear(); 
            content += '</li>';

          }

          content += '<li style="padding: 10px 10px 10px 10px;"><a class="mood_list_item" moodListId="'+i+'">';
          content += '<table>';
          content += '<tr>';
          content += '  <td align="center" width="60px">'
          content += '    <div class="mood-list-time">'+ mood_time +'</div>';
          content += '    <div class="mood-list-date">' + mood_date_time.getDate() + '</div>';
          content += '    <div class="mood-list-day">' + weekday[mood_date_time.getDay()] + '</div>';
          content += '  <td><div class="mood-content">' + nl2br(results.rows.item(i).content) + '</div>';
          content += '</td></tr>';

          content += '</table></a></li>';

          current_month = mood_date_time.getFullYear() + '-' + mood_date_time.getMonth();

        }

        var contentWidth = $(window).width() - 100;

        $('#mood_tracker .list').html(content);

        $('.mood-content').css({'width': contentWidth+'px'});

        $('.mood_list_item').click(function(){
          
          mood_load_id = $(this).attr('moodListId');
          mood_status = 'view';

          $.ui.loadContent("#mood_view",false,false,"slide");
        
        });

      } // if(len > 0) 
      else {
        content = '<li><a href="#mood_list">Click here to add new note.</a></li>';
        $('#mood_tracker .list').html(content);
      }
    }

  };

  this.saveNote = function(content, face) {

    db.transaction(insertMood, errorCB, successCB);

    function insertMood(tx) {

      var timesamp = currentDate() + ' ' + currentTime();

      tx.executeSql("INSERT INTO mood_tracker (content, created_time, face, mood) VALUES (?, '"+timesamp+"', '"+face+"', 'mood')", [content]);

      $('.emoji').removeClass('moji-press');
    
    }

    moodTracker.needTalk(face, 'save');

  };

  this.updateNote = function(content, face) {

    db.transaction(updateMood, errorCB, successCB);

    function updateMood(tx) {

      tx.executeSql("UPDATE mood_tracker SET content = ?, face = '"+face+"' WHERE _id = " + moodList.item(mood_load_id).data, [content]);

      $('.edit-emoji').removeClass('moji-press');
    
    }

    mood_status = 'view';

    moodTracker.needTalk(face, 'update');

  };

  this.needTalk = function(face, type) {

    var talk = false;

    if(face > 3) {

      $("#afui").popup({
        title: "",
        message: "Would you like to talk to someone?",
        cancelText: "No",
        cancelCallback: function () {
          if(type == 'save') 
            $.ui.loadContent("#mood_tracker",false,false,"slide"); 
          else 
            $.ui.loadContent("#mood_view",false,false,"slide"); 
        },
        doneText: "Yes",
        doneCallback: function () {
          
          $.ui.loadContent("#contact_list",false,false,"slide"); 
        },
        cancelOnly: false
      });

    }
    else {
      if(type == 'save') 
        $.ui.loadContent("#mood_tracker",false,false,"slide"); 
      else 
        $.ui.loadContent("#mood_view",false,false,"slide"); 
    }

  };

  this.deletePop = function() {

    $("#afui").popup({
      title: "Confirm",
      message: "Are you sure that you want to delete this note?",
      cancelText: "Cancel",
      cancelCallback: function () {
          //console.log("cancelled");
      },
      doneText: "Delete",
      doneCallback: function () {
        moodTracker.deleteMood();
      },
      cancelOnly: false
    });
    
  };

  this.deleteMood = function() {

    db.transaction(delMood, errorCB, successCB);

    function delMood(tx) {
      tx.executeSql("DELETE FROM mood_tracker WHERE _id = " + moodList.item(mood_load_id).data, [], dataSuccess, errorCB);
    }

    function dataSuccess(tx, results) {
      moodList.remove(mood_load_id);
    }

    $.ui.loadContent("#mood_tracker",false,false,"slide"); 
    
  };

  this.viewFooter = function() {

    var footer = '<a href="#mood_tracker" id="mood_view_home" class="icon heart">Note List';

    var next = '<a id="mood_view_next" class="icon right">Next</a>';
    var prev = '<a id="mood_view_prev" class="icon left">Prev.</a>';
    var edit = '<a id="mood_view_edit" class="icon pencil">Edit</a>';
    var del  = '<a id="mood_view_delete" class="icon trash">Delete</a>'; 

    if(moodList.size() == 1) {
      footer += edit + del;
      $('#mood_view_footer').html(footer);
      $('#mood_view_footer a').css({'width':'33%'});
    }
    else if((mood_load_id == 0)&&(moodList.size() != 1)) { 
      footer += edit + next + del;
      $('#mood_view_footer').html(footer);
    }
    else if(mood_load_id != moodList.size()-1) {
      footer += prev + edit + next + del;
      $('#mood_view_footer').html(footer);
      $('#mood_view_footer a').css({'width':'20%'});
    }
    else if(mood_load_id == moodList.size()-1) {
      footer += prev + edit + del; 
      $('#mood_view_footer').html(footer);
    }

    $('#mood_view_edit').click(function(){ 
      mood_status = 'edit';
      $.ui.loadContent("#mood_edit",false,false,"up"); 
    });

    $('#mood_view_delete').click(function(){ moodTracker.deletePop(); });
    
    $('#mood_view_prev').click(function(){

      --mood_load_id;

      $.ui.showMask('Loading');

      window.setTimeout(function () {
          $.ui.hideMask();
          moodTracker.loadMood('view');
      }, 500);

    });
    
    $('#mood_view_next').click(function(){ 
    
      ++mood_load_id;

      $.ui.showMask('Loading');

      window.setTimeout(function () {
          $.ui.hideMask();
          moodTracker.loadMood('view');
      }, 500);

    });

  };

}