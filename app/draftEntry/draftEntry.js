(function(angular) {
  "use strict";

  var app = angular.module('myApp.draftEntry', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute']);

  app.controller('DraftEntryCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray) {
    $scope.user = user;
    $scope.FBURL = FBURL;

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
