import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  applied: '#3b82f6',
  interview: '#eab308',
  offer: '#22c55e',
  rejected: '#ef4444',
}

export default function StatsChart({ stats }) {
  const data = stats.map(item => ({
    name: item._id,
    value: item.count,
  }))

  if (data.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Applications Overview</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]} />
          <Legend formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}