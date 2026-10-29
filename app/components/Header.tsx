"use strict";
"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onResetView: () => void;
  currentNav: string;
  onSelectNav: (nav: string) => void;
}

export default function Header({
  cartCount,
  onOpenCart,
  onResetView,
  currentNav,
  onSelectNav,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["COLLECTION", "READY-TO-WEAR", "LEATHER", "ARCHIVE"];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between text-xs tracking-[0.18em] font-medium transition-all duration-300">
      {/* Brand Logo */}
      <button
        onClick={onResetView}
        className="text-base sm:text-xl font-black tracking-[0.25em] uppercase hover:opacity-70 transition-opacity text-black text-left"
      >
        KAYA ELITE
      </button>

      {/* Desktop & Tablet Navigation */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-10">
        {navItems.map((item) => {
          const isActive = currentNav === item;
          return (
            <button
              key={item}
              onClick={() => {
                onSelectNav(item);
                if (item === "COLLECTION") onResetView();
              }}
              className={`relative transition-colors duration-200 uppercase py-1 text-[11px] sm:text-xs ${
                isActive ? "text-black font-semibold" : "text-neutral-500 hover:text-black"
              }`}
            >
              {item}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Cart & Mobile Toggle */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={onOpenCart}
          className="flex items-center gap-1 uppercase hover:opacity-70 transition-opacity group text-neutral-800 py-1.5 px-2 rounded-full active:bg-neutral-200/50"
          aria-label="View shopping bag"
        >
          <span className="font-semibold text-[11px] tracking-[0.2em]">
            BAG ({cartCount})
          </span>
        </button>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-800 hover:text-black active:bg-neutral-200/50 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[52px] sm:top-[60px] bg-[#f6f5f1]/98 backdrop-blur-xl z-50 flex flex-col p-6 sm:p-8 md:hidden border-t border-neutral-300/80 animate-in fade-in duration-200">
          <div className="flex flex-col gap-2 text-base tracking-[0.2em] uppercase font-semibold">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  onSelectNav(item);
                  if (item === "COLLECTION") onResetView();
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-3.5 border-b border-neutral-300/40 text-sm font-bold tracking-widest ${
                  currentNav === item ? "text-black" : "text-neutral-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 text-[11px] text-neutral-500 tracking-widest font-mono">
            <p>FW26 SILENT AMBER</p>
            <p className="mt-1">AUTUMN / WINTER 2026</p>
          </div>
        </div>
      )}
    </header>
  );
}
