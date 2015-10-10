var module = angular.module('starter.controllers', ['firebase', 'daterangepicker', 'ngOpenFB']);


module.service('TripsService', function($firebaseArray, $firebaseAuth){

  var rootRef = new Firebase("https://radiant-heat-1148.firebaseio.com/");

  var user = null;
  var uid = null;
  var authData = null;
  var profilePic = null;
  var trips = $firebaseArray(rootRef.child("trips"));
  var users = $firebaseArray(rootRef.child("users"));
  var photos = $firebaseArray(rootRef.child("photos"));

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
    getPhotos: function () {
      return photos;
    },
    getTripRef: function(tripId) {
      return rootRef.child("trips").child(tripId);
    },
    getRef: function () {
      return rootRef;
    },
  };

});
