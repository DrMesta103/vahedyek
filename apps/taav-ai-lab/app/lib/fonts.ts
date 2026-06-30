import localFont from 'next/font/local';

export const iranSans = localFont({
  src: [
    {
      path: '../../public/fonts/iran.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/iran.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-iran-sans',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'sans-serif'],
});
