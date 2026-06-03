import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Issue } from '@/types'

interface Stats {
  total: number
  open: number
  resolved: number
  critical: number
}

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Issue[]>('/issues')
      .then(r => setIssues(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats: Stats = {
    total: issues.length,
    open: issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length,
    critical: issues.filter(i => i.priority === 'Critical').length,
  }

  const recent = issues.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Genel durum özeti</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Issue" value={stats.total} color="blue" />
        <StatCard label="Açık" value={stats.open} color="yellow" />
        <StatCard label="Çözüldü" value={stats.resolved} color="green" />
        <StatCard label="Kritik" value={stats.critical} color="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Son Issue'lar</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : recent.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">Henüz issue yok.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map(issue => (
              <li key={issue.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{issue.hotelName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'blue' | 'yellow' | 'green' | 'red' }) {
  const colors = {
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
    red: 'text-red-700',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: 'bg-gray-100 text-gray-700',
    Investigating: 'bg-blue-100 text-blue-700',
    WaitingCustomer: 'bg-yellow-100 text-yellow-700',
    AssignedDeveloper: 'bg-purple-100 text-purple-700',
    Resolved: 'bg-green-100 text-green-700',
    Closed: 'bg-gray-200 text-gray-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-600',
    High: 'bg-orange-100 text-orange-600',
    Critical: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  )
}
