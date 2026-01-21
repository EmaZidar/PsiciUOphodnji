import React from "react";

export default function ChatList({ chats, onSelect, selectedId }) {
  if (chats.length === 0) {
    return <div style={{ padding: 16 }}>Nema razgovora</div>;
  }

  return (
    <div className="chat-list">
      {chats.map((c) => {
        const isSelected = selectedId === c.idrezervacija;
        const imgSrc = c.otherprofilfoto || '/images/chatProfile.png';

        return (
          <button
            key={c.idrezervacija}
            className={`chat-list-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(c)}
          >
            <div className="chat-avatar">
              <img src={imgSrc} alt={c.otherName} className="chat-avatar-img" />
            </div>
            <div className="chat-item-body">
              <div className="chat-item-name">{c.othername}</div>
              <div className="chat-item-meta">{c.tipsetnja} • {c.datum} {c.vrijeme}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
