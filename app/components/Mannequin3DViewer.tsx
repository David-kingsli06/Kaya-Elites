"use strict";
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Look } from "../types/collection";

interface Mannequin3DViewerProps {
  looks: Look[];
  currentLookIndex: number;
  isDetailView: boolean;
  onSelectLook: (index: number) => void;
  onHoverLook: (index: number | null) => void;
  hoveredLookIndex: number | null;
  onPrevLook?: () => void;
  onNextLook?: () => void;
}

export default function Mannequin3DViewer({
  looks,
  currentLookIndex,
  isDetailView,
  onSelectLook,
  onHoverLook,
  hoveredLookIndex,
  onPrevLook,
  onNextLook,
}: Mannequin3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mannequinGroupsRef = useRef<THREE.Group[]>([]);
  const shadowMeshesRef = useRef<THREE.Mesh[]>([]);
  const materialsByMannequinRef = useRef<THREE.Material[][]>([]);

  // Layout measurements & model scale
  const modelScale = 0.82; // Runway couture proportion
  const centerOffset = (looks.length - 1) / 2;

  // Responsive spacing helper: mobile = 1.35, tablet = 1.75, laptop/desktop = 2.1
  const getSpacing = useCallback((width: number) => {
    if (width < 768) return 1.35;
    if (width < 1024) return 1.75;
    return 2.1;
  }, []);

  // Interaction refs
  const isDraggingRef = useRef(false);
  const previousPointerXRef = useRef(0);
  const pointerDownPosRef = useRef({ x: 0, y: 0, time: 0 });
  const mannequinRotationsRef = useRef<number[]>(new Array(looks.length).fill(0));
  const targetRotationRef = useRef<number[]>(new Array(looks.length).fill(0));

  // Camera targets
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.12, 5.6));
  const cameraLookAtTargetRef = useRef(new THREE.Vector3(0, 0.70, 0));
  const currentCameraPos = useRef(new THREE.Vector3(0, 1.12, 5.6));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.70, 0));

  // Screen-space tooltip coordinates for hovered figure in overview
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Helper to create ambient contact shadow texture
  const createContactShadowTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
    gradient.addColorStop(0, "rgba(10, 10, 10, 0.58)");
    gradient.addColorStop(0.35, "rgba(20, 20, 20, 0.38)");
    gradient.addColorStop(0.65, "rgba(40, 40, 40, 0.12)");
    gradient.addColorStop(1, "rgba(80, 80, 80, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to build realistic stylized runway fashion model matching the user images
  const createRunwayModelMesh = (look: Look, index: number, initialSpacing: number) => {
    const group = new THREE.Group();
    group.name = `model-${index}`;

    const modelMaterials: THREE.Material[] = [];

    // 1. Shared Materials
    // Skin: Warm natural porcelain peach tone
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e5bba0"),
      roughness: 0.44,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(skinMat);

    // Hair: Rich dark espresso brunette
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a1412"),
      roughness: 0.38,
      metalness: 0.08,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(hairMat);

    // Eyes / Lashes / Features
    const darkFeatureMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#111111"),
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(darkFeatureMat);

    const lipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#bb6258"),
      roughness: 0.25,
      metalness: 0.05,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(lipMat);

    // Garment Colors
    const blackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#141414"),
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(blackMat);

    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f7f7f7"),
      roughness: 0.35,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(whiteMat);

    const ivoryDressMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#faf7ee"),
      roughness: 0.40,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(ivoryDressMat);

    const shearlingCollarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#262220"),
      roughness: 0.75,
      metalness: 0.0,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(shearlingCollarMat);

    const sheerMeshMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a2626"),
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.55,
    });
    modelMaterials.push(sheerMeshMat);

    const goldHardwareMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d4af37"),
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 1.0,
    });
    modelMaterials.push(goldHardwareMat);

    materialsByMannequinRef.current.push(modelMaterials);

    // =========================================================================
    // HEAD, FACE & STYLED HAIR
    // =========================================================================
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.70, 0);

    // Cranium / Face Base
    const headGeom = new THREE.SphereGeometry(0.108, 24, 24);
    headGeom.scale(0.85, 1.08, 0.95);
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Feminine Sculpted Jaw & Chin
    const chinGeom = new THREE.ConeGeometry(0.065, 0.07, 16);
    chinGeom.rotateX(Math.PI);
    chinGeom.scale(0.85, 1.0, 0.75);
    const chin = new THREE.Mesh(chinGeom, skinMat);
    chin.position.set(0, -0.065, 0.025);
    headGroup.add(chin);

    // Stylized Eyes & Brows
    const eyeGeom = new THREE.SphereGeometry(0.016, 12, 12);
    eyeGeom.scale(1.2, 0.7, 0.6);
    const leftEye = new THREE.Mesh(eyeGeom, darkFeatureMat);
    leftEye.position.set(0.038, 0.012, 0.092);
    leftEye.rotation.z = -0.08;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, darkFeatureMat);
    rightEye.position.set(-0.038, 0.012, 0.092);
    rightEye.rotation.z = 0.08;
    headGroup.add(rightEye);

    // Nose Bridge
    const noseGeom = new THREE.CylinderGeometry(0.007, 0.014, 0.035, 12);
    const nose = new THREE.Mesh(noseGeom, skinMat);
    nose.position.set(0, 0.002, 0.102);
    nose.rotation.x = 0.15;
    headGroup.add(nose);

    // Rosy Lips
    const lipGeom = new THREE.SphereGeometry(0.016, 12, 12);
    lipGeom.scale(1.1, 0.45, 0.6);
    const lips = new THREE.Mesh(lipGeom, lipMat);
    lips.position.set(0, -0.035, 0.095);
    headGroup.add(lips);

    // HAIR SCULPTING (Matching exact hairstyle in images)
    const hairGroup = new THREE.Group();
    if (look.lookNumber === "03") {
      // Look 03: Retro 1950s Voluminous Curled Bob (from Image 3)
      const bobCap = new THREE.Mesh(new THREE.SphereGeometry(0.122, 20, 20), hairMat);
      bobCap.scale.set(0.96, 1.04, 1.06);
      bobCap.position.set(0, 0.02, -0.01);
      bobCap.castShadow = true;
      hairGroup.add(bobCap);

      // Flared side curl volumes
      const sideCurlGeom = new THREE.SphereGeometry(0.055, 16, 16);
      sideCurlGeom.scale(1.2, 0.8, 1.0);
      const leftCurl = new THREE.Mesh(sideCurlGeom, hairMat);
      leftCurl.position.set(0.105, -0.025, 0.01);
      leftCurl.castShadow = true;
      hairGroup.add(leftCurl);

      const rightCurl = new THREE.Mesh(sideCurlGeom, hairMat);
      rightCurl.position.set(-0.105, -0.025, 0.01);
      rightCurl.castShadow = true;
      hairGroup.add(rightCurl);
    } else {
      // Look 01 & 02: Chic Cropped Textured Wavy Pixie / Short Bob (from Image 1 & 2)
      const pixieCap = new THREE.Mesh(new THREE.SphereGeometry(0.118, 20, 20), hairMat);
      pixieCap.scale.set(0.94, 1.02, 1.02);
      pixieCap.position.set(0, 0.025, -0.01);
      pixieCap.castShadow = true;
      hairGroup.add(pixieCap);

      // Textured wavy bangs / curls
      for (let i = -2; i <= 2; i++) {
        const bang = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), hairMat);
        bang.position.set(i * 0.025, 0.075, 0.088);
        hairGroup.add(bang);
      }
    }
    headGroup.add(hairGroup);
    group.add(headGroup);

    // =========================================================================
    // SLENDER FEMININE NECK
    // =========================================================================
    const neckGeom = new THREE.CylinderGeometry(0.026, 0.034, 0.10, 16);
    const neck = new THREE.Mesh(neckGeom, skinMat);
    neck.position.set(0, 1.56, 0);
    neck.castShadow = true;
    group.add(neck);

    // =========================================================================
    // TORSO & CHEST (Look-Specific Runway Outfits)
    // =========================================================================
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.34, 0);

    if (look.lookNumber === "01") {
      // =======================================================================
      // LOOK 01: Bicolor Split Jumpsuit (Half Black / Half White - Image 1)
      // =======================================================================
      // Right Chest (Black)
      const rightChestGeom = new THREE.CylinderGeometry(0.125, 0.095, 0.32, 16, 1, false, -Math.PI / 2, Math.PI);
      rightChestGeom.scale(1.05, 1.0, 0.85);
      const rightChest = new THREE.Mesh(rightChestGeom, blackMat);
      rightChest.castShadow = true;
      torsoGroup.add(rightChest);

      // Left Chest (White)
      const leftChestGeom = new THREE.CylinderGeometry(0.125, 0.095, 0.32, 16, 1, false, Math.PI / 2, Math.PI);
      leftChestGeom.scale(1.05, 1.0, 0.85);
      const leftChest = new THREE.Mesh(leftChestGeom, whiteMat);
      leftChest.castShadow = true;
      torsoGroup.add(leftChest);

      // Elegant V-Neck wrap collar
      const vNeckTrimGeom = new THREE.BoxGeometry(0.015, 0.18, 0.015);
      const vTrim = new THREE.Mesh(vNeckTrimGeom, blackMat);
      vTrim.position.set(0, 0.05, 0.11);
      vTrim.rotation.z = -0.3;
      torsoGroup.add(vTrim);
    } else if (look.lookNumber === "02") {
      // =======================================================================
      // LOOK 02: Shearling Collar Biker Jacket & Micro Skirt (Image 2)
      // =======================================================================
      // Inner black crew top
      const innerTop = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.095, 0.32, 16), blackMat);
      innerTop.scale.set(1.05, 1, 0.82);
      torsoGroup.add(innerTop);

      // Oversized Leather Biker Shell
      const jacketGeom = new THREE.CylinderGeometry(0.155, 0.135, 0.34, 20);
      jacketGeom.scale(1.15, 1, 0.95);
      const jacket = new THREE.Mesh(jacketGeom, blackMat);
      jacket.castShadow = true;
      torsoGroup.add(jacket);

      // Broad Shearling Lapel / Collar (Plush Fur Trim)
      const lapelGeom = new THREE.BoxGeometry(0.10, 0.22, 0.06);
      const leftLapel = new THREE.Mesh(lapelGeom, shearlingCollarMat);
      leftLapel.position.set(0.08, 0.08, 0.12);
      leftLapel.rotation.z = -0.25;
      leftLapel.castShadow = true;
      torsoGroup.add(leftLapel);

      const rightLapel = new THREE.Mesh(lapelGeom, shearlingCollarMat);
      rightLapel.position.set(-0.08, 0.08, 0.12);
      rightLapel.rotation.z = 0.25;
      rightLapel.castShadow = true;
      torsoGroup.add(rightLapel);
    } else {
      // =======================================================================
      // LOOK 03: Ivory Halter Skater Mini Dress with Black Halter Trim (Image 3)
      // =======================================================================
      // Sweetheart bustier top in textured ivory
      const bodiceGeom = new THREE.CylinderGeometry(0.12, 0.092, 0.30, 20);
      bodiceGeom.scale(1.06, 1.0, 0.85);
      const bodice = new THREE.Mesh(bodiceGeom, ivoryDressMat);
      bodice.castShadow = true;
      torsoGroup.add(bodice);

      // Black Halter Neck Strap & Bow Tie
      const halterGeom = new THREE.TorusGeometry(0.085, 0.012, 10, 20, Math.PI);
      const halter = new THREE.Mesh(halterGeom, blackMat);
      halter.position.set(0, 0.14, 0.04);
      halter.rotation.x = Math.PI / 2;
      torsoGroup.add(halter);

      // Sweetheart bust contrast black piping
      const bustTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.014, 0.02), blackMat);
      bustTrim.position.set(0, 0.11, 0.10);
      torsoGroup.add(bustTrim);
    }
    group.add(torsoGroup);

    // =========================================================================
    // WAIST & SKIRT / PELVIS
    // =========================================================================
    if (look.lookNumber === "03") {
      // Flared Ivory Skater Circle Skirt with Black Hem Border (Image 3)
      const skirtGroup = new THREE.Group();
      skirtGroup.position.set(0, 1.18, 0);

      // Flared Skater Bell Cone
      const skirtGeom = new THREE.ConeGeometry(0.38, 0.36, 32, 1, true);
      skirtGeom.scale(1.1, 1.0, 0.95);
      const skirt = new THREE.Mesh(skirtGeom, ivoryDressMat);
      skirt.position.set(0, -0.15, 0);
      skirt.castShadow = true;
      skirtGroup.add(skirt);

      // Crisp Black Hemline Border along bottom circumference
      const hemBorderGeom = new THREE.TorusGeometry(0.38, 0.014, 8, 36);
      hemBorderGeom.scale(1.1, 1.0, 0.95);
      const hemBorder = new THREE.Mesh(hemBorderGeom, blackMat);
      hemBorder.rotation.x = Math.PI / 2;
      hemBorder.position.set(0, -0.33, 0);
      hemBorder.castShadow = true;
      skirtGroup.add(hemBorder);

      group.add(skirtGroup);
    } else if (look.lookNumber === "02") {
      // Buckled Leather Micro Skirt (Image 2)
      const skirtGeom = new THREE.CylinderGeometry(0.125, 0.15, 0.18, 20);
      skirtGeom.scale(1.15, 1, 0.9);
      const skirt = new THREE.Mesh(skirtGeom, blackMat);
      skirt.position.set(0, 1.10, 0);
      skirt.castShadow = true;
      group.add(skirt);

      // Metallic Buckle Straps
      const buckleGeom = new THREE.BoxGeometry(0.035, 0.02, 0.01);
      const b1 = new THREE.Mesh(buckleGeom, goldHardwareMat);
      b1.position.set(0.04, 1.12, 0.145);
      group.add(b1);
      const b2 = new THREE.Mesh(buckleGeom, goldHardwareMat);
      b2.position.set(0.04, 1.06, 0.155);
      group.add(b2);
    }

    // =========================================================================
    // ARMS & SIGNATURE HANDBAG (Held in Left Hand)
    // =========================================================================
    // Right Arm (Posed gracefully alongside body)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.18, 1.44, 0);

    const rightSleeveMat = look.lookNumber === "01" ? blackMat : look.lookNumber === "02" ? blackMat : skinMat;
    const rightUpperGeom = new THREE.CylinderGeometry(0.028, 0.024, 0.28, 14);
    rightUpperGeom.translate(0, -0.14, 0);
    const rightUpper = new THREE.Mesh(rightUpperGeom, rightSleeveMat);
    rightUpper.castShadow = true;
    rightArmGroup.add(rightUpper);

    // Right Forearm (Skin or Sheer Mesh in Look 02)
    const rightForearmMat = look.lookNumber === "02" ? sheerMeshMat : skinMat;
    const rightForearmGeom = new THREE.CylinderGeometry(0.024, 0.020, 0.28, 14);
    rightForearmGeom.translate(0, -0.14, 0);
    const rightForearm = new THREE.Mesh(rightForearmGeom, rightForearmMat);
    rightForearm.position.set(0, -0.28, 0);
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    // Right Hand
    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), skinMat);
    rightHand.scale.set(0.8, 1.4, 0.6);
    rightHand.position.set(0, -0.58, 0);
    rightArmGroup.add(rightHand);
    group.add(rightArmGroup);

    // Left Arm (Holding the Mini Handbag)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.18, 1.44, 0);

    const leftSleeveMat = look.lookNumber === "01" ? whiteMat : look.lookNumber === "02" ? blackMat : skinMat;
    const leftUpperGeom = new THREE.CylinderGeometry(0.028, 0.024, 0.28, 14);
    leftUpperGeom.translate(0, -0.14, 0);
    const leftUpper = new THREE.Mesh(leftUpperGeom, leftSleeveMat);
    leftUpper.castShadow = true;
    leftArmGroup.add(leftUpper);

    const leftForearmMat = look.lookNumber === "02" ? sheerMeshMat : skinMat;
    const leftForearmGeom = new THREE.CylinderGeometry(0.024, 0.020, 0.26, 14);
    leftForearmGeom.translate(0, -0.13, 0);
    const leftForearm = new THREE.Mesh(leftForearmGeom, leftForearmMat);
    leftForearm.position.set(0, -0.28, 0);
    leftForearm.castShadow = true;
    leftArmGroup.add(leftForearm);

    // Left Hand gripping bag handle
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), skinMat);
    leftHand.scale.set(0.8, 1.4, 0.6);
    leftHand.position.set(0, -0.55, 0);
    leftArmGroup.add(leftHand);

    // =========================================================================
    // SIGNATURE STRUCTURED MINI HANDBAG (From all 3 runway images)
    // =========================================================================
    const bagGroup = new THREE.Group();
    bagGroup.position.set(0.01, -0.68, 0.03);

    // Structured Trapezoid Bag Body
    const bagGeom = new THREE.BoxGeometry(0.08, 0.085, 0.05);
    const bagBody = new THREE.Mesh(bagGeom, blackMat);
    bagBody.castShadow = true;
    bagGroup.add(bagBody);

    // Front Flap & Hardware
    const flapGeom = new THREE.BoxGeometry(0.082, 0.045, 0.01);
    const bagFlap = new THREE.Mesh(flapGeom, blackMat);
    bagFlap.position.set(0, 0.015, 0.025);
    bagGroup.add(bagFlap);

    const lockGeom = new THREE.BoxGeometry(0.014, 0.010, 0.008);
    const bagLock = new THREE.Mesh(lockGeom, goldHardwareMat);
    bagLock.position.set(0, -0.01, 0.031);
    bagGroup.add(bagLock);

    // Rigid Top Handle looping up to hand
    const handleGeom = new THREE.TorusGeometry(0.034, 0.005, 8, 16, Math.PI);
    const bagHandle = new THREE.Mesh(handleGeom, blackMat);
    bagHandle.rotation.z = Math.PI;
    bagHandle.position.set(0, 0.048, 0);
    bagGroup.add(bagHandle);

    leftArmGroup.add(bagGroup);
    group.add(leftArmGroup);

    // =========================================================================
    // LEGS & FOOTWEAR (Strictly Grounded at y = 0.0)
    // =========================================================================
    const createLeg = (side: number) => {
      const legGroup = new THREE.Group();
      const hipX = side * 0.095;
      legGroup.position.set(hipX, 1.04, 0);

      // Thigh & Shin Styling based on Outfit
      let legMat = skinMat;
      if (look.lookNumber === "01") {
        // Look 01: Split Trousers (Right leg black, Left leg white)
        legMat = side < 0 ? blackMat : whiteMat;
      } else if (look.lookNumber === "02") {
        // Look 02: Sheer Black Fishnet Tights
        legMat = sheerMeshMat;
      } else {
        // Look 03: Bare Runway Legs
        legMat = skinMat;
      }

      // Thigh
      const thighGeom = new THREE.CylinderGeometry(0.052, 0.042, 0.46, 16);
      thighGeom.translate(0, -0.23, 0);
      const thigh = new THREE.Mesh(thighGeom, legMat);
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), legMat);
      knee.position.set(0, -0.46, 0);
      knee.castShadow = true;
      legGroup.add(knee);

      // Shin / Calf
      const shinGeom = new THREE.CylinderGeometry(0.042, 0.034, 0.46, 16);
      shinGeom.translate(0, -0.23, 0);
      const shin = new THREE.Mesh(shinGeom, legMat);
      shin.position.set(0, -0.46, 0);
      shin.castShadow = true;
      legGroup.add(shin);

      // Footwear
      if (look.lookNumber === "03") {
        // Look 03: Black Mary Jane Strap Pumps (Image 3)
        const shoeGeom = new THREE.BoxGeometry(0.065, 0.045, 0.16);
        const shoe = new THREE.Mesh(shoeGeom, blackMat);
        shoe.position.set(0, -0.98, 0.025);
        shoe.castShadow = true;
        legGroup.add(shoe);

        // Thin Mary Jane Ankle Strap
        const strapGeom = new THREE.TorusGeometry(0.036, 0.005, 8, 16);
        const strap = new THREE.Mesh(strapGeom, blackMat);
        strap.rotation.x = Math.PI / 2;
        strap.position.set(0, -0.94, 0.01);
        legGroup.add(strap);
      } else {
        // Look 01 & Look 02: Pointed Black Leather Ankle Boots (Image 1 & 2)
        const bootGeom = new THREE.BoxGeometry(0.072, 0.075, 0.18);
        const boot = new THREE.Mesh(bootGeom, blackMat);
        boot.position.set(0, -0.98, 0.03);
        boot.castShadow = true;
        legGroup.add(boot);
      }

      return legGroup;
    };

    group.add(createLeg(-1)); // Right Leg
    group.add(createLeg(1));  // Left Leg

    // Scale to couture proportions & position on floor
    group.scale.set(modelScale, modelScale, modelScale);

    const posX = (index - centerOffset) * initialSpacing;
    group.position.set(posX, 0.0, 0);

    return group;
  };

  // Main Three.js Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const initialSpacing = getSpacing(width);
    const aspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f6f5f1");
    sceneRef.current = scene;

    // 2. Camera with responsive FOV (keeps 32° on desktop, widens on mobile portrait)
    const baseFov = aspect < 1.15 ? Math.min(50, 32 * (1.15 / aspect)) : 32;
    const camera = new THREE.PerspectiveCamera(baseFov, aspect, 0.1, 100);
    camera.position.set(0, 1.12, 5.6);
    cameraRef.current = camera;

    // 3. Renderer with high quality PCF soft shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Setup - Runway Key & Fill Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe4e2dc, 0.95);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight.position.set(0.8, 9.0, 3.8);
    dirLight.target.position.set(0, 0.0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -1;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);
    scene.add(dirLight.target);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
    rimLight.position.set(-4, 6, -5);
    scene.add(rimLight);

    // 5. Studio Floor Plane positioned strictly at y = 0.0
    const floorGeom = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.ShadowMaterial({
      opacity: 0.20,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Ambient Contact Shadow Discs directly hugging the feet
    const contactShadowTexture = createContactShadowTexture();

    const shadows: THREE.Mesh[] = [];
    looks.forEach((_, idx) => {
      const posX = (idx - centerOffset) * initialSpacing;
      const discMat = new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const shadowDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.34), discMat);
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.set(posX, 0.002, 0.025);
      scene.add(shadowDisc);
      shadows.push(shadowDisc);
    });
    shadowMeshesRef.current = shadows;

    // 7. Build the Runway Models
    const groups: THREE.Group[] = [];
    materialsByMannequinRef.current = [];
    looks.forEach((look, idx) => {
      const modelMesh = createRunwayModelMesh(look, idx, initialSpacing);
      scene.add(modelMesh);
      groups.push(modelMesh);
    });
    mannequinGroupsRef.current = groups;

    // 8. Responsive resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const newAspect = w / h;
      cameraRef.current.aspect = newAspect;

      if (newAspect < 1.15) {
        cameraRef.current.fov = Math.min(50, 32 * (1.15 / newAspect));
      } else {
        cameraRef.current.fov = 32;
      }
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);

      // Re-space models dynamically
      const currentSpacing = getSpacing(w);
      mannequinGroupsRef.current.forEach((grp, idx) => {
        grp.position.x = (idx - centerOffset) * currentSpacing;
      });
      shadowMeshesRef.current.forEach((s, idx) => {
        s.position.x = (idx - centerOffset) * currentSpacing;
      });
    };
    window.addEventListener("resize", handleResize);

    // 9. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      currentCameraPos.current.lerp(cameraTargetRef.current, 0.08);
      currentLookAt.current.lerp(cameraLookAtTargetRef.current, 0.08);
      cameraRef.current.position.copy(currentCameraPos.current);
      cameraRef.current.lookAt(currentLookAt.current);

      mannequinGroupsRef.current.forEach((grp, idx) => {
        mannequinRotationsRef.current[idx] = THREE.MathUtils.lerp(
          mannequinRotationsRef.current[idx],
          targetRotationRef.current[idx],
          0.1
        );
        grp.rotation.y = mannequinRotationsRef.current[idx];

        if (!isDetailView) {
          const isHovered = hoveredLookIndex === idx;
          const targetY = isHovered ? 0.03 : 0.0;
          grp.position.y = THREE.MathUtils.lerp(grp.position.y, targetY, 0.15);
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
      rendererRef.current?.dispose();
    };
  }, [getSpacing]);

  // Update Camera Targets & Model Opacities when mode or active look changes
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current) return;

    const width = containerRef.current.clientWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const currentSpacing = getSpacing(width);

    if (!isDetailView) {
      // OVERVIEW MODE
      const camZ = isMobile ? 5.2 : isTablet ? 5.4 : 5.6;
      const camY = isMobile ? 1.05 : isTablet ? 1.08 : 1.12;

      cameraTargetRef.current.set(0, camY, camZ);
      cameraLookAtTargetRef.current.set(0, 0.70, 0);

      materialsByMannequinRef.current.forEach((matList) => {
        matList.forEach((mat) => {
          mat.opacity = 1.0;
          mat.transparent = false;
          mat.depthWrite = true;
          mat.needsUpdate = true;
        });
      });

      shadowMeshesRef.current.forEach((s) => {
        s.visible = true;
        (s.material as THREE.MeshBasicMaterial).opacity = 0.85;
      });

      targetRotationRef.current = targetRotationRef.current.map(() => 0);
    } else {
      // DETAIL MODE
      const selectedX = (currentLookIndex - centerOffset) * currentSpacing;
      const lateralOffset = isMobile || isTablet ? 0 : 0.44;
      const camZ = isMobile ? 3.3 : isTablet ? 3.2 : 3.1;
      const camY = isMobile ? 0.76 : isTablet ? 0.82 : 0.88;

      cameraTargetRef.current.set(selectedX - lateralOffset, camY, camZ);
      cameraLookAtTargetRef.current.set(selectedX - lateralOffset, 0.70, 0);

      materialsByMannequinRef.current.forEach((matList, idx) => {
        const isSelected = idx === currentLookIndex;
        matList.forEach((mat) => {
          if (isSelected) {
            mat.opacity = 1.0;
            mat.transparent = false;
            mat.depthWrite = true;
          } else {
            mat.opacity = 0.18;
            mat.transparent = true;
            mat.depthWrite = false;
          }
          mat.needsUpdate = true;
        });
      });

      shadowMeshesRef.current.forEach((s, idx) => {
        const isSelected = idx === currentLookIndex;
        (s.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.85 : 0.15;
      });
    }
  }, [isDetailView, currentLookIndex, getSpacing]);

  // Pointer event handlers with mobile swipe & drag rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerXRef.current = e.clientX;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current) return;

    const deltaX = e.clientX - previousPointerXRef.current;
    previousPointerXRef.current = e.clientX;

    if (isDraggingRef.current) {
      if (isDetailView) {
        targetRotationRef.current[currentLookIndex] += deltaX * 0.012;
      }
      return;
    }

    // Raycast hover detection in Overview mode
    if (!isDetailView) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      let foundIdx: number | null = null;
      for (let i = 0; i < mannequinGroupsRef.current.length; i++) {
        const intersects = raycaster.intersectObjects(mannequinGroupsRef.current[i].children, true);
        if (intersects.length > 0) {
          foundIdx = i;
          break;
        }
      }

      onHoverLook(foundIdx);

      if (foundIdx !== null) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        setTooltipPos(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    const deltaXTotal = e.clientX - pointerDownPosRef.current.x;
    const deltaYTotal = e.clientY - pointerDownPosRef.current.y;
    const moveDist = Math.hypot(deltaXTotal, deltaYTotal);
    const duration = Date.now() - pointerDownPosRef.current.time;

    // Mobile swipe detection in detail view
    if (isDetailView && duration < 350 && Math.abs(deltaXTotal) > 50 && Math.abs(deltaYTotal) < 50) {
      if (deltaXTotal < 0 && onNextLook) {
        onNextLook();
        return;
      } else if (deltaXTotal > 0 && onPrevLook) {
        onPrevLook();
        return;
      }
    }

    // Click / Tap detection
    if (moveDist < 12) {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      for (let i = 0; i < mannequinGroupsRef.current.length; i++) {
        const intersects = raycaster.intersectObjects(mannequinGroupsRef.current[i].children, true);
        if (intersects.length > 0) {
          onSelectLook(i);
          setTooltipPos(null);
          break;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
      className={`relative w-full h-full select-none ${
        isDetailView ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
    >
      {/* Floating Hover Tooltip in Overview Mode (desktop only) */}
      {!isDetailView && hoveredLookIndex !== null && tooltipPos && (
        <div
          className="hidden md:block pointer-events-none fixed z-40 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-mono tracking-widest uppercase shadow-lg transition-all duration-75"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 18}px`,
          }}
        >
          {looks[hoveredLookIndex].lookNumber} — {looks[hoveredLookIndex].name}
        </div>
      )}
    </div>
  );
}
