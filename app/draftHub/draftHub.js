(function (angular) {
  "use strict";

  var app = angular.module('myApp.draftHub', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'angucomplete-alt', 'angularModalService', 'ui.bootstrap']);

  app.controller('DraftHubCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', "$firebaseArray", '$modal', '$log', '$route', function ($scope, fbutil, user, $firebaseObject, FBURL, $firebaseArray, $modal, $log, $route) {
    // Firebase and User Inits
    $scope.user = user;
    $scope.FBURL = FBURL;

    $scope.draftPosition = null;
    $scope.currentPick = null;
    $scope.round = 1;

    $scope.suggestedPlayers = [];
    $scope.watchList = [];

    $scope.begun = false;

    var playersRef = new Firebase(FBURL).child("players");
    var query = playersRef.orderByChild("adp").limitToFirst(500);
    $scope.players = $firebaseArray(query);

    // --------------- Watch List ---------------
    $scope.addToWL = function () {
      $scope.watchList.push($scope.selectedPlayer.originalObject);
      $scope.$broadcast('angucomplete-alt:clearInput');
    };

    $scope.removeFromWL = function (i) {
      $scope.watchList.splice(i, 1);
    };
    
    // --------------- End of Watch List ---------------
    
    $scope.nextRound = function () {
      $scope.currentPick = getDraftPick($scope.round += 1);
      draft($scope, $scope.currentPick);
    };

    $scope.prevRound = function () {
      $scope.currentPick = getDraftPick($scope.round -= 1);
      draft($scope, $scope.currentPick);
    };

    $scope.refresh = function () {
      $route.reload();
    };
    
    // --------------- Modal  ---------------
    $scope.modal = $modal.open({
      templateUrl: 'myModalContent.html',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal',
      size: 'sm',
      controller: function ($scope, $modalInstance, $log, draftPosition) {
        $scope.draftPosition = draftPosition;

        $scope.submit = function () {
          draft($scope);
          $modalInstance.close([$scope.suggestedPlayers, $scope.draftPosition]);
        };

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

    $scope.$on('$locationChangeStart', function (event) {
      $scope.modal.close();
    });
    
    // --------------- End of Modal  ---------------

    $scope.draftPlayer = function () {
      var draftedPlayer = $scope.draftedPlayer.originalObject;

      switch (draftedPlayer.pos) {
        case 'QB':
          $scope.qb = draftedPlayer;
          break;
      }
    };
    
    // Helpful Functions
    
    /**
    * Return the pick in the given round.
    * @function
    * @param {int} round - next or prev round.
    */
    function getDraftPick(round) {
      if (round % 2 === 0) {
        return ((round - 1) * 32) + (32 - parseInt($scope.draftPosition)) + 1;
      } else {
        return ((round - 1) * 32) + (parseInt($scope.draftPosition));
      }
    }
    
    function draft($scope, draftPos) {
      var suggestedPlayers = [],
          draftPosition = draftPos || parseInt($scope.draftPosition),
          lookUntil;

      if (draftPosition + 20 < $scope.players.length) {
        lookUntil = draftPosition + 20;
      } else {
        lookUntil = $scope.players.length - 1;
      }
      
      for (var i = 0; i < $scope.players.length; i++) {
        if ((draftPosition - 2 <= $scope.players[i].adp) && ($scope.players[i].adp <= draftPosition + 3)) {
          suggestedPlayers.push($scope.players[i]);
        }
        if ($scope.players[i].adp > draftPosition + 3) {
          break;
        }
      }
      $scope.suggestedPlayers = suggestedPlayers;
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
