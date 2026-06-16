/* demos.js — self-contained interactive demo widgets.
   Depends on course.js. Each demo initializes only if its container exists, so
   this file is safe to include on every module page.

   Demos:
     * Tokenizer visualizer        (Module 4)  -> #demo-tokenizer
     * Temperature / sampling toy   (Module 6)  -> #demo-temperature
     * Embeddings / similarity demo (Module 7)  -> #demo-embeddings

   All demos use simple, clearly-labeled heuristics — no real model is involved. */

(function () {
  "use strict";

  var Course = (window.Course = window.Course || {});
  var Demos = (Course.Demos = Course.Demos || {});

  /* =========================================================================
   * Tokenizer visualizer (approximate)
   * ======================================================================= */
  function approximateTokens(text) {
    // A transparent heuristic: split on whitespace, keep punctuation as its own
    // token, and break long word-pieces into ~4-character chunks. This is NOT a
    // real learned tokenizer — it only conveys the idea that text becomes chunks.
    var tokens = [];
    var pieces = text.match(/\s+|[A-Za-z0-9]+|[^\sA-Za-z0-9]/g);
    if (!pieces) return tokens;
    pieces.forEach(function (p) {
      if (/^\s+$/.test(p)) return; // skip pure whitespace
      if (/^[A-Za-z0-9]+$/.test(p) && p.length > 6) {
        for (var i = 0; i < p.length; i += 4) {
          tokens.push(p.slice(i, i + 4));
        }
      } else {
        tokens.push(p);
      }
    });
    return tokens;
  }

  Demos.initTokenizer = function () {
    var host = document.getElementById("demo-tokenizer");
    if (!host) return;

    var input = host.querySelector("#tok-input");
    var out = host.querySelector("#tok-output");
    var count = host.querySelector("#tok-count");
    var words = host.querySelector("#tok-words");
    var chars = host.querySelector("#tok-chars");
    if (!input || !out) return;

    function update() {
      var text = input.value;
      var tokens = approximateTokens(text);
      out.innerHTML = "";
      tokens.forEach(function (t, i) {
        var chip = Course.el("span", { class: "token-chip token-c" + (i % 6), text: t });
        out.appendChild(chip);
      });
      if (count) count.textContent = String(tokens.length);
      if (words) {
        var w = text.trim() ? text.trim().split(/\s+/).length : 0;
        words.textContent = String(w);
      }
      if (chars) chars.textContent = String(text.length);
    }

    input.addEventListener("input", update);
    update();
  };

  /* =========================================================================
   * Temperature / sampling toy
   * ======================================================================= */
  Demos.initTemperature = function () {
    var host = document.getElementById("demo-temperature");
    if (!host) return;

    var slider = host.querySelector("#temp-slider");
    var tempLabel = host.querySelector("#temp-value");
    var bars = host.querySelector("#temp-bars");
    var note = host.querySelector("#temp-note");
    if (!slider || !bars) return;

    // Hardcoded illustrative example: next word after
    // "The server crashed, so I decided to ___".  Raw "scores" (logits).
    var candidates = [
      { word: "restart", score: 3.0 },
      { word: "investigate", score: 2.4 },
      { word: "escalate", score: 1.8 },
      { word: "wait", score: 1.0 },
      { word: "panic", score: 0.2 }
    ];

    function softmax(scores, temp) {
      var t = Math.max(temp, 0.01);
      var scaled = scores.map(function (s) {
        return Math.exp(s / t);
      });
      var sum = scaled.reduce(function (a, b) {
        return a + b;
      }, 0);
      return scaled.map(function (v) {
        return v / sum;
      });
    }

    function update() {
      var temp = parseInt(slider.value, 10) / 100; // 0.00 - 1.50
      if (tempLabel) tempLabel.textContent = temp.toFixed(2);
      var probs = softmax(
        candidates.map(function (c) {
          return c.score;
        }),
        temp
      );
      // Identify the top probability for highlighting.
      var topIdx = 0;
      probs.forEach(function (p, i) {
        if (p > probs[topIdx]) topIdx = i;
      });

      bars.innerHTML = "";
      candidates.forEach(function (c, i) {
        var pct = Math.round(probs[i] * 100);
        var row = Course.el("div", { class: "tbar-row" + (i === topIdx ? " is-top" : "") });
        var label = Course.el("span", { class: "tbar-label", text: c.word });
        var track = Course.el("div", { class: "tbar-track" });
        var fill = Course.el("div", { class: "tbar-fill" });
        fill.style.width = pct + "%";
        track.appendChild(fill);
        var val = Course.el("span", { class: "tbar-val", text: pct + "%" });
        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(val);
        bars.appendChild(row);
      });

      if (note) {
        if (temp <= 0.3) {
          note.textContent =
            "Low temperature: the model strongly favors the single most likely word (\"" +
            candidates[topIdx].word +
            "\"). Output is focused and repeatable.";
        } else if (temp <= 0.8) {
          note.textContent =
            "Moderate temperature: the top word is still most likely, but other reasonable words now have a real chance.";
        } else {
          note.textContent =
            "High temperature: probabilities flatten out, so less-likely words (even \"panic\") can get picked. Output is varied and less predictable.";
        }
      }
    }

    slider.addEventListener("input", update);
    update();
  };

  /* =========================================================================
   * Embeddings / similarity demo (illustrative)
   * ======================================================================= */
  Demos.initEmbeddings = function () {
    var host = document.getElementById("demo-embeddings");
    if (!host) return;

    var select = host.querySelector("#emb-select");
    var results = host.querySelector("#emb-results");
    if (!select || !results) return;

    // Each phrase has a small, hand-authored 3-D "embedding" purely to
    // illustrate the idea. Dimensions loosely mean [tech-support, weather,
    // finance]. Real embeddings have hundreds of dimensions learned from data.
    var phrases = [
      { text: "My laptop won't turn on", vec: [0.95, 0.05, 0.1] },
      { text: "The computer keeps crashing", vec: [0.9, 0.05, 0.15] },
      { text: "How do I reset my password?", vec: [0.8, 0.05, 0.2] },
      { text: "Will it rain this weekend?", vec: [0.05, 0.95, 0.05] },
      { text: "It's sunny and warm outside", vec: [0.05, 0.9, 0.1] },
      { text: "What is my account balance?", vec: [0.1, 0.05, 0.95] },
      { text: "Please process this invoice", vec: [0.15, 0.05, 0.9] }
    ];

    function cosine(a, b) {
      var dot = 0,
        na = 0,
        nb = 0;
      for (var i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
      }
      return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
    }

    // Populate the dropdown once.
    phrases.forEach(function (p, i) {
      select.appendChild(Course.el("option", { value: String(i), text: p.text }));
    });

    function update() {
      var idx = parseInt(select.value, 10);
      var base = phrases[idx];
      var scored = phrases
        .map(function (p, i) {
          return { p: p, i: i, score: cosine(base.vec, p.vec) };
        })
        .filter(function (s) {
          return s.i !== idx;
        })
        .sort(function (a, b) {
          return b.score - a.score;
        });

      results.innerHTML = "";
      scored.forEach(function (s) {
        var pct = Math.round(s.score * 100);
        var row = Course.el("div", { class: "emb-row" });
        var label = Course.el("span", { class: "emb-label", text: s.p.text });
        var track = Course.el("div", { class: "emb-track" });
        var fill = Course.el("div", { class: "emb-fill" });
        fill.style.width = pct + "%";
        track.appendChild(fill);
        var val = Course.el("span", { class: "emb-val", text: pct + "% similar" });
        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(val);
        results.appendChild(row);
      });
    }

    select.addEventListener("change", update);
    update();
  };

  Demos.initAll = function () {
    Demos.initTokenizer();
    Demos.initTemperature();
    Demos.initEmbeddings();
  };
})();
