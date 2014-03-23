var alertService, alertMessage;

alertMessage = null;

alertService = {
  showAlertMessage: function ($, type, title, text, duration, undoCb, undoCbArgs) {
    var alertMessageElt, alertMessageButton, alertMessageContent, content, className, closeAlert, undoMessage, undoMessageElt;
    if (!text) {
      if (!title) {
        text = type;
        title = null;
        type = null;
      } else {
        text = title;
        title = null;
      }
    }
    undoMessage = "";
    if (undoCb) {
      undoMessage = " <a id=\"undo-link\" class=\"glyphicon glyphicon-share-alt\"> undo</a>";
    }
    
    type = type || 'info';
    title = title || type;
    switch (type) {
      case 'error':
        className = 'alert-danger';
        break;
      default:
        className = 'alert-' + type;
    }
    content = (title ? '<strong>' + title + '</strong> ' : '') + text + undoMessage;
    alertMessageElt = $('#alertMessageContainer > .alert');
    alertMessageButton = $('#alertMessageContainer > .alert > button');
    alertMessageContent = $('#alertMessage');
    closeAlert = function () {
      if (alertMessage) {
        alertMessageButton.off('click');
        alertMessageContent.html();
        alertMessageElt.removeClass(alertMessage.className);
        alertMessageElt.hide();
        alertMessage = null;
      }
      return false;
    };
    if (alertMessage) {
      closeAlert();
    }
    alertMessageContent.html(content);
    alertMessageButton.on('click', closeAlert);
    alertMessage = { className: className };
    alertMessageElt.addClass(className);
    alertMessageElt.show();
    if (!duration) {
      duration = type === 'error' ? 0 : 2000;
    }
    if (duration) {
      setTimeout(closeAlert, duration);
    }
    
    undoMessageElt = $('#undo-link');
    undoCbCaller = function() {
      undoMessageElt.off('click');
      closeAlert();
      if (undoCbArgs) {
        undoCb(undoCbArgs);
      } else {
        undoCb();
      }
      return true;
    }
    undoMessageElt.on('click', undoCbCaller);
  }
};

module.exports = alertService;