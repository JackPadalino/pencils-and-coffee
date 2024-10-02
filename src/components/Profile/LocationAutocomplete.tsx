/** Google Maps autocomplete component - was previously being
 * used in the EditProfileModal component for user profile - NOT IN USE
 */

import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  //   ControlPosition,
  //   MapControl,
  //   AdvancedMarker,
  //   Map,
  //   useMap,
  useMapsLibrary,
  //   useAdvancedMarkerRef,
  //   AdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

import { Input } from "@chakra-ui/react";

type LocationInputProps = {
  currentLocation: any;
};

// Google maps autocomplete location input - this component uses
// the Google Maps API to create an autocomplete input. As the user
// types their location, Google Maps displays suggested locations
const LocationAutocomplete = ({ currentLocation }: LocationInputProps) => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY!}>
      <PlaceAutocomplete currentLocation={currentLocation} />
    </APIProvider>
  );
};

// need to add logic to verify the selected location (from the user)
// is a real place inside the US
const PlaceAutocomplete = ({ currentLocation }: LocationInputProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      setSelectedPlace(placeAutocomplete.getPlace());
    });
  }, [placeAutocomplete]);

  // validating the location is both a city and located in the US
  useEffect(() => {
    const validateLocation = async () => {
      if (!selectedPlace || !selectedPlace.formatted_address) return;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            selectedPlace.formatted_address
          )}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
        );

        const data = await response.json();
        const results = data.results;

        if (results.length > 0) {
          const locationType = results[0].types;
          if (locationType.includes("locality")) {
            const addressComponents = results[0].address_components;
            const country =
              addressComponents[addressComponents.length - 1].short_name;
            if (country === "US") {
              console.log("Location is in United States.");
            } else {
              console.log("Location is not in the United States.");
            }
          } else {
            console.log("Sorry. This is not a city.");
          }
          return;
        }
      } catch (error) {
        console.error("Error validating city:", error);
      }
    };
    validateLocation();
  }, [selectedPlace]);

  return <Input ref={inputRef} defaultValue={currentLocation} />;
};

export default LocationAutocomplete;
