var util = require('util')
  , alertService = require('../lib/alert-service')
  , gtdService = require('../lib/gtd-service');

module.exports = function ($scope, $rootScope, $location, $) {

  $scope.task = {};

  $scope.initTask = function () {
    $('#description').focus();
  };

  $scope.save = function () {
    var task;
    task = {
      date: new Date(),
      description: $scope.task.description,
      priority: $scope.task.priority
    };
    if ($scope.task.dueDateStr) {
      task.dueDate = gtdService.parseDate($scope.task.dueDateStr, 'YYYY-MM-DD');
    }
    if ($scope.task.projectsLine) {
      task.projects = $scope.task.projectsLine.split(' ');
    }
    if ($scope.task.contextsLine) {
      task.contexts = $scope.task.contextsLine.split(' ');
    }
    gtdService.addTask(task);
    $rootScope.disableWatchers();
    gtdService.saveFileData(
      $rootScope.settings.todoFile,
      $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
    );
    $rootScope.enableWatchers();
    $rootScope.loadData();
    alertService.showAlertMessage($, 'success', 'Task successfully created.');
    $rootScope.goBack();
  };

};