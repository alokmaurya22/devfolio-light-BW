/**
 * Site analytics - Google Analytics 4 + Microsoft Clarity.
 *
 * Both ids below are public, client-side ids (they ship in the page source on
 * every site that uses them); they are configuration, not secrets.
 *
 * NOTE: this is the *only* third-party network traffic on the site - everything
 * else is self-hosted on purpose (see AGENT.md). Two things keep it honest:
 *
 *   1. Nothing loads until the config below is filled in. With both ids empty
 *      this file costs one parsed function and zero requests.
 *   2. The vendor tags load on idle *after* the load event, so they can never
 *      compete with the page's own FCP/LCP work.
 *
 * Local hostnames are skipped so development traffic does not pollute the data.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------
       CONFIGURATION - fill these in to switch analytics on.
       GA4:     Admin -> Data streams -> your web stream -> "Measurement ID"
       Clarity: Settings -> Overview -> the id in the install snippet
       ------------------------------------------------------------------ */
    var GA4_MEASUREMENT_ID = '';   // e.g. 'G-XXXXXXXXXX'
    var CLARITY_PROJECT_ID = '';   // e.g. 'abcdefghij'
    /* ------------------------------------------------------------------ */

    var host = location.hostname;
    var isLocal = !host || host === 'localhost' || host === '127.0.0.1' ||
        host === '[::1]' || host.slice(-6) === '.local';

    if (isLocal || (!GA4_MEASUREMENT_ID && !CLARITY_PROJECT_ID)) return;

    /**
     * Send one event to whichever vendors are configured. Safe to call before
     * the vendor tags have finished loading - both of them queue.
     */
    function track(name, params) {
        try {
            if (GA4_MEASUREMENT_ID && typeof window.gtag === 'function') {
                window.gtag('event', name, params || {});
            }
            if (CLARITY_PROJECT_ID && typeof window.clarity === 'function') {
                window.clarity('event', name);
            }
        } catch (e) { /* analytics must never break the page */ }
    }

    function loadGA4() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA4_MEASUREMENT_ID);

        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
        document.head.appendChild(s);
    }

    function loadClarity() {
        window.clarity = window.clarity || function () {
            (window.clarity.q = window.clarity.q || []).push(arguments);
        };
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(CLARITY_PROJECT_ID);
        document.head.appendChild(s);
    }

    /**
     * The handful of interactions actually worth measuring on a portfolio:
     * did they take the resume, open a project, or start a conversation.
     */
    function bindEvents() {
        document.addEventListener('click', function (event) {
            var el = event.target;
            if (!el || !el.closest) return;

            // Opt-in hook: data-analytics="event_name" on any element.
            var tagged = el.closest('[data-analytics]');
            if (tagged) track(tagged.getAttribute('data-analytics'));

            var link = el.closest('a[href]');

            if (link && /\.pdf(\?|#|$)/i.test(link.getAttribute('href') || '')) {
                track('resume_open');
            }

            var card = el.closest('.project-card, .project-read-more');
            if (card) {
                var index = card.getAttribute('data-index');
                var project = (typeof projectsData !== 'undefined' && projectsData[index]) || null;
                track('project_open', { project_title: project ? project.title : 'unknown' });
            }

            var certificate = el.closest('.certificate-card');
            if (certificate) {
                var title = certificate.querySelector('.certificate-title');
                track('certificate_open', { certificate_title: title ? title.textContent.trim() : 'unknown' });
            }

            // Outbound links tell you where visitors go next - LinkedIn, GitHub,
            // a live project - which is the whole point of the social buttons.
            if (link && link.hostname && link.hostname !== location.hostname) {
                track('outbound_click', {
                    link_domain: link.hostname,
                    link_text: (link.textContent || '').trim().slice(0, 60)
                });
            }
        }, true);

        var form = document.getElementById('contactForm');
        if (form) form.addEventListener('submit', function () { track('contact_submit'); });
    }

    function start() {
        if (GA4_MEASUREMENT_ID) loadGA4();
        if (CLARITY_PROJECT_ID) loadClarity();
        bindEvents();
    }

    // PERF: never let a vendor tag compete with the page's own load. Wait for
    // load, then for the first idle slot after it.
    function schedule() {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(start, { timeout: 4000 });
        } else {
            setTimeout(start, 1500);
        }
    }

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule);
})();
