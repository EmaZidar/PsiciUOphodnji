import React, { useEffect, useState, useRef } from "react";

// sample poruke za lokalni test
const SAMPLE_MESSAGES = {
  "test-1": [
    { idPoruka: "m1", vrijemeSlanja: new Date().toISOString(), posiljatelj: 999, tekst: "Bok! Ovo je testna poruka." },
    { idPoruka: "m2", vrijemeSlanja: new Date().toISOString(), posiljatelj: 1, tekst: "Super, vidim test chat!" },
  ],
  "test-2": [
    { idPoruka: "d1", vrijemeSlanja: new Date().toISOString(), posiljatelj: 998, tekst: "Hej, imaš slobodno večeras?" },
  ],
};

export default function ChatWindow({ chat, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const containerRef = useRef(null);

  const userId = me?.idKorisnik;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chat.idRezervacija}/messages`, { credentials: "include" });
      let data = [];
      if (res.ok) {
        data = await res.json();
      } else if (SAMPLE_MESSAGES[chat.idRezervacija]) {
        data = SAMPLE_MESSAGES[chat.idRezervacija];
      }
      data.sort((a, b) => new Date(a.vrijemeSlanja) - new Date(b.vrijemeSlanja));
      setMessages(data);
    } catch {
      if (SAMPLE_MESSAGES[chat.idRezervacija]) setMessages(SAMPLE_MESSAGES[chat.idRezervacija]);
    }
  };

  useEffect(() => {
    if (chat) fetchMessages();
  }, [chat]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await fetch(`/api/chats/${chat.idRezervacija}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tekst: text }),
      });
      setText("");
      fetchMessages();
    } catch {
      // za sada nis 
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="name">{chat.otherName}</div>
        <div className="sub">{chat.tipSetnja} • {chat.datum} {chat.vrijeme}</div>
      </div>

      <div className="chat-messages" ref={containerRef}>
        {messages.map((m) => {
          const isMe = userId === m.posiljatelj;
          return (
            <div key={m.idPoruka} className={`message-row ${isMe ? "me" : ""}`}>
              <div className={`message-bubble ${isMe ? "me" : "them"}`}>
                <div className="message-text">{m.tekst}</div>
                <div className="message-meta">{formatTime(m.vrijemeSlanja)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pošalji poruku..."
          rows={2}
        />
        <button type="submit" disabled={!text.trim()}>Pošalji</button>
      </form>
    </div>
  );
}
