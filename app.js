var pkg = require('./package')
  , util = require('util')
  , path = require('path')
  , moment = require('moment')
  , gui = require('nw.gui')
  , fs = require('fs')
  , config = require('./config')
  , alertService = require('./lib/alert-service')
  , gtdService = require('./lib/gtd-service')
  , controllers = require('./controllers')
  , app, win, module;

win = gui.Window.get();

controllers.init();

app = {
  name: pkg.name,
  log: config.log,
  router: function ($routeProvider) {
    console.log('configure router');
    $routeProvider
      .when('/inbox', { templateUrl: 'views/taskList.html' })
      .when('/today', { templateUrl: 'views/taskList.html' })
      .when('/next', { templateUrl: 'views/taskList.html' })
      .when('/project/:name', { templateUrl: 'views/taskList.html' })
      .when('/context/:name', { templateUrl: 'views/taskList.html' })
      .when('/completed', { templateUrl: 'views/taskList.html' })
      .when('/search/:q', { templateUrl: 'views/taskList.html' })
      .when('/new', { templateUrl: 'views/newTaskForm.html' })
      .when('/edit/:taskId', { templateUrl: 'views/taskForm.html' })
      .when('/data/changed', { templateUrl: 'views/dataChanged.html' })
      .when('/settings', { templateUrl: 'views/settings.html' })
      .when('/about', { templateUrl: 'views/about.html' })
      .when('/exit', { templateUrl: 'views/exit.html' })
      .when('/', { redirectTo: 'inbox' })
      .otherwise({ redirectTo: 'inbox' });
  }
};

module = angular.module(app.name, ['ngSanitize']);

module.config(['$routeProvider', app.router]);

['gui', 'win', 'screen', '$', 'moment'].forEach(function (v) {
  module.factory(v, function () {
    return window[v];
  });
});

module.provider({
  $exceptionHandler: {
    $get: function () {
      return function (exception, cause) {
        console.error('Error :', exception);
        alertService.showAlertMessage($, 'error', exception);
      };
    }
  }
});

module.directive('ngDraggable', function () {
  return function (scope, element, attrs) {
    $(element).addClass('draggable');
    $(element).draggable({
      cursor: 'move',
      addClasses: false,
      handle: '.dragIndicator',
      helper: 'clone',
      start: function (event, ui) {
        $('[ng-droppable]').addClass('droppable');
      },
      stop: function (event, ui) {
        $('[ng-droppable]').removeClass('droppable');
      }
    });
  };
});

module.directive('ngDroppable', function ($rootScope) {
  return function (scope, element, attrs) {
    var changeName, changeData, taskListScope;
    attrs.$observe('ngDroppable', function (value) {
      var datas;
      datas = value.split(' ');
      changeName = datas[0];
      changeData = datas[1];
    });
    $(element).droppable({
      accept: '.draggable',
      hoverClass: 'hovered',
      addClasses: false,
      tolerance: 'pointer',
      drop: function (event, ui) {
        var taskId, task, hasChanged;
        taskId = $(ui.helper[0]).attr('ng-draggable');
        task = gtdService.getTasks()[parseInt(taskId)];
        switch (changeName) {
          case 'inbox':
            task.dueDate = null;
            if (task.projects && task.projects.length) {
              task.projects.length = 0;
            }
            hasChanged = true;
            break;
          case 'today':
            task.dueDate = new Date();
            hasChanged = true;
            break;
          case 'next':
            task.dueDate = moment().add('days', 1).toDate();
            hasChanged = true;
            break;
          case 'project':
            if (!task.projects || task.projects.indexOf(changeData) === -1) {
              task.projects = task.projects || [];
              task.projects.push(changeData);
              hasChanged = true;
            }
            break;
          case 'context':
            if (!task.contexts || task.contexts.indexOf(changeData) === -1) {
              task.contexts = task.contexts || [];
              task.contexts.push(changeData);
              hasChanged = true;
            }
            break;
        }
        if (hasChanged) {
          $rootScope.disableWatchers();
          gtdService.saveFileData(
            $rootScope.settings.todoFile,
            $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
          );
          $rootScope.enableWatchers();
          $rootScope.loadData();
          $rootScope.$apply();
          taskListScope = angular.element('#taskListContainer').scope();
          if (taskListScope) {
            taskListScope.$apply(function () {
              taskListScope.init();
            });
          }
          alertService.showAlertMessage($, 'success', 'Task successfully changed.');
        }
      }
    });
  };
});

