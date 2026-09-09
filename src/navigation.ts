import { getPermalink, getHomePermalink } from './utils/permalinks';

export const dragMapUrl = '/map';

export const headerData = {
  links: [{ text: 'Home', href: getHomePermalink() }],
  actions: [{ text: 'Build your Drag Map', href: dragMapUrl }],
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
