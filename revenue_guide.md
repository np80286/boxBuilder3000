# Box Builder Revenue Guide

## Goal

Turn Box Builder into a monetizable static site without damaging the calculator experience.

## Current Site State

Already in place:

- Public calculator at `https://www.paisleydevelopment.com/boxBuilder3000/`
- Supporting trust pages:
  - `about.html`
  - `contact.html`
  - `privacy.html`
- Supporting content pages:
  - `guides/index.html`
  - `guides/sealed-vs-ported.html`
  - `guides/trunk-measurement-guide.html`
  - `guides/wedge-box-guide.html`
- `robots.txt`
- `sitemap.xml`
- Ad-ready placeholder slots controlled by `site.js`
- Optional analytics hook scaffold in `site.js`

## Revenue Plan

### Phase 1: Search + Trust Foundation

1. Verify the site in Google Search Console.
2. Submit the sitemap:
   - `https://www.paisleydevelopment.com/boxBuilder3000/sitemap.xml`
3. Confirm Google can crawl the public pages.
4. Keep the calculator, About, Contact, Privacy, and Guides pages live and accessible.

Why this matters:

- Search Console helps indexing and exposes crawl problems.
- Ad networks are much more comfortable approving a real site than a single bare tool page.

### Phase 2: Traffic Measurement

1. Create a Google Analytics property.
2. Create a web data stream for:
   - `https://www.paisleydevelopment.com/boxBuilder3000/`
3. Put the GA4 measurement ID into `site.js`.
4. Enable analytics in `window.BOX_BUILDER_SITE.analytics`.

Suggested config shape in `site.js`:

```js
window.BOX_BUILDER_SITE = window.BOX_BUILDER_SITE || {
  ads: {
    enabled: false,
    provider: 'placeholder',
    message: 'Ad space reserved for a future sponsor or approved ad network.'
  },
  analytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX'
  }
};
```

Why this matters:

- You need evidence of traffic and page behavior.
- It helps prove which pages attract users and where ad placements should go.

### Phase 3: AdSense Application

1. Sign into Google AdSense.
2. Add the site:
   - `https://www.paisleydevelopment.com/boxBuilder3000/`
3. Complete the site connection flow.
4. Wait for site review and approval.

What Google will likely care about:

- Original content
- Site usability
- Clear navigation
- Privacy/support pages
- A site they can crawl and understand

### Phase 4: First Ad Placement

Start with one ad placement only.

Recommended first spot:

- One responsive ad block below the workflow intro or between the calculator and guides section

Avoid at first:

- Ads inside dense input areas
- Multiple ads above the fold
- Ads that interrupt the main calculation flow

Principle:

- Better UX usually beats aggressive ad stuffing on a specialist tool.

### Phase 5: Expand Content For Search

Add more guide pages over time:

- Round port vs slot port
- Folded slot basics
- Common box-building mistakes
- How to account for driver displacement
- How to choose tuning frequency

Why this matters:

- Content pages can rank independently.
- They also make AdSense approval easier than a tool-only site.

## Accounts To Create Or Verify

### Required

1. Google Search Console
2. Google AdSense

### Strongly recommended

1. Google Analytics

### Existing operational accounts

1. GitHub
2. Domain/DNS provider for `paisleydevelopment.com`

## Technical Checklist

### Search Console

1. Verify the property for `https://www.paisleydevelopment.com/boxBuilder3000/`
2. Submit:
   - `https://www.paisleydevelopment.com/boxBuilder3000/sitemap.xml`
3. Check indexing and crawl reports

### Analytics

1. Create property
2. Create web stream
3. Copy GA4 measurement ID
4. Add it to `site.js`
5. Enable analytics

### AdSense

1. Create AdSense account
2. Add the site
3. Follow the connection instructions
4. Wait for approval
5. Add the actual ad code only after approval

## How To Enable Real Ads Later

Right now the site uses placeholders only.

When approved:

1. Add the AdSense site code in the shared page head layout where needed.
2. Replace placeholder slot content with real ad units.
3. Keep `ads.enabled` false until code is in place and tested.
4. Then switch it on and redeploy.

## Suggested Monetization Order

1. Search Console verification
2. Analytics install
3. AdSense application
4. First ad unit
5. More guides and SEO pages
6. Review revenue vs UX impact

## Medium-Term Improvement Ideas

1. Add `ads.txt` after your ad account is approved and you know the correct publisher record.
2. Move the public site to a dedicated publish directory or fuller hosting setup if you want tighter control over public assets.
3. Add richer SEO metadata and social preview tags per page.
4. Add basic event tracking for:
   - box type changes
   - enclosure type changes
   - apply suggested dimensions
   - guide page visits

## Useful Official Links

- Google Search Console sitemap guidance:
  - https://support.google.com/webmasters/answer/7451001?hl=en
- Google sitemap guidance:
  - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Analytics website setup:
  - https://support.google.com/analytics/answer/9304153?hl=en
- Google AdSense site connection:
  - https://support.google.com/adsense/answer/7584263?hl=en
- Google AdSense site addition:
  - https://support.google.com/adsense/answer/12169212?hl=en
