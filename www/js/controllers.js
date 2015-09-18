angular

.module('starter.controllers', ['firebase', 'ngCordova', 'webcam', 'daterangepicker'])


.factory('TripsService', function($firebaseArray, $firebaseAuth){

  var rootRef = new Firebase("https://radiant-heat-1148.firebaseio.com/");
  //var userRef = new Firebase("https://radiant-heat-1148.firebaseio.com/users/");
  //var users = $firebaseArray(userRef);
  var user = null;
  var uid = null;
  var profilePic = null;

  return {
    setUser: function(utente) {
      user = utente;
    },
    setProfilePic: function(pic) {
      profilePic = pic;
    },
    getAuth: function () {
      return $firebaseAuth(rootRef.child("users"));
    },
    getUser: function () {
      return user;
    },
    getProfilePic: function() {
      return profilePic;
    },
    getTrips: function () {
      return $firebaseArray(rootRef.child("trips"));
    },
    getTripRef: function(tripId) {
      return rootRef.child("trips").child(tripId);
    },
    getPhotos: function() {
      return $firebaseArray(rootRef.child("photos"));
    },
    getRef: function () {
      return rootRef;
    },
    setUID: function (id) {
      uid = id;
    },
    getUID: function() {
      return uid;
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
  $scope.user = TripsService.getUser();
  $scope.loginData = {};

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
          $scope.closeLogin();
        }
      });
    }
    else{
      $scope.showConfirm("Please enter mail and password.");
    };
  }

  auth = TripsService.getAuth();
  $scope.doFacebookLogin = function () {
    //CI SONO PROBLEMI A FARE IL LOGIN SENZA POPUP, NON PARTE L'EVENTO ONAUTH()
    //auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      // User successfully logged in
      //non si può usare la console perchè il login avviene su unaltra pagina
    //}).catch(function(error) {
    //  if (error.code === "TRANSPORT_UNAVAILABLE") {
        auth.$authWithOAuthPopup("facebook", {
          //remember: "sessionOnly",
          scope: "email,user_friends",
        }).then(function(authData) {
          // User successfully logged in. We can log to the console
          // since we’re using a popup here
          $scope.closeLogin();
        });
      //} else {
        // Another error occurred
      //  console.log(error);
      //}
    //});
  }

  //comprende tutte le attività da fare quando ci si loogga
  loggedUser = function(authData) {
    console.log("Logged in as", authData.uid);
    TripsService.setUID(authData.uid);
    console.log(authData);
    //aggiungere l'utente di facebook alla registrazione in user
    userData = ref.child('users').child(authData.uid);
    switch (authData.provider) {
      case 'password':
        $scope.profilePic = authData.password.profileImageURL || "/img/anonimo.png";
        break;
      case 'facebook':
        $scope.profilePic = authData.facebook.profileImageURL || "/img/anonimo.png";
        break;
      default:

    }

    //$scope.profilePic = authData.password.profileImageURL || "/img/anonimo.png";
    userData.once("value", function(snap) {
      $scope.user = snap.val();

      //se non esiste un utente registrato di facebook lo registro tra gli user
      if (!$scope.user && authData.provider == 'facebook') {
        ref.child("users").child(authData.uid).set({
              email:        authData.facebook.email,
              name:         authData.facebook.cachedUserProfile.first_name,
              surname:      authData.facebook.cachedUserProfile.last_name,
              birth_date:   null,
              reg_date:     Firebase.ServerValue.TIMESTAMP,
              gender:       authData.facebook.cachedUserProfile.gender,
              id:           authData.facebook.id,
              locale:       authData.facebook.cachedUserProfile.locale,
              link:         authData.facebook.cachedUserProfile.link,
              trips:        {},
              //privacy:    'X',
              provider:     'facebook',
              age_range:    authData.facebook.cachedUserProfile.age_range
        });

        //controlla quando user cambia
        userData.once("value", function(snap) {
          $scope.user = snap.val();
          TripsService.setUser($scope.user);
          console.log($scope.user);
        });
      }else {
        TripsService.setUser($scope.user);
        console.log($scope.user);
      }


    });
  }

  auth.$onAuth(function(authData) {
  if (authData === null) {
    console.log("Not logged in yet");
    $scope.profilePic = "/img/anonimo.png";
    $scope.user = null;
    TripsService.setUser($scope.user);
    // se non sono loggato vai al login
    $scope.login();
  } else {
    loggedUser(authData);
  }
  TripsService.setProfilePic($scope.profilePic);
});

  //logout
  $scope.doLogout = function() {
      ref.unauth();
      authData = ref.getAuth()
      if (authData){
        console.log("user:", authData.uid, "still logged");
      }else{
        // $scope.profilePic = "/img/anonimo.png";
        // $scope.user = null;
        // TripsService.setUser($scope.user);
        // console.log("User logged out");
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
                email:        $scope.loginData.email,
                name:         $scope.loginData.name || null,
                surname:      $scope.loginData.surname || null,
                birth_date:   $scope.loginData.birthday ? $scope.loginData.birthday.getTime() : null,
                reg_date:     Firebase.ServerValue.TIMESTAMP,
                gender:       $scope.loginData.gender || null,
                trips:        {},
                privacy:      $scope.loginData.privacy || false,
                provider:     'password',
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
// $timeout(function() {
//   if (!$scope.user) {
//     $scope.login();
//   }
// }, 2000)


})

