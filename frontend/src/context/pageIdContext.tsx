import { createContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const PageIdContext = createContext<[string | null, (id: string | null) => void]>([null, () => {}]);

const pageIdKey = "rezervačníStránka";

export function PageIdProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const [pageId, setPageId] = useState(searchParams.get(pageIdKey));

  const handleSet = (id: string | null) => {
    if (id === pageId) return;

    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set(pageIdKey, id);
    } else {
      url.searchParams.delete(pageIdKey);
    }

    setPageId(id);
    window.history.replaceState({}, "", url);
  };

  return (
    <PageIdContext.Provider value={[pageId, handleSet]}>
      {children}
    </PageIdContext.Provider>
  );
}