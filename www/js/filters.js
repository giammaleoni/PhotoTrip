module.filter('myTrips', function(){

  return function(items, uid){

    var arrayToReturn = [];
    if (uid) {
      for (var i=0; i<items.length; i++){
        if (items[i].admin == uid) {
          arrayToReturn.push(items[i]);
        } else if(items[i].mates){
          for(var j=0; j<items[i].mates.length; j++){
            if (items[i].mates[j] == uid) {
              arrayToReturn.push(items[i]);
              break;
            }
          }
        }
      }
    }
    return arrayToReturn;

  }
})

//elenco dei compagni di viaggio (admin compreso)
.filter('myMates', function() {
  return function(items, mates){
    var arrayToReturn = [];
    if (mates) {
      for (var i=0; i<items.length; i++){
        for(var j=0; j<mates.length; j++){
          if (items[i].$id == mates[j]) {
            arrayToReturn.push(items[i]);
            break;
          }
        }
      }
    }
    return arrayToReturn;
  }
})
