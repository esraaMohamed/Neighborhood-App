var map;

//styles variable is used to style the map
var styles = [
	{
		featureType: 'water',
		stylers: [
			{ color: '#19a0d8' }
			]
	},{
		featureType: 'administrative',
		elementType: 'labels.text.stroke',
		stylers: [
			{ color: '#ffffff' },
			{ weight: 6 }
			]
	},{
		featureType: 'administrative',
		elementType: 'labels.text.fill',
		stylers: [
			{ color: '#e85113' }
			]
	},{
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [
			{ color: '#efe9e4' },
			{ lightness: -40 }
			]
	},{
		featureType: 'transit.station',
		stylers: [
			{ weight: 9 },
			{ hue: '#e85113' }
			]
	},{
		featureType: 'road.highway',
		elementType: 'labels.icon',
		stylers: [
			{ visibility: 'off' }
			]
	},{
		featureType: 'water',
		elementType: 'labels.text.stroke',
		stylers: [
			{ lightness: 100 }
			]
	},{
		featureType: 'water',
		elementType: 'labels.text.fill',
		stylers: [
			{ lightness: -100 }
			]
	},{
		featureType: 'poi',
		elementType: 'geometry',
		stylers: [
			{ visibility: 'on' },
			{ color: '#f0e4d3' }
			]
	},{
		featureType: 'road.highway',
		elementType: 'geometry.fill',
		stylers: [
			{ color: '#efe9e4' },
			{ lightness: -25 }
			]
	}
	];

function Locations(data){
	var self = this;
	self.venue_id = ko.observable(data.id);
	self.title = ko.observable(data.title);
	self.location = ko.observable(data.location);
	self.address = ko.observable(data.address);
	self.price = ko.observable(data.price);
	self.rating = ko.observable(data.rating);
	self.url = ko.observable(data.url);
	self.venue_open = ko.observable(data.isOpen);
	self.marker = data.marker;
}

