// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.photos', {
    url: '/photos',
    views: {
      'menuContent': {
        templateUrl: 'templates/photos.html',
        controller: 'PhotosCtrl',
      }
    }
  })

    .state('app.trips', {
      url: '/trips',
      views: {
        'menuContent': {
          templateUrl: 'templates/trips.html',
          controller: 'TripsCtrl',
          resolve: {
            trips: function(TripsService) {
              return TripsService.getTrips()
            }
          }
        }
      }
    })

  .state('app.trip', {
    url: '/trips/:tripId',
    views: {
      'menuContent': {
        templateUrl: 'templates/trip.html',
        controller: 'TripCtrl',
        // resolve: {
        //   trip: function($stateParams, TripsService) {
        //     return TripsService.getTrip($stateParams.tripId)
        //   }
        //}
      }
    }
  })

  .state('app.friends', {
    url: '/trips/:tripId/friends',
    views: {
      'menuContent': {
        templateUrl: 'templates/friends.html',
        controller: 'FriendsCtrl',
      }
    }
  })

  .state('app.album', {
    url: '/trips/:tripId/album',
    views: {
      'menuContent': {
        templateUrl: 'templates/album.html',
        controller: 'AlbumCtrl',
      }
    }
  })

  .state('app.albumChessboard', {
    url: '/trips/:tripId/albumChessboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/photos.html',
        controller: 'AlbumChessboardCtrl',
      }
    }
  })

  .state('app.map', {
    url: '/trips/:tripId/map',
    views: {
      'menuContent': {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl',
      }
    }
  })

  .state('app.camera', {
    url: '/trips/:tripId/camera',
    views: {
      'menuContent': {
        templateUrl: 'templates/camera.html',
        controller: 'CameraCtrl',
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/trips');
});
