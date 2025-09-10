export default function ResultsPanel({ found = [], missing = [] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Matched</h3>
        <ul className="space-y-1 max-h-72 overflow-auto">
          {found.map((r, i) => (
            <li key={i} className="text-sm flex justify-between">
              <span className="text-gray-700">{pretty(r.name)}</span>
              <span className="font-mono">{r.number}</span>
            </li>
          ))}
          {!found.length && <p className="text-xs text-gray-400">— none —</p>}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Unmatched</h3>
        <ul className="space-y-1 max-h-72 overflow-auto">
          {missing.map((r, i) => (
            <li key={i} className="text-sm flex justify-between">
              <span className="text-gray-700">{pretty(r.name)}</span>
              <span className="font-mono">{r.number}</span>
            </li>
          ))}
          {!missing.length && <p className="text-xs text-gray-400">— none —</p>}
        </ul>
      </div>
    </div>
  );
}

function pretty(n) {
  return n.split(' ').map(w => w && (w[0].toUpperCase() + w.slice(1))).join(' ');
}
