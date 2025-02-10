import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  tooltip: string;
  category: string;
}

interface MapSettings {
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  styles: {
    marker: {
      [key: string]: string;
    };
  };
}

interface MapData {
  locations: Location[];
  mapSettings: MapSettings;
}

const MapComponent = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/data/locations.json');
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error loading location data:', error);
      }
    };

    fetchLocations();
  }, []);

  if (!mapData) return <div>Loading...</div>;

  const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapData.mapSettings.defaultCenter}
        zoom={mapData.mapSettings.defaultZoom}
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          mapTypeId: 'satellite'
        }}
        mapTypeId="satellite"
      >
        {mapData.locations.map((location) => (
          <Marker
            key={location.id}
            position={{
              lat: location.latitude,
              lng: location.longitude,
            }}
            onClick={() => setSelectedLocation(location)}
            label={{
              text: "●",
              color: mapData.mapSettings.styles.marker[location.category],
              fontSize: "20px"
            }}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={{
              lat: selectedLocation.latitude,
              lng: selectedLocation.longitude,
            }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedLocation.name}</h3>
              <p>{selectedLocation.tooltip}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;