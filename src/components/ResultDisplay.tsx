"use client";

import type { AnalysisResult } from "@/types";

type Props = {
  result: AnalysisResult | null;
  onSave: () => void;
  canSave: boolean;
};

export function ResultDisplay({ result, onSave, canSave }: Props) {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className="animate-in">
        <div className="error-block">
          <p className="error-title">Error</p>
          <p className="error-text">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="hakase-result">
        <img src="/hakase.png" alt="洗濯博士" className="hakase-img" />
      </div>
      <div className="result-block">
        {result.detected && result.detected.length > 0 && (
          <div className="result-section">
            <p className="result-label">Detected (検出)</p>
            <ul className="result-list">
              {result.detected.map((item, i) => (
                <li key={i}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="result-section">
          <p className="result-label">Conclusion (結論)</p>
          <p className="result-text">{result.conclusion}</p>
        </div>

        {result.notes.length > 0 && (
          <div className="result-section">
            <p className="result-label">Notes (注意)</p>
            <ul className="result-list">
              {result.notes.map((note, i) => (
                <li key={i}>
                  <span className="num">{i + 1}</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="result-section">
          <p className="result-label">Recommendation (推奨)</p>
          <p className="result-text">{result.recommendation}</p>
        </div>
      </div>

      {canSave && (
        <button onClick={onSave} className="btn-full">
          Save Result
        </button>
      )}
    </div>
  );
}
