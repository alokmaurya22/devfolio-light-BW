/**
 * Site behaviour: loader, smooth scrolling, scroll affordances.
 *
 * Carousels, skill bars and every data-driven section are initialized in
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

    /**
     * Pointer follower: a small circle that trails the cursor and inverts what is
     * behind it (mix-blend-mode: exclusion), sitting behind kursor's ring and dot.
     *
     * This used to come from the mouseFollower helper in Shery, which dragged in
     * three.js and ControlKit with it - 1.27 MB to draw one 15px circle. Same
     * look here in ~30 lines: one rAF loop that stops as soon as it settles.
     */
    function initPointerFollower() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var dot = document.createElement('div');
        dot.className = 'mouse-follower';
        document.body.appendChild(dot);

        var targetX = 0, targetY = 0, x = 0, y = 0, running = false, seen = false;

        function frame() {
            // Ease towards the pointer; 0.12 lands in roughly the 0.6s Shery used.
            x += (targetX - x) * 0.12;
            y += (targetY - y) * 0.12;
            dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
            if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1) {
                running = false;   // settled - stop burning frames
                return;
            }
            requestAnimationFrame(frame);
        }

        document.addEventListener('mousemove', function (e) {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!seen) {
                // Start from under the pointer so it does not fly in from 0,0.
                seen = true;
                x = targetX;
                y = targetY;
                dot.classList.add('is-visible');
            }
            if (!running) {
                running = true;
                requestAnimationFrame(frame);
            }
        }, { passive: true });

        document.addEventListener('mouseleave', function () { dot.classList.remove('is-visible'); });
        document.addEventListener('mouseenter', function () { if (seen) dot.classList.add('is-visible'); });
    }

    /**
     * Theme toggle. The chosen theme is already applied by the inline script in
     * <head>; this only flips it and remembers the choice.
     */
    function initThemeToggle() {
        var root = document.documentElement;
        var button = document.getElementById('theme-toggle');
        if (!button) return;

        function sync() {
            var dark = root.getAttribute('data-theme') === 'dark';
            button.setAttribute('aria-pressed', dark ? 'true' : 'false');
            button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        }

        button.addEventListener('click', function () {
            var dark = root.getAttribute('data-theme') === 'dark';
            if (dark) root.removeAttribute('data-theme');
            else root.setAttribute('data-theme', 'dark');
            try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) { /* ignore */ }
            sync();
        });

        // Follow the OS while the visitor has not made a choice of their own.
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        var onChange = function (e) {
            try { if (localStorage.getItem('theme')) return; } catch (err) { return; }
            if (e.matches) root.setAttribute('data-theme', 'dark');
            else root.removeAttribute('data-theme');
            sync();
        };
        if (media.addEventListener) media.addEventListener('change', onChange);
        else if (media.addListener) media.addListener(onChange);

        sync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }

    window.addEventListener('load', function () {
        var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1); };
        idle(initPointerFollower);
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
