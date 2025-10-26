import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daily Ticker',
    short_name: 'Daily Ticker',
    description: 'A daily, plain-English market brief for people who want to be in the action but don\'t have time to do the research.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1E32',
    theme_color: '#00FF88',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