.controller('TripsCtrl', function($scope, TripsService, $timeout) {
  //mi servono i trips per utente
  //ref = TripsService.getRef();
  $timeout(function(){
    //va bene solo se l'utente è già loggato...
    $scope.user = TripsService.getUser();
    $scope.profilePic = TripsService.getProfilePic();
  },2000);

  // Controlla la variabile user nel service e la aggiorna nel controller
  $scope.$watch( function () { return TripsService.getUser(); }, function ( user ) {
    $scope.user = user;
  });

  $scope.trips = TripsService.getTrips();
  //console.log(trips);


})

.controller('TripCtrl', function($scope, tripRef, $stateParams, $state, $timeout, TripsService) {
  //  mi serve:
  //    - dettaglio del trip
  //    - dettaglio degli amici
  //$timeout(function(){
    //va bene solo se l'utente è già loggato...
    $scope.$watch( function () { return TripsService.getUser(); }, function ( user ) {
      $scope.user = user;
    });
    $scope.$watch( function () { return TripsService.getUID(); }, function ( uid ) {
      $scope.uid = uid;
    });
    $scope.$watch( function () { return TripsService.getProfilePic(); }, function ( profilePic ) {
      $scope.profilePic = profilePic;
    });

    //$scope.uid = TripsService.getUID();
    //$scope.user = TripsService.getUser();
    //$scope.profilePic = TripsService.getProfilePic();
    $scope.datePicker = {};
    $scope.options = {
      autoApply: true,
      opens: "left",
      // startDate: "2015/11/09",
      // endDate: "2015/12/09",
      locale: {
       format: "DD/MM/YYYY",
       separator: " / ",
       fromLabel: "From",
       toLabel: "To",
       daysOfWeek: [
           "Su",
           "Mo",
           "Tu",
           "We",
           "Th",
           "Fr",
           "Sa"
       ],
       monthNames: [
           "January",
           "February",
           "March",
           "April",
           "May",
           "June",
           "July",
           "August",
           "September",
           "October",
           "November",
           "December"
       ],
       firstDay: 1,
      },
      eventHandlers: {'apply.daterangepicker': function(ev, picker) {
        console.log(picker);
        console.log("start date: " + picker.startDate._d);
        console.log("end date: " + picker.endDate._d);
      }}
    };

    if ($stateParams.tripId == 'newTrip') {

      $scope.trip = {};
      $scope.newTrip = true;
      $scope.editable = true;
      $scope.datePicker.date = {startDate: null, endDate: null};

      $scope.createTrip = function() {

        ref = TripsService.getRef();
        newTrip = ref.child('trips').push({
          title:      $scope.trip.title || null,
          subtitle:   $scope.trip.subtitle || null,
          where:      $scope.trip.where || null,
          from:       $scope.datePicker.date.startDate._d.getTime() || null,
          to:         $scope.datePicker.date.endDate._d.getTime() || null,
          admin:      $scope.uid || null,
        });

        //aggiorno la lista dei trip dell'utente, vediamo se conviene mettere la lista degli utenti direttamente sul trip
        ref.child('users').child($scope.uid).child('trips').once("value", function(snap){
          tripsOld = snap.val() || [];
          tripsNew = tripsOld;
          tripsNew.push(newTrip.key());
          ref.child('users').child($scope.uid).child('trips').set(tripsNew);
        });

        //torna alla lista dei trip
        $state.go('app.trips', {'navDirection':'backward'});

      }
    }else{
      tripRef.once("value", function(snap) {
        $scope.trip = snap.val();
        console.log($scope.trip);
        $scope.datePicker.date = {startDate: $scope.trip.from, endDate: $scope.trip.to};
      });
    }

  //},2000);



  // FB.api('me/friends', { fields: 'id, first_name,picture', limit: 6 },function(response){
  //
  //   console.log(response);
  //
  // });

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


})


.filter('myTrips', function(){

  return function(items, trips){

    var arrayToReturn = [];
    if (trips) {
      for (var i=0; i<items.length; i++){
        for(var j=0; j<trips.length; j++){
          //il parse int serve solo se è numerico l'ID del trip
          //creando un ID in lettere è da togliere
          if (items[i].$id == trips[j]) {
            arrayToReturn.push(items[i]);
            break;
          }
        }
      }
    }
    return arrayToReturn;

  };
});
