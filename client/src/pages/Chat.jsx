import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

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
      if (!res.ok) return;
      const data = await res.json();
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
