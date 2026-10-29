"use strict";
"use client";

import React from "react";
import { COLLECTION_METADATA } from "../data/collectionData";

interface OverviewOverlayProps {
  isVisible: boolean;
}

export default function OverviewOverlay({ isVisible }: OverviewOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed top-14 sm:top-20 left-4 sm:left-10 z-30 max-w-xs sm:max-w-sm md:max-w-md transition-all duration-500 ease-out">
      {/* Subtitle / Season Tag */}
      <div className="text-[9px] sm:text-[11px] tracking-[0.25em] text-neutral-500 font-mono uppercase mb-1 sm:mb-2 flex items-center gap-2">
        <span>
          {COLLECTION_METADATA.season} / {COLLECTION_METADATA.title} / {COLLECTION_METADATA.lookCount} LOOKS
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-none uppercase mb-2 sm:mb-4">
        {COLLECTION_METADATA.headline}
      </h1>

      {/* Description & Instruction */}
      <div className="text-[11px] sm:text-[13px] leading-relaxed text-neutral-600 font-normal tracking-wide space-y-0.5 max-w-[280px] sm:max-w-sm">
        <p>{COLLECTION_METADATA.overviewSubtitle}</p>
        <p className="text-neutral-500 hidden xs:block">{COLLECTION_METADATA.overviewInstruction}</p>
      </div>
    </div>
  );
}
