import React from "react";

export default function ChatList({ chats, onSelect, selectedId }) {
  return (
    <div className="chat-list">
      {chats.length === 0 && <div className="empty">Nema razgovora</div>}
      {chats.map((c) => (
        <button
          key={c.idRezervacija}
          className={`chat-list-item ${selectedId === c.idRezervacija ? 'selected' : ''}`}
          onClick={() => onSelect(c)}
        >
          <div className="chat-item-name">{c.otherName}</div>
          <div className="chat-item-meta">{c.tipSetnja} • {c.datum} {c.vrijeme}</div>
        </button>
      ))}
    </div>
  );
}
