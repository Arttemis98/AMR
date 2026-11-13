import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Activity, AlertTriangle, Droplets, Building2, ChevronRight, FileText } from 'lucide-react';
import { geoMercator, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { AMRReport } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { subscribePublicReports } from '../services/irisFirestore';

interface IndiaStateFeature {
  type: 'Feature';
  properties?: {
    ST_NM?: string;
    NAME_1?: string;
    name?: string;
    [key: string]: unknown;
  };
  geometry: GeoPermissibleObjects;
}

interface IndiaStatesGeoJSON {
  type: 'FeatureCollection';
  features: IndiaStateFeature[];
}

interface MapMarkerItem {
  key: string;
  city: string;
  state: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  organism: string;
  lat: number;
  lng: number;
  isLive: boolean;
  siteName?: string;
  report?: AMRReport;
}

const BASELINE_REPORTS: (AMRReport & { isSample?: boolean })[] = [
  { id: 'R-101', location: { state: 'Gujarat', city: 'Vadodara', siteName: 'Muni. WWTP A' }, date: '2024-05-12', source: 'WWTP', dataType: 'RNA_SEQ', organism: 'P. aeruginosa', resistanceFlag: 'HIGH', summary: 'Chlorine-induced multidrug resistance', submittedBy: 'IRIS Reference Network', isSample: true },
  { id: 'R-102', location: { state: 'Gujarat', city: 'Anand', siteName: 'Civil Hospital' }, date: '2024-05-10', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'K. pneumoniae', resistanceFlag: 'HIGH', summary: 'Carbapenem resistant isolate', submittedBy: 'IRIS Reference Network', isSample: true },
  { id: 'R-103', location: { state: 'Maharashtra', city: 'Mumbai', siteName: 'Mithi River' }, date: '2024-05-08', source: 'RIVER', dataType: 'PCR', organism: 'E. coli', resistanceFlag: 'MEDIUM', summary: 'blaNDM-1 gene detected', submittedBy: 'IRIS Reference Network', isSample: true },
  { id: 'R-104', location: { state: 'Karnataka', city: 'Bengaluru', siteName: 'Lake Bellandur' }, date: '2024-05-05', source: 'RIVER', dataType: 'WGS', organism: 'A. baumannii', resistanceFlag: 'HIGH', summary: 'Extensively drug resistant', submittedBy: 'IRIS Reference Network', isSample: true },
  { id: 'R-105', location: { state: 'Delhi', city: 'New Delhi', siteName: 'AIIMS' }, date: '2024-05-01', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'S. aureus', resistanceFlag: 'LOW', summary: 'MRSA screening positive', submittedBy: 'IRIS Reference Network', isSample: true },
];

const MAP_LOCATIONS: Array<{
  id: number;
  lat: number;
  lng: number;
  city: string;
  state: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  organism: string;
}> = [
  { id: 1, lat: 22.31, lng: 73.18, city: 'Vadodara', state: 'Gujarat', risk: 'CRITICAL', organism: 'P. aeruginosa' },
  { id: 5, lat: 23.02, lng: 72.57, city: 'Ahmedabad', state: 'Gujarat', risk: 'HIGH', organism: 'K. pneumoniae' },
  { id: 16, lat: 22.30, lng: 70.80, city: 'Rajkot', state: 'Gujarat', risk: 'MEDIUM', organism: 'E. coli' },
  { id: 2, lat: 28.61, lng: 77.21, city: 'New Delhi', state: 'Delhi', risk: 'LOW', organism: 'S. aureus' },
  { id: 15, lat: 30.73, lng: 76.78, city: 'Chandigarh', state: 'Punjab', risk: 'HIGH', organism: 'P. aeruginosa' },
  { id: 9, lat: 26.91, lng: 75.79, city: 'Jaipur', state: 'Rajasthan', risk: 'HIGH', organism: 'MRSA' },
  { id: 10, lat: 26.85, lng: 80.95, city: 'Lucknow', state: 'Uttar Pradesh', risk: 'HIGH', organism: 'E. coli (ESBL)' },
  { id: 3, lat: 19.08, lng: 72.88, city: 'Mumbai', state: 'Maharashtra', risk: 'MEDIUM', organism: 'E. coli' },
  { id: 12, lat: 18.52, lng: 73.86, city: 'Pune', state: 'Maharashtra', risk: 'HIGH', organism: 'A. baumannii' },
  { id: 13, lat: 23.26, lng: 77.41, city: 'Bhopal', state: 'Madhya Pradesh', risk: 'LOW', organism: 'Salmonella' },
  { id: 4, lat: 12.97, lng: 77.59, city: 'Bengaluru', state: 'Karnataka', risk: 'HIGH', organism: 'A. baumannii' },
  { id: 6, lat: 13.08, lng: 80.27, city: 'Chennai', state: 'Tamil Nadu', risk: 'CRITICAL', organism: 'C. auris' },
  { id: 7, lat: 17.39, lng: 78.49, city: 'Hyderabad', state: 'Telangana', risk: 'HIGH', organism: 'A. baumannii' },
  { id: 11, lat: 9.93, lng: 76.27, city: 'Kochi', state: 'Kerala', risk: 'CRITICAL', organism: 'K. pneumoniae' },
  { id: 8, lat: 22.57, lng: 88.36, city: 'Kolkata', state: 'West Bengal', risk: 'MEDIUM', organism: 'V. cholerae' },
  { id: 14, lat: 26.14, lng: 91.74, city: 'Guwahati', state: 'Assam', risk: 'MEDIUM', organism: 'Shigella' },
];

const getRiskMarkerColor = (risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): string => {
  if (risk === 'CRITICAL' || risk === 'HIGH') return '#e11d48';
  if (risk === 'MEDIUM') return '#f59e0b';
  return '#16a34a';
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

const NationalOverview: React.FC<{ onSelectReport: (r: AMRReport) => void }> = ({ onSelectReport }) => {
  const [liveReports, setLiveReports] = useState<AMRReport[]>([]);
  const [showAll, setShowAll] = useState(false);

  // India GeoJSON map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [indiaGeoJson, setIndiaGeoJson] = useState<IndiaStatesGeoJSON | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({ width: 450, height: 500 });
  const [hoveredState, setHoveredState] = useState<{ name: string; x: number; y: number } | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<{ marker: MapMarkerItem; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePublicReports(
      (items) => setLiveReports(items),
      () => {
        // Keep liveReports empty if unavailable
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setMapLoading(true);
    setMapError(null);

    fetch('/india-states.json', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load map boundaries (HTTP ${res.status})`);
        }
        return res.json() as Promise<IndiaStatesGeoJSON>;
      })
      .then((data) => {
        if (!data || !Array.isArray(data.features)) {
          throw new Error('Invalid India GeoJSON map data.');
        }
        setIndiaGeoJson(data);
        setMapLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Error loading India states GeoJSON:', err);
        setMapError('Unable to load India map boundaries. Please refresh the page.');
        setMapLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateSize = (width: number, height: number) => {
      const nextW = Math.max(240, Math.round(width));
      const nextH = Math.max(266, Math.round(height));
      setMapSize((prev) => (prev.width === nextW && prev.height === nextH ? prev : { width: nextW, height: nextH }));
    };

    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      updateSize(rect.width, rect.height);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          updateSize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { projection, statePaths } = useMemo(() => {
    if (!indiaGeoJson || mapSize.width <= 0 || mapSize.height <= 0) {
      return { projection: null, statePaths: [] as Array<{ id: string; name: string; d: string }> };
    }

    const proj = geoMercator().fitSize(
      [mapSize.width, mapSize.height],
      indiaGeoJson as unknown as GeoPermissibleObjects
    );
    const pathGenerator = geoPath().projection(proj);

    const paths = indiaGeoJson.features.map((feature, idx) => {
      const stateName = String(
        feature.properties?.ST_NM ||
        feature.properties?.NAME_1 ||
        feature.properties?.name ||
        `Region ${idx + 1}`
      );
      const d = pathGenerator(feature as unknown as GeoPermissibleObjects) || '';
      return {
        id: `${stateName}-${idx}`,
        name: stateName,
        d,
      };
    });

    return { projection: proj, statePaths: paths };
  }, [indiaGeoJson, mapSize.width, mapSize.height]);

  const projectedMarkers = useMemo(() => {
    if (!projection) return [] as Array<{ marker: MapMarkerItem; cx: number; cy: number }>;

    const referenceMarkers: MapMarkerItem[] = MAP_LOCATIONS.map((loc) => ({
      key: `ref-${loc.id}`,
      city: loc.city,
      state: loc.state,
      risk: loc.risk,
      organism: loc.organism,
      lat: loc.lat,
      lng: loc.lng,
      isLive: false,
    }));

    const liveMarkers: MapMarkerItem[] = liveReports.reduce<MapMarkerItem[]>((acc, report) => {
      const latStr = report.latitude?.trim();
      const lngStr = report.longitude?.trim();
      if (!latStr || !lngStr) return acc;

      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180 ||
        (lat === 0 && lng === 0)
      ) {
        return acc;
      }

      acc.push({
        key: `live-${report.id}`,
        city: report.location.city || 'Reported Site',
        state: report.location.state || 'India',
        risk: report.resistanceFlag,
        organism: report.organism,
        lat,
        lng,
        isLive: true,
        siteName: report.location.siteName,
        report,
      });
      return acc;
    }, []);

    return [...referenceMarkers, ...liveMarkers].reduce<Array<{ marker: MapMarkerItem; cx: number; cy: number }>>(
      (acc, marker) => {
        const coords = projection([marker.lng, marker.lat]);
        if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
          return acc;
        }
        acc.push({ marker, cx: coords[0], cy: coords[1] });
        return acc;
      },
      []
    );
  }, [projection, liveReports]);

  const combinedReports: (AMRReport & { isSample?: boolean })[] = useMemo(() => {
    const seen = new Set(liveReports.map((r) => r.id));
    return [...liveReports, ...BASELINE_REPORTS.filter((r) => !seen.has(r.id))];
  }, [liveReports]);

  const displayedReports = showAll ? combinedReports : combinedReports.slice(0, 6);

  const totalCount = liveReports.length;
  const highRiskCount = liveReports.filter((r) => r.resistanceFlag === 'HIGH').length;
  const mediumRiskCount = liveReports.filter((r) => r.resistanceFlag === 'MEDIUM').length;
  const lowRiskCount = liveReports.filter((r) => r.resistanceFlag === 'LOW').length;
  const envCount = liveReports.filter((r) => ['WWTP', 'RIVER', 'SOIL'].includes(r.source)).length;
  const contributingLabsCount = useMemo(() => {
    const labs = new Set(
      liveReports
        .map((r) => (r.submittedByInstitute || r.submittedBy || '').trim())
        .filter(Boolean)
    );
    return labs.size;
  }, [liveReports]);

  const sourceData = useMemo(() => {
    const clinicalLive = liveReports.filter((r) => r.source === 'CLINICAL' || r.source === 'LIVESTOCK').length;
    const wwtpLive = liveReports.filter((r) => r.source === 'WWTP').length;
    const envLive = liveReports.filter((r) => r.source === 'RIVER' || r.source === 'SOIL').length;
    const total = liveReports.length;
    if (total === 0) {
      return [
        { name: 'Clinical', value: 0 },
        { name: 'Wastewater', value: 0 },
        { name: 'Environmental', value: 0 },
      ];
    }
    return [
      { name: 'Clinical', value: Math.round((clinicalLive / total) * 100) },
      { name: 'Wastewater', value: Math.round((wwtpLive / total) * 100) },
      { name: 'Environmental', value: Math.round((envLive / total) * 100) },
    ];
  }, [liveReports]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP METRICS (Computed strictly from live approved Firestore reports) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Approved Public Reports</h3>
            <Activity className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">High Risk Alerts</h3>
            <AlertTriangle className="text-rose-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{highRiskCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Contributing Labs</h3>
            <Building2 className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{contributingLabsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Env. Samples</h3>
            <Droplets className="text-teal-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{envCount}</p>
        </div>
      </div>

      {/* 2. MAP & PIE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <MapPin className="mr-2 text-blue-600" size={20} />
              Surveillance Map: Resistance Hotspots
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Reference/sample data
            </span>
          </div>

          <div className="w-full flex justify-center bg-slate-50 rounded-xl border border-slate-100 py-4 px-2">
            <div ref={mapContainerRef} className="relative w-full max-w-[540px] aspect-[0.9]">
              {mapLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-slate-100/80 animate-pulse border border-slate-200">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin mb-3"></div>
                  <p className="text-xs font-medium text-slate-500">Loading India surveillance map…</p>
                </div>
              )}

              {!mapLoading && mapError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-rose-50 border border-rose-200 p-6 text-center">
                  <AlertTriangle className="text-rose-600 mb-2" size={24} />
                  <p className="text-sm font-semibold text-rose-800">{mapError}</p>
                </div>
              )}

              {!mapLoading && !mapError && indiaGeoJson && (
                <>
                  <svg
                    viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 w-full h-full overflow-visible"
                    aria-label="India Surveillance Map"
                  >
                    <g>
                      {statePaths.map((state) => {
                        const isHovered = hoveredState?.name === state.name;
                        return (
                          <path
                            key={state.id}
                            d={state.d}
                            fill={isHovered ? '#94a3b8' : '#cbd5e1'}
                            stroke="#ffffff"
                            strokeWidth={0.8}
                            strokeLinejoin="round"
                            opacity={1}
                            className="transition-colors duration-150 cursor-pointer"
                            onMouseMove={(e) => {
                              const rect = mapContainerRef.current?.getBoundingClientRect();
                              if (!rect) return;
                              setHoveredState({
                                name: state.name,
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                              });
                            }}
                            onMouseLeave={() => {
                              setHoveredState((prev) => (prev?.name === state.name ? null : prev));
                            }}
                          />
                        );
                      })}
                    </g>

                    <g>
                      {projectedMarkers.map(({ marker, cx, cy }) => {
                        const fillColor = getRiskMarkerColor(marker.risk);
                        const isUrgent = marker.risk === 'CRITICAL' || marker.risk === 'HIGH';
                        const isHovered = hoveredMarker?.marker.key === marker.key;
                        return (
                          <g
                            key={marker.key}
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              setHoveredState(null);
                              setHoveredMarker({ marker, cx, cy });
                            }}
                            onMouseLeave={() => {
                              setHoveredMarker((prev) => (prev?.marker.key === marker.key ? null : prev));
                            }}
                            onClick={() => {
                              if (marker.report) {
                                onSelectReport(marker.report);
                              }
                            }}
                          >
                            {isUrgent && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill={fillColor}
                                opacity={0.45}
                                pointerEvents="none"
                              >
                                <animate
                                  attributeName="r"
                                  from="5"
                                  to="15"
                                  dur="1.8s"
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  from="0.55"
                                  to="0"
                                  dur="1.8s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            )}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isHovered ? 7 : marker.isLive ? 5.5 : 4.5}
                              fill={fillColor}
                              stroke="#ffffff"
                              strokeWidth={1.8}
                            />
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* State Name Hover Tooltip */}
                  {hoveredState && !hoveredMarker && (
                    <div
                      className="absolute z-40 pointer-events-none bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap"
                      style={{
                        left: `${Math.min(Math.max(hoveredState.x, 48), mapSize.width - 48)}px`,
                        top: `${Math.max(hoveredState.y, 28)}px`,
                      }}
                    >
                      {hoveredState.name}
                    </div>
                  )}

                  {/* Marker Hover Tooltip */}
                  {hoveredMarker && (
                    <div
                      className="absolute z-50 pointer-events-none bg-slate-900 text-white p-3 rounded-lg shadow-xl w-52 -translate-x-1/2 -translate-y-full -mt-3"
                      style={{
                        left: `${(hoveredMarker.cx / mapSize.width) * 100}%`,
                        top: `${(hoveredMarker.cy / mapSize.height) * 100}%`,
                      }}
                    >
                      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold">{hoveredMarker.marker.city}</p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 ${
                            hoveredMarker.marker.risk === 'CRITICAL' || hoveredMarker.marker.risk === 'HIGH'
                              ? 'bg-rose-500 text-white'
                              : hoveredMarker.marker.risk === 'MEDIUM'
                              ? 'bg-amber-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {hoveredMarker.marker.risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium mb-1">{hoveredMarker.marker.organism}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                        {hoveredMarker.marker.state} ·{' '}
                        {hoveredMarker.marker.isLive ? 'Live approved report' : 'Reference/sample data'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-4">Sample Sources (Live Reports)</h3>
          <div className="h-48 shrink-0 flex items-center justify-center">
            {liveReports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 px-4">
                No approved public reports submitted yet. Chart updates automatically as reports are approved.
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4 mb-6">
            {sourceData.map((entry, index) => (
              <div key={index} className="flex justify-between text-sm items-center p-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-slate-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-800">{entry.value}%</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Distribution (Live)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm p-1">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> High / Critical</span>
                <span className="font-bold text-slate-800">{highRiskCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium</span>
                <span className="font-bold text-slate-800">{mediumRiskCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Low / Surveillance</span>
                <span className="font-bold text-slate-800">{lowRiskCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT REPORTS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> Approved &amp; Reference Reports
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {liveReports.length} live · {BASELINE_REPORTS.length} Reference/sample data
            </span>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            {showAll ? 'Show Less' : `View All (${combinedReports.length})`}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Report ID</th>
                <th className="p-4">Location</th>
                <th className="p-4">Organism</th>
                <th className="p-4">Data Type</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-left w-40">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="p-4 pl-6 font-mono font-medium text-slate-600">
                    <div>{report.id}</div>
                    {report.isSample && (
                      <span className="inline-block mt-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Reference/sample data
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{report.location.city}</div>
                    <div className="text-xs text-slate-500">{report.location.siteName}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-700 italic">{report.organism}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                      {report.dataType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      report.resistanceFlag === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                      report.resistanceFlag === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {report.resistanceFlag}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onSelectReport(report)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center w-full gap-2"
                    >
                      View Report <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default NationalOverview;