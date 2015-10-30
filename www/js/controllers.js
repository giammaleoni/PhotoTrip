module.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $state, $rootScope, $ionicLoading, ngFB, TripsService) {
//controller generico dell'applicazione.
// gestisce il login
  // i dati che servono:
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
  $scope.showConfirm = function(error){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Validation Error',
      template: error,
      okText: 'Try Again',
      cancelText: 'Cancel'
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

  //loader
  $scope.loading = $ionicLoading.show({
    template: '<ion-spinner icon="spiral"></ion-spinner><br>Loading...',
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

  //facebook login firebase
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



    // ngFB.login({scope: 'email,user_friends'}).then(
    //     function (response) {
    //         if (response.status === 'connected') {
    //             //auth.$authWithOAuthToken('facebook', token, function() {
    //               console.log('Facebook login succeeded');
    //               $scope.closeLogin();
    //             //});
    //         } else {
    //             alert('Facebook login failed');
    //         }
    //     });

  }

  //comprende tutte le attività da fare quando ci si logga
  loggedUser = function(authData) {
    //console.log("Logged in as", authData.uid);
    TripsService.setUID(authData.uid);
    //console.log(authData);
    userData = ref.child('users').child(authData.uid);
    switch (authData.provider) {
      case 'password':
        $scope.profilePic = authData.password.profileImageURL || "img/anonimo.png";
        userData.update({
          url:          $scope.profilePic,
        });
        break;
      case 'facebook':
        $scope.profilePic = authData.facebook.profileImageURL || "img/anonimo.png";
        break;
      default:

    }

    userData.once("value", function(snap) {
      $scope.user = snap.val();
      //se non esiste un utente registrato di facebook lo registro tra gli user
      //if (!$scope.user && authData.provider == 'facebook') {
      if (authData.provider == 'facebook') {
        ref.child("users").child(authData.uid).update({
              email:        authData.facebook.email,
              name:         authData.facebook.cachedUserProfile.first_name,
              surname:      authData.facebook.cachedUserProfile.last_name,
              birth_date:   null,
              reg_date:     Firebase.ServerValue.TIMESTAMP,
              gender:       authData.facebook.cachedUserProfile.gender,
              id:           authData.facebook.id,
              locale:       authData.facebook.cachedUserProfile.locale,
              link:         authData.facebook.cachedUserProfile.link,
              url:          authData.facebook.profileImageURL,
              provider:     'facebook',
              age_range:    authData.facebook.cachedUserProfile.age_range
        }, function(error) {
          if (error) {
            console.log('Synchronization failed');
          } else {
            //console.log('Synchronization succeeded');
          }
        });

        //controlla quando user cambia
         userData.once("value", function(snap) {
          $scope.user = snap.val();
          TripsService.setUser($scope.user);
          console.log($scope.user);
          //nasconde il loader
          $scope.loading = $ionicLoading.hide();
         });

      }else {         //utente già registrato (solo login)
      //
        TripsService.setUser($scope.user);
        //nasconde il loader
        $scope.loading = $ionicLoading.hide();
      }


    });
  }

  //controllo lo stato del login
  auth.$onAuth(function(authData) {
  if (authData === null) {                      //utente non loggato
    console.log("Not logged in yet");
    $scope.profilePic = "img/anonimo.png";
    $scope.user = null;
    $scope.uid = null;
    TripsService.setUser($scope.user);
    TripsService.setUID($scope.uid);
    // se non sono loggato, nascondi il loader e vai al login
    $scope.loading = $ionicLoading.hide();
    //$scope.login();
  } else {                                      //utente loggato esegui attività di login
    loggedUser(authData);
  }

  //setto la profile pic nel service
  TripsService.setProfilePic($scope.profilePic);
});

  //logout
  $scope.doLogout = function() {
      ref.unauth();
      authData = ref.getAuth()
      if (authData){
        console.log("user:", authData.uid, "still logged");
      }else{
        // $scope.profilePic = "img/anonimo.png";
        // $scope.user = null;
        // TripsService.setUser($scope.user);
        // console.log("User logged out");
        $state.go('app.trips', {'navDirection':'backward'});
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

  //registrazione tramite mail
  $scope.doSignup = function(form) {
    if (form.$valid) {
        console.log('Doing signup', $scope.loginData);
        var email = $scope.loginData.email;
        var password = $scope.loginData.password;
        if(email && password && $scope.loginData.name && $scope.loginData.surname){
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

              //inserisce tra gli users i dettagli dell'utente registrato
              ref.child("users").child(userData.uid).set({
                    email:        $scope.loginData.email,
                    name:         $scope.loginData.name || null,
                    surname:      $scope.loginData.surname || null,
                    birth_date:   $scope.loginData.birthday ? $scope.loginData.birthday.getTime() : null,
                    reg_date:     Firebase.ServerValue.TIMESTAMP,
                    gender:       $scope.loginData.gender || null,
                    privacy:      $scope.loginData.privacy || false,
                    provider:     'password',
              });

              //una volta registrato chiudo il signup ed eseguo il login
              $scope.closeSignup();
              $scope.doLogin();
            }
          });
        }
        else{
          $scope.showConfirm("Please enter at least required information: mail, password, name and surname");
        };
      } else {
        console.log("Form not compiled correctly");
      }

    }

})

