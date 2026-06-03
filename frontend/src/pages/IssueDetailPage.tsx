import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { IssueDetail, IssueStatus, Comment } from '@/types'
import { StatusBadge, PriorityBadge } from './DashboardPage'

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: 'New', label: 'Yeni' },
  { value: 'Investigating', label: 'İnceleniyor' },
  { value: 'WaitingCustomer', label: 'Müşteri Bekliyor' },
  { value: 'AssignedDeveloper', label: 'Geliştiricide' },
  { value: 'Resolved', label: 'Çözüldü' },
  { value: 'Closed', label: 'Kapatıldı' },
]

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<IssueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  function load() {
    setLoading(true)
    api.get<IssueDetail>(`/issues/${id}`)
      .then(r => setIssue(r.data))
      .catch(() => setError('Issue bulunamadı.'))
      .finally(() => setLoading(false))
  }

  async function handleStatusChange(newStatus: IssueStatus) {
    if (!issue) return
    setUpdatingStatus(true)
    try {
      await api.put(`/issues/${issue.id}`, {
        title: issue.title,
        description: issue.description,
        status: newStatus,
        priority: issue.priority,
        assignedUserId: issue.assignedUserId ?? null,
      })
      setIssue(prev => prev ? { ...prev, status: newStatus } : prev)
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!issue || !commentText.trim()) return
    setSubmittingComment(true)
    try {
      await api.post(`/issues/${issue.id}/comments`, { content: commentText.trim() })
      setCommentText('')
      load()
    } catch {
      // silently fail
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Yükleniyor...</div>
  )

  if (error || !issue) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error || 'Issue yüklenemedi.'}</div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Geri
        </button>
      </div>

      {/* Ana kart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{issue.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={issue.priority} />
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">{issue.description}</p>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Otel</p>
            <p className="text-sm font-medium text-gray-700">{issue.hotelName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Atanan</p>
            <p className="text-sm font-medium text-gray-700">{issue.assignedUserName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Oluşturulma</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(issue.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Durum</p>
            <select
              value={issue.status}
              onChange={e => handleStatusChange(e.target.value as IssueStatus)}
              disabled={updatingStatus}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Yorumlar */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Yorumlar <span className="text-gray-400 font-normal text-sm">({issue.comments.length})</span>
          </h2>
        </div>

        {issue.comments.length === 0 ? (
          <div className="px-6 py-4 text-sm text-gray-400">Henüz yorum yok.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {issue.comments.map((comment: Comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ul>
        )}

        <div className="px-6 py-4 border-t border-gray-100">
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Yorum ekle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submittingComment ? 'Gönderiliyor...' : 'Yorum Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <li className="px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
          {comment.authorName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-800">{comment.authorName}</span>
        <span className="text-xs text-gray-400">
          {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed ml-9">{comment.content}</p>
    </li>
  )
}
