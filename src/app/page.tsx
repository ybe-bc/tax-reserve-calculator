'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the component with no SSR to avoid hydration issues with localStorage
const TaxReserveCalculator = dynamic(
  () => import('./components/TaxReserveCalculator'),
  { ssr: false } // This is allowed in client components but not in server components
);

export default function Home() {
  return (
    <div className="py-8">
      <Suspense fallback={<div className="text-center p-8">Loading calculator...</div>}>
        <TaxReserveCalculator />
      </Suspense>
    </div>
  );
}
