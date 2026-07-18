import type { ResultInfo } from "../types";
import { ScorePill } from "./bits";

export function FinalGallery({ results }: { results: ResultInfo[] }) {
  return (
    <section className="card fade-in">
      <header className="card-head">
        <div>
          <span className="loop-tag done">OUTPUT</span>
          <h2>Finished set</h2>
        </div>
      </header>
      <div className="gallery">
        {results.map((result) => (
          <figure className={`result-card ${result.winner ? "winner" : ""}`} key={result.frameId}>
            {result.winner && <div className="winner-banner">WINNER</div>}
            <img src={result.url} alt={result.frameId} />
            <figcaption>
              <span className="mono">{result.frameId}</span>
              <ScorePill score={result.score} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
