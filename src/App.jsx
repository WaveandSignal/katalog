import { useEffect, useState } from 'react'
import { CatalogView } from './views/CatalogView'
import { StatsView } from './views/StatsView'
import { EntryDetail } from './views/EntryDetail'
import { Capture } from './components/Capture'
import { MilestoneToast } from './components/MilestoneToast'
import { Icon } from './components/Icons'
import { getStats, getMeta, setMeta } from './services/storage'
import { computeEarned } from './lib/milestones'

export default function App() {
  const [tab, setTab] = useState('catalog')
  const [openEntryId, setOpenEntryId] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingMilestone, setPendingMilestone] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function checkMilestones() {
    const stats = await getStats()
    const earned = computeEarned(stats)
    const earnedIds = earned.map(m => m.id)
    const seen = (await getMeta('seenMilestones')) || []
    const newly = earned.filter(m => !seen.includes(m.id))
    if (newly.length > 0) {
      setPendingMilestone(newly[0])
      await setMeta('seenMilestones', earnedIds)
    }
  }

  useEffect(() => {
    checkMilestones()
  }, [])

  function handleEntrySaved() {
    setCapturing(false)
    setRefreshKey(k => k + 1)
    checkMilestones()
  }

  function handleEntryChanged() {
    setRefreshKey(k => k + 1)
    checkMilestones()
  }

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  if (capturing) {
    return <Capture onDone={handleEntrySaved} onCancel={() => setCapturing(false)} />
  }

  if (openEntryId) {
    return (
      <>
        <EntryDetail
          entryId={openEntryId}
          onBack={() => setOpenEntryId(null)}
          onChanged={handleEntryChanged}
        />
        {pendingMilestone && (
          <MilestoneToast
            milestone={pendingMilestone}
            onDismiss={() => setPendingMilestone(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      {tab === 'catalog' && (
        <CatalogView
          refreshKey={refreshKey}
          onOpenEntry={setOpenEntryId}
          onNewEntry={() => setCapturing(true)}
        />
      )}
      {tab === 'stats' && <StatsView refreshKey={refreshKey} />}

      {installPrompt && (
        <div style={{
          position: 'fixed', bottom: 86, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: 'var(--bg)', padding: '10px 14px',
          borderRadius: 10, fontSize: 13, display: 'flex', gap: 10, alignItems: 'center',
          maxWidth: 'calc(100% - 40px)', zIndex: 50, boxShadow: 'var(--shadow-md)',
        }}>
          <span>Install Katalog</span>
          <button onClick={handleInstall} style={{
            background: 'var(--bg)', color: 'var(--ink)', padding: '6px 12px',
            borderRadius: 6, fontWeight: 600, fontSize: 12,
          }}>Add</button>
          <button onClick={() => setInstallPrompt(null)} style={{ color: 'var(--bg)', opacity: 0.6 }}>×</button>
        </div>
      )}

      <nav className="tab-bar">
        <div className="tab-bar-inner">
          <button className={`tab-btn ${tab === 'catalog' ? 'active' : ''}`} onClick={() => setTab('catalog')}>
            <Icon.Grid /> Catalog
          </button>
          <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
            <Icon.Stats /> Stats
          </button>
        </div>
      </nav>

      {pendingMilestone && (
        <MilestoneToast
          milestone={pendingMilestone}
          onDismiss={() => setPendingMilestone(null)}
        />
      )}
    </>
  )
}
