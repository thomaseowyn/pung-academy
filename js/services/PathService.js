/* ==========================================================================
   PathService
   --------------------------------------------------------------------------
   Builds links between pages from any depth in the site.

   Every page declares how far it sits from the site root with
   <html data-root="..">; this service turns that into working URLs, so no
   module ever hard-codes a "../.." chain.

   Paths are deliberately relative, never root-absolute: GitHub Pages serves
   this project from /pung-academy/, so a link to "/pages/login.html" would
   work locally and 404 in production.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.PathService = (function () {
  "use strict";

  /** Prefix from the current page back to the site root, e.g. "../../". */
  function rootPath() {
    const root = document.documentElement.getAttribute("data-root");
    if (!root || root === ".") {
      return "";
    }
    return root.replace(/\/?$/, "/");
  }

  /** Resolve a root-relative path for use on the current page. */
  function url(fromRoot) {
    return rootPath() + fromRoot.replace(/^\//, "");
  }

  /* Where each course's overview page and lesson folder live, keyed by the
     same course id used in js/config/courseData.js. */
  const DEFAULT_COURSE = "introductionToProgramming";
  const COURSE_PATHS = {
    introductionToProgramming: {
      overview: "pages/courses/introduction-to-programming.html",
      lessonDir: "pages/courses/introduction",
    },
    ai: {
      overview: "pages/courses/ai-overview.html",
      lessonDir: "pages/courses/ai",
    },
    softwareEngineering: {
      overview: "pages/courses/software-engineering.html",
      lessonDir: "pages/courses/software-engineering",
    },
  };

  /* Named destinations, so a rename only has to happen here. */
  const routes = {
    home: () => url("index.html"),
    login: () => url("pages/login.html"),
    signup: () => url("pages/signup.html"),
    about: () => url("pages/about-us.html"),
    courseTree: () => url("pages/course-tree.html"),
    comingSoon: () => url("pages/coming-soon.html"),
    courseOverview: (courseId = DEFAULT_COURSE) => url(COURSE_PATHS[courseId].overview),
    chapter: (n, courseId = DEFAULT_COURSE) =>
      url(`${COURSE_PATHS[courseId].lessonDir}/lesson-${Number(n)}.html`),
    teamMember: (who) => url(`pages/team/${who}.html`),
    asset: (file) => url(`assets/${file}`),
  };

  return { rootPath, routes, url };
})();
