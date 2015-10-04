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
    if(!sessionStorage.getItem('pick')){
        var draftedPlayers = [];
        sessionStorage.setItem('pick', '1');
        sessionStorage.setItem('draftedPlayers', JSON.stringify(draftedPlayers));
    }


    $scope.draftedPlayers = JSON.parse(sessionStorage.getItem('draftedPlayers'));
    $scope.pick = parseInt(sessionStorage.getItem('pick'));

    $scope.draft = function(){
        var selectedPlayer = $scope.selectedPlayer;

        $scope.draftedPlayers.push(selectedPlayer.originalObject);
        sessionStorage.draftedPlayers = JSON.stringify($scope.draftedPlayers);
        if(sessionStorage.getItem('pick') == null){
            sessionStorage.setItem('pick',$scope.pick);
        }
        // Get Reference to Player
        var firePlayer = new Firebase(FBURL + '/players/' + selectedPlayer.originalObject.$id);
        var player  = $firebaseObject(firePlayer);

        player.$loaded().then(function() {
            // Update Info
            player.drafted.push(parseInt($scope.pick));
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

            sessionStorage.pick = parseInt(sessionStorage.pick) + 1;
            $scope.pick = sessionStorage.pick;
          });
          $scope.$broadcast('angucomplete-alt:clearInput');
    }
    $scope.undo = function(){
        var index;
        if($scope.pick == 1){
            $scope.pick = 1;
            sessionStorage.clear();
            index = 0;
        }else{
            $scope.pick -= 1;
            sessionStorage.pick = $scope.pick;
            index = $scope.pick - 1;
        }

        var firePlayer = new Firebase(FBURL + '/players/' + $scope.draftedPlayers[index].$id);
        var player  = $firebaseObject(firePlayer);

        $scope.draftedPlayers.pop();
        sessionStorage.draftedPlayers = JSON.stringify($scope.draftedPlayers);

        player.$loaded().then(function() {
            // Update Info
            player.drafted.pop();
            player.numDrafts -= 1;

            var sum = player.drafted.reduce(function(a, b) {
              return a + b;
            });

            player.adp = Math.round(sum/player.numDrafts);

            player.$save().then(function(ref) {
              ref.key() === player.$id; // true
            }, function(error) {
              console.log("Error:", error);
            });

          });
    }
    $scope.reset = function(){
        sessionStorage.clear();
        $scope.pick = 1;
        $scope.draftedPlayers = [];
    }

    $scope.skip = function(pick) {
        $scope.pick = pick;
        sessionStorage.pick = $scope.pick;
        $scope.skipToPick = null;
      };
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
