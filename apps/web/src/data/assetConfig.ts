const GENERIC_PARK_PHOTO_ID = "photo-1516450360452-9312f5e86fc7";

export const queueCutAssets = {
  hero: `https://images.unsplash.com/${GENERIC_PARK_PHOTO_ID}?auto=format&fit=crop&w=2400&q=85`,
  genericParkImage: (width: number) =>
    `https://images.unsplash.com/${GENERIC_PARK_PHOTO_ID}?auto=format&fit=crop&w=${width}&q=80`,
} as const;
