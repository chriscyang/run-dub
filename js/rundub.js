/* -------------------------------------------------------------------------- */
/* VARIABLES
/* -------------------------------------------------------------------------- */

var lat = null;
var lng = null;
var loc;
var rad;

var map;
var keywords = ["restaurant", "coffee", "bus", "school"];
var nearbys = [];
var randomPts;

/* -------------------------------------------------------------------------- */
/* INTERACTIVE ELEMENTS & PAGE TRANSITIONS
/* -------------------------------------------------------------------------- */

$(document).ready(function() {

    // Reload page on logo click.
    $("#logo-link").on("click", function() {
        location.reload();
    });

    /* -----------------------------------------------------------------------*/
    /* PAGE 1: LOCATION
    /* -----------------------------------------------------------------------*/

    // Show location input on button click.
    $("#enter-loc").on("click", function() {
        $("#user-loc").toggle("fast")
                      .focus();
    });

    // Submit location and transition to page 2 on enter.
    $("#user-loc").keypress(function(e) {
        if (e.which == 13) {
            if ($(this).val()) {
                loc = $(this).val();
                submitLocation();
            } else {
                alert("Please enter a location!");
            }
        }
    });

    function submitLocation() {

        // Collect the lat and lng values.
        var gc = new google.maps.Geocoder();
        gc.geocode({ "address": loc }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.lat();
                lng = results[0].geometry.location.lng();
            }
        });

        // Transition to page 2.
        $("#pg-location").toggle("fast", function() {
            $("#overlay").css("background-color", "#FDC689");
            $("body").css("background-color", "#FDC689")
                     .css("background", "url(img/bg_sfo.png)");
            $("#pg-radius").toggle("fast");
            $("#user-rad").focus();
        });
    }

    /* -----------------------------------------------------------------------*/
    /* PAGE 2: RADIUS
    /* -----------------------------------------------------------------------*/

    // Submit radius and transition to page 3 on enter.
    $("#user-rad").keypress(function(e) {
        if (e.which == 13) {
            if ($(this).val()) {
                rad = $(this).val();
                submitRadius();
            } else {
                alert("Please enter a radius!");
            }
        }
    });

    // Submit radius and transition to page 3 on button click.
    $("#lets-move").on("click", function() {
        var e = $.Event("keypress", { which: 13 });
        $("#user-rad").trigger(e);
    });

    function submitRadius() {

        // Transition to page 3.
        $("#pg-radius").toggle("fast", function() {
            $("#overlay").css("background-color", "#6DCFF6");
            $("body").css("background-color", "#6DCFF6")
                     .css("background", "url(img/bg_mtn.png)");
            $("#pg-route").toggle("fast");
            initMap();
            gimmeARoute();
        });
    }

    /* -----------------------------------------------------------------------*/
    /* PAGE 3: ROUTE
    /* -----------------------------------------------------------------------*/

    // Generate route on button click.
    $("#new-route").on("click", function() {
        $("#pg-route").find("span").html("AND HERE'S YOUR ROUTE");
        $("#pg-route").find("#new-route").find("a").html("Give me something fresh");
        initMap();
        gimmeARoute();
    });
});

/* -------------------------------------------------------------------------- */
/* MAP FUNCTIONS
/* -------------------------------------------------------------------------- */

/**
 * Initializes the map based on user location.
 */
function initMap() {
    loc = new google.maps.LatLng(lat, lng);
    map = new google.maps.Map(document.getElementById("map"), {
        center: loc,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
    });
    infoWindow = new google.maps.InfoWindow();
}

/**
 * Gets nearby places based on a keyword.
 */
function generateNearbys(k) {
    var service = new google.maps.places.PlacesService(map);
    var request = {
        location: loc,
        radius: rad / 2,
        keyword: k
    };
    service.nearbySearch(request, generateNearbysCallback);
}

/**
 * Pushes results from generateNearbys() into an array.
 */
function generateNearbysCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            nearbys.push(results[i]);
        }
    }
}

/**
 * Gets nearby places based on a set of keywords.
 */
function generateAllNearbys(){
    for (var i = 0; i < keywords.length; i++) {
        generateNearbys(keywords[i]);
    }
}

/**
 * Chooses random points from nearbys.
 */
function chooseRandomPts() {
    var randomInd;
    randomPts = [];

    randomInd = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomInd]);

    randomInd = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomInd]);

    randomInd = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomInd]);

    randomInd = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomInd]);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var waypts = [];
    for (var i = 0; i < randomPts.length; i++) {
        if (randomPts[i]) {
            waypts.push({
                location: randomPts[i].geometry.location,
                stopover: true
            });
        }
    }

    directionsService.route({
        origin: loc,
        destination: loc,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING
    }, calculateAndDisplayRouteCallback);

    function calculateAndDisplayRouteCallback(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
        } else {
            window.alert("Directions request failed due to " + status);
        }
    }
}

function gimmeARoute() {
    generateAllNearbys();
    chooseRandomPts();

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
}
