/* course.js — global namespace, single source of truth for modules,
   shared utilities, theming, and navigation rendering.

   IMPORTANT (file:// constraints):
   - No ES modules. Everything is shared through the global `window.Course`.
   - No fetch/XHR. All data is embedded directly in JavaScript.
   - Loaded with a plain <script src="..."> in dependency order. course.js must
     load before progress.js, quiz.js, glossary.js and demos.js. */

(function () {
  "use strict";

  var Course = (window.Course = window.Course || {});

  /* ---------------------------------------------------------------------------
   * Storage helper — feature-detects localStorage and degrades gracefully to an
   * in-memory store when storage is unavailable (common on file:// origins).
   * ------------------------------------------------------------------------- */
  Course.storage = (function () {
    var ok = false;
    try {
      var probe = "__course_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      ok = true;
    } catch (e) {
      ok = false;
    }
    var mem = {};
    return {
      available: ok,
      get: function (key) {
        try {
          return ok ? window.localStorage.getItem(key) : (key in mem ? mem[key] : null);
        } catch (e) {
          return key in mem ? mem[key] : null;
        }
      },
      set: function (key, value) {
        try {
          if (ok) window.localStorage.setItem(key, value);
          else mem[key] = String(value);
        } catch (e) {
          mem[key] = String(value);
        }
      },
      remove: function (key) {
        try {
          if (ok) window.localStorage.removeItem(key);
          else delete mem[key];
        } catch (e) {
          delete mem[key];
        }
      }
    };
  })();

  /* ---------------------------------------------------------------------------
   * Module list — the SINGLE SOURCE OF TRUTH for the curriculum. Navigation,
   * prev/next links, the home page module list, and progress tracking are all
   * derived from this array. To add a module, add an entry here and create the
   * matching HTML page under /modules/.
   * ------------------------------------------------------------------------- */
  Course.modules = [
    {
      num: "01",
      file: "01-what-is-ai.html",
      title: "What is AI?",
      minutes: 12,
      summary: "Untangle AI, machine learning, deep learning and generative AI, and clear up common buzzword confusion."
    },
    {
      num: "02",
      file: "02-ml-vs-deep-learning.html",
      title: "Machine Learning vs. Deep Learning",
      minutes: 12,
      summary: "Learning from data, training vs. inference, what a \"model\" really is, and why GPUs matter."
    },
    {
      num: "03",
      file: "03-what-is-an-llm.html",
      title: "What is an LLM?",
      minutes: 13,
      summary: "Next-token prediction in plain English, what \"parameters\" and \"model size\" mean, and why fluent can still be wrong."
    },
    {
      num: "04",
      file: "04-tokens-and-tokenization.html",
      title: "Tokens & Tokenization",
      minutes: 12,
      summary: "What tokens are, why text is split this way, and how that drives context limits and pricing. Includes a live tokenizer demo."
    },
    {
      num: "05",
      file: "05-how-llms-are-trained.html",
      title: "How LLMs are Trained",
      minutes: 13,
      summary: "Pretraining, fine-tuning and alignment/RLHF at a conceptual level, plus what a \"knowledge cutoff\" means."
    },
    {
      num: "06",
      file: "06-prompting-and-context.html",
      title: "Prompting & Context",
      minutes: 14,
      summary: "Prompts, system instructions, context windows, why the model \"forgets,\" and practical prompting tips. Includes a temperature demo."
    },
    {
      num: "07",
      file: "07-embeddings-and-vector-search.html",
      title: "Embeddings & Vector Search",
      minutes: 13,
      summary: "Turning meaning into numbers, semantic similarity, vector databases, and how this differs from keyword search. Includes a similarity demo."
    },
    {
      num: "08",
      file: "08-rag.html",
      title: "Retrieval-Augmented Generation (RAG)",
      minutes: 12,
      summary: "Grounding answers in your own documents, why companies use RAG, and the retrieve-then-generate flow."
    },
    {
      num: "09",
      file: "09-agents-and-tool-use.html",
      title: "Agents & Tool Use",
      minutes: 12,
      summary: "Function/tool calling, agents that take actions, and the reliability and safety implications."
    },
    {
      num: "10",
      file: "10-limitations-and-risks.html",
      title: "Limitations & Risks",
      minutes: 13,
      summary: "Hallucinations, bias, confident wrongness, prompt injection and non-determinism — and how to sanity-check output."
    },
    {
      num: "11",
      file: "11-security-privacy-governance.html",
      title: "Security, Privacy & Governance",
      minutes: 15,
      summary: "The most important module for IT: data handling, third-party risk, shadow IT, cloud vs. local models, and evaluating vendors."
    },
    {
      num: "12",
      file: "12-the-ai-tool-landscape.html",
      title: "The AI Tool Landscape",
      minutes: 12,
      summary: "Categories of tools, API vs. app vs. local, and a vendor-neutral framework for evaluating new AI tools."
    }
  ];

  Course.totalModules = Course.modules.length;

  Course.getModule = function (num) {
    for (var i = 0; i < Course.modules.length; i++) {
      if (Course.modules[i].num === num) return Course.modules[i];
    }
    return null;
  };

  Course.getModuleIndex = function (num) {
    for (var i = 0; i < Course.modules.length; i++) {
      if (Course.modules[i].num === num) return i;
    }
    return -1;
  };

  /* base = "" for root pages, "../" for pages inside /modules/. Pages set
     window.COURSE_BASE before this script's init runs. */
  Course.base = function () {
    return window.COURSE_BASE || "";
  };

  /* Small DOM helper. */
  Course.el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  };

  /* ---------------------------------------------------------------------------
   * Theming — light/dark toggle persisted in localStorage via CSS custom
   * properties (data-theme on <html>).
   * ------------------------------------------------------------------------- */
  var THEME_KEY = "course-theme";

  Course.getTheme = function () {
    return Course.storage.get(THEME_KEY) || "light";
  };

  Course.applyTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.textContent = dark ? "☀ Light" : "☾ Dark";
      btn.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
    }
  };

  Course.toggleTheme = function () {
    var next = Course.getTheme() === "dark" ? "light" : "dark";
    Course.storage.set(THEME_KEY, next);
    Course.applyTheme(next);
  };

  /* Apply the saved theme as early as possible to avoid a flash. */
  Course.applyTheme(Course.getTheme());

  /* ---------------------------------------------------------------------------
   * Header / top navigation — generated from the module list.
   * ------------------------------------------------------------------------- */
  Course.renderHeader = function (active) {
    var host = document.getElementById("site-header");
    if (!host) return;
    var base = Course.base();

    var nav = Course.el("nav", { class: "site-nav", "aria-label": "Primary" });

    var brand = Course.el("a", { class: "brand", href: base + "index.html" }, [
      Course.el("span", { class: "brand-mark", "aria-hidden": "true", text: "AI" }),
      Course.el("span", { class: "brand-text", text: "AI & LLM Systems 101" })
    ]);

    var links = Course.el("ul", { class: "nav-links" });
    var items = [
      { label: "Home", href: base + "index.html", key: "home" },
      { label: "Modules", href: base + "index.html#modules", key: "modules" },
      { label: "Glossary", href: base + "glossary.html", key: "glossary" },
      { label: "About", href: base + "about.html", key: "about" }
    ];
    items.forEach(function (it) {
      var a = Course.el("a", { href: it.href, text: it.label });
      if (active === it.key) a.setAttribute("aria-current", "page");
      links.appendChild(Course.el("li", null, a));
    });

    var toggle = Course.el("button", {
      id: "theme-toggle",
      class: "theme-toggle",
      type: "button",
      "aria-pressed": "false"
    });
    toggle.addEventListener("click", Course.toggleTheme);

    var controls = Course.el("div", { class: "nav-controls" }, [toggle]);

    nav.appendChild(brand);
    nav.appendChild(links);
    nav.appendChild(controls);
    host.innerHTML = "";
    host.appendChild(nav);

    Course.applyTheme(Course.getTheme());
  };

  /* ---------------------------------------------------------------------------
   * Footer.
   * ------------------------------------------------------------------------- */
  Course.renderFooter = function () {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var base = Course.base();
    host.innerHTML = "";
    var inner = Course.el("div", { class: "footer-inner" }, [
      Course.el("p", {
        text:
          "AI & LLM Systems 101 — an internal, vendor-neutral training aid. Runs fully offline; no data leaves your browser."
      }),
      Course.el("p", null, [
        Course.el("a", { href: base + "about.html", text: "About & disclaimer" }),
        document.createTextNode(" · "),
        Course.el("a", { href: base + "glossary.html", text: "Glossary" })
      ])
    ]);
    host.appendChild(inner);
  };

  /* ---------------------------------------------------------------------------
   * Module prev/next navigation, generated from the module list.
   * ------------------------------------------------------------------------- */
  Course.renderModuleNav = function (num) {
    var host = document.getElementById("module-nav");
    if (!host) return;
    var base = Course.base();
    var idx = Course.getModuleIndex(num);
    var prev = idx > 0 ? Course.modules[idx - 1] : null;
    var next = idx < Course.modules.length - 1 ? Course.modules[idx + 1] : null;

    host.innerHTML = "";
    host.setAttribute("aria-label", "Module navigation");

    var prevNode;
    if (prev) {
      prevNode = Course.el("a", { class: "modnav-link prev", href: base + "modules/" + prev.file }, [
        Course.el("span", { class: "modnav-dir", text: "← Previous" }),
        Course.el("span", { class: "modnav-title", text: prev.num + ". " + prev.title })
      ]);
    } else {
      prevNode = Course.el("a", { class: "modnav-link prev", href: base + "index.html" }, [
        Course.el("span", { class: "modnav-dir", text: "← Back" }),
        Course.el("span", { class: "modnav-title", text: "Course home" })
      ]);
    }

    var nextNode;
    if (next) {
      nextNode = Course.el("a", { class: "modnav-link next", href: base + "modules/" + next.file }, [
        Course.el("span", { class: "modnav-dir", text: "Next →" }),
        Course.el("span", { class: "modnav-title", text: next.num + ". " + next.title })
      ]);
    } else {
      nextNode = Course.el("a", { class: "modnav-link next", href: base + "index.html#modules" }, [
        Course.el("span", { class: "modnav-dir", text: "Finish →" }),
        Course.el("span", { class: "modnav-title", text: "Back to all modules" })
      ]);
    }

    host.appendChild(prevNode);
    host.appendChild(nextNode);
  };

  /* ---------------------------------------------------------------------------
   * Page initialisation. Pages may set window.COURSE_PAGE (one of home,
   * glossary, about, module) and window.COURSE_MODULE (e.g. "04").
   * ------------------------------------------------------------------------- */
  Course.initPage = function () {
    var page = window.COURSE_PAGE || "";
    var active = page === "module" ? "modules" : page;
    Course.renderHeader(active);
    Course.renderFooter();

    if (page === "module" && window.COURSE_MODULE) {
      Course.renderModuleNav(window.COURSE_MODULE);
      if (Course.Progress && Course.Progress.markVisited) {
        Course.Progress.markVisited(window.COURSE_MODULE);
      }
    }
    if (page === "home" && Course.Progress && Course.Progress.renderHome) {
      Course.Progress.renderHome();
    }
    if (page === "glossary" && Course.Glossary && Course.Glossary.init) {
      Course.Glossary.init();
    }
    if (window.Course && Course.Demos && Course.Demos.initAll) {
      Course.Demos.initAll();
    }
    if (page === "module" && window.COURSE_MODULE && Course.Quiz && Course.Quiz.autoInit) {
      Course.Quiz.autoInit(window.COURSE_MODULE);
    }
  };

  document.addEventListener("DOMContentLoaded", Course.initPage);
})();
