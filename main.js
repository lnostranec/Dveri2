(function () {
  var cookieBanner = document.getElementById("cookieBanner");
  var cookieBannerAccept = document.getElementById("cookieBannerAccept");
  var COOKIE_CONSENT_KEY = "hollywood_doors_cookie_consent_v1";

  function showCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    requestAnimationFrame(function () {
      cookieBanner.classList.add("is-visible");
    });
  }

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.remove("is-visible");
    setTimeout(function () {
      if (!cookieBanner.classList.contains("is-visible")) {
        cookieBanner.hidden = true;
      }
    }, 220);
  }

  function getCookieConsentAccepted() {
    try {
      return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
    } catch (e) {
      return false;
    }
  }

  function setCookieConsentAccepted() {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch (e) {}
  }

  function updateCookieBannerVisibility() {
    if (!cookieBanner) return;
    if (getCookieConsentAccepted()) {
      hideCookieBanner();
      return;
    }
    showCookieBanner();
  }

  if (cookieBanner && cookieBannerAccept) {
    cookieBannerAccept.addEventListener("click", function () {
      setCookieConsentAccepted();
      hideCookieBanner();
    });
    updateCookieBannerVisibility();
  }
})();

(function initSiteScrollLock() {
  var lockCount = 0;
  var savedScrollY = 0;

  function lock() {
    if (lockCount === 0) {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add("is-scroll-locked");
      document.body.classList.add("is-scroll-locked");
      document.body.style.top = -savedScrollY + "px";
    }
    lockCount += 1;
  }

  function unlock() {
    if (lockCount <= 0) return;
    lockCount -= 1;
    if (lockCount > 0) return;
    var y = savedScrollY;
    document.body.style.top = "";
    document.documentElement.classList.remove("is-scroll-locked");
    document.body.classList.remove("is-scroll-locked");
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
  }

  window.hollywoodLockScroll = lock;
  window.hollywoodUnlockScroll = unlock;
})();

(function () {
  var menu = document.querySelector(".mobile-menu");
  if (!menu) return;

  var closeBtn = menu.querySelector(".mobile-menu__close");
  var backdrop = menu.querySelector(".mobile-menu__backdrop");
  var links = menu.querySelectorAll(".mobile-menu__links a");
  var openBtn = document.querySelector(".header-tools__menu");

  function openMenu() {
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      menu.classList.add("is-open");
    });
    document.body.classList.add("mobile-menu-open");
    if (window.hollywoodLockScroll) window.hollywoodLockScroll();
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-menu-open");
    if (window.hollywoodUnlockScroll) window.hollywoodUnlockScroll();
    setTimeout(function () {
      if (!menu.classList.contains("is-open")) {
        menu.hidden = true;
      }
    }, 220);
  }

  if (openBtn) {
    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openMenu();
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  links.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
})();

(function () {
  var searchTriggers = document.querySelectorAll(".header-tools__icon");
  var overlay = document.getElementById("headerSearchOverlay");
  if (!searchTriggers.length || !overlay) return;

  var closeBtn = overlay.querySelector(".header-search-overlay__close");
  var searchForm = overlay.querySelector(".header-search-overlay__form");
  var searchInput = overlay.querySelector('input[name="q"]');

  function syncSearchLabelState() {
    if (!searchInput) return;
    if (String(searchInput.value || "").trim() === "") {
      searchInput.classList.remove("has-value");
    } else {
      searchInput.classList.add("has-value");
    }
  }

  var searchCloseTimer = null;
  var OVERLAY_MS = 320;

  function blockSearchBackgroundScroll(e) {
    if (!document.documentElement.classList.contains("search-overlay-open")) return;
    if (overlay && e.target && overlay.contains(e.target)) return;
    e.preventDefault();
  }

  function bindSearchScrollLock() {
    window.addEventListener("wheel", blockSearchBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", blockSearchBackgroundScroll, { passive: false });
  }

  function unbindSearchScrollLock() {
    window.removeEventListener("wheel", blockSearchBackgroundScroll);
    window.removeEventListener("touchmove", blockSearchBackgroundScroll);
  }

  function releaseSearchState() {
    unbindSearchScrollLock();
    document.body.classList.remove("search-overlay-open");
    document.documentElement.classList.remove("search-overlay-open");
  }

  function openSearchOverlay(e) {
    e.preventDefault();
    if (searchCloseTimer) {
      clearTimeout(searchCloseTimer);
      searchCloseTimer = null;
    }
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("search-overlay-open");
    document.body.classList.add("search-overlay-open");
    bindSearchScrollLock();
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
  }

  function closeSearchOverlay() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    releaseSearchState();
    searchCloseTimer = setTimeout(function () {
      searchCloseTimer = null;
      if (!overlay.classList.contains("is-open")) {
        overlay.hidden = true;
      }
    }, OVERLAY_MS);
  }

  searchTriggers.forEach(function (btn) {
    btn.addEventListener("click", openSearchOverlay);
  });

  if (closeBtn) closeBtn.addEventListener("click", closeSearchOverlay);
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
  if (searchInput) {
    syncSearchLabelState();
    searchInput.addEventListener("input", syncSearchLabelState);
  }
})();

