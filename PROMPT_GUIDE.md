# KAYA ELITE — 3D Interactive Runway Lookbook Prompt Guide

Use this prompt template to recreate this exact luxury fashion 3D lookbook application in any future AI session without needing video or image attachments.

---

## 1. Master Copy-Paste Prompt

```markdown
Build an Awwwards-style luxury 3D interactive fashion runway lookbook in Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Three.js for a high-fashion brand called "KAYA ELITE".

### 1. Visual Aesthetic & Background
- Ultra-minimalist luxury editorial aesthetic with warm off-white studio background (`#f6f5f1`), rich dark typography (`#111111`), and subtle gray accents (`#737373`).
- Fixed header:
  - Left: Brand title `KAYA ELITE` in bold tracked uppercase.
  - Center: Nav items `COLLECTION`, `READY-TO-WEAR`, `LEATHER`, `ARCHIVE`.
  - Right: Cart indicator `BAG (0)`.

### 2. State 1: Lineup Overview Mode
- Three stylized 3D runway fashion models standing side-by-side horizontally on an infinite studio floor:
  - Model 01 (THE DUALITY): High-contrast split jumpsuit (right side black, left side white), short sleeves, wrap V-neck, pointed boots.
  - Model 02 (THE SHEARLING MOTO): Oversized black leather biker jacket with plush shearling lapels/cuffs, sheer black mesh sleeves, buckled micro-skirt, sheer fishnet stockings, and zip boots.
  - Model 03 (HALTER SKATER MINI): Textured ivory sweetheart bustier skater dress with black halter neck strap, flared skater circle skirt with black hem border, 1950s retro curled bob hair, and ankle-strap Mary Jane pumps.
  - All 3 models carry a structured black leather top-handle mini bag in their left hand.
- Editorial typography on top-left:
  - Season tag: `FW26 / RUNWAY COUTURE / 3 LOOKS`
  - Massive bold title: `COLLECTION`
  - Subtext: "Three signature runway silhouettes designed for the modern muse." and "Click a figure to step into the look."
- Generous top breathing room (top ~35% of screen height is empty for clean typographic separation).
- Strict Grounding & Dual Shadows:
  - All soles rest flat at `y = 0.0`.
  - Dual shadow system: A soft radial gradient contact shadow disc (`PlaneGeometry(0.58, 0.34)`) directly hugging each pair of shoes + an elevated directional light (`[0.8, 9.0, 3.8]`) casting soft, identical ground shadows across all figures.
- Raycasted Hover: Hovering over a figure displays a dark floating pill badge (`01 — THE DUALITY`) and gently elevates the figure.
- Clicking any figure triggers a smooth camera glide into Detail Mode.

### 3. State 2: Look Detail / Spotlight Mode
- The camera smoothly glides and zooms into the selected model.
- Flanking Ghosting: Models to the left and right remain visible in the peripheral background wings as faded ghost silhouettes (`opacity: 0.18, transparent: true, depthWrite: false`) so they never obstruct reading.
- Active model remains fully opaque (`opacity: 1.0`).
- Left-side product breakdown:
  - Subtitle tag (e.g., `LOOK 01 / 03 · MONOCHROME SPLIT. GRAPHIC TAILORING.`).
  - Large look title (e.g., `THE DUALITY`).
  - Garment breakdown with fabrics and EUR prices separated by subtle hairline dividers.
  - Total line: `Complete look €2,850`.
  - Action buttons: Pill outline `[← COLLECTION]` and solid black `[SHOP THE LOOK]`.
- 360° Drag-to-Rotate: Single-finger touch or mouse drag rotates the active figure around the Y-axis with realistic inertia damping.
- Bottom bar:
  - Left: Numerical look selector `01  02  03` with active dot indicator.
  - Right: Rotation indicator `DRAG TO ROTATE [ ← | → ]` with working previous/next buttons.

### 4. Cross-Device Responsiveness (Mobile, Tablet, Laptop)
- Laptop (`lg:`): Left-aligned editorial card with right-of-center 3D model spotlight (`lateralOffset = 0.44`, `fov = 32°`).
- Mobile & Tablet (`< lg:`):
  - Dynamic Spacing: Automatically tighten model spacing (`1.35` mobile, `1.75` tablet, `2.1` laptop) so all 3 models fit side-by-side in portrait without clipping.
  - Dynamic Aspect FOV: If `aspect < 1.15`, calculate `fov = Math.min(50, 32 * (1.15 / aspect))` to preserve full horizontal runway framing.
  - Unobstructed Detail View: Center the active 3D model horizontally (`lateralOffset = 0`) in the upper 70% of the screen.
  - Mobile Floating Glass Card: Dock an expandable floating glass pill card (`bg-[#f6f5f1]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl`) at the bottom with price summary and `[SHOP]` button, expandable to reveal full garment specs without covering the 3D model.
  - Mobile Swipe Gesture: Horizontal swipe on the canvas switches between previous and next looks.
  - Add `touchAction: "none"` to the canvas container to prevent mobile scroll interference.
```

---

## 2. Technical Vocabulary Cheat Sheet

When communicating with coding agents for 3D web projects, these terms ensure high-precision results:

| Concept | Key Term to Use | What it Accomplishes |
| :--- | :--- | :--- |
| **Aesthetics** | *"Awwwards-style editorial lookbook"* | Triggers clean typography, generous whitespace, luxury monochrome palette (`#f6f5f1`), and refined animations. |
| **Camera Transition** | *"Two-state camera lerping (Overview vs Detail)"* | Ensures the camera glides seamlessly inside a single scene rather than unmounting or reloading routes. |
| **Text Legibility** | *"Flanking models ghosting (`opacity: 0.18`)"* | Keeps adjacent models visible for depth while preventing them from blocking the product text. |
| **Grounding** | *"Strict y = 0 grounding with contact shadow disc"* | Prevents floating models and detached shadows by placing an ambient occlusion disc directly under the shoes. |
| **Mobile WebGL** | *"Dynamic aspect-ratio FOV compensation"* | Automatically widens the camera lens in portrait orientation so outer models are never cropped. |
| **Mobile UX** | *"Docked floating glass sheet"* | Moves bulky product specs into an expandable bottom card so the 3D model is open for touch rotation. |
