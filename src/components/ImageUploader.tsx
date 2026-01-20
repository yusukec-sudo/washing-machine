"use client";

import { useCallback, useState, useRef } from "react";

type Props = {
  onImageSelect: (base64: string) => void;
  preview: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onClear: () => void;
};

export function ImageUploader({ onImageSelect, preview, isLoading, onAnalyze, onClear }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="animate-in">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`upload-zone ${isDragging ? "active" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <p className="upload-text">画像をドロップ、またはクリック</p>
          <p className="upload-hint">JPG / PNG / HEIC</p>
        </div>
      ) : (
        <div>
          <div className="preview-frame">
            <img src={preview} alt="アップロード画像" />
          </div>
          <div className="btn-group">
            <button onClick={onClear} disabled={isLoading} className="btn btn-light">
              変更
            </button>
            <button onClick={onAnalyze} disabled={isLoading} className="btn btn-dark">
              {isLoading ? (
                <span className="loading">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </span>
              ) : (
                "実行"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