(function () {
  var feature = document.getElementById("heroFeature");
  if (!feature) return;

  var slides = feature.querySelectorAll(".hero-intro__feature-slide");
  var prevBtn = feature.querySelector(".hero-intro__nav-btn--prev");
  var nextBtn = feature.querySelector(".hero-intro__nav-btn--next");
  var dotsRoot = feature.querySelector(".hero-intro__dots");
  if (!slides.length || !dotsRoot) return;

  var current = 0;
  var dots = [];

  slides.forEach(function (slide, idx) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-intro__dot" + (idx === 0 ? " is-active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Слайд " + (idx + 1));
    dot.setAttribute("aria-selected", idx === 0 ? "true" : "false");
    dot.addEventListener("click", function () {
      goTo(idx);
    });
    dotsRoot.appendChild(dot);
    dots.push(dot);
  });

  function render() {
    slides.forEach(function (slide, idx) {
      slide.classList.toggle("is-active", idx === current);
    });
    dots.forEach(function (dot, idx) {
      var on = idx === current;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function goTo(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    render();
  }

  function step(delta) {
    goTo(current + delta);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      step(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      step(1);
    });
  }

  var swipeArea = feature.querySelector(".hero-intro__feature-slides") || feature;
  var interactionRoot = swipeArea;
  var pointerStartX = 0;
  var pointerStartY = 0;
  var pointerTracking = false;
  var isCoarsePointer =
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
  var swipeThreshold = isCoarsePointer ? 60 : 40;
  var axisLockThreshold = isCoarsePointer ? 14 : 10;
  var tapSlop = 16;
  var axisLock = null;
  var gestureAborted = false;
  var lastSwipeStepAt = 0;
  var pendingTapHref = null;
  var tapNavTimer = null;

  function isSwipeBlocked(target) {
    return target && target.closest && target.closest(".hero-intro__dot, .hero-intro__nav");
  }

  function clearPendingTapNav() {
    pendingTapHref = null;
    if (tapNavTimer) {
      clearTimeout(tapNavTimer);
      tapNavTimer = null;
    }
  }

  function blockGhostClickAfterSwipe(e) {
    var slide = e.target && e.target.closest && e.target.closest(".hero-intro__feature-slide");
    if (!slide || !slide.classList.contains("is-active")) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function armGhostClickGuard() {
    swipeArea.addEventListener("click", blockGhostClickAfterSwipe, {
      capture: true,
      once: true,
    });
  }

  function resetPointerState() {
    pointerTracking = false;
    axisLock = null;
    swipeArea.classList.remove("is-dragging");
    unbindWindowPointerHandlers();
  }

  function abortPointerGesture() {
    gestureAborted = true;
    resetPointerState();
  }

  function finishPointer(clientX) {
    if (!pointerTracking) return false;
    var didSwipe = false;
    var dx = (typeof clientX === "number" ? clientX : pointerStartX) - pointerStartX;
    if (axisLock === "x" && Math.abs(dx) >= swipeThreshold) {
      var now = Date.now();
      if (now - lastSwipeStepAt >= 350) {
        lastSwipeStepAt = now;
        step(dx < 0 ? 1 : -1);
        didSwipe = true;
      }
    }
    resetPointerState();
    if (didSwipe) {
      clearPendingTapNav();
      armGhostClickGuard();
    }
    return didSwipe;
  }

  function onWindowPointerMove(e) {
    if (!pointerTracking) return;
    var dx = e.clientX - pointerStartX;
    var dy = e.clientY - pointerStartY;

    if (!axisLock) {
      if (Math.abs(dx) < axisLockThreshold && Math.abs(dy) < axisLockThreshold) {
        return;
      }
      if (Math.abs(dy) > Math.abs(dx)) {
        abortPointerGesture();
        return;
      }
      axisLock = "x";
    }

    if (axisLock !== "x") return;

    var absDx = Math.abs(dx);
    if (absDx >= swipeThreshold) {
      swipeArea.classList.add("is-dragging");
    }

    if (isCoarsePointer) {
      return;
    }

    if (absDx >= 12 && e.cancelable) {
      swipeArea.classList.add("is-dragging");
      e.preventDefault();
    }
  }

  function scheduleTapNavigation(href) {
    clearPendingTapNav();
    pendingTapHref = href;
    tapNavTimer = setTimeout(function () {
      tapNavTimer = null;
      if (pendingTapHref === href) {
        pendingTapHref = null;
        window.location.assign(href);
      }
    }, 10);
  }

  function onWindowPointerUp(e) {
    var startX = pointerStartX;
    var startY = pointerStartY;
    var didSwipe = finishPointer(e.clientX);
    if (didSwipe || gestureAborted || !isCoarsePointer) return;

    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (Math.abs(dx) > tapSlop || Math.abs(dy) > tapSlop) return;

    var slide =
      e.target &&
      e.target.closest &&
      e.target.closest(".hero-intro__feature-slide.is-active");
    if (!slide || !slide.href) return;

    scheduleTapNavigation(slide.href);
  }

  function onWindowPointerCancel() {
    finishPointer(null);
    clearPendingTapNav();
  }

  function bindWindowPointerHandlers() {
    window.addEventListener("pointermove", onWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerCancel);
  }

  function unbindWindowPointerHandlers() {
    window.removeEventListener("pointermove", onWindowPointerMove);
    window.removeEventListener("pointerup", onWindowPointerUp);
    window.removeEventListener("pointercancel", onWindowPointerCancel);
  }

  interactionRoot.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (isSwipeBlocked(e.target)) return;
    clearPendingTapNav();
    resetPointerState();
    pointerTracking = true;
    gestureAborted = false;
    axisLock = null;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    bindWindowPointerHandlers();
  });

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      resetPointerState();
    }
  });

  window.addEventListener("pagehide", function () {
    resetPointerState();
  });

  slides.forEach(function (slide) {
    slide.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    slide.addEventListener(
      "click",
      function (e) {
        if (!slide.classList.contains("is-active")) {
          e.preventDefault();
          return;
        }
        if (pendingTapHref && pendingTapHref === slide.href) {
          clearPendingTapNav();
        }
      },
      true
    );
  });

  render();
})();

(function initAboutSwiper() {
  if (typeof Swiper === "undefined") return;

  var desktopEl = document.querySelector('[data-about-swiper="desktop"]');
  var mobileEl = document.querySelector('[data-about-swiper="mobile"]');
  if (!desktopEl && !mobileEl) return;

  var mq = window.matchMedia("(max-width: 1200px)");
  var desktopSwiper = null;
  var mobileSwiper = null;

  function destroySwipers() {
    if (desktopSwiper) {
      desktopSwiper.destroy(true, true);
      desktopSwiper = null;
    }
    if (mobileSwiper) {
      mobileSwiper.destroy(true, true);
      mobileSwiper = null;
    }
  }

  function setupAboutSwipers() {
    destroySwipers();

    var section =
      (desktopEl && desktopEl.closest(".about-split")) ||
      (mobileEl && mobileEl.closest(".about-split"));
    if (!section) return;

    if (mq.matches && mobileEl) {
      if (desktopEl) {
        desktopEl.hidden = true;
      }
      mobileEl.hidden = false;
      mobileEl.style.display = "";
      mobileSwiper = new Swiper(mobileEl, {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 450,
        grabCursor: true,
        allowTouchMove: true,
        resistanceRatio: 0.85,
        watchOverflow: true,
        autoHeight: true,
        touchStartPreventDefault: false,
        touchAngle: 35,
        threshold: 8,
      });
      return;
    }

    if (desktopEl) {
      desktopEl.hidden = false;
      desktopEl.style.display = "";
    }
    if (mobileEl) {
      mobileEl.hidden = true;
      mobileEl.style.display = "";
    }

    if (!desktopEl) return;

    desktopSwiper = new Swiper(desktopEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 450,
      grabCursor: true,
      allowTouchMove: true,
      resistanceRatio: 0.85,
      watchOverflow: true,
      touchStartPreventDefault: false,
      touchAngle: 35,
      threshold: 8,
    });
  }

  setupAboutSwipers();

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", setupAboutSwipers);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(setupAboutSwipers);
  }
})();

