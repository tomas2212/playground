import React, {useState, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {getWorker} from "./getWorker.ts";
import {useWorker} from "./hooks/useWorker.ts";

let worker = null;

// function fibonacciTest(n: number): number {
//     if (n <= 1) return n;
//     return fibonacciTest(n - 1) + fibonacciTest(n - 2);
// }
//
// const fibTest = fibonacciTest(4);
// console.log('fibTest',fibTest);

function App() {
    const [count, setCount] = useState(0)

    // const [msg, setMsg] = useState<string | null>(null);
    const [msg, setMsg] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const workerRef = useRef<Worker | null>(null);

    // React.useEffect(() => {
    //     // const worker = getWorker();
    //
    //     const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    //         type: 'module',
    //     });
    //
    //     workerRef.current = worker;
    //
    //     // worker = getWorker();
    //
    //     worker.onmessage = (e) => {
    //         console.log('[App] received:', e.data);
    //         // setMsg(e.data);
    //         setMsg(prevState => (prevState + e.data));
    //     };
    //
    //     worker.onerror = (e) => {
    //         console.error('[App] worker error:', e.message);
    //     };
    //
    //     // worker.postMessage('...');
    //     console.log('!!! volam worker.postMessage', worker);
    //     worker.postMessage(3);
    //
    //     // V dev mode sa vyre-rendruje worker 2x (kvoli strict modu), aby sa odhalili side effecty react effectu a nespravny return. Kedze idem ale cez instanciu singleton, tak si ho znicim a nefunguje mi to vobec.
    //     return () => {
    //         console.log('[App] cleaning up worker');
    //         if (worker) {
    //             worker.terminate();
    //             // worker = null;
    //         }
    //     };
    // }, []);


    const postToWorker = useWorker(
        () => new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'}),
        (data) => {
            console.log('[App] Got from worker:', data);
            // setResult(data);
            setMsg(prevState => (prevState + data));
            setCount((count) => count + 1)
            setIsLoading(false)
        }
    );

    // const { runWorker, loading: loadingWorker, error } = useWorker(() => {
    //     const worker = new Worker(new URL('./worker1.ts', import.meta.url), {
    //         type: 'module',
    //     });
    //
    //     worker.onmessage = (e) => {
    //         console.log('[App] Worker result:', e.data);
    //         setMsg(prevState => (prevState + e.data));
    //     };
    //
    //     return worker;
    // });


    // const handleClick = () => {
    //     console.log('[App] Posting message...');
    //     // postToWorker('Start heavy task');
    //     // postToWorker(20);
    //     // setCount((count) => count + 1)
    //     runWorker(10);
    // };

    return (
        <>

            <h2>Worker Message: {msg}</h2>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button
                    // disabled={loadingWorker}
                    onClick={() => {
                    // console.log('button clicked')
                    // setCount((count) => count + 1)
                    // setIsLoading(true);
                    postToWorker(40)
                    // // worker.postMessage(10);
                    // runWorker(10);
                }}>count is {count}</button>

                {/*<button onClick={handleClick}>*/}
                {/*    count is {count}*/}
                {/*</button>*/}

                {/*{error && <p style={{ color: 'red' }}>Worker Error: {error}</p>}*/}
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
