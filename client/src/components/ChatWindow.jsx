import React, { useEffect, useState } from "react";

export default function ChatWindow({ chat, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chat.idRezervacija}/messages`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      data.sort(
        (a, b) => new Date(a.vrijemeSlanja) - new Date(b.vrijemeSlanja)
      );
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (!chat) return;
    fetchMessages();
  }, [chat]);

  const handleSend = async (e) => {
  e.preventDefault();
  if (!text.trim()) return;
  try {
    const res = await fetch(`/api/chats/${chat.idRezervacija}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tekst: text }),
    });
    if (res.ok) {
      setText("");
      fetchMessages();
    } else {
      console.error("Failed to send message");
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
};


  return (
    <div className="chat-window">
      <div className="chat-header">Razgovor s {chat.otherName}</div>
      <div className="chat-messages">
        {messages.map((m) => {
          const isMe = me && me.idkorisnik === m.posiljatelj;
          return (
            <div key={m.idporuka} className={`chat-message ${isMe ? 'me' : 'them'}`}>
              <div className="chat-message-text">{m.tekst}</div>
              <div className="chat-message-time">{new Date(m.vrijemeSlanja ?? m.vrijemeSlanja).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pošalji poruku..." />
        <button type="submit">Pošalji</button>
      </form>
    </div>
  );
}