(function initCollectionSwipers() {
  if (typeof Swiper === "undefined") return;

  var swipers = document.querySelectorAll("[data-collection-swiper]");
  if (!swipers.length) return;

  function getCollectionLayout() {
    var root = getComputedStyle(document.body);
    var visible = parseInt(root.getPropertyValue("--collection-visible"), 10);
    var gap = parseFloat(root.getPropertyValue("--door-card-gap"));

    if (
      document.body.classList.contains("page-collection") &&
      window.matchMedia("(max-width: 768px)").matches
    ) {
      visible = 1;
      gap = 8;
    }

    return {
      visible: visible > 0 ? visible : 4,
      gap: Number.isFinite(gap) ? gap : 29,
    };
  }

  function applySlideWidths(swiper) {
    var layout = getCollectionLayout();
    var trackWidth = swiper.el.clientWidth;
    if (!trackWidth) return;

    var slideW = (trackWidth - (layout.visible - 1) * layout.gap) / layout.visible;
    slideW = Math.max(0, slideW);
    swiper.params.spaceBetween = layout.gap;

    swiper.slides.forEach(function (slide) {
      slide.style.width = slideW + "px";
    });

    var block = swiper.el.closest(".collection-block");
    if (block) {
      var hitArea = block.querySelector(".collection-block__strip-hit-area");
      if (hitArea) {
        hitArea.style.setProperty("--collection-strip-w", slideW + "px");
      }
    }

    swiper.update();
  }

  swipers.forEach(function (el) {
    var block = el.closest(".collection-block");
    var paginationEl = block
      ? block.querySelector(".collection-block__strip-pagination")
      : null;

    var layout = getCollectionLayout();

    new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: layout.gap,
      speed: 400,
      watchSlidesProgress: true,
      rewind: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      pagination: paginationEl
        ? {
            el: paginationEl,
            type: "progressbar",
          }
        : undefined,
      on: {
        init: function () {
          applySlideWidths(this);
          if (this.pagination) this.pagination.update();
        },
        resize: function () {
          applySlideWidths(this);
          if (this.pagination) this.pagination.update();
        },
        slideChange: function () {
          if (this.pagination) this.pagination.update();
        },
        progress: function () {
          if (this.pagination) this.pagination.update();
        },
      },
    });
  });
})();

(function initConsultModal() {
  var modal = document.getElementById("consultModal");
  if (!modal) return;

  var quickOrderTriggers = document.querySelectorAll(
    "#callbackBtn, #maxContactBtn, [data-open-consult-modal]"
  );
  var backdrop = modal.querySelector(".consult-modal__backdrop");
  var closeBtn = modal.querySelector(".consult-modal__close");
  var form = modal.querySelector("#consultModalForm");
  var nameInput = form ? form.querySelector('input[name="name"]') : null;
  var phoneInput = form ? form.querySelector('input[name="phone"]') : null;
  var consentCheckbox = form
    ? form.querySelector('.consult-modal__checkbox input[type="checkbox"]')
    : null;
  var modalFormSubmitted = false;
  var modalCloseTimer = null;
  var OVERLAY_MS = 320;

  function syncModalFieldState(inputEl) {
    if (!inputEl) return;
    var has = String(inputEl.value || "").trim() !== "";
    inputEl.classList.toggle("has-value", has);
  }

  function getPhoneDigits(value) {
    var v = (value || "").replace(/\D/g, "");
    if (v.indexOf("8") === 0 && v.length <= 11) {
      v = "7" + v.slice(1);
    }
    if (v.indexOf("7") === 0) {
      v = v.slice(1);
    }
    return v;
  }

  function isPhoneFull(value) {
    return getPhoneDigits(value).length === 10;
  }

  function filterNameLetters(inputEl) {
    if (!inputEl) return;
    var filtered = String(inputEl.value || "").replace(/[^A-Za-zА-Яа-яЁё\s\-]/g, "");
    if (inputEl.value !== filtered) {
      inputEl.value = filtered;
    }
  }

  function closeMobileMenuIfOpen() {
    var mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu || !mobileMenu.classList.contains("is-open")) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-menu-open");
    mobileMenu.hidden = true;
  }

  function formatPhoneInput(inputEl) {
    if (!inputEl) return;
    var v = (inputEl.value || "").replace(/\D/g, "");
    if (v.indexOf("8") === 0 && v.length <= 11) {
      v = "7" + v.slice(1);
    }
    if (v.indexOf("7") === 0) {
      v = v.slice(1);
    }
    if (v.length > 10) {
      v = v.slice(0, 10);
    }

    var formatted = "+7";
    if (v.length > 0) formatted += " (" + v.slice(0, 3);
    if (v.length >= 3) formatted += ") " + v.slice(3, 6);
    if (v.length >= 6) formatted += " " + v.slice(6, 8);
    if (v.length >= 8) formatted += " " + v.slice(8, 10);
    inputEl.value = formatted;
  }

  function clearModalFieldErrors() {
    if (nameInput) nameInput.classList.remove("input--error");
    if (phoneInput) phoneInput.classList.remove("input--error");
    if (consentCheckbox) consentCheckbox.classList.remove("input--error");
  }

  function blockModalBackgroundScroll(e) {
    if (!document.documentElement.classList.contains("consult-modal-open")) return;
    var dialog = modal.querySelector(".consult-modal__dialog");
    if (dialog && e.target && dialog.contains(e.target)) return;
    e.preventDefault();
  }

  function bindModalScrollLock() {
    window.addEventListener("wheel", blockModalBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", blockModalBackgroundScroll, { passive: false });
  }

  function unbindModalScrollLock() {
    window.removeEventListener("wheel", blockModalBackgroundScroll);
    window.removeEventListener("touchmove", blockModalBackgroundScroll);
  }

  function releaseModalState() {
    unbindModalScrollLock();
    document.body.classList.remove("consult-modal-open");
    document.documentElement.classList.remove("consult-modal-open");
  }

  function resetModalForm() {
    modalFormSubmitted = false;
    if (form) form.reset();
    clearModalFieldErrors();
  }

  function openModal(e) {
    if (e) e.preventDefault();
    if (modalCloseTimer) {
      clearTimeout(modalCloseTimer);
      modalCloseTimer = null;
    }
    closeMobileMenuIfOpen();
    modalFormSubmitted = false;
    clearModalFieldErrors();
    syncModalFieldState(nameInput);
    syncModalFieldState(phoneInput);
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("consult-modal-open");
    document.body.classList.add("consult-modal-open");
    bindModalScrollLock();
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
    });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    if (modalCloseTimer) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    releaseModalState();
    modalCloseTimer = setTimeout(function () {
      modalCloseTimer = null;
      resetModalForm();
    }, OVERLAY_MS);
  }

  if (quickOrderTriggers.length) {
    quickOrderTriggers.forEach(function (btn) {
      btn.addEventListener("click", openModal);
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      modalFormSubmitted = true;
      var nameEmpty = !nameInput || !nameInput.value || !nameInput.value.trim();
      var phoneEmpty = !phoneInput || !isPhoneFull(phoneInput.value);
      var consentEmpty = !consentCheckbox || !consentCheckbox.checked;

      if (nameInput) {
        nameInput.classList.toggle("input--error", !!nameEmpty);
      }
      if (phoneInput) {
        phoneInput.classList.toggle("input--error", !!phoneEmpty);
      }
      if (consentCheckbox) {
        consentCheckbox.classList.toggle("input--error", !!consentEmpty);
      }

      if (nameEmpty || phoneEmpty || consentEmpty) {
        return;
      }

      closeModal();
    });

    if (nameInput) {
      nameInput.setAttribute("inputmode", "text");
      nameInput.setAttribute("autocomplete", "name");
      nameInput.setAttribute("aria-label", "Ваше имя");
      nameInput.addEventListener("input", function () {
        filterNameLetters(nameInput);
        syncModalFieldState(nameInput);
        var hasError = !nameInput.value || !nameInput.value.trim();
        nameInput.classList.toggle("input--error", !!hasError);
      });
      nameInput.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var key = e.key;
        if (key.length !== 1) return;
        if (/[A-Za-zА-Яа-яЁё\s\-]/.test(key)) return;
        e.preventDefault();
      });
      nameInput.addEventListener("paste", function (e) {
        e.preventDefault();
        var pasted = "";
        if (e.clipboardData) {
          pasted = e.clipboardData.getData("text") || "";
        }
        var start = nameInput.selectionStart;
        var end = nameInput.selectionEnd;
        var value = nameInput.value;
        var next =
          value.slice(0, start) +
          pasted.replace(/[^A-Za-zА-Яа-яЁё\s\-]/g, "") +
          value.slice(end);
        nameInput.value = next;
        filterNameLetters(nameInput);
        syncModalFieldState(nameInput);
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener("focus", function () {
        if (!phoneInput.value || !phoneInput.value.trim()) {
          phoneInput.value = "+7 ";
        }
      });
      phoneInput.addEventListener("input", function () {
        formatPhoneInput(phoneInput);
        syncModalFieldState(phoneInput);
        if (modalFormSubmitted) {
          phoneInput.classList.toggle("input--error", !isPhoneFull(phoneInput.value));
        } else {
          phoneInput.classList.remove("input--error");
        }
      });
      phoneInput.addEventListener("blur", function () {
        var digits = getPhoneDigits(phoneInput.value);
        if (!digits.length) {
          phoneInput.value = "";
          syncModalFieldState(phoneInput);
          if (!modalFormSubmitted) {
            phoneInput.classList.remove("input--error");
          }
        }
      });
      phoneInput.setAttribute("maxlength", "18");
    }

    if (consentCheckbox) {
      consentCheckbox.addEventListener("change", function () {
        consentCheckbox.classList.toggle("input--error", !consentCheckbox.checked);
      });
    }
  }
})();

