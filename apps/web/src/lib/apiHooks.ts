import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { 
  RecommendationRequest, 
  ItineraryRequest, 
  FeedbackObservationReport,
} from "../types/api";

export function useParksQuery() {
  return useQuery({
    queryKey: ["parks"],
    queryFn: () => apiClient.getParks(),
  });
}

export function useParkQuery(parkId: string) {
  return useQuery({
    queryKey: ["parks", parkId],
    queryFn: () => apiClient.getPark(parkId),
    enabled: !!parkId,
  });
}

export function useParkRidesQuery(parkId: string) {
  return useQuery({
    queryKey: ["parks", parkId, "rides"],
    queryFn: () => apiClient.getParkRides(parkId),
    enabled: !!parkId,
  });
}

export function useParkTariffQuery(parkId: string) {
  return useQuery({
    queryKey: ["parks", parkId, "tariff"],
    queryFn: () => apiClient.getParkTariff(parkId),
    enabled: !!parkId,
  });
}

export function useTripsQuery() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => apiClient.getTrips(),
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.getNotifications(),
  });
}

export function useNewsQuery(parkId?: string) {
  return useQuery({
    queryKey: ["news", parkId],
    queryFn: () => apiClient.getNews(parkId),
  });
}

export function useWeatherQuery(parkId: string, date?: string) {
  return useQuery({
    queryKey: ["weather", parkId, date],
    queryFn: () => apiClient.getWeather(parkId, date),
    enabled: !!parkId,
  });
}

export function useCommuteQuery(parkId: string, originLat: number, originLon: number) {
  return useQuery({
    queryKey: ["commute", parkId, originLat, originLon],
    queryFn: () => apiClient.getCommute(parkId, originLat, originLon),
    enabled: !!parkId && !!originLat && !!originLon,
  });
}

// Mutations
export function useSaveTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.saveTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useSubmitFeedbackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.submitCrowdReport,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", variables.park_id] });
    },
  });
}
