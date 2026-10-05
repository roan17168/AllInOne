(function () {
  "use strict";

  let dialog;
  let message;

  function showAllInOneMessage(text) {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "pd-feedback-dialog";
      dialog.setAttribute("aria-labelledby", "pdFeedbackTitle");

      const heading = document.createElement("h2");
      heading.id = "pdFeedbackTitle";
      heading.textContent = "AllInOne";

      message = document.createElement("p");
      message.setAttribute("aria-live", "polite");

      const form = document.createElement("form");
      form.method = "dialog";
      const button = document.createElement("button");
      button.type = "submit";
      button.className = "btn btn-accent";
      button.textContent = "Continue";
      form.appendChild(button);
      dialog.append(heading, message, form);
      document.body.appendChild(dialog);
    }

    message.textContent = String(text);
    if (!dialog.open) dialog.showModal();
  }

  window.showAllInOneMessage = showAllInOneMessage;
})();
