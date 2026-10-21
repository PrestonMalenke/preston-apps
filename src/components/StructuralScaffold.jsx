const ticks = Array.from({ length: 12 }, (_, i) => i)

export default function StructuralScaffold({ type = 'panel', label }) {
  return (
    <div className={`structural-scaffold structural-scaffold--${type}`} role="status" aria-live="polite" aria-label={label}>
      <div className="structural-scaffold__top" aria-hidden="true"><span>SYS / STRUCTURE</span><span className="structural-scaffold__status">LIVE SCAN <i/></span></div>
      {type === 'ledger' ? (
        <div className="structural-scaffold__ledger" aria-hidden="true">
          {ticks.slice(0, 3).map(i => <div key={i} className="structural-scaffold__row" style={{ '--slot': i }}>
            <span className="structural-scaffold__stub"><b className="structural-scaffold__index">0{i + 1}</b></span>
            <span className="structural-scaffold__entry"><i /><i /><em className="structural-scaffold__bits">1010 0011 0110</em></span>
          </div>)}
        </div>
      ) : type === 'metric' ? (
        <div className="structural-scaffold__metric" aria-hidden="true">
          <div className="structural-scaffold__metric-value"><span className="structural-scaffold__counter">0000</span><span /></div>
          <div className="structural-scaffold__metric-grid">{ticks.slice(0,4).map(i => <span key={i} style={{ '--slot': i }}><i/><b/></span>)}</div>
        </div>
      ) : (
        <div className="structural-scaffold__panel" aria-hidden="true">
          <div className="structural-scaffold__panel-header"><span/><i/></div>
          <div className="structural-scaffold__panel-title"><span className="structural-scaffold__registers">A0 : F7 : 3C : 19</span></div>
          <div className="structural-scaffold__panel-columns"><span/><span/></div>
          <div className="structural-scaffold__panel-footer"/>
        </div>
      )}
      <div className="structural-scaffold__bottom" aria-hidden="true"><span className="structural-scaffold__pulse"/>FRAME / {type.toUpperCase()}<span>AWAITING DATA</span></div>
    </div>
  )
}
