"use client";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { divIcon } from "leaflet";
import { useMemo } from "react";
import "leaflet/dist/leaflet.css";

export interface Pin {
  id: string;
  lat: number;
  lng: number;
  kind: "driver" | "order" | "dest";
}

interface Props {
  pins: Pin[];
  trail?: { from: [number, number]; to: [number, number] };
  center?: [number, number];
  zoom?: number;
  height?: string;
  onPinClick?: (pinId: string) => void;
}

const DAKAR: [number, number] = [14.6928, -17.4467];

const icons = {
  driver: divIcon({ className: "", html: '<div class="driver-pin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
  order:  divIcon({ className: "", html: '<div class="order-pin"></div>',  iconSize: [12, 12], iconAnchor: [6, 6] }),
  dest:   divIcon({ className: "", html: '<div class="dest-pin"></div>',   iconSize: [18, 18], iconAnchor: [9, 18] }),
};

export default function DakarMap({ pins, trail, center = DAKAR, zoom = 12, height = "480px", onPinClick }: Props) {
  const markers = useMemo(() => pins.map((p) => ({ ...p, icon: icons[p.kind] })), [pins]);
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-cream-200 shadow-card">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.icon}
            eventHandlers={onPinClick ? { click: () => onPinClick(m.id) } : {}}
          />
        ))}
        {trail && (
          <Polyline positions={[trail.from, trail.to]} pathOptions={{ color: "#D4A574", weight: 3, dashArray: "6 6" }} />
        )}
      </MapContainer>
    </div>
  );
}
