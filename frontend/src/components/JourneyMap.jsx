import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Custom icon builders ───────────────────────────────────
function createSvgIcon(emoji, color, size = 36) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;
      line-height:1;
    ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const COLLECTOR_ICON = createSvgIcon('🌿', '#2E7D32');
const LAB_ICON = createSvgIcon('🔬', '#1565C0');
const FACTORY_ICON = createSvgIcon('🏭', '#E65100');
const DESTINATION_ICON = createSvgIcon('🏪', '#00838F');

function createTruckIcon() {
  return L.divIcon({
    html: `<div style="
      width:32px;height:32px;
      border-radius:50%;
      background:#FFF;
      border:2px solid #1B5E20;
      box-shadow:0 2px 12px rgba(27,94,32,0.5);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      line-height:1;
      animation: truckerPulse 1.2s ease-in-out infinite;
    ">🚛</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ── Interpolate between two coords ─────────────────────────
function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// ── Auto-fit map bounds ────────────────────────────────────
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [positions, map]);
  return null;
}

// ── Animated Truck Marker ──────────────────────────────────
function AnimatedTruck({ waypoints }) {
  const [position, setPosition] = useState(waypoints[0]);
  const progressRef = useRef(0);
  const segmentRef = useRef(0);

  useEffect(() => {
    if (waypoints.length < 2) return;
    const speed = 0.008; // controls animation speed
    let animFrame;

    function animate() {
      progressRef.current += speed;

      if (progressRef.current >= 1) {
        progressRef.current = 0;
        segmentRef.current = (segmentRef.current + 1) % (waypoints.length - 1);
      }

      const from = waypoints[segmentRef.current];
      const to = waypoints[segmentRef.current + 1];
      const pos = lerp(from, to, progressRef.current);
      setPosition(pos);

      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [waypoints]);

  return <Marker position={position} icon={createTruckIcon()} />;
}

// ── Main Component ─────────────────────────────────────────
export default function JourneyMap({ product }) {
  // Build waypoints from product data
  const waypoints = useMemo(() => {
    if (!product) return [];

    const points = [];

    // 1. Collector locations (all ingredient origins)
    product.ingredients.forEach((ing) => {
      points.push({
        lat: ing.gps_lat,
        lng: ing.gps_lng,
        label: `${ing.herb_name} — ${ing.collector_name}`,
        sublabel: ing.gps_place_name,
        type: 'collector',
      });
    });

    // 2. Lab location
    if (product.lab_location) {
      points.push({
        lat: product.lab_location.lat,
        lng: product.lab_location.lng,
        label: 'Lab Testing Facility',
        sublabel: product.lab_location.name,
        type: 'lab',
      });
    }

    // 3. Manufacturer location
    if (product.manufacturer_location) {
      points.push({
        lat: product.manufacturer_location.lat,
        lng: product.manufacturer_location.lng,
        label: 'Manufacturing Unit',
        sublabel: product.manufacturer_location.name,
        type: 'manufacturer',
      });
    }

    // 4. Final Destination
    if (product.destination_location) {
      points.push({
        lat: product.destination_location.lat,
        lng: product.destination_location.lng,
        label: 'Final Destination',
        sublabel: product.destination_location.name,
        type: 'destination',
      });
    }

    return points;
  }, [product]);

  const positions = waypoints.map((wp) => [wp.lat, wp.lng]);

  // Polyline segments (collector(s) → lab → manufacturer)
  const routeSegments = useMemo(() => {
    if (positions.length < 2) return [];
    // Connect all points in order
    return positions;
  }, [positions]);

  const getIcon = (type) => {
    switch (type) {
      case 'lab':
        return LAB_ICON;
      case 'manufacturer':
        return FACTORY_ICON;
      case 'destination':
        return DESTINATION_ICON;
      default:
        return COLLECTOR_ICON;
    }
  };

  if (waypoints.length === 0) return null;

  // Default center on south India
  const center = [12.5, 78.5];

  return (
    <div className="journey-map-wrapper">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={positions} />

        {/* Route line — dashed */}
        {routeSegments.length >= 2 && (
          <Polyline
            positions={routeSegments}
            pathOptions={{
              color: '#1B5E20',
              weight: 3,
              dashArray: '10, 8',
              opacity: 0.7,
            }}
          />
        )}

        {/* Waypoint markers */}
        {waypoints.map((wp, idx) => (
          <Marker key={idx} position={[wp.lat, wp.lng]} icon={getIcon(wp.type)}>
            <Popup>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '2px 0' }}>
                <strong style={{ fontSize: '13px', color: '#1B5E20' }}>{wp.label}</strong>
                <br />
                <span style={{ fontSize: '11px', color: '#666' }}>{wp.sublabel}</span>
                <br />
                <span style={{
                  fontSize: '10px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {wp.type === 'collector' ? 'Collection Point' : 
                   wp.type === 'lab' ? 'Lab Facility' : 
                   wp.type === 'manufacturer' ? 'Manufacturer' : 'Retail Destination'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Animated truck */}
        {positions.length >= 2 && <AnimatedTruck waypoints={positions} />}
      </MapContainer>

      {/* Legend */}
      <div className="journey-map-legend" style={{ flexWrap: 'wrap' }}>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#2E7D32' }}>🌿</span>
          <span>Collector</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#1565C0' }}>🔬</span>
          <span>Lab</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#E65100' }}>🏭</span>
          <span>Manufacturer</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#00838F' }}>🏪</span>
          <span>Destination</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#fff', border: '2px solid #1B5E20' }}>🚛</span>
          <span>In Transit</span>
        </div>
      </div>
    </div>
  );
}
