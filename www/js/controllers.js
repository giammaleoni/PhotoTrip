angular

.module('starter.controllers', ['ionic', 'firebase', 'ngCordova', 'webcam'])

.factory('TripsService', function($firebaseArray){

  var rootRef = new Firebase("https://radiant-heat-1148.firebaseio.com/");
  //var userRef = new Firebase("https://radiant-heat-1148.firebaseio.com/users/");
  //var users = $firebaseArray(userRef);
  var user = null;

  return {
    setUser: function(utente) {
      user = utente;
    },
    getUser: function () {
      return user;
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
  };

})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $rootScope, TripsService) {
  // mi dati che servono:
  //  - Utente con dettaglio
  //      . name
  //      . uid
  //      . foto

  // percorso firebase
  var ref = TripsService.getRef();

  //utente
  $scope.user = null
  $scope.loginData = {};

  //comprende tutte le attività da fare quando ci si loogga
  loggedUser = function(authData) {
    userData = ref.child('users').child(authData.uid);
    $scope.profilePic = authData.password.profileImageURL || "/img/anonimo.png";
    userData.once("value", function(snap) {
      $scope.user = snap.val();
      TripsService.setUser($scope.user);
      console.log("Authenticated user with uid:", authData.uid);
      console.log($scope.user);
      console.log(authData.uid);
    });
  }


  var authData = ref.getAuth();
  if (authData) {
    loggedUser(authData);
  }else{
    console.log("No user logged");
    $scope.profilePic = "/img/anonimo.png";
    $scope.user = null;
    TripsService.setUser($scope.user);
  }

  //pop up di conferma
  $scope.showConfirm = function(error, oktext, canceltext){
    var confirmPopup = $ionicPopup.confirm({
      title: '', //'Validation Error',
      template: error,
      okText: oktext || 'Try Again',
      cancelText: canceltext || 'Cancel'
    });
    confirmPopup.then(function(tryAgain) {
      if (tryAgain) {

      }else {
        $scope.closeLogin();
        $scope.closeSignup();
      }
    });
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
    var email = $scope.loginData.email;
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
          loggedUser(authData);
          $scope.closeLogin();
        }
      });
    }
    else{
      $scope.showConfirm("Please enter mail and password.");
    };
  }

  //logout
  $scope.doLogout = function() {
      ref.unauth();
      authData = ref.getAuth()
      if (authData){
        console.log("user:", authData.uid, "still logged");
      }else{
        $scope.profilePic = "/img/anonimo.png";
        $scope.user = null;
        TripsService.setUser($scope.user);
        console.log("User logged out");
      }
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

          //to get the name of the user
          // find a suitable name based on the meta info given by each provider
          // function getName(authData) {
          //   switch(authData.provider) {
          //      case 'password':
          //        return authData.password.email.replace(/@.*/, '');
          //      case 'twitter':
          //        return authData.twitter.displayName;
          //      case 'facebook':
          //        return authData.facebook.displayName;
          //   }
          // }

          //inserisce tra gli users i dettagli dell'utente reistrato
          ref.child("users").child(userData.uid).set({
                email: $scope.loginData.email,
                name: $scope.loginData.name || null,
                surname: $scope.loginData.surname || null,
                birth_date: $scope.loginData.birthday ? $scope.loginData.birthday.getTime() : null,
                reg_date: Firebase.ServerValue.TIMESTAMP,
                gender: $scope.loginData.gender || null,
                trips: {},
                privacy: $scope.loginData.privacy || false,
          });
          $scope.closeSignup();
          $scope.doLogin();
        }
      });
    }
    else{
      $scope.showConfirm("Please enter at least mail and password");
    };
  }

//se non sono loggato si deve aprire il login!!
$timeout(function() {
  if (!$scope.user) {
    $scope.login();
  }
}, 2000)


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
