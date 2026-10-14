'use client';

import { useEffect } from 'react';
import { getStallFromUrl } from '@/lib/utils';

export default function StallTracker() {
  useEffect(() => {
    getStallFromUrl();
  }, []);

  return null;
}
