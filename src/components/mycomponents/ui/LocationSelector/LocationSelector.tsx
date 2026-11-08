import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, LoaderCircle, LocateFixed, MapPin } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AppDispatch, RootState } from "@/store/store";
import {
  beginGpsDetection,
  setGpsError,
  setGpsLocation,
} from "@/store/slices/locationSlice";
import {
  createLocationRequestId,
  getLocationLabel,
  reverseGeocode,
} from "../../../../utils/location";

const LocationSelector = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedLocation, gpsDetectionStatus, gpsError } = useSelector(
    (state: RootState) => state.location
  );

  const [open, setOpen] = useState(false);
  const activeRequestId = useRef<string | null>(null);
  const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimeout.current !== null) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
  }, []);

  const handlePointerEnter = useCallback(
    (pointerType: string) => {
      if (pointerType === "mouse" || pointerType === "pen") {
        cancelHoverClose();
        setOpen(true);
      }
    },
    [cancelHoverClose]
  );

  const handlePointerLeave = useCallback(() => {
    cancelHoverClose();
    hoverCloseTimeout.current = setTimeout(() => {
      setOpen(false);
      hoverCloseTimeout.current = null;
    }, 180);
  }, [cancelHoverClose]);

  const fetchExactLocation = useCallback(() => {
    const requestId = createLocationRequestId();
    activeRequestId.current = requestId;
    dispatch(beginGpsDetection({ requestId, force: true }));

    if (!navigator.geolocation) {
      dispatch(
        setGpsError({
          requestId,
          message: "Aapke browser me location support nahi hai.",
        })
      );
      return;
    }

    const onLocationSuccess = async (position: GeolocationPosition) => {
      if (activeRequestId.current !== requestId) return;
      const { latitude, longitude } = position.coords;

      try {
        const details = await reverseGeocode(latitude, longitude);
        if (activeRequestId.current === requestId) {
          activeRequestId.current = null;
          dispatch(setGpsLocation({ requestId, location: details }));
        }
      } catch {
        if (activeRequestId.current === requestId) {
          dispatch(
            setGpsError({
              requestId,
              message: "Address identify karne me dikkat aayi.",
            })
          );
        }
      }
    };

    // 1st Attempt: High Accuracy (Mobile/Fast GPS)
    navigator.geolocation.getCurrentPosition(onLocationSuccess,
      () => {
        // 2nd Attempt: Low Accuracy (Laptop/Desktop Wi-Fi Fallback)
        navigator.geolocation.getCurrentPosition(
          onLocationSuccess,
          (err) => {
            activeRequestId.current = null;
            dispatch(
              setGpsError({
                requestId,
                message:
                  err.code === 1
                    ? "Browser me location allow karein."
                    : "Location fetch nahi ho payi.",
              })
            );
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [dispatch]);

  // Page khulte hi auto-fetch chalega
  useEffect(() => {
    if (!selectedLocation && gpsDetectionStatus === "idle") {
      fetchExactLocation();
    }
  }, [selectedLocation, gpsDetectionStatus, fetchExactLocation]);

  useEffect(
    () => () => {
      cancelHoverClose();
    },
    [cancelHoverClose]
  );

  const frontLabel =  selectedLocation ? getLocationLabel(selectedLocation) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
        onPointerLeave={handlePointerLeave}
        className="group/location inline-flex max-w-full items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-2 py-1.5 text-left shadow-sm transition-colors hover:border-violet-300 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:hover:border-violet-700"
        aria-label={`Current location: ${gpsDetectionStatus === "loading" ? "Fetching location" : frontLabel || "Choose location"}. Hover or activate to view details.`}
      >
        <span className="relative flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white dark:bg-violet-500">
          {gpsDetectionStatus === "loading" ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <MapPin size={14} aria-hidden="true" />
          )}
        </span>
        <span className="max-w-[150px] truncate text-xs font-semibold text-foreground sm:max-w-[180px]">
          {gpsDetectionStatus === "loading"
            ? "Finding location…"
            : frontLabel || "Choose location"}
        </span>
        <ChevronDown
          size={13}
          className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/location:rotate-180"
          aria-hidden="true"
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
        onPointerLeave={handlePointerLeave}
        className="w-[min(19rem,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-xl border border-border/70 bg-popover p-0 shadow-xl shadow-black/10 ring-1 ring-foreground/5 dark:shadow-black/40"
      >


        {/* Current Location Display Card */}
        {selectedLocation && (
          <div className="mx-2.5 mt-2.5 rounded-lg border border-border/70 bg-card p-2.5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <MapPin size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="size-1 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                  {selectedLocation.city || selectedLocation.state || selectedLocation.country || "Selected place"}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {[selectedLocation.state, selectedLocation.pincode]
                    .filter(Boolean)
                    .join(" · ") || selectedLocation.country}
                </p>
              </div>
            </div>

          </div>
        )}

        {gpsError && (
          <div
            role="status"
            className="mx-2.5 mt-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-[11px] leading-relaxed text-destructive"
          >
            {gpsError}
          </div>
        )}

        {!selectedLocation && gpsDetectionStatus !== "loading" && !gpsError && (
          <div className="mx-2.5 mt-2.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center">
            <span className="mx-auto flex size-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <MapPin size={15} aria-hidden="true" />
            </span>
            <p className="mt-2 text-xs font-medium text-foreground">
              No location selected
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Find your current location to get started.
            </p>
          </div>
        )}

        {/* Quick Refresh Button */}
        <button
          type="button"
          onClick={() => fetchExactLocation()}
          disabled={gpsDetectionStatus === "loading"}
          className="mx-2.5 mb-2.5 mt-2.5 flex w-[calc(100%-1.25rem)] items-center justify-center gap-2 rounded-lg bg-violet-600 px-2.5 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {gpsDetectionStatus === "loading" ? (
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed size={16} aria-hidden="true" />
          )}
          <span>
            {gpsDetectionStatus === "loading" ? "Finding your location…" : selectedLocation ? "Refresh  location" : "Use current location"}
          </span>
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default LocationSelector;