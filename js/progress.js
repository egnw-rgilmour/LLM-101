/* progress.js — localStorage-backed progress + completion tracking.
   Depends on course.js (Course.storage, Course.modules). */

(function () {
  "use strict";

  var Course = (window.Course = window.Course || {});
  var KEY = "course-progress";

  function load() {
    var raw = Course.storage.get(KEY);
    if (!raw) return { completed: {}, visited: {} };
    try {
      var data = JSON.parse(raw);
      data.completed = data.completed || {};
      data.visited = data.visited || {};
      return data;
    } catch (e) {
      return { completed: {}, visited: {} };
    }
  }

  function save(data) {
    Course.storage.set(KEY, JSON.stringify(data));
  }

  var Progress = (Course.Progress = {});

  Progress.isComplete = function (num) {
    return !!load().completed[num];
  };

  Progress.isVisited = function (num) {
    var d = load();
    return !!d.completed[num] || !!d.visited[num];
  };

  Progress.markVisited = function (num) {
    var d = load();
    if (!d.visited[num]) {
      d.visited[num] = true;
      save(d);
    }
  };

  Progress.setComplete = function (num, complete) {
    var d = load();
    if (complete) d.completed[num] = true;
    else delete d.completed[num];
    save(d);
    Progress.refreshHome();
  };

  Progress.completedCount = function () {
    var d = load();
    var n = 0;
    Course.modules.forEach(function (m) {
      if (d.completed[m.num]) n++;
    });
    return n;
  };

  Progress.reset = function () {
    Course.storage.remove(KEY);
    Progress.refreshHome();
  };

  Progress.percent = function () {
    if (!Course.totalModules) return 0;
    return Math.round((Progress.completedCount() / Course.totalModules) * 100);
  };

  /* ---- Home page rendering ---------------------------------------------- */

  Progress.refreshHome = function () {
    var bar = document.getElementById("progress-bar-fill");
    var label = document.getElementById("progress-label");
    if (bar) {
      var pct = Progress.percent();
      bar.style.width = pct + "%";
      var wrap = document.getElementById("progress-bar");
      if (wrap) {
        wrap.setAttribute("aria-valuenow", String(pct));
      }
    }
    if (label) {
      label.textContent =
        Progress.completedCount() + " of " + Course.totalModules + " modules complete (" + Progress.percent() + "%)";
    }
    // Update module list completion badges
    Course.modules.forEach(function (m) {
      var badge = document.getElementById("badge-" + m.num);
      if (badge) {
        var done = Progress.isComplete(m.num);
        var visited = Progress.isVisited(m.num);
        badge.className = "module-status " + (done ? "is-complete" : visited ? "is-visited" : "is-new");
        badge.textContent = done ? "✓ Complete" : visited ? "In progress" : "Not started";
      }
    });
  };

  Progress.renderHome = function () {
    var list = document.getElementById("module-list");
    if (list) {
      list.innerHTML = "";
      Course.modules.forEach(function (m) {
        var card = Course.el("a", {
          class: "module-card",
          href: "modules/" + m.file
        });
        var head = Course.el("div", { class: "module-card-head" }, [
          Course.el("span", { class: "module-num", text: "Module " + m.num }),
          Course.el("span", { id: "badge-" + m.num, class: "module-status is-new", text: "Not started" })
        ]);
        var title = Course.el("h3", { class: "module-card-title", text: m.title });
        var summary = Course.el("p", { class: "module-card-summary", text: m.summary });
        var meta = Course.el("p", { class: "module-card-meta", text: "~" + m.minutes + " min read" });
        card.appendChild(head);
        card.appendChild(title);
        card.appendChild(summary);
        card.appendChild(meta);
        list.appendChild(card);
      });
    }

    // Wire up reset button
    var resetBtn = document.getElementById("reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        var ok = window.confirm("Reset all course progress? This clears your completed modules on this browser.");
        if (ok) Progress.reset();
      });
    }

    // Storage-unavailable notice
    var notice = document.getElementById("storage-notice");
    if (notice && !Course.storage.available) {
      notice.hidden = false;
    }

    Progress.refreshHome();
  };
})();
