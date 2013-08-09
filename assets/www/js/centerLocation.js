var map = '';
var directionsDisplay;
var directionsService;
var currentMarker = '';
var currentLat, currentLng;
var markers = new Array();

var markerClusterer = null;
var imageUrl_blue = 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&' +
          'chco=FFFFFF,008CFF,000000&ext=.png';

var imageUrl_green = 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&' +
          'chco=FFFFFF,1fbf5f,000000&ext=.png';

var mapFirst = true;

          


function loadCenter() {

  //alert(mood_stauts);
  $.ui.slideSideMenu = false;
  $.ui.toggleHeaderMenu(false);

  //$('#map-canvas').html('');

  if(navigator.network.connection.type == 'none') { 
    $.ui.loadContent("#network_error",false,false,"slide"); 
    return 0;
  }
  
  
  
  if(map == '') {
    $.ui.showMask('Loading...');
    centerLocation.initial();
  }
  else {
    google.maps.event.trigger(map, "resize");
  }

}

function unloadCenter() {
  $.ui.hideMask();
}




/*var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + '90EE90',
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));*/


//var markerImage = new google.maps.MarkerImage(imageUrl, new google.maps.Size(24, 32));


function locationGenerator() {
  
  this.initial = function() {

    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsService = new google.maps.DirectionsService();

    google.maps.visualRefresh = true;

    //navigator.geolocation.getCurrentPosition(centerLocation.onGeoSuccess, onError);
    
    centerLocation.onGeoSuccess();
    
  };

  this.onGeoSuccess = function(position) {

    //if(map == '') {
      

      //currentLat = position.coords.latitude;
      //currentLng = position.coords.longitude;

      currentLat = 34.031723;
      currentLng = -118.458525;

      //directionsDisplay = new google.maps.DirectionsRenderer();
    
      var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(currentLat, currentLng),
        //center: berlin,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      var markerImage_Green = new google.maps.MarkerImage(imageUrl_green, new google.maps.Size(24, 32));
      centerLocation.currentMarker(currentLat, currentLng, markerImage_Green);

      //centerLocation.markers();

      centerLocation.refreshMap();

      window.setTimeout(function () {
        $.ui.hideMask();
      }, 1500);

      //directionsDisplay.setMap(map);

    /*}
    else {
      google.maps.event.trigger(map, "resize");
      directionsDisplay.setMap(map);
      centerLocation.currentMarker(position.coords.latitude, position.coords.longitude);

    }*/

  };

  this.refreshMap = function() {

  	if (markerClusterer) {
	    markerClusterer.clearMarkers();
	  }

	  var markerImage = new google.maps.MarkerImage(imageUrl_blue,
	  new google.maps.Size(24, 32));

	  centerLocation.markers(markerImage);

	  markerClusterer = new MarkerClusterer(map, markers, {
		  maxZoom: null,
		  gridSize: null
	  });

  };


  this.calcRoute = function(lat, lng) {

  	$.ui.showMask('Calculating...');

    start = new google.maps.LatLng(currentLat, currentLng); 
    end = new google.maps.LatLng(lat, lng); 

    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsDisplay.setMap(map);

      
    var request = {
        origin: start,
        destination: new google.maps.LatLng(lat, lng),
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      //console.log(response);
      if (status == google.maps.DirectionsStatus.OK) { 

        /*var mapDirectionFooter = ['<a href="#main" class="icon home column4">Home</a>', 
                             '<a href="#contact_list" class="icon phone column4">Call</a>',
                             '<a id="show_direction" class="icon location column4">Direction</a>',
                             '<a id="clear_direction" class=" icon trash column4" >Clear Route</a>'].join('');*/

        var mapDirectionFooter = '<a href="#main" class="icon home column4">Home</a>'; 
            mapDirectionFooter +='<a href="#contact_list" class="icon phone column4">Call</a>';
            mapDirectionFooter +='<a href="#map_direction" data-transition="up" class="icon location column4">Direction</a>';
            mapDirectionFooter +='<a id="clear_direction" class=" icon trash column4" >Clear Route</a>';

        var mapMainFooter = '<a href="#main" class="icon home column2">Home</a>'; 
            mapMainFooter +='<a href="#contact_list" class="icon phone column2">Call</a>';

        /*var mapMainFooter = ['<a href="#main" class="icon home column2">Home</a>', 
                             '<a href="#contact_list" class="icon phone column2">Call</a>'].join('');*/

        $('#map-footer').html(mapDirectionFooter);

        //infowindow.close();
        centerLocation.clearMarkers();

        markerClusterer.clearMarkers();

        directionsDisplay.setDirections(response);

        var direction = { distance: response.routes[0].legs[0].distance.text, 
                          duration: response.routes[0].legs[0].duration.text,
                          startAddress: response.routes[0].legs[0].start_address,
                          endAddress: response.routes[0].legs[0].end_address,
                          steps: response.routes[0].legs[0].steps };
        
        var directionContent = '<li><b>'+direction.startAddress+'</b></li>';

        if(direction.steps) {
          for(i in direction.steps) {

            var counter = parseInt(i) + 1;
            /*var step = ['<li>', 
                        '<p class="direct-item number" >'+ counter +'.</p>',
                        '<p class="direct-item content">'+ direction.steps[i].instructions +'</p>',
                        '</li>'].join('');*/
            var step = '<li>'; 
            		step +='<table><tr>';
            		step +='<td class="direct-item number">' + counter + '.';
            		step +='<td class="direct-item content">' + direction.steps[i].instructions + '</td>';
                //step +='<p class="direct-item number" >'+ counter +'.</p>';
                //step +='<p class="direct-item content">'+ direction.steps[i].instructions +'</p>';
                step += '</tr></table>';
                step +='</li>';

            directionContent += step;  
          }
        }

        directionContent += '<li><b>'+direction.endAddress+'</b></li>';

        $('.direct-item-mile').html(direction.distance);
        
        $('.direct-item-duration').html(direction.duration);

        $('#map_direction .list').html(directionContent);

        //$('#direction_detail').click(function(){ $.ui.loadContent("#map_direction2",false,false,"up"); });

        $('#clear_direction').click(function(){

          //centerLocation.showMarkers(); 
          currentMarker.setMap(map);

          markerClusterer = new MarkerClusterer(map, markers, {maxZoom: null,gridSize: null});

          directionsDisplay.setMap(null); 

          $('#map-footer').html(mapMainFooter);
                  
        });
        
      }

      window.setTimeout(function () {
        $.ui.hideMask();
      }, 1000);

    });

		

  };

  this.clearMarkers = function() {

    currentMarker.setMap(null);

    if (markers) {
      for (i in markers) {
        markers[i].setMap(null);
      }
    }
    //markersArray = [];

  };

  this.showMarkers = function() {

    currentMarker.setMap(map);

    if (markers) {
      for (i in markers) {
        markers[i].setMap(map);
      }
    }
  };

  

  this.currentMarker = function(lat, lng, icon) {

    var infowindow =  new google.maps.InfoWindow({content: ''});

    if(currentMarker == '') {

      currentMarker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: 'My Location',
            map: map,
            icon: icon
      });

    }
    else {
      currentMarker.setMap(null);
      currentMarker = null;
      currentMarker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: 'My Location',
            map: map,
            icon: icon
      });

      map.setCenter(new google.maps.LatLng(lat, lng));
    }

    var infoContent = 'My Location';

    centerLocation.infoWindow(currentMarker, map, infowindow, infoContent);
  };

  this.markers = function(icon) {

    var infowindow =  new google.maps.InfoWindow({content: ''});

    for (i in centerList) {

      var marker_obj = new google.maps.Marker({
          position: new google.maps.LatLng(centerList[i].lat, centerList[i].lng),
          title: centerList[i].name,
          map: map,
          icon: icon
      });

      var address = centerList[i].street + '<br>';

      if(centerList[i].street2 != '')
        address += centerList[i].street2 + '<br>';

      address += centerList[i].city+', '+centerList[i].state+' '+centerList[i].zip+'<br>';

      //var phone = '<a style="color:#999999; text-decoration:none;" href="tel:'+centerList[i].phone+'"><div class="icon phone" style="text-align:center; font-size:18px; border-top:1px solid #999999; padding:3px;">Call<br></div></a>';

      //phone += '<div onclick="calcRoute('+centerList[i].lat+', '+centerList[i].lng+')" class="get-direction icon phone" style="text-align:center; font-size:18px; border-top:1px solid #999999; padding:3px;">Direction<br></div>';

      //var infoContent = '<div><b>'+centerList[i].name+'</b><br><br>'+address+centerList[i].phone+'<br><br></div>'+phone;

      var infoContent  = '<div class="infoWindowContent">';
          infoContent += '<b>'+centerList[i].name+'</b><br><br>';
          infoContent += address+centerList[i].phone + '<br><br>';
          infoContent += '<div class="map-info-bottom"><a style="color: inherit;" href="tel:'+ centerList[i].phone +'">';
          infoContent += '<div class="icon phone map-info-phone" tel="'+centerList[i].phone+'">Call<br></div></a>';
          infoContent += '<a style="color: inherit;" onClick="centerLocation.calcRoute('+centerList[i].lat+', '+centerList[i].lng+')">';
          infoContent += '<div class="icon location map-info-direction" lat="'+centerList[i].lat+'" lng="'+centerList[i].lng+'">Direction<br></div></a>';
          infoContent += '</div></div>';

      /*var $infoWindowContent = $([
        '<div class="infoWindowContent">',
        '<b>'+centerList[i].name+'</b><br><br>',
        address+centerList[i].phone + '<br><br>',
        '<div>',
        '<div class="icon phone map-info-phone" tel="'+centerList[i].phone+'">Call  <br></div>',
        '<div class="icon location map-info-direction" lat="'+centerList[i].lat+'" lng="'+centerList[i].lng+'">Direction<br></div>',
        '</div></div>'
      ].join(''));

      //alert('test');

      $infoWindowContent.find(".map-info-phone").on('click', function() {
          window.location = 'tel:' + $(this).attr('tel');
      });

      $infoWindowContent.find(".map-info-direction").on('click', function() {
          //alert('direction');
          centerLocation.calcRoute($(this).attr('lat'), $(this).attr('lng'));
      });*/

      
      markers.push(marker_obj);

      centerLocation.infoWindow(marker_obj, map, infowindow, infoContent);
      //centerLocation.infoWindow(marker_obj, map, infowindow, $infoWindowContent.get(0));

    }

  };

  this.infoWindow =  function(marker, map, infowindow, html) {

    google.maps.event.addListener(marker, 'click', function() {
                          infowindow.setContent(html);
                          infowindow.open(map, marker);
                      });

  };
}


