import { useQuery } from '@tanstack/react-query';
import { reservationPagesApi } from '../../api/apis';

export function useReservationPage(pageId: string | undefined | null) {
  return useQuery({
    queryKey: ['reservation-pages', pageId],
    queryFn: () => reservationPagesApi.apiReservationPagesIdGet(pageId!),
    enabled: !!pageId,
  });
}
