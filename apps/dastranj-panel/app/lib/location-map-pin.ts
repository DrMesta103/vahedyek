export type LocationMapPin = {
  x: number;
  y: number;
};

const PRESET_POINTS: Array<LocationMapPin & { lat: string; lng: string }> = [
  { lat: '35.699739', lng: '51.338097', x: 48, y: 50 },
  { lat: '35.783115', lng: '51.425682', x: 66, y: 24 },
  { lat: '35.744251', lng: '51.209943', x: 20, y: 40 },
  { lat: '35.620421', lng: '51.420112', x: 63, y: 77 },
];

export function resolveLocationMapPin(latitude?: { toString(): string } | string | null, longitude?: { toString(): string } | string | null): LocationMapPin {
  const lat = latitude == null ? '' : String(latitude);
  const lng = longitude == null ? '' : String(longitude);
  const preset = PRESET_POINTS.find((point) => point.lat === lat && point.lng === lng);
  if (preset) {
    return { x: preset.x, y: preset.y };
  }
  return { x: 48, y: 50 };
}
