"use strict";
"use client";

import React from "react";
import { Look } from "../types/collection";
import { X, Trash2, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Look[];
  onRemoveItem: (index: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#f6f5f1] h-full shadow-2xl z-10 flex flex-col p-6 sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-300">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-800">
            Shopping Bag ({cartItems.length})
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <p className="text-sm tracking-widest text-neutral-500 uppercase font-mono">
              Your bag is empty
            </p>
            <p className="text-xs text-neutral-400 mt-2 max-w-xs">
              Explore the FW26 Silent Amber collection and add looks to your selection.
            </p>
          </div>
        ) : (
          <div className="flex-1 py-6 space-y-6 overflow-y-auto no-scrollbar">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/70 border border-neutral-200/80 shadow-xs"
              >
                <div className="flex-1">
                  <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    {item.lookNumber} · {item.subtitleTag}
                  </div>
                  <h4 className="text-base font-bold uppercase tracking-wide mt-1 text-neutral-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    {item.items.length} garments included
                  </p>
                  <div className="font-mono text-sm font-semibold mt-2 text-neutral-900">
                    €{item.totalPrice.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(idx)}
                  className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="pt-6 border-t border-neutral-300 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 tracking-wider uppercase text-xs">
                Estimated Total
              </span>
              <span className="font-mono font-bold text-base text-neutral-900">
                €{totalAmount.toLocaleString()}
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 text-center tracking-wide">
              Complimentary express courier delivery & carbon-neutral packaging.
            </p>

            <button
              onClick={() => alert("Proceeding to luxury checkout...")}
              className="w-full py-3.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
            >
              <span>CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
