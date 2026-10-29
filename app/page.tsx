"use strict";
"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import OverviewOverlay from "./components/OverviewOverlay";
import DetailOverlay from "./components/DetailOverlay";
import BottomBar from "./components/BottomBar";
import CartDrawer from "./components/CartDrawer";
import { LOOKS_DATA } from "./data/collectionData";
import { Look } from "./types/collection";

// Dynamically import Three.js viewer with SSR disabled
const Mannequin3DViewer = dynamic(
  () => import("./components/Mannequin3DViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f6f5f1] text-neutral-400 font-mono text-xs tracking-widest uppercase">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin mb-4" />
        <span>VANTRE FW26 SILENT AMBER</span>
      </div>
    ),
  }
);

export default function Home() {
  const [currentNav, setCurrentNav] = useState("COLLECTION");
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(1); // Default to Look 02 (The Shadow)
  const [hoveredLookIndex, setHoveredLookIndex] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<Look[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Navigate to look detail
  const handleSelectLook = useCallback((index: number) => {
    setCurrentLookIndex(index);
    setIsDetailView(true);
  }, []);

  // Return to 11-figure overview
  const handleBackToCollection = useCallback(() => {
    setIsDetailView(false);
  }, []);

  // Previous / Next look carousel actions
  const handlePrevLook = useCallback(() => {
    setCurrentLookIndex((prev) => (prev > 0 ? prev - 1 : LOOKS_DATA.length - 1));
  }, []);

  const handleNextLook = useCallback(() => {
    setCurrentLookIndex((prev) => (prev < LOOKS_DATA.length - 1 ? prev + 1 : 0));
  }, []);

  // Add to Bag
  const handleShopTheLook = useCallback((look: Look) => {
    setCartItems((prev) => [...prev, look]);
  }, []);

  // Remove from Bag
  const handleRemoveCartItem = useCallback((idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDetailView(false);
        setIsCartOpen(false);
      } else if (isDetailView) {
        if (e.key === "ArrowLeft") {
          handlePrevLook();
        } else if (e.key === "ArrowRight") {
          handleNextLook();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailView, handlePrevLook, handleNextLook]);

  const activeLook = LOOKS_DATA[currentLookIndex];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#f6f5f1] select-none">
      {/* 1. Header Navigation */}
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onResetView={handleBackToCollection}
        currentNav={currentNav}
        onSelectNav={setCurrentNav}
      />

      {/* 2. Top-Left Content Overlays */}
      {/* Mode A: Collection Overview */}
      <OverviewOverlay isVisible={!isDetailView} />

      {/* Mode B: Look Detail Breakdown */}
      <DetailOverlay
        look={activeLook}
        isVisible={isDetailView}
        onBackToCollection={handleBackToCollection}
        onShopTheLook={handleShopTheLook}
      />

      {/* 3. The 3D Mannequin Interactive Stage */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Mannequin3DViewer
          looks={LOOKS_DATA}
          currentLookIndex={currentLookIndex}
          isDetailView={isDetailView}
          onSelectLook={handleSelectLook}
          onHoverLook={setHoveredLookIndex}
          hoveredLookIndex={hoveredLookIndex}
          onPrevLook={handlePrevLook}
          onNextLook={handleNextLook}
        />
      </div>

      {/* 4. Bottom Navigation & Pagination */}
      <BottomBar
        looks={LOOKS_DATA}
        currentLookIndex={currentLookIndex}
        isDetailView={isDetailView}
        onSelectLook={handleSelectLook}
        onPrevLook={handlePrevLook}
        onNextLook={handleNextLook}
      />

      {/* 6. Shopping Bag Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
      />
    </main>
  );
}
