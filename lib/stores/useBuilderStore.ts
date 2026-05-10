import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { format, differenceInDays } from "date-fns";

export type ActivityData = {
  id: string;
  activityName: string;
  description: string | null;
  duration: number;
  cost: number;
  scheduledDay: number | null;
  scheduledTime: string | null;
};

export type TransportSegmentData = {
  id: string;
  fromStopId: string;
  toStopId: string;
  mode: string;
  duration: number | null;
  cost: number | null;
};

export type StopData = {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  hotelName: string | null;
  hotelAddress: string | null;
  stayCost: number | null;
  transportCost: number | null;
  miscCost: number | null;
  activities: ActivityData[];
};

export type BuilderState = {
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  budgetLimit: number | null;
  stops: StopData[];
  transportSegments: TransportSegmentData[];
  isLoading: boolean;
  warnings: string[];
  
  // Actions
  initialize: (data: any) => void;
  reorderStops: (activeId: string, overId: string) => void;
  updateStop: (stopId: string, updates: Partial<StopData>) => void;
  addActivity: (stopId: string, activity: ActivityData) => void;
  validateItinerary: () => void;
};

export const useBuilderStore = create<BuilderState>()(
  devtools((set, get) => ({
    tripId: "",
    tripName: "",
    startDate: "",
    endDate: "",
    budgetLimit: null,
    stops: [],
    transportSegments: [],
    isLoading: true,
    warnings: [],

    initialize: (data) => {
      set({
        tripId: data.id,
        tripName: data.tripName,
        startDate: data.startDate,
        endDate: data.endDate,
        budgetLimit: data.budgetLimit,
        stops: data.stops.map((s: any) => ({
          ...s,
          arrivalDate: s.arrivalDate,
          departureDate: s.departureDate,
        })),
        transportSegments: data.transportSegments || [],
        isLoading: false,
      });
      get().validateItinerary();
    },

    reorderStops: (activeId, overId) => {
      set((state) => {
        const oldIndex = state.stops.findIndex((s) => s.id === activeId);
        const newIndex = state.stops.findIndex((s) => s.id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return state;

        const newStops = [...state.stops];
        const [moved] = newStops.splice(oldIndex, 1);
        newStops.splice(newIndex, 0, moved);

        return { stops: newStops };
      });
      get().validateItinerary();
    },

    updateStop: (stopId, updates) => {
      set((state) => ({
        stops: state.stops.map((stop) =>
          stop.id === stopId ? { ...stop, ...updates } : stop
        ),
      }));
      get().validateItinerary();
    },

    addActivity: (stopId, activity) => {
      set((state) => ({
        stops: state.stops.map((stop) =>
          stop.id === stopId
            ? { ...stop, activities: [...stop.activities, activity] }
            : stop
        ),
      }));
    },

    validateItinerary: () => {
      const { stops } = get();
      const newWarnings: string[] = [];

      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (new Date(stop.departureDate) <= new Date(stop.arrivalDate)) {
          newWarnings.push(`Stop ${i + 1} (${stop.cityName}): Departure must be after arrival.`);
        }
        
        if (i > 0) {
          const prevStop = stops[i - 1];
          if (new Date(stop.arrivalDate) < new Date(prevStop.departureDate)) {
            newWarnings.push(`Timing conflict between ${prevStop.cityName} and ${stop.cityName}.`);
          }
        }
      }

      set({ warnings: newWarnings });
    },
  }))
);
