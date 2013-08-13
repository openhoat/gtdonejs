var util = require('util')
  , moment = require('moment')
  , alertService = require('../lib/alert-service')
  , gtdService = require('../lib/gtd-service');

module.exports = function ($scope, $rootScope, $location, $) {

  $scope.task = {};
  $scope.dueFreqItems = [
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly' }
  ];

  $scope.initTask = function () {
    if ($rootScope.prevLocationPath.indexOf('/today') === 0) {
      $scope.task.dueDateStr = gtdService.formatDate(new Date(), 'YYYY-MM-DD');
    } else if ($rootScope.prevLocationPath.indexOf('/next') === 0) {
      $scope.task.dueDateStr = gtdService.formatDate(moment(new Date()).add('days', 1).toDate(), 'YYYY-MM-DD');
    } else if ($rootScope.prevLocationPath.indexOf('/project') === 0) {
      $scope.task.projectsLine = $rootScope.prevLocationPath.split('/')[2];
    } else if ($rootScope.prevLocationPath.indexOf('/context') === 0) {
      $scope.task.contextsLine = $rootScope.prevLocationPath.split('/')[2];
    }
    $('#description').focus();
  };

  $scope.save = function () {
    var task;
    task = {
      date: new Date(),
      description: $scope.task.description,
      priority: $scope.task.priority,
      dueFreq: $scope.task.dueFreq
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
    $rootScope.$apply();
    alertService.showAlertMessage($, 'success', 'Task successfully created.');
    $rootScope.goBack();
  };

};