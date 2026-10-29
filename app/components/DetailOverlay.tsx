"use strict";
"use client";

import React, { useState } from "react";
import { Look } from "../types/collection";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";

interface DetailOverlayProps {
  look: Look | null;
  isVisible: boolean;
  onBackToCollection: () => void;
  onShopTheLook: (look: Look) => void;
}

export default function DetailOverlay({
  look,
  isVisible,
  onBackToCollection,
  onShopTheLook,
}: DetailOverlayProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  if (!isVisible || !look) return null;

  const handleShop = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAdded(true);
    onShopTheLook(look);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  return (
    <>
      {/* =====================================================================
          1. LAPTOP & LARGE DESKTOP VIEW (lg: and above)
          Untouched 1:1 original layout
          ===================================================================== */}
      <div className="hidden lg:block fixed top-20 left-10 z-30 w-96 transition-all duration-500 ease-out">
        {/* Look Tagline */}
        <div className="text-[11px] tracking-[0.22em] text-neutral-500 font-mono uppercase mb-2 truncate">
          {look.subtitleTag}
        </div>

        {/* Look Title */}
        <h1 className="text-5xl font-black tracking-tight text-neutral-900 leading-none uppercase mb-5">
          {look.name}
        </h1>

        {/* Product Items Breakdown */}
        <div className="space-y-0 mb-6 text-[13px]">
          {look.items.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-300/40 group transition-colors duration-150"
            >
              <div className="flex flex-col">
                <span className="font-medium text-neutral-900 group-hover:text-black">
                  {item.name}
                </span>
                <span className="text-[11px] text-neutral-500 tracking-wide">
                  {item.material}
                </span>
              </div>
              <div className="font-mono text-neutral-800 text-right whitespace-nowrap pt-0.5">
                €{item.price.toLocaleString()}
              </div>
            </div>
          ))}

          {/* Subtotal Divider */}
          <div className="pt-3 flex items-center justify-between text-[13px] font-semibold text-neutral-900">
            <span className="tracking-wide">Complete look</span>
            <span className="font-mono text-[14px]">
              €{look.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCollection}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold tracking-widest uppercase hover:bg-neutral-100/80 transition-all active:scale-95 text-neutral-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>COLLECTION</span>
          </button>

          <button
            onClick={handleShop}
            disabled={isAdded}
            className={`inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-200 active:scale-95 shadow-sm ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED TO BAG</span>
              </>
            ) : (
              <span>SHOP THE LOOK</span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. MOBILE & TABLET VIEW (< lg:)
          Polished, responsive editorial sheet that leaves the 3D model visible!
          ===================================================================== */}
      <div className="lg:hidden">
        {/* Top Floating Badge Bar */}
        <div className="fixed top-14 sm:top-16 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBackToCollection}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-300/80 text-[11px] font-mono tracking-widest text-neutral-700 uppercase shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>COLLECTION</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
              LOOK {look.lookNumber} / 03
            </span>
            <span className="text-sm font-black tracking-tight text-neutral-900 uppercase">
              {look.name}
            </span>
          </div>
        </div>

        {/* Bottom Floating Glass Card / Sheet (Above Bottom Bar) */}
        <div className="fixed bottom-16 sm:bottom-20 left-3 right-3 sm:left-6 sm:right-6 z-30 max-w-lg mx-auto transition-all duration-300">
          <div className="bg-[#f6f5f1]/95 backdrop-blur-md border border-neutral-300/80 rounded-2xl p-4 sm:p-5 shadow-xl">
            {/* Header / Summary Row */}
            <div
              onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  {look.items.length} GARMENTS
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-neutral-900">
                  €{look.totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShop}
                  disabled={isAdded}
                  className={`px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white hover:bg-neutral-800"
                  }`}
                >
                  {isAdded ? "ADDED" : "SHOP"}
                </button>

                <button
                  type="button"
                  className="p-1.5 text-neutral-500 hover:text-black rounded-full"
                  aria-label="Toggle details"
                >
                  {mobileSheetOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Breakdown on Mobile */}
            {mobileSheetOpen && (
              <div className="mt-4 pt-3 border-t border-neutral-300/60 space-y-2.5 max-h-52 overflow-y-auto no-scrollbar transition-all">
                {look.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {item.material}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-800 whitespace-nowrap">
                      €{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}

                <button
                  onClick={handleShop}
                  disabled={isAdded}
                  className="w-full mt-3 py-2.5 rounded-full bg-black text-white text-xs font-semibold tracking-widest uppercase active:scale-95"
                >
                  {isAdded ? "ADDED TO BAG" : `PURCHASE LOOK — €${look.totalPrice.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
