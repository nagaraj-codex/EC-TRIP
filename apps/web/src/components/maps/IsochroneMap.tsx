import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lon: number;
  parkName: string;
}

const PARK_COORDS: Record<string, { lat: number; lon: number }> = {
  "wonderla-chennai":         { lat: 12.75, lon: 80.19 },
  "mgm-dizzee-chennai":       { lat: 12.82, lon: 80.24 },
  "black-thunder-coimbatore": { lat: 11.30, lon: 76.93 },
};

export default function IsochroneMap({ lat, lon, parkName }: Props) {
  const mapToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapToken || !mapRef.current) return;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (mapInstance.current) return;
      mapboxgl.accessToken = mapToken;
      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [lon, lat],
        zoom: 11,
      });
      new mapboxgl.Marker({ color: "#4338ca" }).setLngLat([lon, lat]).addTo(map);
      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon, mapToken]);

  if (!mapToken) {
    return (
      <div className="card flex flex-col items-center justify-center h-48 text-center gap-2">
        <p className="text-sm font-medium text-slate-600">{parkName}</p>
        <p className="text-xs text-slate-400">
          Map view unavailable. Set VITE_MAPBOX_TOKEN to enable the isochrone drive-time layer.
        </p>
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-2xl overflow-hidden h-52 w-full" />;
}
