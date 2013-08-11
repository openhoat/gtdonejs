var path = require('path')
  , fs = require('fs')
  , controllers;

controllers = {
  init: function () {
    fs.readdirSync(__dirname).forEach(function (file) {
      var ctrlName, ctrl;
      ctrlName = path.basename(file, '.js');
      if (ctrlName === path.basename(__filename, '.js')) {
        return;
      }
      ctrl = require(path.join(__dirname, ctrlName));
      if (typeof ctrl !== 'function') {
        return;
      }
      window[ctrlName] = ctrl;
    });
  }
};

module.exports = controllers;