(function initCatalogMega() {
  var root = document.getElementById("catalogMega");
  var openBtn = document.getElementById("catalogMegaOpen");
  if (!root || !openBtn) return;

  var mq = window.matchMedia("(min-width: 901px)");
  var panels = root.querySelectorAll(".catalog-mega__sub-panel");
  var primary = root.querySelector(".catalog-mega__primary");

  function clearPrimaryActive() {
    if (!primary) return;
    primary.querySelectorAll("li.is-active").forEach(function (li) {
      li.classList.remove("is-active");
    });
    primary.querySelectorAll("a[data-mega-subpanel]").forEach(function (a) {
      a.setAttribute("aria-expanded", "false");
    });
  }

  function isOpen() {
    return root.classList.contains("is-open") || !root.hasAttribute("hidden");
  }

  function getDefaultPanelId() {
    var first = primary && primary.querySelector("a[data-mega-subpanel]");
    return first ? first.getAttribute("data-mega-subpanel") : null;
  }

  function showSubPanel(panelId) {
    if (!panelId) return;
    var target = document.getElementById(panelId);
    panels.forEach(function (panel) {
      if (panel.id === panelId) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
    if (!target) return;
    if (target.classList.contains("catalog-mega__sub-panel--empty")) {
      root.setAttribute("data-mega-hide-main", "true");
    } else {
      root.removeAttribute("data-mega-hide-main");
    }
  }

  var scrollLocked = false;
  var closeTimer = null;
  var MEGA_TRANSITION_MS = 320;

  function syncCatalogMegaAlign() {
    if (!mq.matches) {
      root.style.removeProperty("--catalog-mega-left");
      root.style.removeProperty("--catalog-mega-width");
      return;
    }

    var headerInner = document.querySelector(".site-header__inner");
    var headerEnd = document.querySelector(".site-header__end");
    if (!headerInner) return;

    var headerRect = headerInner.getBoundingClientRect();
    var cs = getComputedStyle(headerInner);
    var padL = parseFloat(cs.paddingLeft) || 0;
    var left = headerRect.left + padL;
    var right = headerRect.right - (parseFloat(cs.paddingRight) || 0);

    if (headerEnd) {
      right = headerEnd.getBoundingClientRect().right;
    }

    var width = Math.max(0, right - left);
    root.style.setProperty("--catalog-mega-left", left + "px");
    root.style.setProperty("--catalog-mega-width", width + "px");
  }

  function isScrollableMegaTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(".catalog-mega__sidebar, .catalog-mega__main");
  }

  function blockBackgroundScroll(e) {
    if (!scrollLocked || !mq.matches) return;
    if (isScrollableMegaTarget(e.target)) return;
    e.preventDefault();
  }

  function blockBackgroundScrollKeys(e) {
    if (!scrollLocked || !mq.matches) return;
    if (isScrollableMegaTarget(e.target)) return;
    var blocked = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (blocked.indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  }

  function lockPageScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    window.addEventListener("wheel", blockBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", blockBackgroundScroll, { passive: false });
    window.addEventListener("keydown", blockBackgroundScrollKeys);
  }

  function unlockPageScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    window.removeEventListener("wheel", blockBackgroundScroll);
    window.removeEventListener("touchmove", blockBackgroundScroll);
    window.removeEventListener("keydown", blockBackgroundScrollKeys);
  }

  function setOpen(open) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (open) {
      if (mq.matches) {
        lockPageScroll();
      }
      root.removeAttribute("hidden");
      root.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("catalog-mega-open");
      document.documentElement.classList.add("catalog-mega-open");
      clearPrimaryActive();
      var def = getDefaultPanelId();
      if (def) {
        var firstA = primary && primary.querySelector('a[data-mega-subpanel="' + def + '"]');
        if (firstA) {
          firstA.closest("li") && firstA.closest("li").classList.add("is-active");
          firstA.setAttribute("aria-expanded", "true");
        }
        showSubPanel(def);
      }
      syncCatalogMegaAlign();
      requestAnimationFrame(function () {
        syncCatalogMegaAlign();
        root.classList.add("is-open");
      });
    } else {
      root.classList.remove("is-open");
      root.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("catalog-mega-open");
      document.documentElement.classList.remove("catalog-mega-open");
      root.removeAttribute("data-mega-hide-main");
      clearPrimaryActive();
      panels.forEach(function (panel) {
        panel.setAttribute("hidden", "");
      });
      closeTimer = setTimeout(function () {
        closeTimer = null;
        if (!root.classList.contains("is-open")) {
          root.setAttribute("hidden", "");
          if (mq.matches) {
            unlockPageScroll();
          }
        }
      }, MEGA_TRANSITION_MS);
    }
  }

  function toggle() {
    setOpen(!isOpen());
  }

  openBtn.addEventListener("click", function (e) {
    if (mq.matches) {
      e.preventDefault();
      toggle();
    }
  });

  var backdrop = root.querySelector(".catalog-mega__backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      if (mq.matches) {
        setOpen(false);
      }
    });
    backdrop.addEventListener(
      "wheel",
      function (e) {
        if (!mq.matches) return;
        if (e.cancelable) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  var headerLogo = document.querySelector(".site-header .brand .logo");
  if (headerLogo) {
    headerLogo.addEventListener("click", function (e) {
      if (mq.matches && isOpen()) {
        e.preventDefault();
        setOpen(false);
      }
    });
  }

  var catalogLabel = document.querySelector(".brand .nav__catalog-text");
  if (catalogLabel) {
    catalogLabel.addEventListener("click", function () {
      if (mq.matches) {
        setOpen(false);
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
    }
  });

  function onMqChange() {
    if (!mq.matches) {
      setOpen(false);
      syncCatalogMegaAlign();
    } else {
      syncCatalogMegaAlign();
    }
  }

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onMqChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onMqChange);
  }

  window.addEventListener("resize", syncCatalogMegaAlign);
  syncCatalogMegaAlign();

  document.querySelectorAll(".site-header__nav .nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mq.matches) {
        setOpen(false);
      }
    });
  });

  function setPrimaryActive(li) {
    clearPrimaryActive();
    if (li) {
      li.classList.add("is-active");
      var a = li.querySelector("a[data-mega-subpanel]");
      if (a) a.setAttribute("aria-expanded", "true");
    }
  }

  function activatePrimaryLink(a) {
    if (!a) return;
    var panelId = a.getAttribute("data-mega-subpanel");
    if (!panelId) return;
    setPrimaryActive(a.closest("li"));
    showSubPanel(panelId);
  }

  if (primary) {
    primary.querySelectorAll("a[data-mega-subpanel]").forEach(function (a) {
      var li = a.closest("li");
      if (!li) return;

      a.addEventListener("click", function (e) {
        if (!mq.matches || !isOpen()) return;
        var href = (a.getAttribute("href") || "").trim();
        var isAlreadyActive = li.classList.contains("is-active");

        if (isAlreadyActive && href && href !== "#") {
          setOpen(false);
          return;
        }

        e.preventDefault();
        activatePrimaryLink(a);
      });
    });
  }

  root.querySelectorAll(".catalog-mega__sub a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mq.matches) {
        setOpen(false);
      }
    });
  });
})();

