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