.controller('TripsCtrl', function($scope, TripsService, $timeout, $ionicPopup, $ionicListDelegate) {
  //mi servono i trips per utente

  // Controlla la variabile user nel service e la aggiorna nel controller
  $scope.$watch( function () { return TripsService.getUser(); }, function ( user ) {
    $scope.user = user;
  });
  $scope.$watch( function () { return TripsService.getUID(); }, function ( uid ) {
    $scope.uid = uid;
  });
  $scope.$watch(function() { return TripsService.getProfilePic();}, function ( profilePic ) {
    $scope.profilePic = profilePic;
  });

  //scarica tutti i trip, è il filtro a filtrarli
  $scope.trips = TripsService.getTrips();

  //cancella trip
  $scope.delete = function (trip) {
    $ionicPopup.confirm({
      title: 'Delete Trip',
      template: 'Do you really want to delet the trip?',
      okText: 'Yes',
      cancelText: 'No'
    }).then(function(yes) {
      if (yes) {
        $scope.trips.$remove(trip).then(function(ref) {
          console.log("removed: ", ref.key());
        });
      }else {
        //chiude la option button
        $ionicListDelegate.closeOptionButtons();
      }
    });

  }

  //condividi trip
  $scope.share = function (trip) {
    console.log("condividi: ", trip);
    //si può inserire la scelta del tipo di condivisione
    //vedi "action sheet" ionic
  }

  //get Current Trip

  $scope.$watch( function() { return $scope.trips;}, function(trips) {
if (trips){
    today = new Date();
    for (var i = 0; i < trips.length; i++) {
      if (trips[i].from <= today &&  today <= trips[i].to) {
        $scope.currentTrip = trips[i];
        break;
      }
    }
    }
  })



})

.controller('TripCtrl', function($scope, tripRef, $stateParams, $state, $timeout, $http, TripsService) {
  //  mi serve:
  //    - dettaglio del trip
  //    - dettaglio degli amici

  $scope.tripId = $stateParams.tripId;
  $scope.$state = $state;

    $scope.$watch( function() { return TripsService.getUser();}, function ( user ) {
      $scope.user = user;
    });
    $scope.$watch( function() { return TripsService.getUID();}, function ( uid ) {
      $scope.uid = uid;
      //se cambia lo user aggiorno se è amministratore per il trip
      if ($scope.trip) {
        $scope.imAdmin = ($scope.trip.admin == $scope.uid) ? true : null;
      }
    });
    $scope.$watch(function() { return TripsService.getProfilePic();}, function ( profilePic ) {
      $scope.profilePic = profilePic;
    });

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
        //console.log(picker);
        console.log("start date: " + picker.startDate._d + " end date: " + picker.endDate._d);
      }}
    };

    if ($stateParams.tripId == 'newTrip') {

      $scope.trip = {};
      $scope.newTrip = true;
      $scope.editable = true;
      $scope.datePicker.date = {startDate: null, endDate: null};


      $scope.createTrip = function() {
        $scope.mates = [];
        $scope.mates.push($scope.uid);

        ref = TripsService.getRef();
        $scope.trip = ref.child('trips').push({
          title:      $scope.trip.title || null,
          subtitle:   $scope.trip.subtitle || null,
          where:      $scope.trip.where || null,
          from:       $scope.datePicker.date.startDate ? $scope.datePicker.date.startDate._d.getTime() : null,
          to:         $scope.datePicker.date.endDate ? $scope.datePicker.date.endDate._d.getTime() : null,
          admin:      $scope.uid || null,
          mates:      $scope.mates,
          url:        'img/random/' + Math.floor((Math.random() * 10) + 1) + '.jpeg',
        });

        //torna alla lista dei trip
        $state.go('app.trips', {'navDirection':'backward'});

      }
    }else{
      tripRef.once("value", function(snap) {
        $scope.trip = snap.val();
        //console.log($scope.trip);
        $scope.datePicker.date = {startDate: $scope.trip.from, endDate: $scope.trip.to};
        $scope.imAdmin = ($scope.trip.admin == $scope.uid) ? true : null;
      });

      $scope.mates = TripsService.getUsers();
      //console.log($scope.mates);

      tripRef.on("child_changed", function(snap) {
        $scope.trip.mates = snap.val();
      });
    }



    //select per località
    $scope.address = {};
    $scope.refreshAddresses = function(address) {
      var params = {address: address, sensor: false};
      return $http.get(
      'http://maps.googleapis.com/maps/api/geocode/json',
      {params: params}
      ).then(function(response) {
      $scope.addresses = response.data.results
      });
    };

  })

