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

  $.ui.slideSideMenu = false;
  $.ui.toggleHeaderMenu(false);

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


function locationGenerator() {
  
  this.initial = function() {

    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsService = new google.maps.DirectionsService();

    google.maps.visualRefresh = true;

    navigator.geolocation.getCurrentPosition(centerLocation.onGeoSuccess, onError);
        
  };

  this.onGeoSuccess = function(position) {      

    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
  
    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(currentLat, currentLng),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var markerImage_Green = new google.maps.MarkerImage(imageUrl_green, new google.maps.Size(24, 32));
    centerLocation.currentMarker(currentLat, currentLng, markerImage_Green);


    centerLocation.refreshMap();

    window.setTimeout(function () {
      $.ui.hideMask();
    }, 1500);

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


  this.calcRoute = function(lat, lng, dis, finaladdress) {

  	$.ui.showMask('Calculating...');

    start = new google.maps.LatLng(currentLat, currentLng); 
    end = new google.maps.LatLng(lat, lng); 

    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsDisplay.setMap(map);

      
    var request = {
        origin: start,
        destination: dis,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {

      if (status == google.maps.DirectionsStatus.OK) { 

        var mapDirectionFooter = '<a href="#main" class="icon home column4">Home</a>'; 
            mapDirectionFooter +='<a href="#contact_list" class="icon phone column4">Call</a>';
            mapDirectionFooter +='<a href="#map_direction" data-transition="up" class="icon location column4">Direction</a>';
            mapDirectionFooter +='<a id="clear_direction" class=" icon trash column4" >Clear Route</a>';

        var mapMainFooter = '<a href="#main" class="icon home column2">Home</a>'; 
            mapMainFooter +='<a href="#contact_list" class="icon phone column2">Call</a>';

        $('#map-footer').html(mapDirectionFooter);

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
           
            var step = '<li>'; 
            		step +='<table><tr>';
            		step +='<td class="direct-item number">' + counter + '.';
            		step +='<td class="direct-item content">' + direction.steps[i].instructions + '</td>';
                step += '</tr></table>';
                step +='</li>';

            directionContent += step;  
          }
        }


        directionContent += '<li><b>'+finaladdress+'</b></li>';

        $('.direct-item-mile').html(direction.distance);
        
        $('.direct-item-duration').html(direction.duration);

        $('#map_direction .list').html(directionContent);

        $('#clear_direction').click(function(){

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

      var addressNoSpace = centerList[i].street.replace(" ","+");

      var dis = addressNoSpace+',+'+centerList[i].city+',+'+centerList[i].state;

      var finalAddress = centerList[i].street + ' ';

      if(centerList[i].street2 != '')
        finalAddress += centerList[i].street2 + '';

      finalAddress += ', '+centerList[i].city+', '+centerList[i].state+' '+centerList[i].zip+', USA';

      var infoContent  = '<div class="infoWindowContent">';
          infoContent += '<b>'+centerList[i].name+'</b><br><br>';
          infoContent += address+centerList[i].phone + '<br><br>';
          infoContent += '<div class="map-info-bottom"><a style="color: inherit;" href="tel:'+ centerList[i].phone +'">';
          infoContent += '<div class="icon phone map-info-phone" tel="'+centerList[i].phone+'">Call<br></div></a>';
          infoContent += '<a style="color: inherit;" onClick="centerLocation.calcRoute('+centerList[i].lat+', '+centerList[i].lng+', \''+dis+'\', \''+finalAddress+'\')">';
          //infoContent += '<a style="color: inherit;" onClick="centerLocation.calcRoute('+centerList[i]+')">';
          infoContent += '<div class="icon location map-info-direction" lat="'+centerList[i].lat+'" lng="'+centerList[i].lng+'">Direction<br></div></a>';
          infoContent += '</div></div>';
      
      markers.push(marker_obj);

      centerLocation.infoWindow(marker_obj, map, infowindow, infoContent);

    }

  };

  this.infoWindow =  function(marker, map, infowindow, html) {

    google.maps.event.addListener(marker, 'click', function() {
                          infowindow.setContent(html);
                          infowindow.open(map, marker);
                      });

  };
}


function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
