// @author Ian Maffett
// @copyright App Framework 2012
// Modified by Rami@alphastagestudios.com - 2013
// - Added markers & directions

(function () {
    var gmapsLoaded = false; //internal variable to see if the google maps API is available

    //We run this on document ready.  It will trigger a gmaps:available event if it's ready
    // or it will include the google maps script for you
    $(document).ready(function () {
        if(window["google"]&&google.maps){
            $(document).trigger("gmaps:available");
            gmapsLoaded = true;
            return true;
        }
        var gmaps = document.createElement("script");
        gmaps.src = "http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=gmapsPluginLoaded";
        // Updated API url
        $("head").append(gmaps);
        window["gmapsPluginLoaded"] = function () {
            $(document).trigger("gmaps:available");
            gmapsLoaded = true;
        }
    });

    //Local cache of the google maps objects
    var mapsCache = {};

    //We can invoke this in two ways
    //If we pass in positions, we create the google maps object
    //If we do not pass in options, it returns the object
    // so we can act upon it.

    $.fn.gmaps = function (opts) {
        if (this.length == 0) return;
        if (!opts) return mapsCache[this[0].id];
        //Special resize event
        if(opts=="resize"&&mapsCache[this[0].id])
        {
            var map = mapsCache[this[0].id];
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
            map.setZoom(13);
            // Extended resize to recenter and reset zoom

            return map;
        }

        //loop through the items and create the new gmaps object
        for (var i = 0; i < this.length; i++) {
            new gmaps(this[i], opts);
        }
    };


    //This is a local object that gets created from the above.
    var gmaps = function (elem, opts) {
        var createMap = function () {
            var officePos = new google.maps.LatLng(55.689403, 12.521281);
            if (!opts || Object.keys(opts).length == 0) {
                opts = {
                    zoom: 13,
                    center: officePos,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
            }
            mapsCache[elem.id] = new google.maps.Map(elem, opts);

            // Added marker for static location 
            var officeMarker = new google.maps.Marker({
                position: officePos,
                map: mapsCache[elem.id],
                title: 'Danmarks Flyttemand ApS'
            });

            // Added custom event listener for availability of userPosition
            $(document).one('userPositionAvailable', function(evt, userPos) {
                if (userPos != null && userPos != '') {
                    addDirections(mapsCache[elem.id], userPos);
                }
            });
        }

        // Adds directions on gmap from userPos to a fixed position
        var addDirections = function(gmap, userPos) {
            var officePos = new google.maps.LatLng(55.689403, 12.521281); // fixed position
            var userMarker = new google.maps.Marker({
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    strokeColor: "green",
                    scale: 5
                },
                position: userPos,
                map: gmap,
                title: 'Your location'
            });

            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
            directionsDisplay.setMap(gmap);
            directionsDisplay.setPanel(document.getElementById('googledirections')); // add id here

            var request = {
                origin: userPos,
                destination: officePos,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
        }

        //If we try to create a map before it is available
        //listen to the event
        if (!gmapsLoaded) {
            $(document).one("gmaps:available", function () {
                createMap()
            });
        } else {
            createMap();
        }
    }
})(af);


function onGeoSuccess(position) {
    var userPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    $(document).trigger('userPositionAvailable', userPos);
}

function onGeoError(error) {
    navigator.notification.alert('Geolocation error: ' + error.message);
}

function initMaps() {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);

    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(55.689403, 12.521281),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $('#googlemap').gmaps(mapOptions); // update id selector

    $('#googlemap-panel').on('loadpanel', function() { // update event for other framework and id selector
        $('#googlemap').gmaps('resize'); // update id selector
    });
}