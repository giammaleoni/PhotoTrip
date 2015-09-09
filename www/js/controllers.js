angular

.module('starter.controllers', ['ionic', 'firebase', 'ngCordova', 'webcam'])

.factory('TripsService', function($firebaseArray){

  var rootRef = new Firebase("https://radiant-heat-1148.firebaseio.com/");
  var userRef = new Firebase("https://radiant-heat-1148.firebaseio.com/users/");
  var user = null;
  var users = $firebaseArray(userRef);

  return {
    setUser: function(username) {
      user = username;
      return $firebaseArray(rootrootRef.child("users/" + user));
    },
    getUserDetails: function () {
      return $firebaseArray(rootRef.child("users/" + user));
    },
    getTrips: function () {
      return $firebaseArray(rootRef.child("trips"));
    },
    getPhotos: function() {
      return $firebaseArray(rootRef.child("photos"));
    },
    getRef: function () {
      return rootRef;
    },
    getUser: function () {
      return user;
    },
    getUsers: function () {
      return users;
    }
  };

})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, TripsService) {
  // mi dati che servono:
  //  - Utente con dettaglio
  //      . name
  //      . uid
  //      . foto

  // percorso firebase
  var ref = TripsService.getRef();
  //utente
  $scope.user = TripsService.getUser();
  if ($scope.user) {
    $scope.userDetails = TripsService.getUserDetails();
  }
  $scope.loginData = {};
  $scope.users = TripsService.getUsers();

  var authData = ref.getAuth();
  if (authData) {
    console.log("Authenticated user with uid:", authData.uid);
    console.log(authData);
    //$scope.user = authData;
    $scope.users.$add(authData);
    //$scope.azione = "Log out"; --> fare con ng-if={{user}} sull'html
  }else{
    console.log("No user logged");
    //$scope.user = "no user logged";
    //$scope.tipoAzione = "Log in"; --> fare con ng-if={{user}} sull'html
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    var email = $scope.loginData.username;
    var password = $scope.loginData.password;
    if(email && password){
      ref.authWithPassword({
        "email": email,
        "password": password
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          $scope.showConfirm(error);
        } else {
          console.log("Authenticated user with uid:", authData.uid);
          console.log(authData);
          $scope.user = authData;
          //$scope.userDetail = getUserDetail($scope.friends, $scope.user);
          //$scope.icon = $scope.userDetail.img ? $scope.userDetail.img : noUser.img;
          $scope.closeLogin();
        }
      });
    }
    else{
      $scope.showConfirm("Please enter username and password.");
    };
  }

  $scope.doLogout = function() {
    //$scope.showConfirm("Are you sure to logout?", "Confirm", "Cancel", function() {
      ref.unauth();
      //$scope.user = "no user logged";
      //$scope.userDetail = {};
      //$scope.icon = $scope.userDetail.img ? $scope.userDetail.img : noUser.img;
    //});

  }

  // Create the signup modal that we will use later
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal2 = modal;
  });

  // Open the signup modal
  $scope.signup = function() {
    $scope.modal2.show();
  };

  // Triggered in the login modal to close it
  $scope.closeSignup = function() {
    $scope.modal2.hide();
  };

  $scope.doSignup = function() {
    console.log('Doing signup', $scope.loginData);
    var email = $scope.loginData.email;
    var password = $scope.loginData.password;
    if(email && password){
      ref.createUser({
        email: email,
        password: password
      }, function(error, userData) {
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              console.log("The new user account cannot be created because the email is already in use.");
              $scope.showConfirm("The new user account cannot be created because the email is already in use.");
            break;
            case "INVALID_EMAIL":
              console.log("The specified email is not a valid email.");
              $scope.showConfirm("The specified email is not a valid email.");
            break;
            default:
              console.log("Error creating user:", error);
              $scope.showConfirm("Error creating user:" + error);
          }
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          //$scope.user = userData;
          $scope.users.$add(
            {
              uid: userData.uid,
              email: $scope.loginData.email,
              name: $scope.loginData.name,
              surname: $scope.loginData.surname,
              birth_date: $scope.loginData.birthday,
              reg_date: new Date(),
              gender: $scope.loginData.gender,
              trips: {},
              privacy: $scope.loginData.privacy,
              }
            );
          $scope.closeSignup();
        }
      });
    }
    else{
      $scope.showConfirm();
    };
  }

})

.controller('TripsCtrl', function($scope, trips) {
  //mi servono i trips per utente
})

.controller('TripCtrl', function($scope, trips, $stateParams, TripsService) {
  //  mi serve:
  //    - dettaglio del trip
  //    - dettaglio degli amici

})

.controller('FriendsCtrl', function($scope, $stateParams, TripsService, $timeout){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio degli amici

})

.controller('AlbumCtrl', function($scope, $state, $stateParams, TripsService, $cordovaSocialSharing){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto

})

.controller('AlbumChessboardCtrl', function($scope, $state, $stateParams, TripsService){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto

})

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $stateParams, TripsService) {
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto
  //    - mappa

})

.controller('PhotosCtrl', function($scope, TripsService) {
  //mi servono:
  // trips per utente
  // dettaglio foto


});

//più controller stesso service
