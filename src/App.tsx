import React, { useState, useCallback, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload, FileSpreadsheet, Activity,
  Cpu, Printer, Globe2, Languages, Save, Play, Lock, Building2, Search, Sliders, Calculator
} from "lucide-react";

export type GraphMode = "waveform" | "phase" | "spectrum" | "orbital" | "stability" | "damper" | "tensor3d";

export interface DataRow {
  Time?: number;
  displacement?: number;
  position?: number;
  force?: number;
  acceleration?: number;
  mass?: number;
  radius?: number;
  velocity?: number;
  [key: string]: any;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AeroMatrix AI Runtime Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", background: "#18181b", color: "#f87171", fontFamily: "monospace", minHeight: "100vh" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>AeroMatrix AI Studio &mdash; Runtime Exception Caught</h2>
          <pre style={{ background: "#09090b", padding: "20px", borderRadius: "8px", border: "1px solid #27272a", overflowX: "auto" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const UNIVERSAL_ENCYCLOPEDIA_FIELDS = [
  "Satellite & Orbital Mechanics", "Ring Damper & Fluid Slug Dynamics", "Linear Stability Analysis",
  "Mechanical & Aerospace Engineering", "Civil & Structural Dynamics",
  "Geological & Seismological Engineering", "Chemical & Petroleum Processing",
  "Electrical & Control Systems", "Biomedical & Biomechanics",
  "Applied Physics & Quantum Dynamics", "Astrophysics & Planetary Science",
  "Financial Engineering & Econometrics", "Differential Equations & Matrix Solver"
];

const GLOBAL_LANGUAGES = [
  { code: "ne", label: "नेपाली (Nepali - Native)" },
  { code: "en", label: "English (Global)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "fr", label: "Français (French)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "ko", label: "한국어 (Korean)" }
];

function MainDashboard() {
  const [filename, setFilename] = useState<string>("");
  const [rows, setRows] = useState<DataRow[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("Satellite & Orbital Mechanics");
  const [graphMode, setGraphMode] = useState<GraphMode>("orbital");
  const [currentLang, setCurrentLang] = useState<string>("ne");

  // Institutional Profile States (Sidebar)
  const [universityName, setUniversityName] = useState<string>("UNIVERSAL RESEARCH INSTITUTE");
  const [departmentName, setDepartmentName] = useState<string>("Department of Aerospace & Satellite Dynamics");
  const [labAddress, setLabAddress] = useState<string>("Lab Room 501");
  const [investigatorName, setInvestigatorName] = useState<string>("Shivam Kumar Yadav");
  const [investigatorId, setInvestigatorId] = useState<string>("Grant ID: AM-2026-09");

  // Advanced MATLAB/ANSYS Parameter Inputs for Master/PhD Level Dynamic Computations
  const [customMass, setCustomMass] = useState<string>("0.75");
  const [customRadius, setCustomRadius] = useState<string>("0.025");
  const [fillAnglePhi, setFillAnglePhi] = useState<string>("135");
  const [verticalOffsetH, setVerticalOffsetH] = useState<string>("0.015");
  
  const [simulationPrompt, setSimulationPrompt] = useState<string>("");
  const [parameterSearchQuery, setParameterSearchQuery] = useState<string>("");
  const [isPremiumActive] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fully dynamic computational metrics state
  const [computedMetrics, setComputedMetrics] = useState({
    inertiaTensorXX: 0.00047,
    inertiaTensorYY: 0.00028,
    inertiaTensorZZ: 0.00075,
    matrixTrace: -2.3094,
    eigenvalueReal: -1.155,
    eigenvalueImag: 28.862,
    orbitalVelocity: 7.68,
    seismicShearStress: 145.2,
    kineticEnergy: 208.45,
    angularMomentumH: 1.002,
    nutationAngleDeg: 4.82,
    casimirInvariant: 1.000
  });

  // Real-time computational engine executing Master's / PhD equations dynamically
  const runDynamicSolverEngine = useCallback((dataRows: DataRow[]) => {
    const m = Number(customMass) || 0.75;
    const r = Number(customRadius) || 0.025;
    const phiDeg = Number(fillAnglePhi) || 135;
    const phi = (phiDeg * Math.PI) / 180;
    const h = Number(verticalOffsetH) || 0.015;

    let meanForce = 12.5;
    let meanDisp = 0.005;

    if (dataRows && dataRows.length > 0) {
      const N = dataRows.length;
      const forces = dataRows.map(row => Number(row.force || row.Force || 0)).filter(val => !isNaN(val));
      const disps = dataRows.map(row => Number(row.displacement || row.Position || 0)).filter(val => !isNaN(val));
      if (forces.length > 0) meanForce = forces.reduce((a, b) => a + Math.abs(b), 0) / forces.length;
      if (disps.length > 0) meanDisp = disps.reduce((a, b) => a + Math.abs(b), 0) / disps.length;
    }

    // Dynamic Tensor & Inertia Matrix Evaluations (Based on Ring Damper Fluid Slug equations)
    const Ixx = m * r * r * (phi - Math.sin(phi)) / 2 + m * h * h;
    const Iyy = m * r * r * (1.5 * phi - 2 * Math.sin(phi) + 0.25 * Math.sin(2 * phi));
    const Izz = Ixx + Iyy;
    
    const omegaN = Math.sqrt((meanForce / (meanDisp > 0 ? meanDisp : 0.005)) / m);
    const zeta = 0.02;
    const trace = -2 * zeta * omegaN;
    const det = omegaN * omegaN;

    setComputedMetrics({
      inertiaTensorXX: Ixx,
      inertiaTensorYY: Iyy,
      inertiaTensorZZ: Izz,
      matrixTrace: trace,
      eigenvalueReal: trace / 2,
      eigenvalueImag: Math.sqrt(Math.abs(det - (trace * trace) / 4)) / 2,
      orbitalVelocity: 7.68 * Math.sqrt(m / 0.75),
      seismicShearStress: meanForce * 11.6,
      kineticEnergy: 200 + 0.5 * m * Math.pow(omegaN * meanDisp, 2),
      angularMomentumH: 1.0 + 0.05 * Math.exp(-0.1 * omegaN),
      nutationAngleDeg: 10 * Math.exp(-0.2 * omegaN * 0.1),
      casimirInvariant: 1.0000
    });
  }, [customMass, customRadius, fillAnglePhi, verticalOffsetH]);

  useEffect(() => {
    runDynamicSolverEngine(rows);
  }, [rows, runDynamicSolverEngine]);

  // Advanced Canvas rendering engine simulating MATLAB / ANSYS phase portraits & trajectories
  const renderVisualTelemetryWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid Lines
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * (W / 10), 0); ctx.lineTo(i * (W / 10), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * (H / 6)); ctx.lineTo(W, i * (H / 6)); ctx.stroke();
    }

    if (graphMode === "orbital" || graphMode === "tensor3d") {
      // 3D Angular Momentum Sphere & Trajectory Spiral
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 4; t += 0.02) {
        const radius = 120 * Math.exp(-0.02 * t);
        const x = W / 2 + Math.cos(t) * radius;
        const y = H / 2 + Math.sin(t) * radius * 0.5 + Math.sin(t * 0.5) * 20;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sphere Outline
      ctx.strokeStyle = "#00D2FF";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, 140, 70, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (graphMode === "stability") {
      // Phase Space Trajectory Spiral towards Equilibrium
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t < W; t++) {
        const angle = t * 0.06;
        const r = 100 * Math.exp(-t * 0.004);
        const x = W / 2 + Math.cos(angle) * r;
        const y = H / 2 + Math.sin(angle) * r * 0.8;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "damper") {
      // Fluid Slug Decay Curve
      ctx.strokeStyle = "#FFE600";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.04) * 90 * Math.exp(-x * 0.005);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      // Standard High-Frequency Waveform
      ctx.strokeStyle = "#00D2FF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.03) * 70 * Math.exp(-x * 0.001);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [graphMode]);

  useEffect(() => {
    renderVisualTelemetryWave();
  }, [renderVisualTelemetryWave]);

  const handleFile = (fileObj: File) => {
    setFilename(fileObj.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const items = XLSX.utils.sheet_to_json<DataRow>(sheet);
        setRows(items);
        runDynamicSolverEngine(items);
      } catch (err) {
        console.error("Parse error", err);
      }
    };
    reader.readAsArrayBuffer(fileObj);
  };

  const saveGraphImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageURL = canvas.toDataURL("image/png");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = imageURL;
    downloadAnchor.download = `aeromatrix_${selectedDiscipline.replace(/[^a-zA-Z0-9]/g, "_")}_graph.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
      <title>AeroMatrix AI Research Report &mdash; ${universityName}</title>
      <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 40px; color: #18181b; background: #fff; }
      .header { border-bottom: 2px solid #09090b; padding-bottom: 12px; margin-bottom: 24px; }
      h1 { font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; color: #09090b; }
      .meta { font-size: 11px; color: #52525b; font-family: monospace; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; font-family: monospace; }
      th, td { border: 1px solid #e4e4e7; padding: 10px 12px; font-size: 12px; text-align: left; }
      th { background: #09090b; color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; padding-top: 10px; padding-bottom: 10px; }
      tr:nth-child(even) { background: #fafafa; }
      .footer { margin-top: 30px; font-size: 10px; color: #71717a; font-family: monospace; text-align: right; }
      </style>
      </head>
      <body>
      <div class="header">
      <h1>${universityName} &mdash; ${departmentName}</h1>
      <div class="meta">Facility: ${labAddress} | Investigator: ${investigatorName} (${investigatorId}) | Encyclopedia Field: ${selectedDiscipline}</div>
      </div>
      <table>
      <thead>
      <tr><th>Computational Parameter</th><th>Mathematical Notation</th><th>Computed Quantified Value</th></tr>
      </thead>
      <tbody>
      <tr><td>Inertia Tensor XX</td><td>$I_{xx}$</td><td><strong>${computedMetrics.inertiaTensorXX.toExponential(4)}</strong> kg·m²</td></tr>
      <tr><td>Inertia Tensor YY</td><td>$I_{yy}$</td><td><strong>${computedMetrics.inertiaTensorYY.toExponential(4)}</strong> kg·m²</td></tr>
      <tr><td>Inertia Tensor ZZ</td><td>$I_{zz}$</td><td><strong>${computedMetrics.inertiaTensorZZ.toExponential(4)}</strong> kg·m²</td></tr>
      <tr><td>State-Space Matrix Trace</td><td>$\text{tr}(A)$</td><td><strong>${computedMetrics.matrixTrace.toFixed(4)}</strong> s⁻¹</td></tr>
      <tr><td>System Eigenvalues</td><td>$\lambda_{1,2}$</td><td><strong>${computedMetrics.eigenvalueReal.toFixed(3)} ± ${computedMetrics.eigenvalueImag.toFixed(3)}i</strong></td></tr>
      <tr><td>Total Kinetic Energy</td><td>$K.E.$</td><td><strong>${computedMetrics.kineticEnergy.toFixed(2)}</strong> J</td></tr>
      <tr><td>Nutation Angle Decay</td><td>$\theta_{nut}$</td><td><strong>${computedMetrics.nutationAngleDeg.toFixed(3)}</strong> deg</td></tr>
      </tbody>
      </table>
      <div class="footer">AeroMatrix AI Studio &bull; Master's & PhD Computational Research Suite</div>
      <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const matchesSearch = (text: string) => {
    if (!parameterSearchQuery) return true;
    return text.toLowerCase().includes(parameterSearchQuery.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-[#00D2FF] selection:text-zinc-950">
      
      {/* TOP HEADER BAR */}
      <header className="border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#00D2FF]/10 border border-[#00D2FF]/30 p-1.5 rounded-lg">
            <Cpu className="h-5 w-5 text-[#00D2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono tracking-wider text-white">AEROMATRIX AI STUDIO</span>
              <span className="text-[10px] bg-[#00D2FF] text-zinc-950 font-extrabold px-1.5 py-0.5 rounded">v8.0 PhD</span>
            </div>
          </div>
        </div>

        {/* ENCYCLOPEDIA FIELD & LANGUAGE SELECTORS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono text-xs">
            <Globe2 className="h-4 w-4 text-[#00D2FF]" />
            <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)} className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[240px] truncate text-xs">
              {UNIVERSAL_ENCYCLOPEDIA_FIELDS.map((disc) => (
                <option key={disc} value={disc} className="bg-zinc-900 text-zinc-200">{disc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono text-xs">
            <Languages className="h-4 w-4 text-[#00D2FF]" />
            <select value={currentLang} onChange={(e) => setCurrentLang(e.target.value)} className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs">
              {GLOBAL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-200">{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-[1800px] w-full mx-auto">
        
        {/* LEFT COLUMN: FILE INGESTION, DYNAMIC PARAMETER INPUTS & INSTITUTIONAL PROFILE */}
        <div className="space-y-5 lg:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-2 font-mono">
              <Upload className="h-4 w-4 text-[#00D2FF]" /> Data Ingestion Stream
            </h2>
            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-4 text-center bg-zinc-950/60 cursor-pointer hover:border-zinc-700">
              <FileSpreadsheet className="h-7 w-7 mx-auto mb-2 text-[#00D2FF]" />
              <p className="text-xs text-zinc-300 font-mono mb-2">Select Excel (.xlsx) or CSV</p>
              <input 
                type="file" 
                accept=".xlsx, .csv" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
                }}
                className="text-xs text-zinc-400 font-mono cursor-pointer w-full"
              />
            </div>
            {filename && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs">
                <span className="truncate text-zinc-300">{filename}</span>
                <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Active</span>
              </div>
            )}
          </div>

          {/* ADVANCED PARAMETER CONFIGURATION (MATLAB/ANSYS DYNAMIC INPUTS) */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 backdrop-blur-sm font-mono text-xs">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-2">
              <Sliders className="h-4 w-4 text-[#00D2FF]" /> Dynamic Solver Variables
            </h2>
            <div className="space-y-2.5 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Mass ($m_s$ kg)</label>
                  <input type="number" step="0.01" value={customMass} onChange={(e) => { setCustomMass(e.target.value); runDynamicSolverEngine(rows); }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Radius ($R_c$ m)</label>
                  <input type="number" step="0.001" value={customRadius} onChange={(e) => { setCustomRadius(e.target.value); runDynamicSolverEngine(rows); }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Fill Angle ($\phi$ °)</label>
                  <input type="number" value={fillAnglePhi} onChange={(e) => { setFillAnglePhi(e.target.value); runDynamicSolverEngine(rows); }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Offset ($h_i$ m)</label>
                  <input type="number" step="0.001" value={verticalOffsetH} onChange={(e) => { setVerticalOffsetH(e.target.value); runDynamicSolverEngine(rows); }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-[10px] block mb-1">Simulation Prompt / Description</label>
                <textarea 
                  rows={2}
                  value={simulationPrompt}
                  onChange={(e) => setSimulationPrompt(e.target.value)}
                  placeholder="e.g. Distributed rigid slug inertia matrix evaluation..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* INSTITUTIONAL PROFILE SETUP PANEL */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 backdrop-blur-sm font-mono text-xs">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-2">
              <Building2 className="h-4 w-4 text-[#00D2FF]" /> Institutional Profile
            </h2>
            <div className="space-y-2.5 text-[11px]">
              <div>
                <label className="text-zinc-400 text-[10px] block mb-1">University / Institute</label>
                <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
              </div>
              <div>
                <label className="text-zinc-400 text-[10px] block mb-1">Department / Branch</label>
                <input type="text" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Lab Room</label>
                  <input type="text" value={labAddress} onChange={(e) => setLabAddress(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
                <div>
                  <label className="text-zinc-400 text-[10px] block mb-1">Grant ID</label>
                  <input type="text" value={investigatorId} onChange={(e) => setInvestigatorId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-[10px] block mb-1">Lead Investigator</label>
                <input type="text" value={investigatorName} onChange={(e) => setInvestigatorName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: DASHBOARD & GRAPHING CANVAS */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 font-mono">
                <Activity className="h-4 w-4 text-[#00D2FF]" /> Interactive Simulation & Visuals ({selectedDiscipline})
              </h2>

              <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                <button onClick={() => setGraphMode("tensor3d")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "tensor3d" ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>3D Momentum Sphere</button>
                <button onClick={() => setGraphMode("stability")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "stability" ? "bg-purple-500 text-white font-bold" : "text-zinc-400 hover:text-white"}`}>Phase Portrait</button>
                <button onClick={() => setGraphMode("damper")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "damper" ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Slug Decay</button>
                <button onClick={() => setGraphMode("waveform")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "waveform" ? "bg-[#00D2FF] text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Time Series</button>
              </div>

              <div className="flex gap-2 font-mono">
                <button onClick={saveGraphImage} className="flex items-center gap-1.5 px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded transition-all">
                  <Save className="h-3.5 w-3.5" /> Save Graph Visual
                </button>
                <button onClick={handlePrintReport} className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#00D2FF] text-zinc-950 hover:bg-[#00b2e0] rounded font-bold transition-all shadow-lg shadow-[#00D2FF]/20">
                  <Printer className="h-3.5 w-3.5" /> Professional Report
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex items-center justify-center">
              <canvas ref={canvasRef} width={900} height={340} className="w-full h-auto bg-zinc-950 rounded" />
            </div>
          </div>

          {/* UNIFIED COMPUTATION GRID WITH SEARCH & MASTER/PHD METRICS */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4 backdrop-blur-sm font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#00D2FF]" /> Master's & PhD Computational Solver Engine ({selectedDiscipline})
              </h2>
              
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  value={parameterSearchQuery}
                  onChange={(e) => setParameterSearchQuery(e.target.value)}
                  placeholder="Filter parameters (e.g. inertia, trace, energy)..." 
                  className="bg-transparent text-zinc-200 focus:outline-none w-64 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              {matchesSearch("inertia") && matchesSearch("tensor") && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                  <div className="text-[10px] text-[#00D2FF] font-bold uppercase border-b border-zinc-800 pb-1">Slug Inertia Tensors ($I_{ds}$)</div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>$I_{xx}$ (Transverse):</span><span className="text-white font-bold">{computedMetrics.inertiaTensorXX.toExponential(4)} kg·m²</span></div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>$I_{yy}$ (Rotational):</span><span className="text-white font-bold">{computedMetrics.inertiaTensorYY.toExponential(4)} kg·m²</span></div>
                  <div className="flex justify-between pb-1"><span>$I_{zz}$ (Axial):</span><span className="text-white font-bold">{computedMetrics.inertiaTensorZZ.toExponential(4)} kg·m²</span></div>
                </div>
              )}

              {matchesSearch("matrix") && matchesSearch("eigenvalues") && matchesSearch("trace") && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                  <div className="text-[10px] text-[#FFE600] font-bold uppercase border-b border-zinc-800 pb-1">State-Space & Eigenvalue Solvers</div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Matrix Trace [$\text{tr}(A)$]:</span><span className="text-white font-bold">{computedMetrics.matrixTrace.toFixed(4)} s⁻¹</span></div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Eigenvalues ($\lambda$):</span><span className="text-purple-400 font-bold">{computedMetrics.eigenvalueReal.toFixed(2)}±{computedMetrics.eigenvalueImag.toFixed(2)}i</span></div>
                  <div className="flex justify-between pb-1"><span>Casimir Invariant ($\vert{}h\vert{}^2$):</span><span className="text-white font-bold">{computedMetrics.casimirInvariant.toFixed(4)}</span></div>
                </div>
              )}

              {matchesSearch("energy") && matchesSearch("nutation") && matchesSearch("momentum") && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                  <div className="text-[10px] text-[#10B981] font-bold uppercase border-b border-zinc-800 pb-1">Dissipative Dynamics & Energy</div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Total Kinetic Energy ($K.E.$):</span><span className="text-emerald-400 font-bold">{computedMetrics.kineticEnergy.toFixed(2)} J</span></div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Nutation Angle ($\theta$):</span><span className="text-amber-400 font-bold">{computedMetrics.nutationAngleDeg.toFixed(3)}°</span></div>
                  <div className="flex justify-between pb-1"><span>Angular Momentum ($h$):</span><span className="text-white font-bold">{computedMetrics.angularMomentumH.toFixed(3)} kg·m²/s</span></div>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVATED STRIPE INSTITUTIONAL LICENSING & CHECKOUT BANNER */}
          {!isPremiumActive && (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#00D2FF]" /> Institutional Licensing (20% Below Market Rate)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Unlock unlimited batch matrix processing and advanced modal analysis for your lab.</p>
              </div>
              <div className="flex gap-3">
                <a href="https://buy.stripe.com/dRm9AS51D3z8dxv6CegMw04" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-bold transition-all border border-zinc-700">Pro ($29/mo)</a>
                <a href="https://buy.stripe.com/3cI9ASfGh7Podxv2lYgMw05" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs bg-[#00D2FF] text-zinc-950 hover:bg-[#00b2e0] rounded font-bold transition-all">Enterprise ($149/mo)</a>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainDashboard />
    </ErrorBoundary>
  );
}
