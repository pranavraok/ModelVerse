import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'ModelVerse',
  projectId: '8ac80799202c9c469730dd2d359494de', // Paste the Reown ID here!
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology/'),
  },
  ssr: true, // This is mandatory for Next.js!
});