(function initDoorCatalogMore() {
  var grid = document.getElementById("doorCatalogGrid");
  var btn = document.getElementById("doorCatalogMoreBtn");
  if (!grid || !btn) return;
  var more = btn.closest(".section-cats__more");
  if (!more) return;

  var cards = Array.prototype.slice.call(
    grid.querySelectorAll(".door-catalog-grid__item")
  );
  var limit = 12;
  var expanded = false;

  function sync() {
    if (cards.length <= limit) {
      more.hidden = true;
      cards.forEach(function (card) {
        card.hidden = false;
        card.style.display = "";
      });
      expanded = false;
      btn.textContent = "Показать ещё";
      btn.setAttribute("aria-expanded", "false");
      return;
    }

    more.hidden = false;
    cards.forEach(function (card, i) {
      var isHidden = expanded ? false : i >= limit;
      card.hidden = isHidden;
      card.style.display = isHidden ? "none" : "";
    });
    btn.textContent = expanded ? "Свернуть" : "Показать ещё";
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  btn.addEventListener("click", function () {
    expanded = !expanded;
    sync();
    if (typeof btn.blur === "function") {
      btn.blur();
    }
  });

  sync();
})();

(function initDoorProductConfig() {
  var root = document.querySelector("[data-door-product-config]");
  if (!root) return;

  var heroImg = document.querySelector(".door-product-detail__hero-img");

  function setHeroFromVariant(btn) {
    if (!heroImg || !btn) return;
    if (btn.querySelector(".door-product-variant__img--empty")) return;
    var thumb = btn.querySelector(".door-product-variant__img img");
    var heroSrc = btn.getAttribute("data-hero-src") || (thumb && (thumb.currentSrc || thumb.src));
    if (!heroSrc) return;
    heroImg.removeAttribute("width");
    heroImg.removeAttribute("height");
    var alt = btn.getAttribute("data-hero-alt") || (thumb && thumb.getAttribute("alt"));
    if (alt) heroImg.alt = alt;
    if (heroImg.src !== heroSrc) {
      heroImg.src = heroSrc;
    }
  }

  var initialActive = root.querySelector(".door-product-variant.is-active");
  if (initialActive) setHeroFromVariant(initialActive);

  var tabs = root.querySelectorAll(".door-product-config__tab");
  var panels = root.querySelectorAll(".door-product-config__panel");
  var tabsBar = root.querySelector(".door-product-config__tabs");

  if (tabsBar) {
    var tabsTouchStartX = 0;
    var tabsTouchStartY = 0;

    tabsBar.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        tabsTouchStartX = e.touches[0].clientX;
        tabsTouchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    tabsBar.addEventListener(
      "touchmove",
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        var dx = Math.abs(e.touches[0].clientX - tabsTouchStartX);
        var dy = Math.abs(e.touches[0].clientY - tabsTouchStartY);
        if (dx > dy && dx > 6) {
          e.stopPropagation();
        }
      },
      { passive: true }
    );
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-tab");
      if (!id) return;

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach(function (panel) {
        var show = panel.id === "tab-" + id;
        panel.classList.toggle("is-active", show);
        panel.hidden = !show;
      });

      if (typeof tab.scrollIntoView === "function") {
        tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    });
  });

  root.querySelectorAll(".door-product-variant").forEach(function (btn) {
    btn.addEventListener("click", function () {
      root.querySelectorAll(".door-product-variant").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      setHeroFromVariant(btn);
    });
  });
})();

