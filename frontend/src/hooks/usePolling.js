import { useEffect, useState, useCallback } from 'react';

// fetcher harus stabil (didefinisikan di luar komponen atau dibungkus useCallback).
// intervalMs = null mematikan auto-refresh (data dimuat sekali dan saat fetcher berubah).
export default function usePolling(fetcher, intervalMs = 15000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diperbarui, setDiperbarui] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await fetcher());
      setError(null);
      setDiperbarui(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState terjadi setelah await, bukan sinkron
    load();
    if (!intervalMs) return;
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, loading, error, reload: load, diperbarui };
}
