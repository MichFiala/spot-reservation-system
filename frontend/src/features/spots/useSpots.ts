import { useQuery } from '@tanstack/react-query';
import { spotsApi } from '../../api/spots';

export function useSpots(onlyActive = true) {
  return useQuery({
    queryKey: ['spots', { onlyActive }],
    queryFn: () => spotsApi.list(onlyActive),
  });
}

export function useSpot(id: string) {
  return useQuery({
    queryKey: ['spots', id],
    queryFn: () => spotsApi.get(id),
    enabled: Boolean(id),
  });
}
