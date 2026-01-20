import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

const SAMPLE_CHATS = [
  {
    idRezervacija: 'test-1',
    idSetnja: 's-test-1',
    otherId: 999,
    otherName: 'Test User',
    tipSetnja: 'Test šetnja',
    datum: '2026-01-20',
    vrijeme: '10:00'
  },
  {
    idRezervacija: 'test-2',
    idSetnja: 's-test-2',
    otherId: 998,
    otherName: 'Demo Vlasnik',
    tipSetnja: 'Brza šetnja',
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
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setMe(json.user);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/chats', { credentials: 'include' });
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
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-list-column">
          <h3>Razgovori</h3>
          <ChatList chats={chats} onSelect={handleSelect} selectedId={selected?.idRezervacija} />
        </div>
        <div className="chat-window-column">
          {selected ? (
            <ChatWindow key={selected.idRezervacija} chat={selected} me={me} />
          ) : (
            <div className="placeholder">Odaberite razgovor s lijeve strane</div>
          )}
        </div>
      </div>
    </div>
  );
}
