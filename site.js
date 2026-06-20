window.BOX_BUILDER_SITE = window.BOX_BUILDER_SITE || {
  ads: {
    enabled: false,
    provider: 'placeholder',
    message: 'Ad space reserved for a future sponsor or approved ad network.'
  },
  analytics: {
    enabled: false,
    measurementId: ''
  }
};

(function initializeSiteChrome() {
  const config = window.BOX_BUILDER_SITE || {};
  const ads = config.ads || {};
  const analytics = config.analytics || {};
  const adSlots = document.querySelectorAll('[data-ad-slot]');

  adSlots.forEach((slot) => {
    const enabled = ads.enabled === true;
    slot.hidden = !enabled;
    if (!enabled) return;

    const copy = slot.querySelector('[data-ad-copy]');
    if (copy) {
      copy.textContent = ads.message || 'Advertisement';
    }
  });

  const yearEls = document.querySelectorAll('[data-current-year]');
  yearEls.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  if (
    analytics.enabled === true &&
    typeof analytics.measurementId === 'string' &&
    analytics.measurementId.trim()
  ) {
    const measurementId = analytics.measurementId.trim();
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(gaScript);
  }
}());
