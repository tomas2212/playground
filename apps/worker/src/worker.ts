// src/worker.ts

self.onmessage = (event: MessageEvent<number>) => {
    console.log('[Worker] Received:', event.data);
    const n = event.data;
    const result = fibonacci(n);

    console.log('[Worker] Computed:', result);
    self.postMessage(result);
};

function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

export {}; // Required to make this a module
