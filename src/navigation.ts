import { getPermalink, getHomePermalink } from './utils/permalinks';

export const mapUrl = '/map';

// About (RAP-377) and Blog (RAP-382) are draft links: the routes do not exist yet.
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
  socialLinks: [],
  footNote: `
    &copy; ${new Date().getFullYear()} Rapid Insights Consulting Inc. All rights reserved.
  `,
};
