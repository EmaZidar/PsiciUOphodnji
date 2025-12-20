import React, { useEffect, useState } from 'react'

function formatDate(dt) {
  const d = new Date(dt)
  return d.toLocaleString()
}

function randomFutureDate() {
  const now = Date.now()
  const days = Math.floor(Math.random()*14)+1
  const hour = 8 + Math.floor(Math.random()*9) // 8..16
  const dt = new Date(now + days*24*60*60*1000)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

export default function Appointments({ userId, userName, showHeader = true }) {
  const key = `appointments_${userId || 'anon'}`
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(key)
      setItems(raw? JSON.parse(raw) : [])
    }catch(e){ setItems([]) }
  },[key])

  useEffect(()=>{
    localStorage.setItem(key, JSON.stringify(items))
  },[key, items])

  const addDefault = () => {
    const newItem = {
      id: 'a'+Date.now(),
      date: randomFutureDate(),
      type: 'individual',
      price: 50,
      duration: 60,
      notes: ''
    }
    // create a draft that is not yet persisted to the appointments list
    setDraft(newItem)
    setEditingId(newItem.id)
  }

  const saveEdit = (id, patch) => {
    if (draft && draft.id === id) {
      // persist draft as a real item
      const saved = { ...draft, ...patch }
      setItems(prev => [saved, ...prev])
      setDraft(null)
      setEditingId(null)
      return
    }
    setItems(prev=> prev.map(i=> i.id===id ? { ...i, ...patch } : i))
    setEditingId(null)
  }

  const remove = (id) => {
    if (!window.confirm('Obrisati termin?')) return
    setItems(prev=> prev.filter(i=> i.id!==id))
  }

  return (
    <div className="appointments-panel">
      {showHeader && <h3>Dobrodošli{userName? ', '+userName : ''}!</h3>}
      <div className="appointments-actions">
        <button onClick={addDefault} className="btn">Dodaj termin šetnje</button>
      </div>

      <div className="appointments-list">
        {draft && editingId===draft.id && (
          <div className={`appointment-item editing`}>
            <AppointmentEditor item={draft} onCancel={()=>{ setDraft(null); setEditingId(null) }} onSave={(patch)=>saveEdit(draft.id, patch)} />
          </div>
        )}

        {items.length===0 && !draft && <div className="muted">Nema termina. Dodajte prvi termin.</div>}

        {items.map(item=> (
          <div key={item.id} className={`appointment-item ${editingId===item.id ? 'editing' : ''}`}>
            {editingId===item.id ? (
              <AppointmentEditor item={item} onCancel={()=>setEditingId(null)} onSave={(patch)=>saveEdit(item.id, patch)} />
            ) : (
              <>
                <div className="appointment-main">
                  <div className="appointment-date">{formatDate(item.date)}</div>
                  <div className="appointment-meta">{item.type} · {item.duration} min · {item.price} €</div>
                </div>
                <div className="appointment-controls">
                  <button onClick={()=>setEditingId(item.id)} className="link">Uredi</button>
                  <button onClick={()=>remove(item.id)} className="link danger">Obriši</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AppointmentEditor({ item, onSave, onCancel }){
  const [form, setForm] = useState({ date: item.date, type: item.type, price: item.price, duration: item.duration, notes: item.notes })
  return (
    <div className="appointment-edit">
      <label>Datum i vrijeme
        <input type="datetime-local" value={toLocal(form.date)} onChange={e=>setForm(s=>({...s, date: e.target.value}))} />
      </label>
      <label>Tip
        <select value={form.type} onChange={e=>setForm(s=>({...s, type: e.target.value}))}>
          <option value="individual">Individualna</option>
          <option value="group">Grupna</option>
        </select>
      </label>
      <label>Cijena (€)
        <input type="number" value={form.price} onChange={e=>setForm(s=>({...s, price: Number(e.target.value)}))} />
      </label>
      <label>Trajanje (min)
        <input type="number" value={form.duration} onChange={e=>setForm(s=>({...s, duration: Number(e.target.value)}))} />
      </label>
      <div className="editor-actions">
        <button onClick={()=>onSave({ ...form, date: fromLocal(form.date) })} className="btn">Spremi</button>
        <button onClick={onCancel} className="btn ghost">Otkaži</button>
      </div>
    </div>
  )
}

function toLocal(iso){
  // convert ISO to input datetime-local format
  const d = new Date(iso)
  const pad = (n)=> String(n).padStart(2,'0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth()+1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}
function fromLocal(val){
  // val is like 2025-12-20T10:00
  const d = new Date(val)
  return d.toISOString()
}
