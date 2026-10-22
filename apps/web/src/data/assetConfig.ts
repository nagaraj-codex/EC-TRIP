const GENERIC_PARK_PHOTO_ID = "photo-1516450360452-9312f5e86fc7";

export const PARK_IMAGES: Record<string, string> = {
  "wonderla-chennai": "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=80",
  "mgm-dizzee-chennai": "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=80",
  "mgm-dizzee-world": "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=80",
  "black-thunder-coimbatore": "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1000&q=80",
  "black-thunder-mettupalayam": "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1000&q=80",
  "black-thunder": "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1000&q=80",
};

export const getParkImage = (parkId?: string, width = 600): string => {
  if (parkId && PARK_IMAGES[parkId]) {
    return PARK_IMAGES[parkId];
  }
  return queueCutAssets.genericParkImage(width);
};

export const queueCutAssets = {
  hero: `https://images.unsplash.com/${GENERIC_PARK_PHOTO_ID}?auto=format&fit=crop&w=2400&q=85`,
  genericParkImage: (width: number) =>
    `https://images.unsplash.com/${GENERIC_PARK_PHOTO_ID}?auto=format&fit=crop&w=${width}&q=80`,
} as const;
