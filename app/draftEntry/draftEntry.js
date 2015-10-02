(function(angular) {
  "use strict";

  var app = angular.module('myApp.draftEntry', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'angucomplete-alt']);

  app.controller('DraftEntryCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    var playersRef = new Firebase(FBURL).child("players");
    var query = playersRef.orderByChild("adp").limitToFirst(400);
    var players = $firebaseArray(query);
    $scope.players = players;

    $scope.selectedPlayer;

    // Draft Begins
    var pick = 1;
    $scope.draftedPlayers = [];
    $scope.pick = pick;

    $scope.draft = function(){
        var selectedPlayer = $scope.selectedPlayer;
        $scope.draftedPlayers.push(selectedPlayer.originalObject);
        // Get Reference to Player
        var firePlayer = new Firebase(FBURL + '/players/' + selectedPlayer.originalObject.$id);
        var player  = $firebaseObject(firePlayer);
        player.$loaded().then(function() {

            // Update Info
            player.drafted.push(pick);
            player.numDrafts += 1;

            var sum = player.drafted.reduce(function(a, b) {
              return a + b;
            });
            player.adp = Math.round(sum/player.numDrafts);

            player.$save().then(function(ref) {
              ref.key() === player.$id; // true
            }, function(error) {
              console.log("Error:", error);
            });

            $scope.pick += 1;
            pick++;

            console.log(pick);
          });
          $scope.$broadcast('angucomplete-alt:clearInput');
    }
  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/draftEntry', {
      templateUrl: 'draftEntry/draftEntry.html',
      controller: 'DraftEntryCtrl',
      resolve: {
        // forces the page to wait for this promise to resolve before controller is loaded
        // the controller can then inject `user` as a dependency. This could also be done
        // in the controller, but this makes things cleaner (controller doesn't need to worry
        // about auth status or timing of accessing data or displaying elements)
        user: ['Auth', function (Auth) {
          return Auth.$waitForAuth();
        }]
      }
    });
  }]);

})(angular);
