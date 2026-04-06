import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh', 
      gap: '1rem', 
      color: 'var(--text-secondary)' 
    }}>
      <Loader2 size={48} className="spin-animation" style={{ color: 'var(--accent-color)' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.5px' }}>Đang tải dữ liệu...</p>
      
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
