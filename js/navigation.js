/* ==========================================================================
   Pung Academy — navigation behaviour
   Swaps the Login/Sign up buttons for the signed-in state. Runs on every
   page that includes the site header.
   ========================================================================== */

(function () {
  "use strict";

  var guestArea = document.querySelector("[data-session='guest']");
  var userArea = document.querySelector("[data-session='user']");

  if (!guestArea || !userArea || !window.PungAuth) {
    return;
  }

  var currentUser = window.PungAuth.getCurrentUser();
  var isSignedIn = Boolean(currentUser);

  guestArea.hidden = isSignedIn;
  userArea.hidden = !isSignedIn;

  if (isSignedIn) {
    var nameSlot = userArea.querySelector("[data-user-name]");
    if (nameSlot) {
      nameSlot.textContent = currentUser.name || currentUser.email;
    }
  }

  var logoutButton = document.querySelector("[data-logout]");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      window.PungAuth.logout();
      window.location.href = window.PungAuth.rootPath() + "index.html";
    });
  }
})();
