import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import Footer from "../components/Footer";
import HeaderUlogiran from "../components/HeaderUlogiran";
import "../components/Chat.css";

const SAMPLE_CHATS = [
  {
    idrezervacija: 'test-1',
    idsetnja: 's-test-1',
    otherid: 999,
    othername: 'Test User',
    tipsetnja: 'Test šetnja',
    datum: '2026-01-20',
    vrijeme: '10:00'
  },
  {
    idrezervacija: 'test-2',
    idsetnja: 's-test-2',
    otherid: 998,
    othername: 'Demo Vlasnik',
    tipsetnja: 'Brza šetnja',
    datum: '2026-01-21',
    vrijeme: '15:30'
  }
];

export default function Chat() {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${BACKEND_URL}/api/me`, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setMe(json.user);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${BACKEND_URL}/api/chats`, { credentials: 'include' });
      if (!res.ok) {
        setChats(SAMPLE_CHATS);
        return;
      }
      const data = await res.json();
      if (!data || data.length === 0) {
        setChats(SAMPLE_CHATS);
        return;
      }
      setChats(data);
    })();
  }, []);

  const handleSelect = (chat) => {
    setSelected(chat);
  };

  return (
    <>
      <HeaderUlogiran />
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-list-column">
            <h3>Razgovori</h3>
            <ChatList chats={chats} onSelect={handleSelect} selectedId={selected?.idrezervacija} />
          </div>
          <div className="chat-window-column">
            {selected ? (
              <ChatWindow key={selected.idrezervacija} chat={selected} me={me} />
            ) : (
              <div className="placeholder">Odaberite razgovor s lijeve strane</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
