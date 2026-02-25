'use client';

import dynamic from 'next/dynamic';

const GlobeMap = dynamic(() => import('@/components/GlobeMap'), { ssr: false });

export default function Home() {
  return <GlobeMap />;
}
