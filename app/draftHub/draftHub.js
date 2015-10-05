(function(angular) {
  "use strict";

  var app = angular.module('myApp.draftHub', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'angucomplete-alt', 'angularModalService', 'ui.bootstrap']);

  app.controller('DraftHubCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", '$modal', '$log',  '$route', function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray, $modal, $log, $route) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    $scope.draftPosition;
    $scope.suggestedPlayers = [];
    $scope.watchList = [];
    $scope.round = 1;
    $scope.currentPick;
    $scope.begun = false;

    var playersRef = new Firebase(FBURL).child("players");
    var query = playersRef.orderByChild("adp").limitToFirst(450);
    var players = $firebaseArray(query);
    $scope.players = players;

    var draft = function($scope, draftPosition){
        var suggestedPlayers = [];
        var draftPosition = draftPosition || parseInt($scope.draftPosition);
        var lookUntil;
        if(draftPosition + 20 < players.length){
            lookUntil = draftPosition + 20;
        }else{
            lookUntil = players.length - 1;
        }
        for (var i = 0; i < players.length; i++) {
            if((draftPosition - 2 <= players[i].adp) &&  (players[i].adp <= draftPosition + 3)){
                suggestedPlayers.push(players[i]);
            }
            if(players[i].adp > draftPosition + 3){
                break;
            }
        }
        $scope.suggestedPlayers = suggestedPlayers;
    }

    $scope.addToWL = function(){
        var selectedPlayer = $scope.selectedPlayer;
        $scope.watchList.push(selectedPlayer.originalObject);
        $scope.$broadcast('angucomplete-alt:clearInput');
    }
    $scope.removeFromWL = function(i){
        $scope.watchList.splice(i, 1);
    }
    $scope.modal = $modal.open({
      templateUrl: 'myModalContent.html',
      backdrop: true,
      windowClass: 'modal',
      size: 'sm',
      controller: function ($scope, $modalInstance, $log, draftPosition) {
          $scope.draftPosition = draftPosition;
          $scope.submit = function () {
              $log.log('Submiting user info.');
              $log.log($scope.draftPosition);
              draft($scope);
              var results = [$scope.suggestedPlayers, $scope.draftPosition];
              $modalInstance.close(results);
          }
          $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
          };
      },
      resolve: {
          draftPosition: function () {
              return $scope.draftPosition;
          },
          suggestedPlayers: function () {
              return $scope.suggestedPlayers;
          }
      }
    });


    $scope.modal.result.then(function (results) {
        $scope.suggestedPlayers = results[0];
        $scope.draftPosition = results[1];
        $scope.currentPick = $scope.draftPosition;
        $scope.begun = true;
    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.$on('$locationChangeStart', function(event) {
        $scope.modal.close();
    });

    $scope.nextRound = function(){
        $scope.round += 1;
        if($scope.round % 2 == 0){
            var nextPosition = (($scope.round - 1) * 32) + (32 - parseInt($scope.draftPosition)) + 1;
        }else{
            var nextPosition = (($scope.round - 1) * 32) + (parseInt($scope.draftPosition));
        }
        draft($scope,nextPosition);
        $scope.currentPick = nextPosition;
    }
    $scope.prevRound = function(){
        $scope.round -= 1;
        if($scope.round % 2 == 0){
            var prevPosition = (($scope.round - 1) * 32) + (32 - parseInt($scope.draftPosition)) + 1;
        }else{
            var prevPosition = (($scope.round - 1) * 32) + (parseInt($scope.draftPosition));
        }
        draft($scope,prevPosition);
        $scope.currentPick = prevPosition;
    }
    $scope.refresh = function(){
        $route.reload();
    }
  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/draftHub', {
      templateUrl: 'draftHub/draftHub.html',
      controller: 'DraftHubCtrl',
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
