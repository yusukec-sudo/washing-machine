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
      <div className="result-block">
        <div className="result-section">
          <p className="result-label">Conclusion</p>
          <p className="result-text">{result.conclusion}</p>
        </div>

        {result.notes.length > 0 && (
          <div className="result-section">
            <p className="result-label">Notes</p>
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
          <p className="result-label">Recommendation</p>
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
