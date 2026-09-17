import { useEffect, useRef, useCallback } from 'react';

export function useWorker(workerFactory: () => Worker, onMessage: (data: any) => void) {
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        const worker = workerFactory();
        workerRef.current = worker;

        worker.onmessage = (e) => {
            onMessage(e.data);
        };

        worker.onerror = (e) => {
            console.error('[useWorker] Worker error:', e.message);
        };

        return () => {
            console.log('[useWorker] Cleaning up worker');
            worker.terminate();
            workerRef.current = null;
        };
    }, [workerFactory, onMessage]);

    const post = useCallback((msg: any) => {
        if (workerRef.current) {
            workerRef.current.postMessage(msg);
        }
    }, []);

    return post;
}
