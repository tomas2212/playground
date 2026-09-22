import React, { useState } from 'react'
import './App.css'
import {MapComponent} from "./MapComponent.jsx";
import {MarkerPopupMap} from "./MarkerPopupMap.jsx";
import {DrawMap} from "./DrawMap.jsx";



function App() {
    const [count, setCount] = useState(0)

    const [msg, setMsg] = useState('');

    React.useEffect(() => {

        console.log('444 import.meta.url',import.meta.url);
        const worker = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module',
        });

        worker.onmessage = (e) => {
            console.log('[App] received:', e.data);
            setMsg(e.data);
        };
        worker.onerror = (e) => {
            console.error('[App] worker error:', e.message);
        };

        worker.postMessage('Test 123');

        return () => worker.terminate();
    }, []);

  return (
      <div className="App">
          {/*<MapComponent/>*/}

          {/*<br/>*/}
          {/*<MarkerPopupMap/>*/}

          <br/>
          <DrawMap/>
          <div>msg: {msg}</div>



          <button onClick={()=>setCount(count +1)}>add </button>

          <div>Count: {count}</div>

      </div>
  )
}

export default App
