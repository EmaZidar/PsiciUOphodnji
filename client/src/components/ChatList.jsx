import React from "react";

export default function ChatList({ chats, onSelect, selectedId }) {
  if (chats.length === 0) {
    return <div style={{ padding: 16 }}>Nema razgovora</div>;
  }

  return (
    <div className="chat-list">
      {chats.map((c) => {
        const isSelected = selectedId === c.idRezervacija;
        const imgSrc = c.profilFoto || c.profileImage || c.avatar || '/images/chatProfile.png';

        return (
          <button
            key={c.idRezervacija}
            className={`chat-list-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(c)}
          >
            <div className="chat-avatar">
              <img src={imgSrc} alt={c.otherName} className="chat-avatar-img" />
            </div>
            <div className="chat-item-body">
              <div className="chat-item-name">{c.otherName}</div>
              <div className="chat-item-meta">{c.tipSetnja} • {c.datum} {c.vrijeme}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
