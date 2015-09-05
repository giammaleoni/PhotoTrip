angular

.module('starter.controllers', [])

.service('TripsService', function($q) {
  return {
    trips: [{
        title: 'Capodanno Amsterdam',
        id: 0,
        where: 'Amsterdam, Paesi Bassi',
        from: '31/12/2014', to: '03/01/2015',
        img: '/img/amsterdam.jpg',
        friends: [
          {id:0},
          {id:1},
        ],
        album: [
          {
            id:0,
            title: 'tramonto',
            descr:'tramonto sui canali',
            by: {id: 1},
            date:'01/01/2015',
            img: '/img/amsterdam1.jpg',
            geotag: { lat: 52.3717158, lng: 4.8916142 },
          },
          {
            id:1,
            title: 'test',
            descr:'descrizione test',
            by: {id: 1},
            date:'02/01/2015',
            img: '/img/amsterdam2.jpg',
            geotag: { lat: 52.3749158, lng: 4.8986142 },
          },
        ],
      },
      {
        title: 'Vacanze Romane',
        id: 1,
        from: '10/08/2014', to: '11/08/2014',
        where: 'Roma, Italia',
        img: '/img/roma.jpg',
        friends:
          [
            {id:0},
            {id:1},
            {id:2},
          ],
          album: [
            {
              id:0,
              title: 'tramonto',
              descr:'tramonto sul tevere',
              by: {id: 0},
              date:'10/08/2014',
              img: '/img/roma1.jpg',
              geotag: { lat: 41.9100711, lng: 12.5369979 },
            },
            {
              id:1,
              title: 'test',
              descr:'descrizione test',
              by: {id: 3},
              date:'11/08/2014',
              img: '/img/roma2.jpg',
              geotag: { lat: 41.9127711, lng: 12.5351979 },
            },
            {
              id:3,
              title: 'test',
              descr:'descrizione test',
              by: {id: 3},
              date:'11/08/2014',
              img: '/img/roma3.jpg',
              geotag: { lat: 41.9119711, lng: 12.5325979 },
            },
          ],
      },
    ],

    friends: [
      { id: 0, name: 'Claudia',   surname: 'Cassano', installed: 'Y', other: "blablabla", img: '/img/anonimo.png'},
      { id: 1, name: 'Gianmaria', surname: 'Leoni',   installed: 'Y', other: "blablabla", img: '/img/anonimo.png'},
      { id: 2, name: 'Alberto',   surname: 'Leoni',   installed: 'N', other: "blablabla", img: '/img/anonimo.png'},
      { id: 3, name: 'Pinco',     surname: 'Pallino', installed: 'Y', other: "blablabla", img: '/img/anonimo.png'},
    ],


    getTrips: function() {
      return this.trips
    },
    getTrip: function(tripId) {
      //var dfd = $q.defer()
      var __trip;
      this.trips.forEach(function(trip) {
        if (trip.id === parseInt(tripId)) {
          __trip = trip //dfd.resolve(trip)
        }
      })
      return __trip;
      //return dfd.promise
    },
    getFriends: function() {
      return this.friends
    },
    getTripFriends: function(tripId) {
      var __trip;
      this.trips.forEach(function(trip) {
        if (trip.id === parseInt(tripId)) {
          __trip = trip
        }
      })
      return __trip.friends;
    },
    getFriendDetail: function(friend) {
      friends = this.friends;
      for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === friend.id ) {
          return friends[i];
        }
      }
    },
    getFriendsDetail: function(tripFriends) {
      friends = this.friends;
      tripFriends.forEach(function(friend, index, tf){
        for (var i = 0; i < friends.length; i++) {
          if (friends[i].id === friend.id ) {
            //friend = friends[i];
            tf[index] = friends[i];
          }
        }
      })
      return tripFriends;
    },
    getTripFriendsDetail: function(trip, friends){
      tripFriends = trip.friends
      trip.friends = [];
      friends.forEach(function(friend){
        trip.friends.push(angular.copy(friend));
        for (var i = 0; i < tripFriends.length; i++) {
          if (tripFriends[i].id === friend.id) {
            trip.friends[i].checked = true;
            break;
          }else{
            //trip.friends[i].checked = false;
          }
        }
      });
      trip.inited = true;
      return trip
    },
    getPhotoDetail: function(album, friends){
      album.forEach

      album.inited = true;
      return trip
    },
    localSaveTrip: function (trip){
      //salva un trip nella local storage
    },
    localGetTrips: function(){
      //riprende tutti i trip dalla local storage
    },
    localGetFriends: function(){
      //riprende tutti gli amici dalla local storage
    }

  }
})

.factory('InitService', function() {
	var hasInited = false;
	return hasInited;
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('TripsCtrl', function($scope, trips) {
  $scope.trips = trips;

})

.controller('TripCtrl', function($scope, $stateParams, TripsService){

  $scope.trip = TripsService.getTrip($stateParams.tripId);
  $scope.friends = TripsService.getFriends();

  //se il trip è già stato inizializzato non re-inizializzare
  if(! $scope.trip.inited ) TripsService.getTripFriendsDetail($scope.trip, $scope.friends);

})

.controller('FriendsCtrl', function($scope, $stateParams, TripsService){

  $scope.trip = TripsService.getTrip($stateParams.tripId);
  $scope.friends = TripsService.getFriends();

  //se il trip è già stato inizializzato non re-inizializzare
  if(! $scope.trip.inited ) TripsService.getTripFriendsDetail($scope.trip, $scope.friends);

})

.controller('AlbumCtrl', function($scope, $stateParams, TripsService){

  $scope.trip = TripsService.getTrip($stateParams.tripId);
  $scope.album = angular.copy($scope.trip.album);

  for (var i = 0; i < $scope.album.length; i++) {
    $scope.album[i].by = TripsService.getFriendDetail($scope.album[i].by);
  }


})

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $stateParams, TripsService) {
  $scope.trip = TripsService.getTrip($stateParams.tripId);


  function initialize() {
    var myLatlng = new google.maps.LatLng(0,0);

    var mapOptions = {
      center: myLatlng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('map'),mapOptions);


    //Marker + infowindow + angularjs compiled ng-click
    var infowindow = new google.maps.InfoWindow();
    var contentString;
    var compiled;



    map.panTo($scope.trip.album[0].geotag);
    $scope.trip.album.forEach(function(photo, index){

        marker = new google.maps.Marker({
          position: photo.geotag,
          map: map,
          title: photo.title,
       });

       google.maps.event.addListener(marker, 'click', function() {
         contentString =  "<div><a ng-click='clickTest()'>Click me!</a>" +
                          "<p><img ng-src='{{trip.album[" + index + "].img'></p>" + 
                          "<p>{{trip.album[" + index + "].title}}</p></div>"
         compiled = $compile(contentString)($scope);
         infowindow.setContent(compiled[0]);
         infowindow.open(map,marker);
       });

    })


    $scope.map = map;
  }

  initialize();

  //google.maps.event.addDomListener(window, 'load', initialize);

  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
  };
});
