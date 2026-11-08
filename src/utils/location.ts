export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  pincode: string;
  formattedAddress: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null && !Array.isArray(val);

// Indian addresses ke liye city/locality extract karne ka priority order
const extractLocalArea = (addr: Record<string, unknown>): string => {
  const priorityKeys = [
    "suburb",
    "neighbourhood",
    "residential",
    "city",
    "town",
    "state_district", // Bulandshahr / Gautam Buddha Nagar aksar yahan aata hai
    "district",
    "county",
    "municipality",
    "village"
  ];

  for (const key of priorityKeys) {
    const val = addr[key];
    if (typeof val === "string" && val.trim()) {
      return val.trim();
    }
  }
  return "";
};

export const parseNominatimData = (data: any, lat: number, lon: number): Location => {
  const addr = isRecord(data?.address) ? data.address : {};

  // Exact city ya area ka naam
  const detectedArea = extractLocalArea(addr);
  const state = typeof addr.state === "string" ? addr.state : "";
  const country = typeof addr.country === "string" ? addr.country : "India";
  const pincode = typeof addr.postcode === "string" ? addr.postcode : "";
  const rawDisplayName = typeof data?.display_name === "string" ? data.display_name : "";

  // Front pe dikhane ke liye clean display string
  const cleanFormatted = [detectedArea, state, country].filter(Boolean).join(", ");

  return {
    latitude: lat,
    longitude: lon,
    city: detectedArea || "Unknown Location",
    state,
    country,
    pincode,
    formattedAddress: rawDisplayName || cleanFormatted,
  };
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<Location> => {
  try {
    const url = new URL(`${NOMINATIM_URL}/reverse`);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "16"); // City/Town level accuracy

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "LocationAppIndianCities/1.0",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return parseNominatimData(data, latitude, longitude);
    }
  } catch (err) {
    console.error("Nominatim reverse geocode error:", err);
  }

  // Fallback direct coordinate string agar API down ho
  return {
    latitude,
    longitude,
    city: "Current Location",
    state: "",
    country: "India",
    pincode: "",
    formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
  };
};

export const getLocationLabel = (location: Location | null): string => {
  if (!location) return "";
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.city || location.formattedAddress || "Selected Location";
};

export const createLocationRequestId = (): string => `${Date.now()}`;