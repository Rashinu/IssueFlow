import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 text-sm mt-1">Hesap bilgileri</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Profil</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name ?? '—'}</p>
            <p className="text-sm text-gray-500">{user?.email ?? '—'}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Rol</span>
            <span className="text-sm font-medium text-gray-800">{user?.role ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Oturum</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
