import { Search } from 'lucide-react'

export function FilterBar({
  query,
  onQuery,
  sort,
  onSort,
}: {
  query: string
  onQuery: (value: string) => void
  sort: string
  onSort: (value: string) => void
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_14rem]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          className="min-h-11 w-full rounded-lg border border-white/10 bg-[#0f1a2c] pl-10 pr-3 text-white"
          placeholder="Suchen"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <select className="min-h-11 rounded-lg border border-white/10 bg-[#0f1a2c] px-3 text-white" value={sort} onChange={(event) => onSort(event.target.value)}>
        <option value="progress">Nach Fortschritt</option>
        <option value="date">Nach Datum</option>
        <option value="alpha">Alphabetisch</option>
        <option value="last">Zuletzt abgefragt</option>
      </select>
    </div>
  )
}
