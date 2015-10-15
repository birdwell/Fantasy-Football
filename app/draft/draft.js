(function(angular) {
  "use strict";

  var app = angular.module('myApp.draft', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'angucomplete-alt']);

  app.controller('DraftCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", '$modal', '$routeParams', function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray, $modal, $routeParams) {
    $scope.user = user;
    $scope.FBURL = FBURL;

    var playersRef = new Firebase(FBURL).child("players");
    var query = playersRef.orderByChild().limitToFirst(600);
    var players = $firebaseArray(query);
    $scope.draftId = $routeParams.draftId;
    $scope.players = players;
  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/draft/:draftId', {
      templateUrl: 'draft/draft.html',
      controller: 'DraftCtrl',
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
