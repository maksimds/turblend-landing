/*
 * Turblend · small enhancements.
 * The page reads and navigates without this file; it adds the mobile menu,
 * the active nav state, the round badge's behavior, pop-up dates, in-page
 * form submission, and the scroll reveals.
 */
(function () {
  "use strict";

  // Tells the inline script in <head> that the animations can run.
  window.TURBLEND_READY = true;

  var TIME_ZONE = "America/New_York"; // Cincinnati
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /* ---------- Round "Get on the list" badge ---------------------------- */

  // The badge tucks up toward the corner once you scroll, and steps aside
  // while the signup form itself is on screen.
  function initBadge() {
    var badge = $("[data-badge]");
    if (!badge) return;
    var queued = false;

    function update() {
      queued = false;
      badge.dataset.scrolled = String(window.scrollY > 150);
    }

    window.addEventListener("scroll", function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    var signup = document.getElementById("signup");
    if (!signup || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      badge.dataset.hidden = String(entries[0].isIntersecting);
    }, { rootMargin: "0px 0px -35% 0px" }).observe(signup);
  }

  /* ---------- Scroll reveals ------------------------------------------- */

  function initReveals() {
    var items = $$(".rv, .rv-up");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- Counting numbers ----------------------------------------- */

  // The final number is already in the HTML; this only animates up to it.
  function initCounters() {
    var counters = $$("[data-count]");
    if (reduceMotion || !counters.length || !("IntersectionObserver" in window)) return;

    function format(value, separator) {
      var text = String(Math.round(value));
      return separator ? text.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : text;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        var node = entry.target;
        var target = parseFloat(node.dataset.count);
        var separator = node.dataset.sep || "";
        var start = performance.now();

        function step(now) {
          var t = Math.min(1, (now - start) / 1500);
          node.textContent = format(target * (1 - Math.pow(1 - t, 3)), separator);
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (node) { observer.observe(node); });
  }

  /* ---------- Mobile menu drawer --------------------------------------- */

  function initDrawer() {
    var drawer = $("[data-drawer]");
    var openButton = $("[data-menu-open]");
    if (!drawer || !openButton || typeof drawer.showModal !== "function") return;

    function setOpen(open) {
      openButton.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("is-locked", open);
    }

    openButton.addEventListener("click", function () {
      drawer.showModal();
      setOpen(true);
    });
    drawer.addEventListener("close", function () {
      setOpen(false);
    });
    $("[data-menu-close]", drawer).addEventListener("click", function () {
      drawer.close();
    });

    // A click on the backdrop lands on the <dialog> itself, not its contents.
    drawer.addEventListener("click", function (event) {
      if (event.target === drawer) drawer.close();
    });

    // Close before the browser follows the anchor, so the page can scroll.
    drawer.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.close();
      });
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
      if (event.matches && drawer.open) drawer.close();
    });
  }

  /* ---------- Highlight the nav item for the section in view ----------- */

  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("is-active", link.hash === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    links
      .map(function (link) { return link.hash.slice(1); })
      .filter(function (id, i, ids) { return ids.indexOf(id) === i; })
      .forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
      });
  }

  /* ---------- Pop-up dates (from js/events.js) ------------------------- */

  // Today as "YYYY-MM-DD" in Cincinnati, so an event stays up through its whole day.
  function todayISO() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var get = function (type) {
      return parts.filter(function (p) { return p.type === type; })[0].value;
    };
    return get("year") + "-" + get("month") + "-" + get("day");
  }

  // Noon UTC keeps the calendar day stable in every time zone.
  function formatDate(iso, options) {
    options.timeZone = "UTC";
    return new Intl.DateTimeFormat("en-US", options).format(new Date(iso + "T12:00:00Z"));
  }

  // Curly apostrophes, to match the rest of the page.
  function typeset(text) {
    return String(text || "").replace(/(\w)'/g, "$1’");
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderEvent(event) {
    var item = el("li", "event");

    var date = el("time", "event-date");
    date.dateTime = event.date;
    date.append(
      el("span", "event-dow", formatDate(event.date, { weekday: "short" })),
      el("span", "event-day", formatDate(event.date, { day: "numeric" })),
      el("span", "event-mon", formatDate(event.date, { month: "short" }))
    );

    var info = el("div", "event-info");
    var venue = el("p", "event-venue");
    if (event.url) {
      var link = el("a", null, typeset(event.venue));
      link.href = event.url;
      venue.append(link);
    } else {
      venue.textContent = typeset(event.venue);
    }
    info.append(venue, el("p", "event-meta", typeset(event.neighborhood)));

    item.append(date, info, el("p", "event-hours", typeset(event.hours)));
    return item;
  }

  function initEvents() {
    var list = $("[data-events]");
    var empty = $("[data-events-empty]");
    var tickers = $$("[data-next-popup]");
    var events = Array.isArray(window.TURBLEND_EVENTS) ? window.TURBLEND_EVENTS : [];
    var today = todayISO();

    var upcoming = events
      .filter(function (event) {
        var valid = event && /^\d{4}-\d{2}-\d{2}$/.test(event.date) && !isNaN(Date.parse(event.date));
        if (!valid) console.warn("Turblend: skipping pop-up with a bad date (use YYYY-MM-DD):", event);
        return valid && event.date >= today;
      })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });

    if (list) {
      list.replaceChildren.apply(list, upcoming.map(renderEvent));
      list.hidden = upcoming.length === 0;
    }
    if (empty) empty.hidden = upcoming.length > 0;

    var next = upcoming[0];
    tickers.forEach(function (ticker) {
      ticker.textContent = next
        ? formatDate(next.date, { weekday: "short", month: "short", day: "numeric" }) + " · " + typeset(next.venue)
        : ticker.dataset.fallback;
    });
  }

  /* ---------- Email signup (Formspree) --------------------------------- */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function initSignup() {
    var form = $("[data-signup]");
    var success = $("[data-signup-success]");
    if (!form || !success) return;

    var email = form.elements.namedItem("email");
    var emailError = $("[data-email-error]", form);
    var formError = $("[data-form-error]", form);
    var button = $('button[type="submit"]', form);
    var sending = false;

    // We show our own inline messages instead of the browser's tooltips.
    form.noValidate = true;

    function setEmailError(show) {
      emailError.textContent = show ? emailError.dataset.message : "";
      emailError.hidden = !show;
      if (show) {
        email.setAttribute("aria-invalid", "true");
        email.setAttribute("aria-describedby", emailError.id);
      } else {
        email.removeAttribute("aria-invalid");
        email.removeAttribute("aria-describedby");
      }
    }

    function setSending(on) {
      sending = on;
      button.setAttribute("aria-disabled", String(on));
      button.textContent = on ? button.dataset.sending : button.dataset.label;
    }

    function showFormError() {
      formError.textContent = formError.dataset.message;
      formError.hidden = false;
    }

    email.addEventListener("input", function () {
      if (email.hasAttribute("aria-invalid") && EMAIL.test(email.value.trim())) setEmailError(false);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;
      formError.hidden = true;

      email.value = email.value.trim();
      if (!EMAIL.test(email.value)) {
        setEmailError(true);
        email.focus();
        return;
      }
      setEmailError(false);

      var action = form.getAttribute("action") || "";
      if (action.indexOf("{") !== -1) {
        console.warn("Turblend: the signup form isn't connected yet. Put your Formspree form ID in the form's action in index.html.");
        showFormError();
        return;
      }

      setSending(true);
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Signup failed with status " + response.status);
          form.hidden = true;
          success.hidden = false;
          success.focus();
        })
        .catch(function (error) {
          console.error(error);
          showFormError();
        })
        .finally(function () {
          setSending(false);
        });
    });
  }

  /* ---------- Share prompt after signing up ----------------------------- */

  // Uses the phone's share sheet, or copies the link. Without either, the
  // button stays a plain email link.
  function initShare() {
    var button = $("[data-share]");
    if (!button) return;
    var label = $("span", button);
    var url = "https://turblend.us/";

    button.addEventListener("click", function (event) {
      if (navigator.share) {
        event.preventDefault();
        navigator.share({ title: "Turblend", text: "Puerto Rican coffee, brewed on sand.", url: url }).catch(function () {});
      } else if (navigator.clipboard && window.isSecureContext) {
        event.preventDefault();
        navigator.clipboard.writeText(url).then(function () {
          label.textContent = button.dataset.copied;
        });
      }
    });
  }

  initBadge();
  initDrawer();
  initActiveNav();
  initEvents();
  initSignup();
  initShare();
  initReveals();
  initCounters();
})();
