import React from "react";

export interface DataRow {
  id: string;
  node: string;
  position: number;
  displacement: number;
  frequency: number;
  parameter: string;
}

interface DataGridProps {
  rows: DataRow[];
}

export function DataGrid({ rows }: DataGridProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
              <th className="p-3.5 font-semibold text-[#00D2FF]">ID</th>
              <th className="p-3.5 font-semibold">Node ID</th>
              <th className="p-3.5 font-semibold">Spatial Position (m)</th>
              <th className="p-3.5 font-semibold">Displacement (mm)</th>
              <th className="p-3.5 font-semibold text-orange-500">Modal Freq (Hz)</th>
              <th className="p-3.5 font-semibold">Constitutive Parameter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="p-3.5 text-zinc-500 font-bold">{row.id}</td>
                <td className="p-3.5 text-[#00D2FF] font-semibold">{row.node}</td>
                <td className="p-3.5">{row.position.toFixed(3)}</td>
                <td className="p-3.5 font-semibold text-emerald-400">{row.displacement.toFixed(4)}</td>
                <td className="p-3.5 text-orange-400">{row.frequency.toFixed(2)}</td>
                <td className="p-3.5 text-zinc-400 italic">{row.parameter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
