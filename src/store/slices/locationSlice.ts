
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import type { Location } from "@/utils/location";

interface LocationState {
  selectedLocation: Location | null;
  recentLocations: Location[];
  gpsDetectionStatus: "idle" | "loading" | "ready" | "error";
  gpsRequestId: string | null;
  gpsRequestForced: boolean;
  gpsError: string | null;
  manuallySelected: boolean;
}

const initialState: LocationState = {
  selectedLocation: null,
  recentLocations: [],
  gpsDetectionStatus: "idle",
  gpsRequestId: null,
  gpsRequestForced: false,
  gpsError: null,
  manuallySelected: false,
};

const locationSlice = createSlice({
  name: "location",  initialState,
  reducers: {
    beginGpsDetection: (
      state,
      action: PayloadAction<{ requestId: string; force?: boolean }>
    ) => {
      const { requestId, force = false } = action.payload;
      if (!force && state.gpsDetectionStatus !== "idle") {
        return;
      }
      state.gpsDetectionStatus = "loading";
      state.gpsRequestId = requestId;
      state.gpsRequestForced = force;
      state.gpsError = null;
      if (force) {
        state.manuallySelected = false;
      }
    },
    setGpsLocation: (
      state,
      action: PayloadAction<{ requestId: string; location: Location }>
    ) => {
      if (
        state.gpsRequestId !== action.payload.requestId ||
        state.gpsDetectionStatus !== "loading" ||
        (state.manuallySelected && !state.gpsRequestForced)
      ) {
        return;
      }
      state.selectedLocation = action.payload.location;
      state.gpsDetectionStatus = "ready";
      state.gpsRequestId = null;
      state.gpsRequestForced = false;
      state.gpsError = null;
      state.manuallySelected = false;
      addRecentLocation(state, action.payload.location);
    },
    setGpsError: (
      state,
      action: PayloadAction<{ requestId: string; message: string }>
    ) => {
      if (
        state.gpsRequestId !== action.payload.requestId ||
        state.gpsDetectionStatus !== "loading"
      ) {
        return;
      }
      state.gpsDetectionStatus = "error";
      state.gpsRequestId = null;
      state.gpsRequestForced = false;
      state.gpsError = action.payload.message;
    },
    setManualLocation: (state, action: PayloadAction<Location>) => {
      state.selectedLocation = action.payload;
      state.gpsDetectionStatus = "ready";
      state.gpsRequestId = null;
      state.gpsRequestForced = false;
      state.gpsError = null;
      state.manuallySelected = true;
      addRecentLocation(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.gpsDetectionStatus = "idle";
      state.gpsRequestId = null;
      state.gpsRequestForced = false;
      state.gpsError = null;
      state.manuallySelected = false;
    });
  },
});

const addRecentLocation = (state: LocationState, location: Location) => {
  state.recentLocations = [
    location,
    ...state.recentLocations.filter(
      (recent) =>
        recent.latitude !== location.latitude ||
        recent.longitude !== location.longitude
    ),
  ].slice(0, 5);
};

export const {
  beginGpsDetection,
  setGpsError,
  setGpsLocation,
  setManualLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
