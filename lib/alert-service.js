var alertService, alertMessage;

alertMessage = null;

alertService = {
  showAlertMessage: function ($, type, title, text, duration) {
    var alertMessageElt, alertMessageButton, alertMessageContent, content, className, closeAlert;
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
    type = type || 'info';
    title = title || type;
    switch (type) {
      case 'error':
        className = 'alert-danger';
        break;
      default:
        className = 'alert-' + type;
    }
    content = (title ? '<strong>' + title + '</strong> ' : '') + text;
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
  }
};

module.exports = alertService;