import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DestinationResult } from '@/types/poll';
import { COUNTRY_DATA, CONTINENT_DATA, LOCATION_TO_COUNTRY } from '@/lib/geoData';
import { useState, useMemo, useEffect } from 'react';
import { Map as MapIcon, Globe, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

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

    const unidentifiedLocations: Set<string> = new Set();

    results.forEach(res => {
      // Split by comma/slash/semicolon and take the first part
      const locations = res.name.split(/[,/;]/).map(l => l.trim()).filter(Boolean);
      const primaryLocation = locations[0]?.toLowerCase() || '';
      
      // Infer country from city/region if possible
      const countryKey = LOCATION_TO_COUNTRY[primaryLocation] || primaryLocation;
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
      } else if (res.totalPoints > 0) {
        unidentifiedLocations.add(res.name);
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
      continents: Object.values(continents),
      unidentified: Array.from(unidentifiedLocations).sort()
    };
  }, [results]);

  const showContinents = zoom < 3;
  const currentMarkers = showContinents ? mapData.continents : mapData.countries;

  return (
    <Card className={cn(
      "shadow-lg border-0 overflow-hidden transition-all duration-300",
      isFullScreen ? "fixed inset-0 z-[100] rounded-none h-screen w-screen" : ""
    )}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Destination Map
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="h-8 w-8"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-l pl-2">
            <Globe className="h-3 w-3" />
            {showContinents ? "Continent View" : "Country View"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        <div className={cn(
          "relative z-0 w-full transition-all",
          isFullScreen ? "flex-1" : "h-[500px]"
        )}>
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            scrollWheelZoom={true} 
            className="h-full w-full"
            key={isFullScreen ? 'fullscreen' : 'normal'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="http://stamen.com">Stamen Design</a>'
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
            />
            <MapEvents />
            {currentMarkers.map((m, i) => {
              const color = (m as any).color || '#3b82f6';
              // Proportional bubble size: min 24px, max 48px
              const maxPointsOverall = Math.max(...currentMarkers.map(marker => marker.totalPoints), 1);
              const iconSize = 24 + (m.totalPoints / maxPointsOverall) * 24;
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: ${iconSize}px; height: ${iconSize}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: ${Math.max(10, iconSize/3)}px; font-weight: bold;">${m.totalPoints}</div>`,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize/2, iconSize/2],
              });

              return (
                <Marker key={m.name} position={[m.lat, m.lng]} icon={icon}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-sm border-b pb-1 mb-1">{m.name}</h3>
                      <p className="text-xs">Points: <span className="font-bold">{m.totalPoints}</span></p>
                      <p className="text-xs mt-1">Voters: <span className="text-muted-foreground">{m.voters.map(v => v.substring(0, 3)).join(', ')}</span></p>
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
        <div className="p-4 bg-muted/30 border-t border-border flex flex-col gap-3 text-xs">
          <div className="flex justify-center gap-4 flex-wrap">
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
          </div>
          
          {mapData.unidentified.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-muted-foreground font-medium mb-1 uppercase tracking-wider text-[10px]">Unidentified Locations:</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground italic">
                {mapData.unidentified.map(loc => (
                  <span key={loc}>{loc}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
