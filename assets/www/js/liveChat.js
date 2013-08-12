

function loadChat() {

  $.ui.slideSideMenu = false;

	liveChat.initial();

}


function messageGenerator(db) {

	this.initial = function() {

    $('#live_chat_message').val('');
    $('#live_chat ul').html('');


    $.ui.showMask('Connecting');

    window.setTimeout(function () {
        $.ui.hideMask();
        liveChat.connectSucces();
    }, 2000);

    $('#live_chat_send').click(function(){

      var message = $('#live_chat_message').val();

      if(message != '') {

        liveChat.displayMessage(message, 'self');

        window.setTimeout(function () {
          liveChat.displayMessage(message, 'other');
        }, 2000);
        
        $('#live_chat_message').val('');

      }
      else {
        $('#live_chat_message').attr('placeholder', 'Please input message here..');
      }
      
    });

	};	

  this.connectSucces = function() {

    liveChat.displayMessage('<p>Hi, My name is Danny</p><p>How may I help you?</p>', 'other');

  };

  this.displayMessage = function(content, type) {

    var text = '';

    var textName = (type == 'other') ? 'Danny (Lifeline)' : 'Me';

    var timesamp = currentDate() + ' ' + currentTime();

    var mood_date_time = new Date(timesamp.split(' '));

    var mood_time = displayTime(mood_date_time);

    text = '<li class="'+type+'">';
    text += ' <div class="messages">';
    text += ' <p>' + textName + ': </p>';
    text += ' <div style="padding-left:5px;">' + content;
    text += '   <time datetime="2009-11-13T20:00">' + mood_time + '</time></div></div>';
    text += '</li>';

    
    $('#live_chat ul').append(text);

    $.ui.scrollToBottom('live_chat');

  };
}