(function initDoorProductConfigSheet() {
  var host = document.getElementById("doorProductConfigHost");
  var sheet = document.getElementById("doorProductConfigSheet");
  var sheetBody = document.getElementById("doorProductConfigSheetBody");
  var openBtn = document.getElementById("doorProductConfigOpen");
  var config = document.querySelector("[data-door-product-config]");
  if (!host || !sheet || !sheetBody || !openBtn || !config) return;

  var panel = sheet.querySelector(".door-product-config-sheet__panel");
  var backdrop = sheet.querySelector(".door-product-config-sheet__backdrop");
  var sheetCloseTimer = null;
  var syncPlacementTimer = null;
  var sheetOpening = false;
  var SHEET_MS = 360;
  var mq = window.matchMedia("(max-width: 768px)");
  var dragZone = sheet.querySelector(".door-product-config-sheet__drag");
  var drag = {
    active: false,
    pointerId: null,
    startY: 0,
    currentY: 0,
    panelHeight: 0,
  };
  var snapResetTimer = null;
  var backdropReadyTimer = null;
  var backdropReady = false;
  var BACKDROP_DELAY_MS = 400;
  var panelsScrollOuter = null;
  var panelsScrollRaf = null;

  function getConfigPanelsEl() {
    return config.querySelector(".door-product-config__panels");
  }

  function ensurePanelsScrollChrome() {
    var panels = getConfigPanelsEl();
    if (!panels) return null;

    var outer = panels.closest(".door-product-config__panels-outer");
    if (!outer) {
      outer = document.createElement("div");
      outer.className = "door-product-config__panels-outer";
      panels.parentNode.insertBefore(outer, panels);
      outer.appendChild(panels);

      var rail = document.createElement("div");
      rail.className = "door-product-config__scrollbar-rail";
      rail.setAttribute("aria-hidden", "true");
      var thumb = document.createElement("div");
      thumb.className = "door-product-config__scrollbar-thumb";
      rail.appendChild(thumb);
      outer.appendChild(rail);

      panels.addEventListener("scroll", schedulePanelsScrollSync, { passive: true });

      if (typeof ResizeObserver !== "undefined") {
        var ro = new ResizeObserver(schedulePanelsScrollSync);
        ro.observe(panels);
        outer._panelsScrollRO = ro;
      }
    }

    panelsScrollOuter = outer;
    return outer;
  }

  function schedulePanelsScrollSync() {
    if (panelsScrollRaf) return;
    panelsScrollRaf = requestAnimationFrame(function () {
      panelsScrollRaf = null;
      syncPanelsCustomScrollbar();
    });
  }

  function syncPanelsCustomScrollbar() {
    if (!isMobile()) return;
    var outer = panelsScrollOuter || ensurePanelsScrollChrome();
    if (!outer) return;

    var panels = outer.querySelector(".door-product-config__panels");
    var thumb = outer.querySelector(".door-product-config__scrollbar-thumb");
    if (!panels || !thumb) return;

    var scrollable = panels.scrollHeight > panels.clientHeight + 1;
    outer.classList.toggle("is-scrollable", scrollable);
    if (!scrollable) return;

    var ch = panels.clientHeight;
    var sh = panels.scrollHeight;
    var thumbH = Math.max(40, (ch / sh) * ch);
    var maxTop = ch - thumbH;
    var top = maxTop <= 0 ? 0 : (panels.scrollTop / (sh - ch)) * maxTop;

    thumb.style.height = thumbH + "px";
    thumb.style.transform = "translateY(" + top + "px)";
  }

  function isMobile() {
    return window.getComputedStyle(openBtn).display !== "none";
  }

  function lockSheetScroll() {
    document.documentElement.classList.add("door-config-sheet-open");
  }

  function unlockSheetScroll() {
    document.documentElement.classList.remove("door-config-sheet-open");
  }

  function mountConfigDesktop() {
    host.hidden = false;
    host.classList.remove("door-product-config-host--sheet-mode");
    if (config.parentNode !== host) {
      host.appendChild(config);
    }
  }

  function mountConfigMobile() {
    host.classList.add("door-product-config-host--sheet-mode");
    if (config.parentNode !== sheetBody) {
      sheetBody.appendChild(config);
    }
    host.hidden = true;
    ensurePanelsScrollChrome();
    schedulePanelsScrollSync();
  }

  function syncConfigPlacement() {
    if (sheet.classList.contains("is-open") || sheetOpening) return;
    if (isMobile()) {
      mountConfigMobile();
      return;
    }
    mountConfigDesktop();
  }

  function scheduleSyncConfigPlacement() {
    if (syncPlacementTimer) clearTimeout(syncPlacementTimer);
    syncPlacementTimer = setTimeout(function () {
      syncPlacementTimer = null;
      syncConfigPlacement();
    }, 120);
  }

  function resetPanelTransform() {
    if (!panel) return;
    panel.style.transition = "";
    panel.style.transform = "";
    if (backdrop) backdrop.style.opacity = "";
  }

  function applyDragOffset(offset, animate) {
    if (!panel) return;
    var y = Math.max(0, offset);
    panel.style.transition = animate ? "" : "none";
    panel.style.transform = y > 0 ? "translateY(" + y + "px)" : "";
    if (backdrop && sheet.classList.contains("is-open")) {
      var h = drag.panelHeight || panel.offsetHeight || 1;
      backdrop.style.transition = animate ? "" : "none";
      backdrop.style.opacity = String(Math.max(0, 1 - y / h));
    }
  }

  function canStartDrag(target) {
    return !!(target && target.closest(".door-product-config-sheet__drag"));
  }

  function clearSnapResetTimer() {
    if (!snapResetTimer) return;
    clearTimeout(snapResetTimer);
    snapResetTimer = null;
  }

  function stopSheetDragTracking() {
    document.removeEventListener("pointermove", onSheetPointerMove);
    document.removeEventListener("pointerup", onSheetPointerEnd);
    document.removeEventListener("pointercancel", onSheetPointerEnd);
  }

  function snapPanelOpen() {
    if (!panel) return;
    clearSnapResetTimer();
    sheet.classList.remove("is-dragging");
    panel.style.transition = "transform 0.25s ease";
    panel.style.transform = "translateY(0)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.25s ease";
      backdrop.style.opacity = "";
    }
    snapResetTimer = setTimeout(function () {
      snapResetTimer = null;
      resetPanelTransform();
    }, 260);
  }

  function releaseOpenBtnFocus() {
    if (openBtn && typeof openBtn.blur === "function") {
      openBtn.blur();
    }
  }

  function setBackdropReady(ready) {
    backdropReady = ready;
    sheet.classList.toggle("is-backdrop-ready", ready);
  }

  function finalizeSheetClose() {
    sheetOpening = false;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    if (panel) {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
    }
    unlockSheetScroll();
    resetPanelTransform();
    setBackdropReady(false);
    sheet.hidden = true;
    releaseOpenBtnFocus();
  }

  function closeSheetFromDrag() {
    if (!sheet.classList.contains("is-open") || !panel) return;

    clearSnapResetTimer();
    stopSheetDragTracking();
    drag.active = false;
    drag.pointerId = null;
    sheet.classList.remove("is-dragging");

    var closeY = drag.panelHeight || panel.offsetHeight || 300;
    panel.style.transition = "transform 0.3s ease";
    panel.style.transform = "translateY(" + closeY + "px)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.3s ease";
      backdrop.style.opacity = "0";
    }

    snapResetTimer = setTimeout(function () {
      snapResetTimer = null;
      finalizeSheetClose();
    }, 300);
  }

  function endDrag(e) {
    if (e && drag.pointerId !== null && e.pointerId !== drag.pointerId) return;

    stopSheetDragTracking();
    if (!drag.active) return;

    var releaseY = e ? e.clientY : drag.startY + drag.currentY;
    var dy = Math.max(drag.currentY, Math.max(0, releaseY - drag.startY));
    drag.currentY = dy;
    drag.active = false;
    drag.pointerId = null;
    clearSnapResetTimer();
    sheet.classList.remove("is-dragging");

    if (dy < 4) {
      resetPanelTransform();
      return;
    }

    var threshold = Math.max(36, drag.panelHeight * 0.15);
    if (dy >= threshold) {
      closeSheetFromDrag();
      return;
    }

    snapPanelOpen();
  }

  function onSheetPointerEnd(e) {
    endDrag(e);
  }

  function onSheetPointerDown(e) {
    if (!sheet.classList.contains("is-open") || !isMobile()) return;
    if (!canStartDrag(e.target)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    clearSnapResetTimer();
    stopSheetDragTracking();

    drag.active = true;
    drag.pointerId = e.pointerId;
    drag.startY = e.clientY;
    drag.currentY = 0;
    drag.panelHeight = panel.offsetHeight || 300;
    sheet.classList.add("is-dragging");

    document.addEventListener("pointermove", onSheetPointerMove, { passive: false });
    document.addEventListener("pointerup", onSheetPointerEnd);
    document.addEventListener("pointercancel", onSheetPointerEnd);
  }

  function onSheetPointerMove(e) {
    if (!drag.active || e.pointerId !== drag.pointerId) return;

    var dy = Math.max(0, e.clientY - drag.startY);
    drag.currentY = dy;
    applyDragOffset(dy, false);
    if (dy > 0 && e.cancelable) e.preventDefault();
  }

  function openSheet(e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    if (!isMobile() || sheet.classList.contains("is-open")) return;

    if (sheetCloseTimer) {
      clearTimeout(sheetCloseTimer);
      sheetCloseTimer = null;
    }
    if (backdropReadyTimer) {
      clearTimeout(backdropReadyTimer);
      backdropReadyTimer = null;
    }
    clearSnapResetTimer();
    stopSheetDragTracking();
    setBackdropReady(false);
    sheetOpening = true;
    mountConfigMobile();
    resetPanelTransform();
    sheet.hidden = false;
    sheet.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    if (panel) {
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sheet.classList.add("is-open");
        lockSheetScroll();
        sheetOpening = false;
        backdropReadyTimer = setTimeout(function () {
          backdropReadyTimer = null;
          if (sheet.classList.contains("is-open")) {
            setBackdropReady(true);
          }
        }, BACKDROP_DELAY_MS);
        ensurePanelsScrollChrome();
        schedulePanelsScrollSync();
        requestAnimationFrame(schedulePanelsScrollSync);
      });
    });
  }

  function closeSheet(immediate) {
    if (!sheet.classList.contains("is-open")) return;

    if (backdropReadyTimer) {
      clearTimeout(backdropReadyTimer);
      backdropReadyTimer = null;
    }
    setBackdropReady(false);
    clearSnapResetTimer();
    stopSheetDragTracking();
    sheetOpening = false;
    drag.active = false;
    drag.pointerId = null;
    sheet.classList.remove("is-dragging");
    resetPanelTransform();

    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    if (panel) {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
    }
    unlockSheetScroll();
    releaseOpenBtnFocus();

    if (sheetCloseTimer) clearTimeout(sheetCloseTimer);
    if (immediate) {
      sheet.hidden = true;
      return;
    }
    sheetCloseTimer = setTimeout(function () {
      sheetCloseTimer = null;
      if (!sheet.classList.contains("is-open")) {
        sheet.hidden = true;
      }
    }, SHEET_MS);
  }

  openBtn.addEventListener("click", openSheet);

  if (dragZone) {
    dragZone.addEventListener("pointerdown", onSheetPointerDown);
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      if (!backdropReady || !sheet.classList.contains("is-open")) return;
      closeSheet();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet.classList.contains("is-open")) {
      closeSheet();
    }
  });

  mq.addEventListener("change", function () {
    if (sheetOpening) return;
    if (sheet.classList.contains("is-open") && !isMobile()) {
      closeSheet();
    }
    scheduleSyncConfigPlacement();
    schedulePanelsScrollSync();
  });

  config.addEventListener("click", function (e) {
    if (e.target.closest(".door-product-config__tab")) {
      schedulePanelsScrollSync();
      requestAnimationFrame(schedulePanelsScrollSync);
    }
  });

  window.addEventListener("resize", schedulePanelsScrollSync);

  syncConfigPlacement();
})();