/*function onGeoSuccess(position) {
  var element = document.getElementById('geolocation');
  element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
                      'Longitude: '          + position.coords.longitude             + '<br />' +
                      'Altitude: '           + position.coords.altitude              + '<br />' +
                      'Accuracy: '           + position.coords.accuracy              + '<br />' +
                      'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                      'Heading: '            + position.coords.heading               + '<br />' +
                      'Speed: '              + position.coords.speed                 + '<br />' +
                      'Timestamp: '          + position.timestamp                    + '<br />';
  initialize(position.coords.latitude, position.coords.longitude);
}*/

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

/*var berlin = new google.maps.LatLng(52.520816, 13.410186);

var neighborhoods = [
  new google.maps.LatLng(52.511467, 13.447179),
  new google.maps.LatLng(52.549061, 13.422975),
  new google.maps.LatLng(52.497622, 13.396110),
  
 
  new google.maps.LatLng(52.517683, 13.394393)
];

var markers = [];
var iterator = 0;





function initialize(latitude, longitude) {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(latitude, longitude),
    //center: berlin,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  

  //drop();
  //toggleKmlLayer();
  //toggleMarkerManager();
  new_marker();
}

function new_marker() {

  var infowindow =  new google.maps.InfoWindow({
        content: ''
    });

  for (var i = 0; i < neighborhoods.length; i++) {

    var marker_obj = new google.maps.Marker({
        position: neighborhoods[i],
        title:"This is Marker "+i,
        map: map
    });


    bindInfoWindow(marker_obj, map, infowindow, '<div><b>This is name of Center</b></div><br><div>Address: 11150 W Olympic Blvd<br> Los Angeles, CA 90067</div><br><div><a href="tel:123456789">Tel: 3103334578</a></div> ' + i);

  }

}

function bindInfoWindow(marker, map, infowindow, html) {
  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(html);
      infowindow.open(map, marker);
  });
} */