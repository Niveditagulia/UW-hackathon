export default function GameArt({ game }: { game: number }) {
  return (
    <div className={"game-art art-" + game} aria-hidden="true">
      {game === 4 ? (
        <div className="art-tiles">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} className={[0, 4, 7].includes(i) ? "lit" : ""}>
              {[0, 4, 7].includes(i) ? "✦" : ""}
            </i>
          ))}
        </div>
      ) : game === 5 ? (
        <div className="art-case">
          <div className="case-handle" />
          <span>◈</span>
          <span>◈</span>
          <span>✿</span>
          <span>◈</span>
          <span>◈</span>
          <span>◈</span>
        </div>
      ) : game === 6 ? (
        <div className="art-numbers">
          <i>3</i>
          <b>→</b>
          <i>6</i>
          <b>→</b>
          <i>?</i>
          <span>FIND YOUR NEXT MOVE</span>
        </div>
      ) : (
        <div className="art-signals">
          <i>←</i>
          <i>↑</i>
          <i>→</i>
          <i>↓</i>
        </div>
      )}
      <span className="art-spark">✧</span>
    </div>
  );
}
