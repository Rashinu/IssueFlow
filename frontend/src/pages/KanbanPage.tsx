import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Hotel, Issue, IssueStatus, Priority } from '@/types'
import { PriorityBadge } from './DashboardPage'

const COLUMNS: { status: IssueStatus; label: string; color: string }[] = [
  { status: 'New', label: 'Yeni', color: 'bg-gray-100' },
  { status: 'Investigating', label: 'İnceleniyor', color: 'bg-blue-100' },
  { status: 'WaitingCustomer', label: 'Müşteri Bekliyor', color: 'bg-yellow-100' },
  { status: 'AssignedDeveloper', label: 'Geliştiricide', color: 'bg-purple-100' },
  { status: 'Resolved', label: 'Çözüldü', color: 'bg-green-100' },
  { status: 'Closed', label: 'Kapatıldı', color: 'bg-gray-200' },
]

export default function KanbanPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterHotel, setFilterHotel] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')
  const [hotels, setHotels] = useState<Hotel[]>([])

  useEffect(() => {
    load()
    api.get<Hotel[]>('/hotels').then(r => setHotels(r.data)).catch(() => {})
  }, [])

  function load() {
    setLoading(true)
    api.get<Issue[]>('/issues')
      .then(r => setIssues(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Yükleniyor...
      </div>
    )
  }

  // Düzeltme 1: filter loading'den sonra
  const filtered = issues.filter(i =>
    (search === '' || i.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterHotel === '' || i.hotelName === filterHotel) &&
    (filterPriority === '' || i.priority === filterPriority)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} / {issues.length} issue</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Yeni Issue
        </button>
      </div>

      {/* Arama & Filtre */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Issue ara..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Düzeltme 3: otel dropdown eklendi */}
        <select
          value={filterHotel}
          onChange={e => setFilterHotel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Oteller</option>
          {hotels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
        </select>
        {/* Düzeltme 2: type cast eklendi */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as Priority | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Öncelikler</option>
          <option value="Critical">Kritik</option>
          <option value="High">Yüksek</option>
          <option value="Medium">Orta</option>
          <option value="Low">Düşük</option>
        </select>
        {(search || filterHotel || filterPriority) && (
          <button
            onClick={() => { setSearch(''); setFilterHotel(''); setFilterPriority('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      {showForm && (
        <NewIssueForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load() }}
        />
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          // Düzeltme 1: issues → filtered
          const colIssues = filtered.filter(i => i.status === col.status)
          return (
            <div key={col.status} className="flex-shrink-0 w-72">
              <div className={`rounded-lg p-3 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  <span className="text-xs bg-white text-gray-500 rounded-full px-2 py-0.5 font-medium">
                    {colIssues.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colIssues.length === 0 ? (
                    <div className="bg-white rounded-lg p-3 text-center text-xs text-gray-400 border border-dashed border-gray-200">
                      Boş
                    </div>
                  ) : (
                    colIssues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IssueCard({ issue }: { issue: Issue }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/issues/${issue.id}`)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{issue.title}</p>
      <p className="text-xs text-gray-400 mt-1">{issue.hotelName}</p>
      <div className="flex items-center justify-between mt-2">
        <PriorityBadge priority={issue.priority} />
        {issue.assignedUserName && (
          <span className="text-xs text-gray-400">{issue.assignedUserName}</span>
        )}
      </div>
    </div>
  )
}

interface NewIssueFormProps {
  onClose: () => void
  onCreated: () => void
}

function NewIssueForm({ onClose, onCreated }: NewIssueFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Hotel[]>('/hotels')
      .then(r => { setHotels(r.data); if (r.data.length) setHotelId(r.data[0].id) })
      .catch(() => {})
    api.get<{ id: string; name: string }[]>('/users')
      .then(r => setUsers(r.data))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/issues', { title, description, hotelId, priority, assignedUserId: assignedUserId || null })
      onCreated()
    } catch {
      setError('Issue oluşturulamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Yeni Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Otel</label>
            {hotels.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Önce Hotels sayfasından bir otel oluşturun.
              </p>
            ) : (
              <select
                value={hotelId} onChange={e => setHotelId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
            <select
              value={priority} onChange={e => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Düşük</option>
              <option value="Medium">Orta</option>
              <option value="High">Yüksek</option>
              <option value="Critical">Kritik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kişi</label>
            <select
              value={assignedUserId} onChange={e => setAssignedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Atanmadı —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              İptal
            </button>
            <button type="submit" disabled={loading || hotels.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
