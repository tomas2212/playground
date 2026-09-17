// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import {useEffect, useState} from "react";
import socket from "./socket";
import {clicks$} from "./RxJs.tsx";
import { Subscription } from 'rxjs';
// import { timeSocket$ } from './services/websocket';
import { timeSocket$ } from './services/socket';

clicks$.subscribe(pos => console.log('Klik na:', pos));

function App() {
    // const [count, setCount] = useState(0)

    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");

    const [timeFromWs, setTimeFromWs] = useState<string>('');

    useEffect(() => {
        // socket.on("message", (data: string) => {
        //     setMessages((prev) => [...prev, data]);
        // });
        socket.on("message", (data: any) => {
            setMessages((prev) => [...prev, data]);
            if (data.msg === 'pokl') {
                console.log('... pokl received, running GET data ... ');
            }
        });
        // socket.on

        socket.on("serverTimeInterval", (data: any) => {
            // console.log('serverTime called', data);
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("message");
            socket.off("serverTimeInterval");

            // TODO: potom mi prestanu chodit 5 sec spravy?  mozno je to preto ze ho mountne 2x (kvoli strict modu) a teda ho aj unmountne raz
            // Cleanup: disconnect socket if needed
            // This is not necessary in most cases, but can be useful for cleanup
            // if you want to disconnect the socket when the component unmounts.
            // Uncomment the next line if you want to disconnect the socket when the component unmounts
            // socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const subs = new Subscription();

        subs.add(
            timeSocket$.subscribe({
                next: (msg) => setTimeFromWs(msg.time),
                error: (err) => console.error('Socket error:', err),
                complete: () => console.log('Socket stream closed'),
            })
        );

        return () => subs.unsubscribe();
    }, []);


    const sendMessage = () => {
        if (input.trim()) {
            // socket.emit("message", input);
            socket.emit("message", {id: 1, msg: input});
            setInput("");
        }
    };

    return (
        <div style={{padding: "2rem"}}>
            <h4>ServerTime: {timeFromWs}</h4>
            <h1>💬 Socket.IO Chat</h1>
            <div>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{JSON.stringify(msg, null, 2)}</li>
                    // <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    )
}

export default App
