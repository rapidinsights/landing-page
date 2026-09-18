import { getPermalink, getHomePermalink } from './utils/permalinks';

export const mapUrl = 'https://app.getrapidinsights.com';
export const bookingUrl = 'https://calendly.com/derek-getrapidinsights/30min';

export const headerData = {
  links: [
    { text: 'Home', href: getHomePermalink() },
    { text: 'About', href: getPermalink('/about') },
    { text: 'Blog', href: getPermalink('/blog') },
  ],
  actions: [{ text: 'See what to fix first', href: mapUrl }],
};

export const footerData = {
  links: [
    {
      title: 'Site',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Blog', href: getPermalink('/blog') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [{ text: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/derek-wayne/' }],
  footNote: `
    &copy; ${new Date().getFullYear()} Rapid Insights Consulting Inc. All rights reserved.
  `,
};
