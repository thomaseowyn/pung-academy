/* Entry point for the lesson page. */
(function () {
  "use strict";

  Pung.Shared.initPage();
  Pung.LessonController.initLessonPage();
  Pung.LessonView.bindPredictWidgets();
})();
