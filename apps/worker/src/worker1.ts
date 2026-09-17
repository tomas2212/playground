// worker1.ts
self.onmessage = (e) => {
    const msg = e.data;
    console.log('[Worker] received:', msg);

    let sum = 0;
    for (let i = 0; i < 1e8; i++) {
        sum += i;
    }

    postMessage(`Done! Sum = ${sum}`);
};
