/* jshint -W117 */

const App = (() => {
  let instance;

  const create = () => {
    const pvt = {
      loc: null,
      rad: null,

      nearbys: [],
      waypoints: []
    };
    const pub = {};

    // -------------------------------------------------------------------------
    // ENUMS
    // -------------------------------------------------------------------------

    pvt.Selector = Object.freeze({
      PAGE: ".page",
      TITLE: ".page-title",
      INPUT: ".page-input",
      SUBMIT: ".page-submit"
    });

    pvt.Page = Object.freeze({
      LOC: "loc",
      RAD: "rad",
      MAP: "map"
    });

    pvt.Alert = Object.freeze({
      LOC: "Please enter a location!",
      RAD: "Please enter a radius!"
    });

    pvt.Label = Object.freeze({
      AND_HERES_YOUR_ROUTE: "AND HERE'S YOUR ROUTE",
      GIVE_ME_SOMETHING_FRESH: "Give Me Something Fresh"
    });

    pvt.KeyCode = Object.freeze({
      ENTER: 13
    });

    // -------------------------------------------------------------------------
    // CONSTANTS
    // -------------------------------------------------------------------------

    pvt.THEMES = Object.freeze({
      [pvt.Page.LOC]: Object.freeze({
        color: "#7accc8",
        image: "url(img/sea.png)"
      }),
      [pvt.Page.RAD]: Object.freeze({
        color: "#fdc689",
        image: "url(img/sfo.png)"
      }),
      [pvt.Page.MAP]: Object.freeze({
        color: "#6dcff6",
        image: "url(img/yvr.png)"
      })
    });

    pvt.KEYWORDS = Object.freeze(["bus", "coffee", "restaurant", "school"]);

    // -------------------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------------------

    pub.init = () => {
      pvt.initElements();
      pvt.initGMaps();
      pvt.initPage();
    };

    pvt.initElements = () => {
      pvt.$body = $("body");
      pvt.$logo = $("#logo");
      pvt.$overlay = $("#overlay");
      pvt.$map = $("#map");
    };

    pvt.initGMaps = () => {
      pvt.geocoder = new google.maps.Geocoder();
      pvt.directionsService = new google.maps.DirectionsService();
      pvt.directionsRenderer = new google.maps.DirectionsRenderer();
    };

    pvt.initPage = () => {
      pvt.goToPage(pvt.Page.LOC);
    };

    // -------------------------------------------------------------------------
    // EVENT LISTENERS
    // -------------------------------------------------------------------------

    pub.bind = () => {
      pvt.bindLogo();

      pvt.bindLoc();
      pvt.bindRad();
      pvt.bindMap();
    };

    pvt.bindLogo = () => {
      pvt.$logo.on("click", () => {
        location.reload();
      });
    };

    pvt.bindLoc = () => {
      const $page = pvt.getPage(pvt.Page.LOC);
      const $input = $page.find(pvt.Selector.INPUT);
      const $submit = $page.find(pvt.Selector.SUBMIT);

      $input.on("keydown", e => {
        if (e.which === pvt.KeyCode.ENTER) {
          pvt.submitLoc($input.val().trim());
        }
      });
      $submit.on("click", () => {
        pvt.submitLoc($input.val().trim());
      });
    };

    pvt.bindRad = () => {
      const $page = pvt.getPage(pvt.Page.RAD);
      const $input = $page.find(pvt.Selector.INPUT);
      const $submit = $page.find(pvt.Selector.SUBMIT);

      $input.on("keydown", e => {
        if (e.which === pvt.KeyCode.ENTER) {
          pvt.submitRad($input.val().trim());
        }
      });
      $submit.on("click", () => {
        pvt.submitRad($input.val().trim());
      });
    };

    pvt.bindMap = () => {
      const $page = pvt.getPage(pvt.Page.MAP);
      const $title = $page.find(pvt.Selector.TITLE);
      const $submit = $page.find(pvt.Selector.SUBMIT);
      const submitMap = () => {
        $title.text(pvt.Label.AND_HERES_YOUR_ROUTE);
        $submit.text(pvt.Label.GIVE_ME_SOMETHING_FRESH);

        pvt.genRoute();
      };

      pvt.$body.on("keydown", e => {
        if (e.which === pvt.KeyCode.ENTER) {
          submitMap();
        }
      });
      $submit.on("click", submitMap);
    };

    // -------------------------------------------------------------------------
    // LOC
    // -------------------------------------------------------------------------

    pvt.submitLoc = loc => {
      if (loc.length > 0) {
        pvt.setLoc(loc);
        pvt.goToPage(pvt.Page.RAD);
      } else {
        alert(pvt.Alert.LOC);
      }
    };

    pvt.setLoc = loc => {
      pvt.geocoder.geocode({ address: loc }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();

          pvt.loc = new google.maps.LatLng(lat, lng);
        }
      });
    };

    // -------------------------------------------------------------------------
    // RAD
    // -------------------------------------------------------------------------

    pvt.submitRad = rad => {
      if (rad > 0) {
        pvt.setRad(rad);
        pvt.initMap();
        pvt.genRoute();

        pvt.goToPage(pvt.Page.MAP);
      } else {
        alert(pvt.Alert.RAD);
      }
    };

    pvt.setRad = rad => {
      pvt.rad = rad;
    };

    // -------------------------------------------------------------------------
    // MAP
    // -------------------------------------------------------------------------

    pvt.initMap = () => {
      const options = {
        center: pvt.loc,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false
      };

      pvt.map = new google.maps.Map(pvt.$map[0], options);
    };

    pvt.genRoute = () => {
      pvt.genNearbys();
      pvt.genWaypoints();
      pvt.genDirections();
    };

    pvt.genNearbys = () => {
      pvt.KEYWORDS.forEach(keyword => {
        const service = new google.maps.places.PlacesService(pvt.map);
        const request = {
          location: pvt.loc,
          radius: pvt.rad / 2,
          keyword: keyword
        };
        const callback = (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            pvt.nearbys = pvt.nearbys.concat(results);
          }
        };

        service.nearbySearch(request, callback);
      });
    };

    pvt.genWaypoints = () => {
      pvt.waypoints = [];
      for (let i = 0; i < 4; i += 1) {
        const index = Math.floor(Math.random() * 80);
        const nearby = pvt.nearbys[index];

        if (nearby) {
          pvt.waypoints.push({
            location: nearby.geometry.location,
            stopover: true
          });
        }
      }
    };

    pvt.genDirections = () => {
      const options = {
        origin: pvt.loc,
        destination: pvt.loc,
        waypoints: pvt.waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING
      };
      const callback = (results, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          pvt.directionsRenderer.setDirections(results);
        }
      };

      pvt.directionsRenderer.setMap(pvt.map);
      pvt.directionsService.route(options, callback);
    };

    // -------------------------------------------------------------------------
    // PAGES
    // -------------------------------------------------------------------------

    pvt.goToPage = name => {
      const theme = pvt.THEMES[name];
      const color = theme.color;
      const image = theme.image;

      const $pages = pvt.getPages();
      const $page = pvt.getPage(name);
      const $input = $page.find(pvt.Selector.INPUT);
      const $submit = $page.find(pvt.Selector.SUBMIT);

      pvt.$body.addClass("hidden");
      $pages.addClass("hidden");

      pvt.$overlay.css("background-color", color);
      pvt.$body.css("background-color", color).css("background", image);

      pvt.$body.removeClass("hidden");
      $page.removeClass("hidden");
      if ($input.length > 0) {
        $input.focus();
      } else {
        $submit.focus();
      }
    };

    pvt.getPages = () => {
      return $(pvt.Selector.PAGE);
    };

    pvt.getPage = name => {
      return pvt.getPages().filter(`[data-page=${name}]`);
    };

    return pub;
  };

  return {
    getInstance: () => {
      if (!instance) {
        instance = create();
      }

      return instance;
    }
  };
})();

$(document).ready(() => {
  App.getInstance().init();
  App.getInstance().bind();
});
