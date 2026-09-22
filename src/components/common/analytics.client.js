// Runs inline in <head> on every page; Analytics.astro prepends posthogKey, gaId
// and mapUrl. Plain browser JavaScript: nothing here is bundled or transpiled.
/* global posthogKey, gaId, mapUrl */
if (!navigator.webdriver) {
  // Our own browsers: open any page with ?internal=1 once. Same rule as the map app.
  let internal = false;
  try {
    if (new URLSearchParams(location.search).get('internal') === '1') localStorage.setItem('landing:internal:v1', '1');
    internal = localStorage.getItem('landing:internal:v1') === '1';
  } catch {
    // storage blocked: count the visit
  }
  const useGa = gaId && !internal;

  // gtag's dataLayer is already a queue; PostHog needs one until its loader has run.
  let waiting = [];
  if (useGa) {
    window.dataLayer = window.dataLayer || [];
    // gtag.js only reads Arguments objects off the queue; a rest array is ignored.
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    // Quebec (Law 25), the EEA and the UK need analytics off until the visitor opts in;
    // the consent banner is a separate issue. Ads stay denied everywhere, we run none.
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      region: [
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'DE',
        'GR',
        'HU',
        'IE',
        'IT',
        'LV',
        'LT',
        'LU',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
        'IS',
        'LI',
        'NO',
        'GB',
        'CA-QC',
      ],
    });
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  const track = (name, props, gaName) => {
    if (posthogKey) {
      if (window.posthog && window.posthog.capture) window.posthog.capture(name, props);
      else waiting.push([name, props]);
    }
    if (gaName && useGa) window.gtag('event', gaName, props);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    if (link.href.startsWith(mapUrl)) {
      const section = link.closest('section[id]');
      const where = section ? section.id : link.closest('header') ? 'header' : 'body';
      track('cta_clicked', { section: where, page: location.pathname }, 'cta_click');
    } else if (link.hasAttribute('data-calendly')) {
      track('booking_opened', { page: location.pathname });
    }
  });

  // The booking iframe passes embed_domain, so Calendly reports back when a call is scheduled.
  addEventListener('message', (e) => {
    if (e.origin === 'https://calendly.com' && e.data && e.data.event === 'calendly.event_scheduled') {
      track('booking_completed', { page: location.pathname }, 'generate_lead');
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!('IntersectionObserver' in window)) return;
    const once = (options, report) => {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          report(entry.target);
        }
      }, options);
      return observer;
    };

    // Mid-screen line, not a ratio: Method is several screens tall and would never reach one.
    const reached = once({ rootMargin: '-50% 0px -50% 0px' }, (el) => track('section_reached', { section: el.id }));
    document.querySelectorAll('section[id]').forEach((el) => reached.observe(el));

    const read = once({}, () => track('case_study_read', { slug: location.pathname.split('/').filter(Boolean).pop() }));
    document.querySelectorAll('[data-case-end]').forEach((el) => read.observe(el));
  });

  const boot = () => {
    if (posthogKey) {
      // PostHog's standard loader, unmodified. Kept away from prettier and eslint --fix, which rewrite it.
      /* eslint-disable */
      // prettier-ignore
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      /* eslint-enable */
      window.posthog.init(posthogKey, {
        api_host: 'https://us.i.posthog.com',
        defaults: '2026-01-30',
        disable_session_recording: true,
      });
      if (internal) window.posthog.setPersonProperties({ $internal_or_test_user: true });
      for (const [name, props] of waiting) window.posthog.capture(name, props);
      waiting = [];
    }
    if (useGa) {
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.append(tag);
    }
  };

  addEventListener('load', () => {
    if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 3000 });
    else setTimeout(boot, 1);
  });
}
