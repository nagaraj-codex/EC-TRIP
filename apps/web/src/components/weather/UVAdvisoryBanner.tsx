interface Props {
  tempMax: number;
  weatherCondition: string;
}

export default function UVAdvisoryBanner({ tempMax, weatherCondition }: Props) {
  const isHighUV = tempMax >= 34 && weatherCondition === "sunny";
  if (!isHighUV) return null;

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-amber-500" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Peak UV: 11:30 AM – 2:30 PM</p>
        <p className="text-xs text-amber-700 mt-0.5">
          High direct irradiance detected. Schedule indoor thrill coasters and shaded zones
          during midday. Water rides and splash areas are recommended between 12 PM – 2 PM.
        </p>
      </div>
    </div>
  );
}
