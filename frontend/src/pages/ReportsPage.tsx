import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { ReportDto } from '@/types'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [report, setReport] = useState<ReportDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<ReportDto>(`/reports/${period}`)
      .then(r => setReport(r.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500 text-sm mt-1">Issue istatistikleri</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-12">Yükleniyor...</div>
      ) : !report ? (
        <div className="text-center text-gray-400 text-sm py-12">Veri alınamadı.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Toplam Issue" value={report.totalIssues} color="blue" />
            <StatCard label="Yeni" value={report.newIssues} color="yellow" />
            <StatCard label="Çözüldü" value={report.resolvedIssues} color="green" />
            <StatCard label="Kritik" value={report.criticalIssues} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Otele Göre</h2>
              {report.byHotel.length === 0 ? (
                <p className="text-gray-400 text-sm">Veri yok</p>
              ) : (
                <div className="space-y-2">
                  {report.byHotel.map(h => (
                    <div key={h.hotelName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{h.hotelName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (h.count / report.totalIssues) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-6 text-right">{h.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Duruma Göre</h2>
              {report.byStatus.length === 0 ? (
                <p className="text-gray-400 text-sm">Veri yok</p>
              ) : (
                <div className="space-y-2">
                  {report.byStatus.map(s => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{s.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (s.count / report.totalIssues) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-6 text-right">{s.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
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
