import React, { useEffect, useState } from 'react'

function formatDate(dt) {
  const d = new Date(dt)
  return d.toLocaleString()
}

export default function Appointments({ userId, userName, showHeader = true }) {
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSetnje = async () => {
      try {
        setLoading(true)
        console.log("Fetching setnje for userId:", userId);
        const response = await fetch(`/api/setnje/${userId}`, {
          method: 'GET',
          credentials: 'include'
        })
        if (!response.ok) throw new Error('Ne mogu dohvatiti podatke o šetnjama');
        const data = await response.json()
        setItems(data?.setac?.setnje || [])
      } catch (err) {
        console.error('Error loading setnje:', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    if (userId) loadSetnje()
  }, [userId])

  const addDefault = () => {
    const newItem = {
      id: 'draft',
      cijena: 50,
      tipsetnja: 'individualna',
      trajanje: 60
    }
    setDraft(newItem)
    setEditingId(newItem.id)
  }

  const saveEdit = async (id, patch) => {
    try {
      if (draft && draft.id === id) {
        const response = await fetch('/api/setnja', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            cijena: patch.cijena,
            tipSetnja: patch.tipsetnja,
            trajanje: patch.trajanje,
            idKorisnik: userId
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setItems(prev => [data.setnja, ...prev])
        }
        setDraft(null)
        setEditingId(null)
        return
      }
      
      const response = await fetch(`/api/setnje/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch)
      })
      
      if (response.ok) {
        setItems(prev => prev.map(i => i.idsetnja === id ? { ...i, ...patch } : i))
      }
      setEditingId(null)
    } catch (err) {
      console.error('Error saving setnja:', err)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Obrisati termin?')) return
    
    try {
      const response = await fetch(`/api/setnje/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setItems(prev => prev.filter(i => i.idsetnja !== id))
      }
    } catch (err) {
      console.error('Error deleting setnja:', err)
    }
  }

  if (loading) return <div>Učitavanje...</div>

  return (
    <div className="appointments-panel">
      {showHeader && <h3>Dobrodošli{userName ? ', ' + userName : ''}!</h3>}
      <div className="appointments-actions">
        <button onClick={addDefault} className="btn">Dodaj termin šetnje</button>
      </div>

      <div className="appointments-list">
        {draft && editingId === draft.id && (
          <div className="appointment-item editing">
            <AppointmentEditor 
              item={draft} 
              onCancel={() => { setDraft(null); setEditingId(null) }} 
              onSave={(patch) => saveEdit(draft.id, patch)} 
            />
          </div>
        )}

        {items.length === 0 && !draft && <div className="muted">Nema termina. Dodajte prvi termin.</div>}

        {items.map(item => (
          <div key={item.idsetnja} className={`appointment-item ${editingId === item.idsetnja ? 'editing' : ''}`}>
            {editingId === item.idsetnja ? (
              <AppointmentEditor 
                item={item} 
                onCancel={() => setEditingId(null)} 
                onSave={(patch) => saveEdit(item.idsetnja, patch)} 
              />
            ) : (
              <>
                <div className="appointment-main">
                  <div className="appointment-meta">
                    <span className="type-pill">{item.tipsetnja === 'grupna' ? 'Grupna' : 'Individualna'}</span>
                    <span className="duration-pill">{item.trajanje} min</span>
                    <span className="price-pill">€{item.cijena}</span>
                  </div>
                </div>
                <div className="appointment-controls">
                  <button onClick={() => setEditingId(item.idsetnja)} className="link">Uredi</button>
                  <button onClick={() => remove(item.idsetnja)} className="link danger">Obriši</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AppointmentEditor({ item, onSave, onCancel }) {
  const [form, setForm] = useState({ 
    cijena: item.cijena, 
    tipsetnja: item.tipsetnja, 
    trajanje: item.trajanje 
  })
  
  return (
    <div className="appointment-edit">
      <label>Tip
        <select value={form.tipsetnja} onChange={e => setForm(s => ({ ...s, tipsetnja: e.target.value }))}>
          <option value="individualna">Individualna</option>
          <option value="grupna">Grupna</option>
        </select>
      </label>
      <label>Cijena (€)
        <input type="number" value={form.cijena} onChange={e => setForm(s => ({ ...s, cijena: Number(e.target.value) }))} />
      </label>
      <label>Trajanje (min)
        <input type="number" value={form.trajanje} onChange={e => setForm(s => ({ ...s, trajanje: Number(e.target.value) }))} />
      </label>
      <div className="editor-actions">
        <button onClick={() => onSave(form)} className="btn">Spremi</button>
        <button onClick={onCancel} className="btn ghost">Otkaži</button>
      </div>
    </div>
  )
}
