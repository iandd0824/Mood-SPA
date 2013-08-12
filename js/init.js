var networkStatus;

var plan_page_number;   

var safetyPlan, moodTracker, contactList, centerLocation;

var firstTime_plan = true;
 
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];


function onload() {

  document.addEventListener("deviceready", onDeviceReady, false);

  document.addEventListener("online", networkOnline, false);

  document.addEventListener("offline", networkOffline, false);

  

}

function onDeviceReady() {
  
  var db = window.sqlitePlugin.openDatabase("Database", "1.0", "nctsn", -1);

  networkStatus = navigator.network.connection.type;

  $.ui.slideSideMenu = false;

  safetyPlan = new planGenerator(db);

  safetyPlan.initial(); 

  moodTracker = new trackerGenerator(db);

  moodTracker.initial(); 

  contactList = new contactGenerator(db);

  centerLocation = new locationGenerator();

  liveChat = new messageGenerator(); 

  navigator.splashscreen.hide();


}

function errorCB(err) {
  alert("Error processing SQL: "+err);
}

function successCB() {
  //alert("success!");
}


function networkOnline() { networkStatus = true; }

function networkOffline() { networkStatus = true; }

function currentDate() {

  var currentdate = new Date(); 

  var mon = currentdate.getMonth() + 1;
  var day = currentdate.getDate();
  var year = currentdate.getFullYear();

  var mon = (mon < 10) ? "0" + mon : mon;
  var day = (day < 10) ? "0" + day : day;

  return year + '-' + mon + '-' + day;
}

function currentTime() {

  var str = "";

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  
  str += hours + ":" + minutes + ":" + seconds;
  
  return str;

}

function displayTime(date_time) {

  var am_pm = (parseInt(date_time.getHours()) > 12) ? 'PM' : 'AM'; 

  var hour = date_time.getHours();
  var min = date_time.getMinutes();

  var hour = (hour < 10) ? '0' + hour : hour;
  var min = (min < 10) ? '0' + min : min;

  return hour + ':' + min + ' ' + am_pm;

}


function nl2br (str, is_xhtml) {
  // http://kevin.vanzonneveld.net
  // *     example 1: nl2br('Kevin\nvan\nZonneveld');
  // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
  // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
  // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
  // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
  // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function br2nl(str) {
    return str.replace(/<br\s*\/?>/mg,"\n");
}

function addslashes (str) {
  // http://kevin.vanzonneveld.net
  // *     example 1: addslashes("kevin's birthday");
  // *     returns 1: 'kevin\'s birthday'
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}