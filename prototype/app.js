/* ============================================================
   Uy Parking! prototype — screen router + demo interactions
   No backend. Everything here is mocked for click-through.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- screen router ---------- */
  var screens = document.querySelectorAll(".screen");
  var crumb = document.getElementById("crumb");

  function go(id) {
    var target = document.getElementById("screen-" + id);
    if (!target) return;
    screens.forEach(function (s) { s.classList.remove("is-active"); });
    target.classList.add("is-active");
    target.querySelectorAll(".screen-body").forEach(function (b) { b.scrollTop = 0; });
    if (crumb) crumb.textContent = target.dataset.title || id;

    if (id === "floor") buildSlots();
    if (id === "qr") startCountdown();
    else stopCountdown();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-goto]");
    if (!el || el.disabled) return;

    if (el.dataset.lot) {
      var name = document.getElementById("lotName");
      if (name) name.textContent = el.dataset.lot;
    }
    if (el.dataset.floor) {
      var fn = document.getElementById("floorNum");
      if (fn) fn.textContent = el.dataset.floor;
    }
    go(el.dataset.goto);
  });

  /* ---------- theme toggle ---------- */
  document.getElementById("themeToggle").addEventListener("click", function () {
    var root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  });

  /* ---------- pseudo-QR generator (cosmetic only) ---------- */
  function paintQR(box, seed) {
    if (!box || box.dataset.painted) return;
    var html = "", x = (seed || 7) >>> 0;
    for (var i = 0; i < 21 * 21; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      var r = Math.floor(i / 21), c = i % 21;
      // three finder squares in the corners
      var inFinder =
        (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
      var on;
      if (inFinder) {
        var fr = r > 13 ? r - 14 : r;
        var fc = c > 13 ? c - 14 : c;
        on = fr === 0 || fr === 6 || fc === 0 || fc === 6 ||
             (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4);
      } else {
        on = (x % 100) < 46;
      }
      html += "<i class='" + (on ? "on" : "") + "'></i>";
    }
    box.innerHTML = html;
    box.dataset.painted = "1";
  }
  paintQR(document.getElementById("qrBox"), 7);
  paintQR(document.getElementById("qrWalkBox"), 19);
  paintQR(document.getElementById("qrPhBox"), 31);

  /* ---------- slot grid ---------- */
  var TAKEN = { 3: 1, 5: 1, 6: 1, 9: 1, 12: 1, 13: 1, 18: 1, 21: 1, 22: 1 };
  var EV = { 1: 1, 2: 1 };
  var PWD = { 7: 1 };

  function buildSlots() {
    var grid = document.getElementById("slotGrid");
    var floor = document.getElementById("floorNum").textContent || "2";
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 1; i <= 24; i++) {
      var b = document.createElement("button");
      var code = floor + "-" + String(i).padStart(2, "0");
      var taken = TAKEN[i];
      b.className = "slot " + (taken ? "taken" : "open") +
        (EV[i] ? " ev" : "") + (PWD[i] ? " pwd" : "");
      b.textContent = code;
      if (!taken) {
        (function (code, isPwd) {
          b.addEventListener("click", function () {
            document.getElementById("rsvSlot").textContent = code;
            document.getElementById("qrSlot").textContent = code;
            document.getElementById("pwdNotice").hidden = !isPwd;
            go("reserve");
          });
        })(code, !!PWD[i]);
      }
      grid.appendChild(b);
    }
  }

  /* ---------- 15-minute countdown ---------- */
  var timer = null, remain = 900;
  function render() {
    var m = Math.floor(remain / 60), s = remain % 60;
    var el = document.getElementById("countdown");
    var note = document.getElementById("countdownNote");
    if (!el) return;
    el.textContent = m + ":" + String(s).padStart(2, "0");
    if (remain <= 120) { el.classList.add("is-warn"); if (note) note.textContent = "Hold about to expire"; }
    else el.classList.remove("is-warn");
    if (remain <= 0) { stopCountdown(); go("expired"); }
  }
  function startCountdown() {
    stopCountdown();
    remain = 900;
    render();
    timer = setInterval(function () { remain -= 1; render(); }, 1000);
  }
  function stopCountdown() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ---------- owner tabs ---------- */
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("is-active"); });
      t.classList.add("is-active");
      var stats = t.dataset.tab === "stats";
      document.getElementById("ownerStats").hidden = !stats;
      document.getElementById("ownerFin").hidden = stats;
    });
  });

  /* ---------- OTP auto-advance (nicety) ---------- */
  var otps = document.querySelectorAll(".otp");
  otps.forEach(function (inp, i) {
    inp.addEventListener("input", function () {
      if (inp.value && otps[i + 1]) otps[i + 1].focus();
    });
  });
})();
