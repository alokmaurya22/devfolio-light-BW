/**
 * Site behaviour: loader, smooth scrolling, scroll affordances.
 *
 * Carousels, Typed, skill bars and every data-driven section are initialized in
 * data/main.js — do not duplicate them here (they run before the data is rendered).
 */
(function () {
    "use strict";

    // PERF: hide the loader as soon as the DOM is usable. Waiting for `load` kept a
    // full-screen overlay up until every script and image had finished downloading.
    function hideLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;
        loader.classList.add('is-hidden');
        setTimeout(function () { loader.style.display = 'none'; }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLoader);
    } else {
        hideLoader();
    }
    // Safety net: never let the overlay outlive the page.
    window.addEventListener('load', hideLoader);

    /* Prevent right click / devtools shortcuts.
       Bound once, here. Uses the handler's own event object (the old code read the
       global `event`, which is not reliable outside Chrome). */
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
        var key = e.key || '';
        var blocked =
            e.keyCode === 123 || key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (key === 'I' || key === 'J' || key === 'C' ||
                e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.ctrlKey && (key === 'u' || key === 'U' || e.keyCode === 85));
        if (blocked) {
            e.preventDefault();
            return false;
        }
    });

    function onJQueryReady() {
        var $ = window.jQuery;

        // Smooth scrolling on the navbar links
        $(document).on('click', '.navbar-nav a[href^="#"]', function (event) {
            var hash = this.hash;
            if (!hash || !$(hash).length) return;
            event.preventDefault();

            $('html, body').animate({
                scrollTop: $(hash).offset().top - 45
            }, 1000, $.easing && $.easing.easeInOutExpo ? 'easeInOutExpo' : 'swing');

            $('.navbar-nav .active').removeClass('active');
            $(this).addClass('active');

            // Collapse the mobile menu after navigating.
            var $collapse = $('#navbarCollapse');
            if ($collapse.hasClass('show')) $collapse.collapse('hide');
        });

        // Scroll affordances: hint arrow at the top, back-to-top after scrolling.
        var ticking = false;
        function onScroll() {
            var top = $(window).scrollTop();
            $('.navbar').toggleClass('navbar-scrolled', top > 60);
            if (top > 100) {
                $('.scroll-to-bottom').fadeOut('slow');
            } else {
                $('.scroll-to-bottom').fadeIn('slow');
            }
            if (top > 200) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
            ticking = false;
        }
        $(window).on('scroll', function () {
            // PERF: coalesce scroll work into one rAF callback per frame.
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(onScroll);
            }
        });
        onScroll();

        $(document).on('click', '.back-to-top', function () {
            $('html, body').animate({ scrollTop: 0 }, 1000,
                $.easing && $.easing.easeInOutExpo ? 'easeInOutExpo' : 'swing');
            return false;
        });
    }

    // jQuery is deferred too; wait for it without blocking.
    (function waitForJQuery(attempts) {
        if (window.jQuery) return onJQueryReady();
        if (attempts > 100) return; // ~5s, then give up quietly
        setTimeout(function () { waitForJQuery(attempts + 1); }, 50);
    })(0);
})();
