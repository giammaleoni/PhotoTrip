angular.module('starter.controllers', [])

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
      },
      {
        title: 'Vacanze Romane',
        id: 1,
        from: '10/08/2014', to: '11/08/2014',
        where: 'Roma, Italia',
        img: '/img/roma.jpg',
        friends:
          [
            {id:1},
            {id:2},
            {id:3},
          ],
      },
    ],

    friends: [
      { id: 0, name: 'Claudia', surname: 'Cassano', installed: 'Y', other: "blablabla", img: '/img/anonimo.png', checked: false},
      { id: 1, name: 'Gianmaria', surname: 'Leoni', installed: 'Y', other: "blablabla", img: '/img/anonimo.png', checked: false},
      { id: 2, name: 'Alberto', surname: 'Leoni', installed: 'N', other: "blablabla", img: '/img/anonimo.png', checked: false},
      { id: 3, name: 'Pinco', surname: 'Pallino', installed: 'Y', other: "blablabla", img: '/img/anonimo.png', checked: false},
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
    getFriendsChecked: function(trip) {
      //da sistemare!!
      friends = this.friends;
      tripFriends = trip.friends;
      tripFriends.forEach(function(friend){
        for (var i = 0; i < friends.length; i++) {
          if (friend.id === friends[i].id) {
            friends[i].checked = true;
          }
        }
      })
      return friends;
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
  }
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
  //.controller('TripCtrl', function($scope, trip) {
  //$scope.trip = trip;



  //da comprimere in un solo statement direttamente nel service
  //$scope.tripFriends = TripsService.getTripFriends($stateParams.tripId);
  //$scope.tripFriends = TripsService.getFriendsDetail($scope.tripFriends);

  $scope.trip = TripsService.getTrip($stateParams.tripId);
  $scope.tripFriends = TripsService.getFriendsChecked($scope.trip);

})

.controller('FriendsCtrl', function($scope, $stateParams, TripsService){
  $scope.trip = TripsService.getTrip($stateParams.tripId)
  $scope.friends = TripsService.getFriendsChecked($scope.trip);
});
