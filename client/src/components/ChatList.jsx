import React from "react";

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
              <div className="chat-item-meta">{c.tipsetnja} • {formatDatumHR(c.datum)} {formatVrijeme(c.vrijeme)}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
