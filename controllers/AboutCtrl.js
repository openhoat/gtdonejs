var util = require('util');

module.exports = function ($scope, $rootScope) {

  $scope.init = function () {
    $rootScope.enableKeyboardShortcuts();
    $rootScope.title = util.format('About - %s', $rootScope.appTitle);
  };

};