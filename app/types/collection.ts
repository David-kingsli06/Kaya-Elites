export interface GarmentItem {
  name: string;
  material: string;
  price: number;
}

export interface Look {
  id: string;
  lookNumber: string; // e.g. "01", "02", ...
  subtitleTag: string; // e.g. "FW26 / SILENT AMBER / 11 LOOKS" or "LOOK 05 / 11 · WARDROBE DEPT. CUT 70 REVO."
  name: string; // e.g. "THE WITNESS"
  tagline?: string;
  items: GarmentItem[];
  totalPrice: number;
  primaryColor: string; // Hex color for mannequin or accent
  accentColor: string;
  characterType: "slender" | "tactical" | "hooded" | "twintail" | "minimal" | "armored" | "athletic";
  pose: "standing" | "hip" | "dynamic" | "stride" | "action";
  silhouetteDescription: string;
}