module.run(function ($rootScope, $location, $route, $exceptionHandler) {

  var userHome, extLinksHandler, keypressHandler;

  userHome = gtdService.getUserHome();

  app.log && console.log('running app');

  $rootScope.appTitle = config.appTitle;
  $rootScope.settings = {
    todoFile: path.join(userHome, 'todo.txt'),
    archiveFile: path.join(userHome, 'done.txt'),
    dateFormat: 'DD/MM/YYYY'
  };
  $rootScope.devTools = config.showDevTools;
  $rootScope.moment = moment;

  extLinksHandler = function () {
    gui.Shell.openExternal(this.href);
    return false;
  };

  keypressHandler = function (event) {
    if ($(event.currentTarget.activeElement).is('input')) {
      return true;
    }
    switch (event.charCode) {
      case 73:
      case 105:
        $rootScope.$apply(function () {
          $location.path('/inbox');
        });
        return false;
        break;
      case 84:
      case 116:
        $rootScope.$apply(function () {
          $location.path('/today');
        });
        return false;
        break;
      case 78:
      case 110:
        $rootScope.$apply(function () {
          $location.path('/next');
        });
        return false;
        break;
      case 65:
      case 97:
        $rootScope.$apply(function () {
          $location.path('/new');
        });
        return false;
        break;
    }
    return true;
  };

  $rootScope.$on('$viewContentLoaded', function () {
    $rootScope.handleExtLinks();
  });
  $rootScope.$on('$locationChangeSuccess', function (evt, newUrl, prevUrl) {
    var prevLocation;
    prevLocation = prevUrl.match(/^.*#(\/.*)$/);
    if (prevLocation) {
      $rootScope.prevLocationPath = prevLocation[1];
    }
  });
  $rootScope.$on('$routeChangeSuccess', function (next, current) {
    var action;
    action = '#' + $location.path();
    $('#navbar li a[href]').parent().removeClass('active');
    $('#navbar li > a[data-toggle!="dropdown"][href="' + action + '"]').parent().addClass('active');
    $('#navbar li > ul.dropdown-menu a[href="' + action + '"]').parent().parent().parent().addClass('active');
    $('#sidebar a[href]').parent().removeClass('active');
    $('#sidebar a[href="' + action + '"]').parent().addClass('active');
  });

  $rootScope.init = function () {
    $rootScope.checkDevTools();
    $rootScope.loadData();
  };
  $rootScope.loadData = function () {
    $rootScope.inboxNr = gtdService.getInboxTasks().length;
    $rootScope.todayNr = gtdService.getTodayTasks().length;
    $rootScope.nextNr = gtdService.getNextTasks().length;
    $rootScope.projects = gtdService.getProjects();
    $rootScope.contexts = gtdService.getContexts();
    $rootScope.completedNr = gtdService.getCompletedTasks().length;
  };
  $rootScope.enableWatchers = function () {
    $rootScope.todoFileWatcher = fs.watchFile($rootScope.settings.todoFile, function (curr, prev) {
      $rootScope.$apply(function () {
        $location.path('/data/changed');
      });
    });
    if ($rootScope.settings.archiveEnabled) {
      $rootScope.archiveFileWatcher = fs.watchFile($rootScope.settings.archiveFile, function (curr, prev) {
        $rootScope.$apply(function () {
          $location.path('/data/changed');
        });
      });
    }
  };
  $rootScope.disableWatchers = function () {
    fs.unwatchFile($rootScope.settings.todoFile, $rootScope.todoFileWatcher);
    $rootScope.todoFileWatcher = null;
    fs.unwatchFile($rootScope.settings.archiveFile, $rootScope.archiveFileWatcher);
    $rootScope.archiveFileWatcher = null;
  };
  $rootScope.checkDevTools = function () {
    if ($rootScope.devTools) {
      if ($rootScope.devToolsWin) {
        $rootScope.devToolsWin.show();
        $rootScope.devToolsWin.moveTo(0, screen.height - $rootScope.devToolsWin.height);
      } else {
        win.showDevTools('', true);
        win.on('devtools-opened', function (url) {
          $rootScope.devToolsWin = gui.Window.open(url, {
            width: screen.width,
            height: Math.round(screen.height / 3)
          });
          $rootScope.devToolsWin.on('loaded', function () {
            $rootScope.devToolsWin.moveTo(0, screen.height - $rootScope.devToolsWin.height);
          });
          $rootScope.devToolsWin.on('close', function () {
            this.hide();
            $rootScope.$apply(function () {
              $rootScope.devTools = false;
            });
          });
        });
      }
    } else {
      if ($rootScope.devToolsWin) {
        $rootScope.devToolsWin.hide();
      }
    }
  };
  $rootScope.toggleDevTools = function ($event) {
    $event.preventDefault();
    $rootScope.devTools = !$rootScope.devTools;
    $rootScope.checkDevTools();
    return false;
  };
  $rootScope.toggleSidebar = function ($event) {
    $event.preventDefault();
    $rootScope.settings.sidebarEnabled = !$rootScope.settings.sidebarEnabled;
  };
  $rootScope.goBack = function () {
    $location.path($rootScope.prevLocationPath);
  };
  $rootScope.goSearch = function () {
    $location.path('/search/' + encodeURIComponent($rootScope.search || ''));
    $rootScope.search = null;
  };
  $rootScope.exit = function () {
    win.close();
  };
  $rootScope.refreshData = function () {
    $rootScope.disableWatchers();
    gtdService.loadFileData(
      $rootScope.settings.todoFile,
      $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
    );
    $rootScope.enableWatchers();
    $rootScope.loadData();
    $rootScope.goBack();
  };
  $rootScope.cancel = function () {
    $('#cancelConfirmContainer').modal({keyboard: true, show: true});
  };
  $rootScope.cancelYes = function () {
    $('#cancelConfirmContainer').modal('hide');
    $('#cancelConfirmContainer').on('hidden.bs.modal', function () {
      $rootScope.$apply(function () {
        $rootScope.goBack();
      });
    })
  };
  $rootScope.enableKeyboardShortcuts = function () {
    $(document).bind('keypress', keypressHandler);
  };
  $rootScope.disableKeyboardShortcuts = function () {
    $(document).unbind('keypress', keypressHandler);
  };
  $rootScope.handleExtLinks = function () {
    var extLinks;
    extLinks = $('a[target=_blank]');
    extLinks.unbind('click', extLinksHandler);
    extLinks.bind('click', extLinksHandler);
  };

  gtdService.loadSettings($rootScope.settings);

  gtdService.loadFileData(
    $rootScope.settings.todoFile,
    $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
  );
  gtdService.saveFileData(
    $rootScope.settings.todoFile,
    $rootScope.settings.archiveEnabled ? $rootScope.settings.archiveFile : null
  );
  $rootScope.enableWatchers();

  //win.on('minimize', function () {});
  win.on('close', function () {
    console.log('closing app');
    this.hide();
    if ($rootScope.devToolsWin != null) {
      $rootScope.devToolsWin.close(true);
    }
    $rootScope.settings.winX = win.x;
    $rootScope.settings.winY = win.y;
    $rootScope.settings.winWidth = win.width;
    $rootScope.settings.winHeight = win.height;
    $rootScope.settings.startLocation = $rootScope.settings.startLocation || 'today';
    console.log('saving settings');
    gtdService.saveSettings($rootScope.settings);
    this.close(true);
    gui.App.quit();
  });

  if (typeof $rootScope.settings.winX === 'undefined') {
    $rootScope.settings.winX = Math.round((screen.width - win.width) / 2);
  }
  if (typeof $rootScope.settings.winY === 'undefined') {
    $rootScope.settings.winY = Math.round((screen.height - win.height) / 2);
  }
  if (typeof $rootScope.settings.winWidth === 'undefined') {
    $rootScope.settings.winWidth = pkg.window.width;
  }
  if (typeof $rootScope.settings.winHeight === 'undefined') {
    $rootScope.settings.winHeight = pkg.window.height;
  }
  win.moveTo($rootScope.settings.winX, $rootScope.settings.winY);
  win.resizeTo($rootScope.settings.winWidth, $rootScope.settings.winHeight);

  $('#searchField').focus(); // set focus to search field

  function refreshHeight() {
    var height;
    height = $(win.window).height() - 120 + 'px';
    $('#sidebar').css('height', height);
    $('#sidebar').css('max-height', height);
  }

  $(win.window).resize(refreshHeight);
  refreshHeight();

  if ($rootScope.settings.startLocation) {
    $location.path('/' + $rootScope.settings.startLocation);
  }

});