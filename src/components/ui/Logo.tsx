'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'dark' | 'light'; // dark text (for cream/white headers), light text (for dark green footers)
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({
  variant = 'dark',
  size = 'md',
  showTagline = true,
}: LogoProps) {
  const iconDimensions = {
    sm: { w: 34, h: 34 },
    md: { w: 42, h: 42 },
    lg: { w: 54, h: 54 },
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl md:text-3xl',
  }[size];

  const taglineSizes = {
    sm: 'text-[9px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.24em]',
    lg: 'text-xs tracking-[0.26em]',
  }[size];

  const isLight = variant === 'light';

  return (
    <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none select-none">
      {/* House-shaped DH Logo Mark */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        <Image
          src="/logo.svg"
          alt="Desi Hub Logo"
          width={iconDimensions.w}
          height={iconDimensions.h}
          className="w-full h-full object-contain drop-shadow-sm"
          priority
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-black tracking-tight transition-colors ${titleSizes}`}
          style={{
            fontFamily: 'var(--font-heading)',
            color: isLight ? '#fdf8ec' : '#14532d',
          }}
        >
          DESI HUB
        </span>

        {showTagline && (
          <span
            className={`font-bold uppercase mt-1 transition-colors hidden min-[400px]:block ${taglineSizes}`}
            style={{
              color: '#c9a227',
              fontFamily: 'var(--font-body)',
            }}
          >
            PURE • NATURAL • HEALTHY
          </span>
        )}
      </div>
    </Link>
  );
}
