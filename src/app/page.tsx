"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ResultDisplay } from "@/components/ResultDisplay";
import { HistoryPanel } from "@/components/HistoryPanel";
import type { AnalysisResult, SavedResult } from "@/types";

const STORAGE_KEY = "washing-machine-history";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SavedResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveHistory = useCallback((newHistory: SavedResult[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }, []);

  const handleImageSelect = useCallback((base64: string) => {
    setPreview(base64);
    setResult(null);
    setIsSaved(false);
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
    setResult(null);
    setIsSaved(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!preview) return;
    setIsLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      setResult(await res.json());
    } catch {
      setResult({ success: false, error: "通信エラーが発生しました", shouldRetry: true });
    } finally {
      setIsLoading(false);
    }
  }, [preview]);

  const handleSave = useCallback(() => {
    if (!result || !result.success || !preview) return;
    saveHistory([{
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      imagePreview: preview,
      detected: result.detected,
      conclusion: result.conclusion,
      notes: result.notes,
      recommendation: result.recommendation,
    }, ...history]);
    setIsSaved(true);
  }, [result, preview, history, saveHistory]);

  return (
    <div className="min-h-screen">
      {result?.success && (
        <>
          <img src="/hakase.png" alt="" className="deco-left" />
          <img src="/hakase2.png" alt="" className="deco-right" />
        </>
      )}
      <div className="container">
        <header className="site-header">
          <h1 className="site-title">洗濯タグ解析 <span className="by-hakase">by 洗濯博士</span></h1>
          <p className="site-subtitle">ケアラベルを読み取り、洗い方を判定</p>
        </header>

        <nav className="nav">
          <button
            onClick={() => setShowHistory(false)}
            className={`nav-item ${!showHistory ? "active" : ""}`}
          >
            Analyze (分析)
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`nav-item ${showHistory ? "active" : ""}`}
          >
            History (履歴){history.length > 0 && ` ${history.length}`}
          </button>
        </nav>

        <main>
          {showHistory ? (
            <HistoryPanel
              history={history}
              onDelete={(id) => saveHistory(history.filter((item) => item.id !== id))}
              onSelect={(item) => {
                setPreview(item.imagePreview);
                setResult({
                  success: true,
                  detected: item.detected || [],
                  conclusion: item.conclusion,
                  notes: item.notes,
                  recommendation: item.recommendation,
                });
                setIsSaved(true);
                setShowHistory(false);
              }}
            />
          ) : (
            <>
              <ImageUploader
                onImageSelect={handleImageSelect}
                preview={preview}
                isLoading={isLoading}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
              />
              <ResultDisplay
                result={result}
                onSave={handleSave}
                canSave={result?.success === true && !isSaved}
              />
              {isSaved && <p className="success-msg">Saved</p>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
