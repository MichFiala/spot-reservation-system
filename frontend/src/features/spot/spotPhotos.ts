const defaultPhotos = [
  "/19166470.jpg",
  "/chata-vysocina-u-rybnika-stekly-trebic.jpg",
  "/preview.jpg",
];

const spotPhotosMap: Record<string, string[]> = {
  // Add spot-specific photos here as needed:
  // "spot-id": ["/photo1.jpg", "/photo2.jpg"],
};

export function getSpotPhotos(spotId: string): string[] {
  return spotPhotosMap[spotId] ?? defaultPhotos;
}
