import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
}

const LABELS = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export default function StatsChart({ stats }) {
  const data = stats.map(item => ({
    name: LABELS[item._id] || item._id,
    value: item.count,
    color: COLORS[item._id] || '#8884d8',
  }))

  if (data.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Overview</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              fontSize: '13px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}