import React, { useEffect, useState, useRef } from "react";

// sample poruke za lokalni test
const SAMPLE_MESSAGES = {
  "test-1": [
    { idporuka: "m1", vrijemeslanja: new Date().toISOString(), posiljatelj: 999, tekst: "Bok! Ovo je testna poruka." },
    { idporuka: "m2", vrijemeslanja: new Date().toISOString(), posiljatelj: 1, tekst: "Super, vidim test chat!" },
  ],
  "test-2": [
    { idporuka: "d1", vrijemeslanja: new Date().toISOString(), posiljatelj: 998, tekst: "Hej, imaš slobodno večeras?" },
  ],
};

function formatDatumHR(datum) {
  if (!datum) return '';

  const d = new Date(datum);

  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  const godina = d.getFullYear();

  return `${dan}.${mjesec}.${godina}.`;
}

function formatVrijeme(vrijeme) {
  if (!vrijeme) return '';

  return vrijeme.slice(0, 5);
}

function formatDatumVrijeme(datumVrijeme) {
  if (!datumVrijeme) return '';

  return datumVrijeme.slice(11, 16);
}

export default function ChatWindow({ chat, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const containerRef = useRef(null);

  const userId = me?.idkorisnik;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chat.idrezervacija}/messages`, { credentials: "include" });
      let data = [];
      if (res.ok) {
        data = await res.json();
      } else if (SAMPLE_MESSAGES[chat.idrezervacija]) {
        data = SAMPLE_MESSAGES[chat.idrezervacija];
      }
      data.sort((a, b) => new Date(a.vrijemeslanja) - new Date(b.vrijemeslanja));
      setMessages(data);
    } catch {
      if (SAMPLE_MESSAGES[chat.idrezervacija]) setMessages(SAMPLE_MESSAGES[chat.idrezervacija]);
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
      await fetch(`/api/chats/${chat.idrezervacija}/messages`, {
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

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="name" style={{ fontWeight: "bold" , fontSize: "1.2rem"}}>{chat.otherName}</div>
        <div className="sub">{chat.tipsetnja} • {formatDatumHR(chat.datum)} {formatVrijeme(chat.vrijeme)}</div>
      </div>

      <div className="chat-messages" ref={containerRef}>
        {messages.map((m) => {
          const isMe = userId == m.posiljatelj;
          return (
            <div key={m.idporuka} className={`message-row ${isMe ? "me" : ""}`}>
              <div className={`message-bubble ${isMe ? "me" : "them"}`}>
                <div className="message-text">{m.tekst}</div>
                <div className="message-meta">{formatDatumVrijeme(m.vrijemeslanja)}</div>
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
