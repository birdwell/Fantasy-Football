(function(angular) {
  "use strict";

  var app = angular.module('myApp.ranking', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute']);

  app.controller('RankingCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    var playersRef = new Firebase(FBURL).child("players");
    var query = playersRef.orderByChild("adp").limitToFirst(400);

    var players = $firebaseArray(query);

    $scope.players = players;
    // $scope.updateGenPos = function(){
    //     debugger;
    //     for (var i = 0; i < players.length; i++) {
    //         var firePlayer = new Firebase(FBURL + '/players/' + players[i].$id);
    //         if(['LG','RG','LT','RT','C'].indexOf(players[i].pos) > -1){
    //             firePlayer.update({
    //               'genPos': 'OL'
    //             });
    //         }else if (['MLB','LOLB','ROLB'].indexOf(players[i].pos) > -1){
    //             firePlayer.update({
    //               'genPos': 'LB'
    //             });
    //         }else if (['FS','SS'].indexOf(players[i].pos) > -1){
    //             firePlayer.update({
    //               'genPos': 'S'
    //             });
    //         }else if(['LE','RE'].indexOf(players[i].pos) > -1){
    //             firePlayer.update({
    //               'genPos': 'DE'
    //             });
    //         }else {
    //             firePlayer.update({
    //               'genPos': players[i].pos
    //             });
    //         }
    //     }
    // }

    $scope.rankingFilter = function(pos, round){
        return function( player ) {
            // No Filter Return True
            if(!(pos || round)) return true;
            // Both Filters
            if(pos && round){
                // All Pos with specific round
                if(pos == "All" && Math.ceil(player.adp/32) == round) return true;
                if(pos == player.genPos && Math.ceil(player.adp/32) == round) return true;
                else return false;
            }
            if(pos){
                if(pos == "All") return true;
                if(pos == player.genPos) return true;
                else return false;
            }
            if(round){
                if(Math.ceil(player.adp/32) == round) return true;
                else return false;
            }
            return true;
        };
    }
  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ranking', {
      templateUrl: 'ranking/ranking.html',
      controller: 'RankingCtrl',
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