(function initProductQty() {
  function setPressed(btn, on) {
    btn.classList.toggle("is-pressed", on);
  }

  document.querySelectorAll(".door-product-detail .qty").forEach(function (qty) {
    var span = qty.querySelector(":scope > span");
    var buttons = qty.querySelectorAll("button");
    if (!span || buttons.length < 2) return;
    var minus = buttons[0];
    var plus = buttons[1];

    minus.addEventListener("click", function () {
      var n = parseInt(span.textContent, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > 1) span.textContent = String(n - 1);
    });

    plus.addEventListener("click", function () {
      var n = parseInt(span.textContent, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n < 9999) span.textContent = String(n + 1);
    });

    [minus, plus].forEach(function (btn) {
      btn.addEventListener("mousedown", function () {
        setPressed(btn, true);
      });
      btn.addEventListener("mouseup", function () {
        setPressed(btn, false);
      });
      btn.addEventListener("mouseleave", function () {
        setPressed(btn, false);
      });
      btn.addEventListener(
        "touchstart",
        function () {
          setPressed(btn, true);
        },
        { passive: true }
      );
      btn.addEventListener("touchend", function () {
        setPressed(btn, false);
      });
      btn.addEventListener("touchcancel", function () {
        setPressed(btn, false);
      });
    });
  });
})();

