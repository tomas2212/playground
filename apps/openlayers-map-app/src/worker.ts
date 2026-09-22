self.onmessage = (e) => {
    console.log('[Worker] input:', e.data);
    self.postMessage(`Hello from worker, input was: ${e.data}`);
};

export {};