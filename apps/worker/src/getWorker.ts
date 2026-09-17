let _worker: Worker | null = null;

export function getWorker(): Worker {
    console.log('getWorker called');
    if (!_worker) {
        _worker = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module',
        });
    }
    return _worker;
}