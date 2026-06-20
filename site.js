window.BOX_BUILDER_SITE = window.BOX_BUILDER_SITE || {
  ads: {
    enabled: false,
    provider: 'placeholder',
    message: 'Ad space reserved for a future sponsor or approved ad network.'
  }
};

(function initializeSiteChrome() {
  const config = window.BOX_BUILDER_SITE || {};
  const ads = config.ads || {};
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
}());
