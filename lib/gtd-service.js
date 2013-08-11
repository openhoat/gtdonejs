var pkg = require('../package')
  , path = require('path')
  , fs = require('fs')
  , moment = require('moment')
  , gtdService, tasks, settingsFilename;

tasks = [];
settingsFilename = '.' + pkg.name + '_settings';

gtdService = {
  propertiesConfig: {
    comment: ['#', ';'],
    separator: '=',
    sections: false
  },
  getUserHome: function () {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  },
  loadSettings: function (settings) {
    var settingsFile, data, key;
    settingsFile = path.join(gtdService.getUserHome(), settingsFilename);
    try {
      data = JSON.parse(fs.readFileSync(settingsFile).toString());
    } catch (err) {
      console.error(err);
      data = {};
    }
    if (settings && typeof settings === 'object') {
      for (key in data) {
        settings[key] = data[key];
      }
    }
    return data;
  },
  saveSettings: function (settings) {
    var settingsFile;
    settingsFile = path.join(gtdService.getUserHome(), settingsFilename);
    try {
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, '\t'));
    } catch (err) {
      console.error(err);
    }
  },
  parseDate: function (s, format) {
    return moment(s, format).toDate();
  },
  formatDate: function (date, format) {
    return moment(date).format(format);
  },
  parseLine: function (line, dateFormat) {
    var task, words, i, j, word, completed, completionDate, priority, date, meta;
    task = {};
    words = line.split(' ');
    j = 0;
    for (i = 0; i < words.length; i++) {
      word = words[i];
      if (i === 0 && !completed) {
        completed = word === 'x';
        if (completed) {
          task.completed = true;
          j++;
          continue;
        }
      }
      if (i === j && !priority) {
        priority = word.match(/\(([A-Z]{1})\)/);
        if (priority) {
          task.priority = priority[1];
          j++;
          continue;
        }
      }
      if (i === j && (!date || !completionDate)) {
        date = word.match(/([\d]{4}-[\d]{2}-[\d]{2})/);
        if (date) {
          if (!completionDate && completed) {
            completionDate = date;
            date = null;
            task.completionDate = gtdService.parseDate(completionDate[1], dateFormat);
            j++;
          } else {
            task.date = gtdService.parseDate(date[1], dateFormat);
            j = -1;
          }
          continue;
        }
      }
      meta = word.match(/(\S+):(\S+)/);
      if (meta) {
        if (meta[1].toLowerCase() === 'due') {
          task.dueDate = gtdService.parseDate(meta[2], dateFormat);
        } else {
          task.meta = task.meta || {};
          task.meta[meta[1]] = meta[2];
        }
        continue;
      }
      if (word.indexOf('+') === 0) {
        task.projects = task.projects || [];
        task.projects.push(word.substring(1));
        continue;
      }
      if (word.indexOf('@') === 0) {
        task.contexts = task.contexts || [];
        task.contexts.push(word.substring(1));
        continue;
      }
      if (task.description) {
        task.description += ' ' + word;
      } else {
        task.description = word;
      }
    }
    task.date = task.date || new Date();
    return task;
  },
  loadFileData: function (todoFile, doneFile) {
    var todotxtData, lines, i, line, task;
    tasks.length = 0;
    [todoFile, doneFile].forEach(function (file) {
      if (!file) {
        return;
      }
      try {
        todotxtData = fs.readFileSync(file);
      } catch (err) {
        console.error(err);
        return;
      }
      lines = todotxtData.toString().split('\n');
      for (i = 0; i < lines.length; i++) {
        line = lines[i];
        if (line === '') {
          lines.splice(i--, 1);
          continue;
        }
        task = gtdService.parseLine(line, 'YYYY-MM-DD');
        tasks.push(task);
        task.id = tasks.length - 1;
      }
    });
  },
  saveFileData: function (todoFile, doneFile) {
    var todoContent, doneContent;
    todoContent = [];
    doneContent = [];
    tasks.forEach(function (task) {
      var line, key;
      line = '';
      if (task.completed) {
        line += 'x ';
        if (task.completionDate) {
          line += gtdService.formatDate(task.completionDate, 'YYYY-MM-DD') + ' ';
        }
      }
      if (task.priority) {
        line += '(' + task.priority + ') ';
      }
      line += gtdService.formatDate(task.date, 'YYYY-MM-DD') + ' ';
      line += task.description;
      if (task.projects && task.projects.length) {
        line += ' +' + task.projects.join(' +');
      }
      if (task.contexts && task.contexts.length) {
        line += ' @' + task.contexts.join(' @');
      }
      if (task.dueDate) {
        line += ' DUE:' + gtdService.formatDate(task.dueDate, 'YYYY-MM-DD');
      }
      if (task.meta) {
        for (key in task.meta) {
          line += ' ' + key + ':' + task.meta[key];
        }
      }
      if (task.completed && doneFile) {
        doneContent.push(line);
      } else {
        todoContent.push(line);
      }
    });
    fs.writeFileSync(todoFile, todoContent.join('\n'));
    if (doneFile) {
      fs.writeFileSync(doneFile, doneContent.join('\n'));
    }
  },
  getTasks: function (search) {
    var result;
    if (search) {
      search = search.toLowerCase();
      result = tasks.filter(function (task) {
        if (task.description.toLowerCase().indexOf(search) !== -1) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      result = tasks;
    }
    return result;
  },
  getProjects: function () {
    var projects, taskNr, result;
    projects = [];
    taskNr = {};
    tasks.forEach(function (task) {
      if (task.projects && task.projects.length) {
        task.projects.forEach(function (project) {
          if (projects.indexOf(project) === -1) {
            projects.push(project);
            taskNr[project] = 0;
          }
          if (!task.completed) {
            taskNr[project]++;
          }
        });
      }
    });
    projects.sort();
    result = [];
    projects.forEach(function (project) {
      result.push({
        name: project,
        taskNr: taskNr[project]
      });
    });
    return result;
  },
  getContexts: function () {
    var contexts , taskNr, result;
    contexts = [];
    taskNr = {};
    tasks.forEach(function (task) {
      if (task.contexts && task.contexts.length) {
        task.contexts.forEach(function (context) {
          if (contexts.indexOf(context) === -1) {
            contexts.push(context);
            taskNr[context] = 0;
          }
          if (!task.completed) {
            taskNr[context]++;
          }
        });
      }
    });
    contexts.sort();
    result = [];
    contexts.forEach(function (context) {
      result.push({
        name: context,
        taskNr: taskNr[context]
      });
    });
    return result;
  },
  getInboxTasks: function () {
    var inbox;
    inbox = tasks.filter(function (task) {
      return !task.completed && !task.dueDate && (!task.projects || !task.projects.length);
    });
    return inbox;
  },
  getTodayTasks: function (contextName) {
    var now = moment();
    return tasks.filter(function (task) {
      return !task.completed && task.dueDate && !now.isBefore(task.dueDate);
    });
  },
  getNextTasks: function (contextName) {
    var now = moment();
    return tasks.filter(function (task) {
      return !task.completed && task.dueDate && now.isBefore(task.dueDate);
    });
  },
  getProjectTasks: function (projectName) {
    return tasks.filter(function (task) {
      return !task.completed && task.projects && task.projects.indexOf(projectName) !== -1;
    });
  },
  getContextTasks: function (contextName) {
    return tasks.filter(function (task) {
      return !task.completed && task.contexts && task.contexts.indexOf(contextName) !== -1;
    });
  },
  getCompletedTasks: function () {
    return tasks.filter(function (task) {
      return task.completed;
    });
  },
  updateTask: function (task) {
    tasks[task.id] = task;
  },
  removeTask: function (index) {
    tasks.splice(index, 1);
  },
  addTask: function (task) {
    tasks.push(task);
    task.id = tasks.length - 1;
  }
};

module.exports = gtdService;