(function initCollectionFilters() {
  var root = document.querySelector(".door-collection-filters");
  if (!root) return;

  var groups = root.querySelectorAll(".door-collection-filters__group");
  if (!groups.length) return;

  var canHover =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function clearFilterHover(scope) {
    var searchRoot = scope || root;
    searchRoot.querySelectorAll(".is-hover").forEach(function (el) {
      el.classList.remove("is-hover");
    });
  }

  function bindFilterHover(el) {
    if (!canHover || !el) return;

    el.addEventListener("mouseenter", function () {
      el.classList.add("is-hover");
    });

    el.addEventListener("mouseleave", function () {
      el.classList.remove("is-hover");
    });
  }

  function blurFilterFocus() {
    var active = document.activeElement;
    if (active && root.contains(active) && typeof active.blur === "function") {
      active.blur();
    }
  }

  function closeGroup(group) {
    if (!group) return;
    var toggle = group.querySelector("[data-filter-toggle]");
    var panel = group.querySelector(".door-collection-filters__panel");
    if (toggle) {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (panel) {
      panel.hidden = true;
    }
    clearFilterHover(group);
    blurFilterFocus();
  }

  function closeAll(exceptGroup) {
    groups.forEach(function (group) {
      if (group !== exceptGroup) {
        closeGroup(group);
      }
    });
  }

  function openGroup(group) {
    var toggle = group.querySelector("[data-filter-toggle]");
    var panel = group.querySelector(".door-collection-filters__panel");
    if (!toggle || !panel) return;
    closeAll(group);
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.hidden = false;
  }

  groups.forEach(function (group) {
    var toggle = group.querySelector("[data-filter-toggle]");
    var panel = group.querySelector(".door-collection-filters__panel");
    var label = group.querySelector("[data-filter-label]");
    var options = group.querySelectorAll(".door-collection-filters__option");
    if (!toggle || !panel) return;

    var defaultLabel = label ? label.textContent : "";

    bindFilterHover(toggle);

    toggle.addEventListener("pointerdown", function () {
      root.querySelectorAll("[data-filter-toggle]").forEach(function (btn) {
        if (btn !== toggle) {
          btn.classList.remove("is-hover");
          if (typeof btn.blur === "function") {
            btn.blur();
          }
        }
      });
    });

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (toggle.classList.contains("is-open")) {
        closeGroup(group);
      } else {
        openGroup(group);
      }
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    options.forEach(function (option) {
      bindFilterHover(option);

      option.addEventListener("click", function (e) {
        e.stopPropagation();
        options.forEach(function (opt) {
          opt.classList.remove("is-selected");
          opt.classList.remove("is-hover");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("is-selected");
        option.setAttribute("aria-selected", "true");
        if (label) {
          label.textContent = option.textContent.trim();
        }
        closeGroup(group);
        if (typeof option.blur === "function") {
          option.blur();
        }
        console.log("[filter-test]", option.getAttribute("data-filter-group"), option.getAttribute("data-filter-value"));
      });
    });

    toggle.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeGroup(group);
      }
    });

    if (label) {
      label.setAttribute("data-filter-default", defaultLabel);
    }
  });

  document.addEventListener("click", function () {
    closeAll(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAll(null);
    }
  });

  root.addEventListener("mouseleave", function () {
    clearFilterHover(root);
  });
})();

(function initBasketQty() {
  document.querySelectorAll(".basket-item__qty").forEach(function (wrapper) {
    var input = wrapper.querySelector("input[type='number']");
    var decBtn = wrapper.querySelector("button:first-child");
    var incBtn = wrapper.querySelector("button:last-child");
    if (!input || !decBtn || !incBtn) return;

    decBtn.addEventListener("click", function () {
      var value = parseInt(input.value, 10);
      if (Number.isNaN(value)) value = 1;
      input.value = String(Math.max(1, value - 1));
    });

    incBtn.addEventListener("click", function () {
      var value = parseInt(input.value, 10);
      if (Number.isNaN(value)) value = 1;
      input.value = String(value + 1);
    });

    input.addEventListener("change", function () {
      var value = parseInt(input.value, 10);
      input.value = String(Number.isNaN(value) || value < 1 ? 1 : value);
    });
  });
})();

(function initOrderInputLabels() {
  document.querySelectorAll(".order-page .input input").forEach(function (field) {
    var wrapper = field.closest(".input");
    if (!wrapper) return;

    function syncState() {
      if (String(field.value || "").trim() === "") {
        wrapper.classList.add("empty");
      } else {
        wrapper.classList.remove("empty");
      }
    }

    syncState();
    field.addEventListener("input", syncState);
    field.addEventListener("change", syncState);
  });
})();

(function initOrderInputFilters() {
  var lettersPattern = /[^a-zA-Z\u0410-\u042F\u0430-\u044F\u0401\u0451\s-]/g;
  var digitsPattern = /\D/g;

  document.querySelectorAll("#order-name, #order-city").forEach(function (field) {
    field.addEventListener("input", function () {
      field.value = field.value.replace(lettersPattern, "");
    });
  });

  document.querySelectorAll("#order-phone, #order-zip, #order-flat").forEach(function (field) {
    field.addEventListener("input", function () {
      field.value = field.value.replace(digitsPattern, "");
    });
  });
})();

(function initHeaderLogoPagesHref() {
  var pagesHref = "spisok-stranic.html";
  var pagesLabel = "Список страниц сайта";

  document
    .querySelectorAll(".site-header a.logo, .mobile-menu__brand")
    .forEach(function (link) {
      link.href = pagesHref;
      link.setAttribute("aria-label", pagesLabel);
    });
})();
