import { useQuery } from '@tanstack/react-query';
import { SpotsApi } from "../../api-client/api";

export function useSpots(onlyActive = true) {
  const spotsApi = new SpotsApi(); 

  return useQuery({
    queryKey: ['spots'],
    queryFn: () => spotsApi.apiSpotsGet(onlyActive),
  });
}

export function useSpot(id: string) {
  const spotsApi = new SpotsApi(); 

  return useQuery({
    queryKey: ['spots', id],
    queryFn: () => spotsApi.apiSpotsIdGet(id),
    enabled: Boolean(id),
  });
}
