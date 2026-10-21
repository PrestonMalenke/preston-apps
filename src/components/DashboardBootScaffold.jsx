const slots = [0, 1, 2, 3, 4, 5]

export default function DashboardBootScaffold({ label = 'Initializing dashboard', section = 'TODAY' }) {
  return (
    <div className="dashboard-boot" role="status" aria-live="polite" aria-label={label}>
      <div className="dashboard-boot__heading" aria-hidden="true">
        <span className="dashboard-boot__path">SYS / WORKSPACE / {section}</span>
        <span className="dashboard-boot__state"><i /> INTERFACE CALIBRATION</span>
      </div>
      <div className="dashboard-boot__intro" aria-hidden="true">
        <span className="dashboard-boot__title" />
        <span className="dashboard-boot__subtitle" />
        <span className="dashboard-boot__clock">DATA LINK // ESTABLISHING</span>
      </div>
      <div className="dashboard-boot__grid" aria-hidden="true">
        {slots.map((i) => (
          <div className={`dashboard-boot__module dashboard-boot__module--${i % 3}`} key={i} style={{ '--boot-index': i }}>
            <div className="dashboard-boot__module-head">
              <span>0{i + 1} / {(section === 'WHITEBOARD' ? ['NOTES', 'CHECKLIST', 'STATISTICS', 'TABLES', 'LINKS', 'MODULES'] : ['SCHEDULE', 'TASK INDEX', 'MESSAGES', 'TIMELINE', 'ACCOUNT', 'NUTRITION'])[i]}</span>
              <i />
            </div>
            <div className="dashboard-boot__module-body">
              {i % 3 === 0 ? (
                <div className="dashboard-boot__rows">
                  {[0, 1, 2].map(j => <span key={j} style={{ '--boot-row': j }}><b /><i /><i /></span>)}
                </div>
              ) : i % 3 === 1 ? (
                <div className="dashboard-boot__columns">
                  <span /><span /><span /><span />
                </div>
              ) : (
                <div className="dashboard-boot__metrics"><span /><span /><div><i /><i /><i /><i /></div></div>
              )}
            </div>
            <div className="dashboard-boot__module-foot"><span>FRAME / {String(i + 1).padStart(2, '0')}</span><span>AWAITING DATA</span></div>
          </div>
        ))}
      </div>
      <div className="dashboard-boot__footer" aria-hidden="true">
        <span className="dashboard-boot__footer-led" />
        <span>SYNC ENGINE // RESOLVING MODULES</span>
        <span className="dashboard-boot__footer-track"><i /></span>
      </div>
    </div>
  )
}
