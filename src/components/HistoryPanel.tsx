"use client";

import type { SavedResult } from "@/types";

type Props = {
  history: SavedResult[];
  onDelete: (id: string) => void;
  onSelect: (result: SavedResult) => void;
};

export function HistoryPanel({ history, onDelete, onSelect }: Props) {
  if (history.length === 0) {
    return (
      <div className="empty-state animate-in">
        <img src="/hakase.png" alt="洗濯博士" className="hakase-empty" />
        <p className="empty-text">まだ履歴がないぞい</p>
      </div>
    );
  }

  return (
    <div className="history-list animate-in">
      {history.map((item) => (
        <div key={item.id} className="history-item" onClick={() => onSelect(item)}>
          <img src={item.imagePreview} alt="" className="history-thumb" />
          <div className="history-content">
            <p className="history-text">{item.conclusion}</p>
            <p className="history-date">
              {new Date(item.timestamp).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="history-delete"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
