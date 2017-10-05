// -----------------------------------------------------------------------------
// VARIABLES
// -----------------------------------------------------------------------------

var PAGE2_COLOUR = "#fdc689";
var PAGE3_COLOUR = "#6dcff6";

var PAGE2_BACKGROUND = "url(img/bg_sfo.png)";
var PAGE3_BACKGROUND = "url(img/bg_mtn.png)";

var lat = null;
var lng = null;
var loc;
var rad;

var map;
var keywords = [
    "restaurant",
    "coffee",
    "bus",
    "school",
];
var nearbys = [];
var randomPts;

// -----------------------------------------------------------------------------
// INTERACTIVE ELEMENTS & PAGE TRANSITIONS
// -----------------------------------------------------------------------------

$(document).ready(function () {

    // Reload page on logo click.
    $("#logo-link").on("click", function () {
        location.reload();
    });

    // Always focus on input fields.
    $("input[type='text']").focus();

    // -------------------------------------------------------------------------
    // PAGE 1: LOCATION
    // -------------------------------------------------------------------------

    // Submit location on enter.
    $("#user-loc").keypress(function (e) {
        if (e.which === 13) {
            if ($(this).val()) {
                loc = $(this).val();
                submitLocation();
            } else {
                alert("Please enter a location!");
            }
            return false;
        }
    });

    // Submit location on button click.
    $("#enter-loc").on("click", function () {
        var e = $.Event("keypress", { which : 13, });
        $("#user-loc").trigger(e);
    });

    /**
     * Collects lat and lng of loc and transitions to Page 2.
     */
    function submitLocation() {
        var gc = new google.maps.Geocoder();
        gc.geocode({ "address" : loc }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.lat();
                lng = results[0].geometry.location.lng();
            }
        });

        $("#pg-location").toggle("fast", function () {
            $("#overlay").css("background-color", PAGE2_COLOUR);
            $("body").css("background-color", PAGE2_COLOUR)
                     .css("background", PAGE2_BACKGROUND);
            $("#pg-radius").toggle("fast");
            $("#user-rad").focus();
        });
    }

    // -------------------------------------------------------------------------
    // PAGE 2: RADIUS
    // -------------------------------------------------------------------------

    // Submit radius on enter.
    $("#user-rad").keypress(function (e) {
        if (e.which === 13) {
            if ($(this).val()) {
                rad = $(this).val();
                submitRadius();
            } else {
                alert("Please enter a radius!");
            }
            return false;
        }
    });

    // Submit radius on button click.
    $("#lets-move").on("click", function () {
        var e = $.Event("keypress", { which : 13, });
        $("#user-rad").trigger(e);
    });

    /**
     * Transitions to Page 3.
     */
    function submitRadius() {
        $("#pg-radius").toggle("fast", function () {
            $("#overlay").css("background-color", PAGE3_COLOUR);
            $("body").css("background-color", PAGE3_COLOUR)
                     .css("background", PAGE3_BACKGROUND);
            $("#pg-route").toggle("fast");
            initMap();
            gimmeARoute();
        });
    }

    // -------------------------------------------------------------------------
    // PAGE 3: ROUTE
    // -------------------------------------------------------------------------

    // Generate route on button click.
    $("#new-route").on("click", function () {
        $("#pg-route").find("span").html("AND HERE'S YOUR ROUTE");
        $("#pg-route").find("#new-route").find("a").html("Give me something fresh");
        initMap();
        gimmeARoute();
    });
});

// -----------------------------------------------------------------------------
// MAP FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Initializes the map based on user location.
 */
function initMap() {
    loc = new google.maps.LatLng(lat, lng);
    map = new google.maps.Map(document.getElementById("map"), {
        center            : loc,
        zoom              : 14,
        mapTypeControl    : false,
        streetViewControl : false,
    });
    infoWindow = new google.maps.InfoWindow();
}

/**
 * Gets nearby places based on a keyword.
 */
function generateNearbys(keyword) {
    var service = new google.maps.places.PlacesService(map);
    var request = {
        location : loc,
        radius   : rad / 2,
        keyword  : keyword,
    };
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i in results) {
                nearbys.push(results[i]);
            }
        }
    }
}

/**
 * Gets nearby places based on a set of keywords.
 */
function generateAllNearbys() {
    for (var i in keywords) {
        generateNearbys(keywords[i]);
    }
}

/**
 * Chooses random points from nearbys.
 */
function chooseRandomPts() {
    var randomIndex;
    randomPts = [];

    randomIndex = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomIndex]);

    randomIndex = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomIndex]);

    randomIndex = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomIndex]);

    randomIndex = Math.floor((Math.random() * 80));
    randomPts.push(nearbys[randomIndex]);
}

/**
 * Puts a randomly generated route on the map.
 */
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var waypoints = [];
    for (var i in randomPts) {
        if (randomPts[i]) {
            waypoints.push({
                location : randomPts[i].geometry.location,
                stopover : true,
            });
        }
    }

    directionsService.route({
        origin            : loc,
        destination       : loc,
        waypoints         : waypoints,
        optimizeWaypoints : true,
        travelMode        : google.maps.TravelMode.WALKING,
    }, callback);

    function callback(results, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(results);
        }
    }
}

function gimmeARoute() {
    generateAllNearbys();
    chooseRandomPts();

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
}
