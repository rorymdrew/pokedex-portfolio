/* ==========================================================================
   RORY DEX — vanilla JS, no dependencies
   Boot sequence · panel navigation · Empoleon pixel sprite ·
   stat bar animation · optional DS-style beeps (WebAudio, off by default)
   ========================================================================== */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Sound — tiny square-wave blips, no audio files. Off until toggled.
  ------------------------------------------------------------------ */
  var soundOn = false;
  var audioCtx = null;

  function beep(freq, dur) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) { /* audio unavailable — stay silent */ }
  }

  var soundToggle = document.getElementById("sound-toggle");
  soundToggle.addEventListener("click", function () {
    soundOn = !soundOn;
    soundToggle.textContent = soundOn ? "SOUND:ON" : "SOUND:OFF";
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    beep(880, 0.08);
  });

  /* ------------------------------------------------------------------
     Boot screen — power on, type the title, then reveal the dex
  ------------------------------------------------------------------ */
  var boot = document.getElementById("boot");
  var bootTitle = document.getElementById("boot-title");
  var bootSub = document.getElementById("boot-sub");
  var bootDone = false;
  var bootTimers = [];

  function endBoot() {
    if (bootDone) return;
    bootDone = true;
    bootTimers.forEach(clearTimeout);
    boot.classList.add("boot-done");
    document.removeEventListener("keydown", endBoot);
    boot.removeEventListener("click", endBoot);
    // free the overlay entirely once faded
    setTimeout(function () { boot.remove(); }, 450);
    animateStatsIfVisible();
  }

  function runBoot() {
    if (reducedMotion) {
      bootTitle.textContent = "RORY DEX";
      endBoot();
      return;
    }
    var title = "RORY DEX";
    var i = 0;
    bootTimers.push(setTimeout(function type() {
      bootTitle.textContent = title.slice(0, ++i);
      beep(420 + i * 40, 0.05);
      if (i < title.length) bootTimers.push(setTimeout(type, 110));
    }, 600));
    bootTimers.push(setTimeout(function () { bootSub.textContent = "SYSTEM CHECK… OK"; }, 1800));
    bootTimers.push(setTimeout(function () { bootSub.textContent = "TRAINER DATA LOADED"; }, 2400));
    bootTimers.push(setTimeout(endBoot, 3100));
  }

  boot.addEventListener("click", endBoot);
  document.addEventListener("keydown", endBoot);
  runBoot();

  /* ------------------------------------------------------------------
     Panel navigation — DS-menu style with keyboard support
  ------------------------------------------------------------------ */
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var flavorTyped = false;

  function showPanel(id, fromButton) {
    panels.forEach(function (p) {
      var match = p.id === id;
      p.hidden = !match;
      p.classList.toggle("is-shown", match);
    });
    navItems.forEach(function (btn) {
      var active = btn.dataset.panel === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
      if (active && fromButton) {
        btn.classList.remove("flash");
        void btn.offsetWidth; // restart the flash animation
        btn.classList.add("flash");
      }
    });
    beep(660, 0.07);
    if (id === "panel-ability") animateStatsIfVisible();
    if (id === "panel-profile" && !flavorTyped) typeFlavor();
  }

  navItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showPanel(btn.dataset.panel, true);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    e.preventDefault();
    var idx = navItems.findIndex(function (b) { return b.classList.contains("is-active"); });
    idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + navItems.length) % navItems.length;
    navItems[idx].focus();
    showPanel(navItems[idx].dataset.panel, true);
  });

  /* ------------------------------------------------------------------
     Expandable sub-entries (Field Log / Research Logs)
  ------------------------------------------------------------------ */
  document.querySelectorAll(".entry-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var entry = head.closest(".entry");
      var open = entry.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
      beep(open ? 760 : 520, 0.06);
    });
  });

  /* ------------------------------------------------------------------
     Stat bars — fill animation each time the panel is shown
  ------------------------------------------------------------------ */
  function animateStatsIfVisible() {
    var panel = document.getElementById("panel-ability");
    if (panel.hidden) return;
    panel.querySelectorAll(".stat-row").forEach(function (row, i) {
      var fill = row.querySelector(".stat-fill");
      var value = parseInt(row.dataset.value, 10) || 0;
      fill.style.transition = "none";
      fill.style.width = "0%";
      void fill.offsetWidth;
      if (reducedMotion) {
        fill.style.width = value + "%";
        return;
      }
      setTimeout(function () {
        fill.style.transition = "";
        fill.style.width = value + "%";
      }, 80 + i * 90);
    });
  }

  /* ------------------------------------------------------------------
     Flavor text typewriter (trainer profile, first view only)
  ------------------------------------------------------------------ */
  function typeFlavor() {
    flavorTyped = true;
    if (reducedMotion) return;
    var p = document.getElementById("flavor-text");
    var full = p.dataset.text;
    var i = 0;
    p.textContent = "";
    (function tick() {
      p.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(tick, 14);
    })();
  }
  // profile is the landing panel — type it once boot finishes
  setTimeout(function () { if (!flavorTyped) typeFlavor(); }, reducedMotion ? 0 : 3200);

  /* ------------------------------------------------------------------
     Empoleon — pixel sprite rendered as SVG rects from a char map.
     Palette: N navy #1B4F8A · S steel #4A8FBF · G gold #D4A017 ·
              W white #E8E8E8 · K outline #0d2440
  ------------------------------------------------------------------ */
  var COLORS = {
    N: "#1B4F8A",
    S: "#4A8FBF",
    G: "#D4A017",
    W: "#E8E8E8",
    K: "#0d2440"
  };

  var SPRITE = [
    "......G........G......",
    "......G........G......",
    ".....GG...GG...GG.....",
    ".....KGGGGGGGGGGK.....",
    "....KNNGGGGGGGGNNK....",
    "....KNNNGGGGGGNNNK....",
    "...KNNNNKGGGGKNNNNK...",
    "...KNNKWWGGGGWWKNNK...",
    "...KNNKWWGGGGWWKNNK...",
    "....KNNKGGGGGGKNNK....",
    "....KNNNNGGGGNNNNK....",
    "...KSNNNNNGGNNNNNSK...",
    "..KSSNNNWWWWWWNNNSSK..",
    ".KSSNNNWWWWWWWWNNNSSK.",
    ".KSNNNWWWWWWWWWWNNNSK.",
    "KSSNNNWWWWWWWWWWNNNSSK",
    "KSNNNNWWWWWWWWWWNNNNSK",
    "KSNNNNWWWWWWWWWWNNNNSK",
    ".KNNNNWWWWWWWWWWNNNNK.",
    ".KGNNNNWWWWWWWWNNNNGK.",
    "..KGNNNNWWWWWWNNNNGK..",
    "...KNNNNNNNNNNNNNNK...",
    "....KNNKKKKKKKKNNK....",
    ".....KGGK....KGGK....."
  ];

  function renderSprite(target, map, colors) {
    var rows = map.length;
    var cols = map[0].length;
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + cols + " " + rows);
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.setAttribute("aria-hidden", "true");
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < map[y].length; x++) {
        var c = map[y][x];
        if (c === ".") continue;
        var rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", 1);
        rect.setAttribute("fill", colors[c] || "#000");
        svg.appendChild(rect);
      }
    }
    target.appendChild(svg);
  }

  renderSprite(document.getElementById("empoleon-sprite"), SPRITE, COLORS);
})();