.controller('FriendsCtrl', function($scope, tripRef, $stateParams, $window, $ionicPopup, $ionicLoading, TripsService){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio degli amici
  $scope.tripId = $stateParams.tripId;

  tripRef.once("value", function(snap) {
    $scope.trip = snap.val();
    //console.log($scope.trip);
  });

  $scope.save = false;
  $scope.users = TripsService.getUsers();

  $scope.check = function(mate) {
    if($scope.trip){
      for (var i = 0; i < $scope.trip.mates.length; i++) {
        if ($scope.trip.mates[i] == mate.$id) {
          return true;
        }
      }
    }
  }

  $scope.addDeleteMate = function(mate) {
    //se metto il tutto in un aray $scope.temp (es. $scope.temp = $scope.trip.mates)
    //quando esco o premo salva (in alto a dx) mando l'aggiornamento diversamente no

    $scope.save = true;
    if (!$scope.temp) {
      $scope.temp = angular.copy($scope.trip.mates);
    }

    // console.log($scope.trip.mates);
    var index = $scope.temp.indexOf(mate.$id);

    if (mate.checked) {
      //flag si
      if (index = -1) {
        $scope.temp.push(mate.$id);
        if (($scope.temp.length == $scope.trip.mates.length) && $scope.temp.every(function(element, index) {
            return element === $scope.trip.mates[index]; })) {
          $scope.save = false;
        }
      }else{
        $scope.save = false;
      }


    }else{
      //flag no
      if (index > -1) {
        $scope.temp.splice(index, 1);
        if (($scope.temp.length == $scope.trip.mates.length) && $scope.temp.every(function(element, index) {
            return element === $scope.trip.mates[index]; })) {
          $scope.save = false;
        }
      }else {
        $scope.save = false;
      }
    }
    console.log($scope.temp);
  }

  //controlla se ci sono state modifiche e prompt per salvataggio
  $scope.checkMod = function () {
    if ($scope.save) {
      $ionicPopup.confirm({
        title: 'Save',
        template: 'Do you want to save changes?',
        okText: 'Yes',
        cancelText: 'No'
      }).then(function(yes) {
        if (yes) {
          // push changes
          $scope.saveMod();
        }else {
          //do nothing
        }
      });
    }
    //go back
    $window.history.back();
  }

  $scope.saveMod = function() {
    tripRef.child("mates").set($scope.temp, function() {
      $ionicLoading.show({ template: 'Saved', noBackdrop: true, duration: 1000 });
      $scope.save = false;
    });
  }

  //FACEBOOK LIST OF FRIENDS

  // auth = TripsService.getAuth();
  // authData = auth.$getAuth();
  // token = authData.token;
  //
  // var params = {access_token: token , fields: 'last_name',}; //, components: 'country:ES'};
  // return $http.get(
  //   'https://graph.facebook.com/967069890020707',
  //   {params: params}
  // ).then(function(response) {
  //   console.log(response);
  // });

  // var tokenStore = {}
  // tokenStore.fbAccessToken = authData.token;

  // FB.api('me/friends', { fields: 'id, first_name,picture', limit: 6 },function(response){
  //
  //   console.log(response);
  //
  // });

  // ngFB.api({
  //       path: '/me',
  //       params: {fields: 'id,name'}
  //   }).then(
  //       function (user) {
  //           $scope.user = user;
  //       },
  //       function (error) {
  //           alert('Facebook error: ' + error.error_description);
  //       });


})

.controller('AlbumStoryCtrl', function($scope, $stateParams, TripsService){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto

})