var ViewModel = function() {
	var self = this;
	self.myLocations = ko.observableArray([]);
	self.searchInput = ko.observable();
	this.initMap = function(){
		// Constructor creates a new map.
		map = new google.maps.Map(document.getElementById('map'), {
			center: { lat : 37.7727138, lng : -122.4127551},
			zoom: 14,
			styles: styles,
			mapTypeControl: false
		});

		
		var defaultIcon = makeMarkerIcon('0091ff');

		var highlightedIcon = makeMarkerIcon('FFFF24');
		
		var clickedIcon = makeMarkerIcon('ecb4a4');

		client_id ="KKI0AMUBBTASBZ1DGBOWKHBY3ZUE24TSGXNHIWGPWU34BACZ";
		client_secret ="MH2V0KQ3MQMOEYLEVSXI1MMNLPB4GDUCZFGPQLFB0PUZ5HPP";
		var $city = "San Fransisco";
		var $establishment = "Restaurant";
		var $listElements = $('#list-items');
		var $errorHeader = $('error-header');
		var url = "https://api.foursquare.com/v2/venues/explore?near="+$city+"&query="+$establishment+"&client_id="+client_id+"&client_secret="+client_secret+"&v=20171202";
		var locations =[];
		var largeInfowindow = new google.maps.InfoWindow();
		var bounds = new google.maps.LatLngBounds();

		var foursquareTimeout = setTimeout(function(){
			$errorHeader.text("Foursquare data could not be loaded");
		}, 8000);

		$.ajax({
			url: url,
			dataType: 'jsonp',
			type: 'GET',
			success: function( data ) {
				places = data.response.groups[0].items;
				for(var i=0;i<places.length;i++){
					var place = places[i];
					var title = place.venue.name;
					var venue_id = place.venue.id;
					if(title!==""){
						// Venue position
						var position = {lat: place.venue.location.lat, lng:place.venue.location.lng};

						//Venue Rating
						var rating = "";
						if(place.venue.rating){
							rating = place.venue.rating;
						}
						else{
							rating = "No Rating";
						}

						// Venue open or closed
						var isOpen = place.venue.hours.isOpen;
						var shop_open = "";
						if(isOpen){
							shop_open = "Open Now";
						}
						else {
							shop_open = "Closed";
						}

						// Venue URL
						var url = place.venue.url;
						if(!url){
							url = "";
						}

						// Venue Address
						var address = place.venue.location.formattedAddress;
						var formattedAddress = "";
						for(var a=0;a<address.length;a++){
							formattedAddress += address[a]+" ";
						}

						//Venue price range
						var tier = 0;
						var message = "";
						var currency = "";
						var currencySymbol ="";
						var price = place.venue.price;
						if(price){
							tier = place.venue.price.tier;
							message = place.venue.price.message;
							currency = place.venue.price.currency;
							for(var t=0; t<tier;t++){
								currencySymbol += currency;
							}
						}
						else{
							message = "Price range not specified";
						}

						//Venue marker
						var marker = new google.maps.Marker({
							position: position,
							title: title,
							address: address,
							price_message: message,
							price_currency: currencySymbol,
							rating: rating,
							url: url,
							venue_open: shop_open,
							animation: google.maps.Animation.DROP,
							icon: defaultIcon,
							id: i,
							map: map
						});

						// Create an onclick event to open an infowindow at each marker.
						marker.addListener('click', function() {
							$("#menu").hide();
							self.populateInfoWindow(this, largeInfowindow);
							//$("#menu").fadeToggle("200");
							this.setIcon(clickedIcon);
						});
						marker.addListener('mouseover', function() {
							this.setIcon(highlightedIcon);
						});
						marker.addListener('mouseout', function() {
							this.setIcon(defaultIcon);
							this.setAnimation(null);

						});

						var location = {id: venue_id, title:title, location:position, address: formattedAddress, 
								price:{message, currencySymbol}, rating: rating, url: url, isOpen: shop_open, marker: marker};
						locations.push(location);
					}
				}
				locations.forEach(function(locationItem){
					self.myLocations.push(new Locations(locationItem));
				});
				clearTimeout(foursquareTimeout);

			}
		}); 
	};
	
	
	$("#hamburger-menu").click(function() {
		$("#menu").fadeToggle("200");
	});

	// This function creates the marker icon with different colors
	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage(
				'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
				'|40|_|%E2%80%A2',
				new google.maps.Size(21, 34),
				new google.maps.Point(0, 0),
				new google.maps.Point(10, 34),
				new google.maps.Size(21,34));
		return markerImage;
	};

	// This function populates the info window when the marker is clicked.
	this.populateInfoWindow = function(marker, infowindow) {
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			marker.setAnimation(google.maps.Animation.DROP); 
			var innerHTML = '<div>';
			innerHTML += '<strong>' + marker.title + '</strong>';
			innerHTML += '<br>' + marker.address;
			innerHTML += '<br><strong>'+ marker.price_message +'</strong><br><strong>'
			+ marker.price_currency +'</strong>'
			innerHTML += '<br><strong>' +marker.venue_open +'</strong><br>';
			innerHTML += '<strong>' + marker.rating +'</strong><br>';
			innerHTML += '<strong><a href="' +marker.url +'">'+marker.url+'</strong><br>';
			innerHTML += '</div>';
			infowindow.setContent(innerHTML);
			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the info window is closed.
			infowindow.addListener('closeclick',function(){
				infowindow.setMarker = null;
			});
		}
	};

	// Filtering the input of the user this method is used as the data bind of the list items to change the view with every user input
	self.filteredListItems = ko.computed(function() {
		var userInput = self.searchInput();
		if (!userInput) {
			self.myLocations().forEach(function(location) {
				if (location.marker) {
					location.marker.setVisible(true);
				}
			});
			return self.myLocations();
		} else {
			return ko.utils.arrayFilter(self.myLocations(), function(location) {
				if (location.title().toLowerCase().indexOf(userInput) != -1 ) {
					location.marker.setVisible(true);
					return location;
				} else {
					location.marker.setVisible(false);
				}
			});
		}
	}, self.animateMarker = function(location){
		google.maps.event.trigger(location.marker, 'click');
	});

	// To trigger a click on the marker of the list item that was clicked
	self.listItemClicked = function(venue) {
		google.maps.event.trigger(venue.marker, 'click');
	};

	// error message if map does not load
	function mapLoadingError() {
		alert("Google Map was unable to load... Please try again");
	};

};

var model = new ViewModel();
ko.applyBindings(model);
