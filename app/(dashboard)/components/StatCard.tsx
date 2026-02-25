import { ReactNode } from "react"

export default function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string
  icon: ReactNode
  color: string
}) {
  return (
    <div className="bg-white border p-4 rounded-xl flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
    </div>
  )
}
