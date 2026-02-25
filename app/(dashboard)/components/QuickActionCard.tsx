export default function QuickActionCard({
  title,
  desc,
}: {
  title: string
  desc: string
}) {
  return (
    <div className="border-dashed border-2 p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  )
}
