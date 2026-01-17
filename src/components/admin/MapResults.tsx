import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DestinationResult } from '@/types/poll';
import { COUNTRY_DATA, CONTINENT_DATA, LOCATION_TO_COUNTRY } from '@/lib/geoData';
import { useState, useMemo } from 'react';
import { Map as MapIcon, Globe } from 'lucide-react';

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapResultsProps {
  results: DestinationResult[];
}

export function MapResults({ results }: MapResultsProps) {
  const [zoom, setZoom] = useState(2);

  const MapEvents = () => {
    useMapEvents({
      zoomend: (e) => {
        setZoom(e.target.getZoom());
      },
    });
    return null;
  };

  const mapData = useMemo(() => {
    const countries: Record<string, DestinationResult & { lat: number, lng: number, continent: string }> = {};
    const continents: Record<string, DestinationResult & { lat: number, lng: number }> = {};

    results.forEach(res => {
      const originalName = res.name.toLowerCase().trim();
      // Infer country from city/region if possible
      const countryKey = LOCATION_TO_COUNTRY[originalName] || originalName;
      const geo = COUNTRY_DATA[countryKey];
      
      if (geo) {
        if (!countries[countryKey]) {
          countries[countryKey] = { 
            ...res, 
            name: countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
            lat: geo.lat, 
            lng: geo.lng, 
            continent: geo.continent 
          };
        } else {
          countries[countryKey].totalPoints += res.totalPoints;
          countries[countryKey].firstVotes += res.firstVotes;
          countries[countryKey].secondVotes += res.secondVotes;
          countries[countryKey].thirdVotes += res.thirdVotes;
          res.voters.forEach(v => {
            if (!countries[countryKey].voters.includes(v)) {
              countries[countryKey].voters.push(v);
            }
          });
        }

        const continent = geo.continent;
        if (!continents[continent]) {
          continents[continent] = { 
            name: continent, 
            totalPoints: res.totalPoints, 
            firstVotes: res.firstVotes,
            secondVotes: res.secondVotes,
            thirdVotes: res.thirdVotes,
            voters: [...res.voters],
            lat: CONTINENT_DATA[continent].lat,
            lng: CONTINENT_DATA[continent].lng
          };
        } else {
          continents[continent].totalPoints += res.totalPoints;
          continents[continent].firstVotes += res.firstVotes;
          continents[continent].secondVotes += res.secondVotes;
          continents[continent].thirdVotes += res.thirdVotes;
          res.voters.forEach(v => {
            if (!continents[continent].voters.includes(v)) {
              continents[continent].voters.push(v);
            }
          });
        }
      }
    });

    const sortedCountries = Object.values(countries).sort((a, b) => b.totalPoints - a.totalPoints);
    const totalCountries = sortedCountries.length;

    const getColor = (index: number, total: number) => {
      if (index < 3 && total > 0) return '#22c55e'; // Top 3: Green
      if (index < total / 2) return '#f97316'; // Middle: Orange
      return '#ef4444'; // Bottom: Red
    };

    return {
      countries: sortedCountries.map((c, i) => ({
        ...c,
        color: getColor(i, totalCountries)
      })),
      continents: Object.values(continents)
    };
  }, [results]);

  const showContinents = zoom < 3;
  const currentMarkers = showContinents ? mapData.continents : mapData.countries;

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Destination Map
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          {showContinents ? "Continent View" : "Country View"}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full relative z-0">
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            scrollWheelZoom={true} 
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            {currentMarkers.map((m, i) => {
              const color = (m as any).color || '#3b82f6';
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; items-center; justify-center; color: white; font-size: 10px; font-weight: bold;">${m.totalPoints}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });

              return (
                <Marker key={m.name} position={[m.lat, m.lng]} icon={icon}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-sm border-b pb-1 mb-1">{m.name}</h3>
                      <p className="text-xs">Points: <span className="font-bold">{m.totalPoints}</span></p>
                      <p className="text-xs">Voters: <span className="text-muted-foreground">{m.voters.length}</span></p>
                      {!showContinents && (m as any).continent && (
                        <p className="text-[10px] text-muted-foreground mt-1">{(m as any).continent}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div className="p-4 bg-muted/30 border-t border-border flex justify-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span>Top 3</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f97316]" />
            <span>Middle Tier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span>Bottom Tier</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
            <span>Zoom out to see continent totals</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
