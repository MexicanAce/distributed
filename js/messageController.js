'use strict';

angular
  .module('fireideaz')
  .controller('MessageCtrl', ['$scope', '$filter', '$interval',
              '$window', 'Auth', '$rootScope', 'FirebaseService', 'ModalService',
    function($scope, $filter, $interval, $window, auth, $rootScope, firebaseService, modalService) {
      $scope.modalService = modalService;
      $scope.userId = $window.location.hash.substring(1);

      $scope.countdown = {
        minutes: parseInt($scope.timerMinutes),
        seconds: 0
      };
      
      $scope.tickDown;

      $scope.startCountdown = function() {
        //Default to last column for Action Items
        $scope.columnType = $scope.board.columns[$scope.board.columns.length - 1].id + "";
        
        $interval.cancel($scope.tickDown);
        $scope.isBlinking = false;
        $scope.countdown = {
          minutes: parseInt($scope.timerMinutes),
          seconds: 0
        };

        $scope.tickDown = $interval(function() {
          $scope.countdown.seconds--;

          if ($scope.countdown.seconds < 0) {
            $scope.countdown.seconds = 59;
            $scope.countdown.minutes--;
          }

          if ($scope.countdown.seconds <= 30 && $scope.countdown.minutes == 0) {
            $scope.isBlinking = true;
          }

          if ($scope.countdown.minutes == 0 && $scope.countdown.seconds == 0) {
            $interval.cancel($scope.tickDown);
            modalService.closeAll();
          }
        }, 1000);
      }

      $scope.doubleClicked = function() {
          if ($scope.toggleTimer){
            modalService.openTimerCountdown($scope);
          }
      }

      $scope.droppedEvent = function(dragEl, dropEl) {
        if(dragEl !== dropEl) {
          $scope.dragEl = dragEl;
          $scope.dropEl = dropEl;

          modalService.openMergeCards($scope);
        }
      };

      $scope.dropped = function(dragEl, dropEl) {
        var drag = $('#' + dragEl);
        var drop = $('#' + dropEl);

        var dropMessageRef = firebaseService.getMessageRef($scope.userId, drop.attr('messageId'));
        var dragMessageRef = firebaseService.getMessageRef($scope.userId, drag.attr('messageId'));

        dropMessageRef.once('value', function(dropMessage) {
          dragMessageRef.once('value', function(dragMessage) {
            dropMessageRef.update({
              text: dropMessage.val().text + ' | ' + dragMessage.val().text,
              votes: dropMessage.val().votes + dragMessage.val().votes
            });

            dragMessageRef.remove();
            modalService.closeAll();
          });
        });
      };
    }]
  );
