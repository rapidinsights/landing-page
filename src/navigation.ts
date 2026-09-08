import { getPermalink, getHomePermalink } from './utils/permalinks';

export const headerData = {
  links: [{ text: 'Home', href: getHomePermalink() }],
  actions: [{ text: "Find out what you can't see", href: getPermalink('/scorecard') }],
};

export const footerData = {
  links: [],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: `
    &copy; ${new Date().getFullYear()} Rapid Insights Consulting Inc. All rights reserved.
  `,
};
