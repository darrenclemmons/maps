import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';

interface Location {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	tooltip: string;
	category: string;
	image1: string;
	image2: string;
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
	const mapRef = useRef<google.maps.Map | null>(null);

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

	const onMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		google.maps.event.addListener(map, 'click', () => {
			setSelectedLocation(null);
		});
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
				onLoad={onMapLoad}
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
						options={{
							maxWidth: 512
						}}
					>
						<div className="p-4 w-[512px]">
							<h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
							<p className="mb-3">{selectedLocation.tooltip}</p>
							<div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
								<Image 
									src={selectedLocation.image1}
									alt={`${selectedLocation.name} - Image 1`}
									width={230}
									height={230}
									style={{ objectFit: 'cover' }}
								/>
								<Image 
									src={selectedLocation.image2}
									alt={`${selectedLocation.name} - Image 2`}
									width={230}
									height={230}
									style={{ objectFit: 'cover' }}
								/>
							</div>
						</div>
					</InfoWindow>
				)}
			</GoogleMap>
		</LoadScript>
	);
};

export default MapComponent;