"use strict";
"use client";

import React from "react";
import { Look } from "../types/collection";
import { MousePointerClick, Touchpad } from "lucide-react";

interface BottomBarProps {
  looks: Look[];
  currentLookIndex: number;
  isDetailView: boolean;
  onSelectLook: (index: number) => void;
  onPrevLook?: () => void;
  onNextLook?: () => void;
}

export default function BottomBar({
  looks,
  currentLookIndex,
  isDetailView,
  onSelectLook,
  onPrevLook,
  onNextLook,
}: BottomBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between text-xs font-mono tracking-widest transition-all duration-300 pointer-events-none">
      {/* Numbers Pagination (01 - 03) */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar py-1">
        {looks.map((look, index) => {
          const isActive = isDetailView && currentLookIndex === index;
          return (
            <button
              key={look.id}
              onClick={() => onSelectLook(index)}
              className={`relative py-1.5 px-2.5 sm:px-3 text-xs sm:text-xs transition-all duration-200 rounded-md active:bg-neutral-200/50 ${
                isActive
                  ? "text-black font-bold"
                  : "text-neutral-400 hover:text-black"
              }`}
              title={`View ${look.name}`}
            >
              <span>{look.lookNumber}</span>
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Hint & Rotation Controls */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-sans select-none shrink-0 ml-2 sm:ml-4">
        {isDetailView ? (
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden md:inline tracking-[0.22em] text-[10px] text-neutral-500">
              DRAG TO ROTATE
            </span>
            <div className="inline-flex items-center border border-neutral-300/80 rounded-sm text-[11px] font-mono bg-white/70 backdrop-blur-xs shadow-xs">
              <button
                onClick={onPrevLook}
                className="px-2.5 py-1 sm:py-0.5 border-r border-neutral-300/80 text-neutral-600 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                title="Previous look"
                aria-label="Previous look"
              >
                ←
              </button>
              <button
                onClick={onNextLook}
                className="px-2.5 py-1 sm:py-0.5 text-neutral-600 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                title="Next look"
                aria-label="Next look"
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline tracking-[0.22em] text-[10px] text-neutral-500">
              CLICK A FIGURE
            </span>
            <span className="sm:hidden tracking-[0.22em] text-[10px] text-neutral-500">
              TAP FIGURE
            </span>
            <MousePointerClick className="w-3.5 h-3.5 text-neutral-500 hidden sm:inline" />
          </div>
        )}
      </div>
    </footer>
  );
}
