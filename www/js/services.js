var module = angular.module('starter.controllers', ['firebase', 'daterangepicker', 'ngOpenFB']);


module.service('TripsService', function($firebaseArray, $firebaseAuth){

  var rootRef = new Firebase("https://radiant-heat-1148.firebaseio.com/");

  var user = null;
  var uid = null;
  var authData = null;
  var profilePic = null;
  var trips = $firebaseArray(rootRef.child("trips"));
  var users = $firebaseArray(rootRef.child("users"));

  return {
    setUID: function (id) {
      uid = id;
    },
    getUID: function() {
      return uid;
    },
    setUser: function(utente) {
      user = utente;
    },
    getUser: function () {
      return user;
    },
    setProfilePic: function(pic) {
      profilePic = pic;
    },
    getProfilePic: function() {
      return profilePic;
    },
    getAuth: function () {
      return $firebaseAuth(rootRef);
    },
    getTrips: function () {
      return trips;
    },
    getUsers: function () {
      return users;
    },
    getTripRef: function(tripId) {
      return rootRef.child("trips").child(tripId);
    },
    getRef: function () {
      return rootRef;
    },
  };

});

module.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}]);
