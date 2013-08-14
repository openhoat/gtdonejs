var util = require('util')
  , path = require('path')
  , alertService = require('../lib/alert-service')
  , gtdService = require('../lib/gtd-service');

module.exports = function ($scope, $rootScope, $location, $) {

  $scope.settings = {
    todoFile: $rootScope.settings.todoFile,
    archiveEnabled: $rootScope.settings.archiveEnabled,
    archiveFile: $rootScope.settings.archiveFile,
    dateFormat: $rootScope.settings.dateFormat,
    startLocation: $rootScope.settings.startLocation || 'about'
  };

  $scope.init = function () {
    $rootScope.disableKeyboardShortcuts();
    $rootScope.title = util.format('Settings - %s', $rootScope.appTitle);
    $('#todoFileChooser').hide();
    $('#archiveFileChooser').hide();
    $('#todoFileChooser').change(function () {
      var that = $(this);
      $scope.$apply(function () {
        $scope.settings.todoFile = that.val();
      });
    });
    $('#archiveFileChooser').change(function () {
      var that = $(this);
      $scope.$apply(function () {
        $scope.settings.archiveFile = that.val();
      });
    });
  };

  $scope.openTodoFileChooser = function () {
    $('#todoFileChooser').click();
  };

  $scope.openArchiveFileChooser = function () {
    $('#archiveFileChooser').click();
  };

  $scope.save = function () {
    $rootScope.disableWatchers();
    $rootScope.settings.todoFile = $scope.settings.todoFile;
    $rootScope.settings.archiveEnabled = $scope.settings.archiveEnabled;
    $rootScope.settings.archiveFile = $scope.settings.archiveFile;
    $rootScope.settings.dateFormat = $scope.settings.dateFormat;
    $rootScope.settings.startLocation = $scope.settings.startLocation;
    gtdService.saveSettings($rootScope.settings);
    gtdService.loadFileData(
      $rootScope.settings.todoFile,
      $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
    );
    $rootScope.enableWatchers();
    $rootScope.loadData();
    alertService.showAlertMessage($, 'success', 'Settings successfully saved.');
    $rootScope.goBack();
  };

};