.controller('AlbumCtrl', function($scope, $stateParams, $state, tripRef, TripsService, $cordovaCamera, $cordovaFile, $ionicActionSheet){
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto
  photoArray = TripsService.getPhotos();
  $scope.$watch( function () { return TripsService.getUID(); }, function ( uid ) {
    $scope.uid = uid;
  });

  $scope.photos = photoArray;
  $scope.$state = $state;
  $scope.tripId = $stateParams.tripId;

  tripRef.once("value", function(snap) {
    $scope.trip = snap.val();
    //console.log($scope.trip);
  });

  //filtro delle foto per trip
  $scope.thisTrip = function(photo){
    return (photo.tripId == $stateParams.tripId);
  };

  //GPS: Degrees --> Decimal Converter
  ConvertDMSToDD = function(degrees, minutes, seconds, direction) {
    if (degrees && minutes && seconds && direction) {
      var dd = degrees + minutes/60 + seconds/(60*60);

      if (direction == "S" || direction == "W") {
          dd = dd * -1;
      } // Don't do anything for N or E
      return dd;
    } else {
      console.log("GPS data missing");
      return false;
    }
  }

  //GPS get Photo EXIF data
  getGPS = function(photo){
    var GPSDetails = [];
    var LatLng;
    //console.log(photo);
    var image = new Image();
    image.src = photo.url;
    image.onload = function() {
        EXIF.getData(image, function() {
            //console.log(EXIF.pretty(image));
            GPSDetails.push(EXIF.getTag(image,"GPSLatitude"));
            GPSDetails.push(EXIF.getTag(image,"GPSLatitudeRef"));
            GPSDetails.push(EXIF.getTag(image,"GPSLongitude"));
            GPSDetails.push(EXIF.getTag(image,"GPSLongitudeRef"));
            //console.log(GPSDetails);

            if (GPSDetails[0] && GPSDetails[1] && GPSDetails[2] && GPSDetails[3]) {
              var lat = ConvertDMSToDD(GPSDetails[0][0].valueOf(), GPSDetails[0][1].valueOf(), GPSDetails[0][2].valueOf(), GPSDetails[1]);
              var lon = ConvertDMSToDD(GPSDetails[2][0].valueOf(), GPSDetails[2][1].valueOf(), GPSDetails[2][2].valueOf(), GPSDetails[3]);
              LatLng = [lat, lon];
              console.log(LatLng);
              //return LatLng;
            }else {
              console.log("GPS data missing for this photo");
            }

        });
    };

  }

  $scope.upload = function() {
      if (Camera) {
        var options = {
            quality : 50, //qualità immagine ridotta per testing
            //destinationType : Camera.DestinationType.DATA_URL,
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            //saveToPhotoAlbum: true --> funziona solo se FILE_URI
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {

            moveFile = function(imageData) {
              file = imageData.substr(imageData.lastIndexOf('/') + 1);
              path = imageData.substr(0,imageData.lastIndexOf('/')+1);
              newPath = cordova.file.externalRootDirectory + "PhotoTrip";

              //leggo l'url
              $cordovaFile.readAsDataURL(path, file)
                .then(function (success) {
                  // success
                  // ho l'url completo, aggiungo l'immagine online
                  $scope.photos.$add({
                    url:    success,
                    picBy:  $scope.uid,
                    tripId: $stateParams.tripId,
                  }).then(function() {
                      console.log("Image has been uploaded to firebase");
                  });

                //console.log(success);

                }, function (error) {
                  // error
                  console.error(error);
                });

              //aggiungo l'immagine alla cartella dell'App
              $cordovaFile.moveFile(path, file, newPath) //il 4° parametro è il nome del file
                .then(function (success) {
                  // success
                  console.log("Image moved to app folder. ", success);

                  //se android aggiorno la galleria
                  // if (cordova.platformId === "android") {
                  //   mediaRefresh.scanMedia(newPath,
                  //     function(result) {
                  //       console.log(result);
                  //     },
                  //     function(error) {
                  //       console.log("Media Refresh failed:" + error);
                  //     });
                  // }
                  return success;
                }, function (error) {
                  // error
                  console.error(error);
                  return error;
                });
            }

            // check esistenza directory + spostamento file
            $cordovaFile.checkDir(cordova.file.externalRootDirectory, "PhotoTrip")
              .then(function (success) {
                // success
                //cartella esistente --> move
                console.warn("Directory already existing");
                moveFile(imageData);
              }, function (error) {
                // error
                //create folder
                $cordovaFile.createDir(cordova.file.externalRootDirectory, "PhotoTrip", false)
                  .then(function (success) {
                    // success
                    // directory creata
                    console.log("Created directory");
                    moveFile(imageData);
                  }, function (error) {
                    // error
                    console.error("Impossible to create the directory");
                  });
              });


        }, function(error) {
            console.error(error);
        });
      } else {
        console.log("Camera not supported");
      }

    }

    $scope.details = function(photo){
      getGPS(photo);
    }

    //TODO: gestire il multiple select
    $scope.onHold = function(photo){
      console.log(photo);

      if ($scope.uid === photo.picBy) {
        $ionicActionSheet.show({
          titleText: 'Possible Actions',
          buttons: [
            { text: '<i class="icon ion-share"></i> Share' },
            //{ text: '<i class="icon ion-arrow-move"></i> Move' },
          ],
          destructiveText: 'Delete',
          cancelText: 'Cancel',
          cancel: function() {
            console.log('CANCELLED');
          },
          buttonClicked: function(index) {
            console.log('BUTTON CLICKED', index);
            return true;
          },
          destructiveButtonClicked: function() {
            console.log('DESTRUCT');
            return true;
          }
        });
      }else {
        $ionicActionSheet.show({
            titleText: 'Possible Actions',
            buttons: [
              { text: '<i class="icon ion-share"></i> Share' },
              //{ text: '<i class="icon ion-arrow-move"></i> Move' },
            ],
            cancelText: 'Cancel',
            cancel: function() {
              console.log('CANCELLED');
            },
            buttonClicked: function(index) {
              console.log('BUTTON CLICKED', index);
              return true;
            },
            destructiveButtonClicked: function() {
              console.log('DESTRUCT');
              return true;
            }
        });
      }
    }


})

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $stateParams, $state, TripsService, tripRef) {
  // mi serve:
  //    - dettaglio del trip
  //    - dettaglio delle foto
  //    - mappa
  $scope.$state = $state;
  $scope.tripId = $stateParams.tripId;

  //da usare in questo modo:
  // var filtered = phoroArray.filter(thisTrip)
  thisTrip = function(photo){
    return (photo.tripId == $stateParams.tripId);
  };

  $scope.photos =  TripsService.getPhotos();



  //GPS: Degrees --> Decimal Converter
  ConvertDMSToDD = function(degrees, minutes, seconds, direction) {
    if (degrees && minutes && seconds && direction) {
      var dd = degrees + minutes/60 + seconds/(60*60);

      if (direction == "S" || direction == "W") {
          dd = dd * -1;
      } // Don't do anything for N or E
      return dd;
    } else {
      console.log("GPS data missing");
      return false;
    }
  }

  //GPS get Photo EXIF data
  getGPS = function(photo){
    var GPSDetails = [];
    var LatLng;
    //console.log(photo);
    var image = new Image();
    image.src = photo.url;
    image.onload = function() {
        EXIF.getData(image, function() {
            //console.log(EXIF.pretty(image));
            GPSDetails.push(EXIF.getTag(image,"GPSLatitude"));
            GPSDetails.push(EXIF.getTag(image,"GPSLatitudeRef"));
            GPSDetails.push(EXIF.getTag(image,"GPSLongitude"));
            GPSDetails.push(EXIF.getTag(image,"GPSLongitudeRef"));
            //console.log(GPSDetails);

            if (GPSDetails[0] && GPSDetails[1] && GPSDetails[2] && GPSDetails[3]) {
              var lat = ConvertDMSToDD(GPSDetails[0][0].valueOf(), GPSDetails[0][1].valueOf(), GPSDetails[0][2].valueOf(), GPSDetails[1]);
              var lon = ConvertDMSToDD(GPSDetails[2][0].valueOf(), GPSDetails[2][1].valueOf(), GPSDetails[2][2].valueOf(), GPSDetails[3]);
              LatLng = [lat, lon];
              return LatLng;
              console.log(LatLng);
              //return LatLng;
            }else {
              console.log("GPS data missing for this photo");
            }

        });
    };

  }

  $scope.$watch( $scope.photos.length, function () {
    if ($scope.photos.length) {
      for (var i = 0; i < $scope.photos.length; i++) {
        $scope.photos[i].LatLng = getGPS($scope.photos[i]);
      }
    }
  });




  tripRef.once("value", function(snap) {
    $scope.trip = snap.val();
    //console.log($scope.trip);
  });

  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      //content: 'Getting current location...',
      //showBackdrop: false
      template: '<ion-spinner icon="lines"></ion-spinner><br>Getting current location...',
      noBackdrop: true,
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      //$scope.loading.hide(); --> deprecato
      $ionicLoading.hide()
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };

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

    $scope.map = map;

    $scope.centerOnMe();

  }

  //inizializza la mappa quando entri nella pagina
  initialize();

})

.controller('PhotosCtrl', function($scope, $state, $stateParams, TripsService) {
  //mi servono:
  // trips per utente
  // dettaglio foto
  $scope.$state = $state;
  $scope.tripId = $stateParams.tripId;



})

.controller('CameraCtrl', function($scope, $state, $stateParams, TripsService) {
  $scope.$state = $state;
  $scope.tripId = $stateParams.tripId;
});
