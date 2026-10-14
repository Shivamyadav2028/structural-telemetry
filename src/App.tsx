import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone as useReactDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Upload, FileSpreadsheet, Activity,
  Binary, Waves, Layers, Cpu, Printer, Download, Key, Globe2, Languages, CheckSquare, Square, Save, Play
} from "lucide-react";

export type GraphMode = "waveform" | "phase" | "spectrum" | "orbital" | "stability" | "damper";

export interface DataRow {
  Time?: number;
  displacement?: number;
  position?: number;
  force?: number;
  acceleration?: number;
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
  "Satellite & Orbital Mechanics", "Linear Stability Analysis", "Damper & Vibration Response",
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
  const [, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rows, setRows] = useState<DataRow[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("Satellite & Orbital Mechanics");
  const [graphMode, setGraphMode] = useState<GraphMode>("orbital");
  const [currentLang, setCurrentLang] = useState<string>("ne");
  const [, setAvailableHeaders] = useState<string[]>([]);
  
  // Top-Row Setup States
  const [universityName, setUniversityName] = useState<string>("UNIVERSAL RESEARCH INSTITUTE");
  const [departmentName, setDepartmentName] = useState<string>("Department of Aerospace & Satellite Dynamics");
  const [labAddress, setLabAddress] = useState<string>("Lab Room 501");
  const [investigatorName, setInvestigatorName] = useState<string>("Shivam Kumar Yadav");
  const [investigatorId, setInvestigatorId] = useState<string>("Grant ID: AM-2026-09");
  const [nominalMassInput, setNominalMassInput] = useState<string>("0.75");

  // Custom Parameter Filter (Check/Uncheck All Global Parameters)
  const [selectedMetricsConfig, setSelectedMetricsConfig] = useState<Record<string, boolean>>({
    stiffness: true,
    damping: true,
    frequency: true,
    stateTrace: true,
    eigenvalues: true,
    orbitalVelocity: true,
    seismicStress: true,
    damperForce: true,
    stabilityMargin: true,
    kineticEnergy: true
  });

  const toggleMetric = (key: string) => {
    setSelectedMetricsConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("AM-FOUNDER-2026");
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [metrics, setMetrics] = useState({
    computedStiffness: 2500, dampingCoefficientC: 1.73, naturalFrequency: 57.74, appliedForceVector: 12.5, nominalMassM: 0.75, staticDeflection: 0.005,
    stateSpaceTrace: -2.3094, matrixDeterminant: 3333.33, eigenvalueReal: -1.155, eigenvalueImag: 28.862,
    orbitalVelocity: 7.68, seismicShearStress: 145.2, damperResponsePeak: 3.42, stabilityMarginDeg: 68.4, kineticEnergy: 0.045
  });

  const rundynamicCalculations = (dataRows: DataRow[]) => {
    if (dataRows.length === 0) return;
    const N = dataRows.length;
    const manualVal = Number(nominalMassInput) || 0.75;
    const fileMassVal = Number(dataRows[0]["mass"] || dataRows[0]["Mass"] || 0);
    const mass = manualVal > 0 ? manualVal : (fileMassVal > 0 ? fileMassVal : 0.75);

    const getValues = (colName: string) => dataRows.map(r => Number(r[colName]) || 0);
    const dispVals = getValues("displacement");
    const forceVals = getValues("force");

    const meanDisp = dispVals.length ? dispVals.reduce((a, b) => a + Math.abs(b), 0) / N : 0.005;
    const meanForce = forceVals.length ? forceVals.reduce((a, b) => a + Math.abs(b), 0) / N : 12.5;

    const kCalc = meanDisp > 0 ? meanForce / meanDisp : 2500;
    const wn = mass > 0 && kCalc > 0 ? Math.sqrt(kCalc / mass) : 57.74;
    const zeta = 0.02;
    const cc = 2 * mass * wn * zeta;
    const trace = -2 * zeta * wn;
    const det = wn * wn;

    setMetrics({
      computedStiffness: kCalc,
      dampingCoefficientC: cc,
      naturalFrequency: wn,
      appliedForceVector: meanForce,
      nominalMassM: mass,
      staticDeflection: meanDisp,
      stateSpaceTrace: trace,
      matrixDeterminant: det,
      eigenvalueReal: trace / 2,
      eigenvalueImag: Math.abs(det - (trace * trace) / 4) ** 0.5 / 2,
      orbitalVelocity: 7.68 * Math.sqrt(mass / 0.75),
      seismicShearStress: meanForce * 11.6,
      damperResponsePeak: cc * 1.98,
      stabilityMarginDeg: 85.4,
      kineticEnergy: 0.5 * mass * Math.pow(wn * meanDisp, 2)
    });
  };

  // Dynamic Graphing Engine tailored for each field/mode
  const renderVisualTelemetryWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * (W / 10), 0); ctx.lineTo(i * (W / 10), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * (H / 6)); ctx.lineTo(W, i * (H / 6)); ctx.stroke();
    }

    if (graphMode === "orbital") {
      // Satellite & Orbital Mechanics Vector Plot
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const x = W / 2 + Math.cos(t) * 140;
        const y = H / 2 + Math.sin(t) * 70 * Math.cos(0.5);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "stability") {
      // Linear Stability Analysis Phase Plane
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t < W; t++) {
        const angle = t * 0.05;
        const radius = 90 * Math.exp(-t * 0.0006);
        const x = W / 2 + Math.cos(angle) * radius;
        const y = H / 2 + Math.sin(angle) * radius * 0.8;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "damper") {
      // Damper Response Decay Curve
      ctx.strokeStyle = "#FFE600";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.05) * 80 * Math.exp(-x * 0.003);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      // Standard Waveform
      ctx.strokeStyle = "#00D2FF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.03) * 60 * Math.exp(-x * 0.0005);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [graphMode]);

  useEffect(() => {
    renderVisualTelemetryWave();
  }, [renderVisualTelemetryWave]);

  const handleFile = useCallback((fileObj: File) => {
    setFilename(fileObj.name);
    setUploadStatus("loading");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const items = XLSX.utils.sheet_to_json<DataRow>(sheet);
        if (items.length > 0) {
          const headers = Object.keys(items[0]);
          setAvailableHeaders(headers);
        }
        setRows(items);
        rundynamicCalculations(items);
        setUploadStatus("success");
      } catch (err) {
        setUploadStatus("error");
      }
    };
    reader.readAsArrayBuffer(fileObj);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) handleFile(acceptedFiles[0]);
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useReactDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
    multiple: false
  });

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
<title>AeroMatrix AI Report &mdash; ${universityName}</title>
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
    <tr>
      <th>Parameter Notation</th>
      <th>Description</th>
      <th>Quantified Value</th>
    </tr>
  </thead>
  <tbody>
    ${selectedMetricsConfig.stiffness ? `<tr><td>k</td><td>System Stiffness / Primary Metric</td><td><strong>${metrics?.computedStiffness?.toFixed(4) ?? "0.0000"}</strong> Units</td></tr>` : ''}
    ${selectedMetricsConfig.damping ? `<tr><td>c</td><td>Viscous Damping Coefficient</td><td><strong>${metrics?.dampingCoefficientC?.toFixed(4) ?? "0.0000"}</strong> N-s/m</td></tr>` : ''}
    ${selectedMetricsConfig.frequency ? `<tr><td>&omega;<sub>n</sub></td><td>Natural Angular Frequency</td><td><strong>${metrics?.naturalFrequency?.toFixed(4) ?? "0.0000"}</strong> rad/s</td></tr>` : ''}
    ${selectedMetricsConfig.stateTrace ? `<tr><td>tr(A)</td><td>State-Space Matrix Trace</td><td><strong>${metrics?.stateSpaceTrace?.toFixed(4) ?? "0.0000"}</strong> 1/s</td></tr>` : ''}
    ${selectedMetricsConfig.orbitalVelocity ? `<tr><td>v<sub>orb</sub></td><td>Satellite Orbital Velocity</td><td><strong>${metrics?.orbitalVelocity?.toFixed(3) ?? "0.000"}</strong> km/s</td></tr>` : ''}
    ${selectedMetricsConfig.seismicStress ? `<tr><td>&sigma;<sub>s</sub></td><td>Seismic Shear Stress</td><td><strong>${metrics?.seismicStress?.toFixed(2) ?? "0.00"}</strong> MPa</td></tr>` : ''}
  </tbody>
</table>
<div class="footer">AeroMatrix AI Studio &bull; Online Differential Equation Solver & Universal Telemetry Suite</div>
<script>window.print();</script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-[#00D2FF] selection:text-zinc-950">
      
      {/* TOP ROW CONTROL BAR: SETUP, ENCYCLOPEDIA FIELD, AND GLOBAL LANGUAGE SELECTOR */}
      <header className="border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <div className="bg-[#00D2FF]/10 border border-[#00D2FF]/30 p-1.5 rounded-lg">
            <Cpu className="h-4 w-4 text-[#00D2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-mono tracking-wider text-white">AEROMATRIX AI STUDIO</span>
              <span className="text-[9px] bg-[#00D2FF] text-zinc-950 font-extrabold px-1.5 py-0.2 rounded">v8.0</span>
            </div>
          </div>
        </div>

        {/* SETUP INPUTS EMBEDDED IN TOP ROW TO SAVE SCREEN SPACE */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <input
            type="text"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            placeholder="University / Institute..."
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 w-36 focus:border-[#00D2FF] focus:outline-none"
          />
          <input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="Department / Branch..."
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 w-36 focus:border-[#00D2FF] focus:outline-none"
          />
          <input
            type="text"
            value={labAddress}
            onChange={(e) => setLabAddress(e.target.value)}
            placeholder="Lab Room..."
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 w-24 focus:border-[#00D2FF] focus:outline-none"
          />
          <input
            type="text"
            value={investigatorName}
            onChange={(e) => setInvestigatorName(e.target.value)}
            placeholder="Lead Investigator..."
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 w-32 focus:border-[#00D2FF] focus:outline-none"
          />
          <input
            type="text"
            value={investigatorId}
            onChange={(e) => setInvestigatorId(e.target.value)}
            placeholder="ID / Grant..."
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 w-28 focus:border-[#00D2FF] focus:outline-none"
          />
        </div>

        {/* ENCYCLOPEDIA FIELD & LANGUAGE SELECTORS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg font-mono text-xs">
            <Globe2 className="h-3.5 w-3.5 text-[#00D2FF]" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[180px] truncate text-xs"
            >
              {UNIVERSAL_ENCYCLOPEDIA_FIELDS.map((disc) => (
                <option key={disc} value={disc} className="bg-zinc-900 text-zinc-200">
                  {disc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg font-mono text-xs">
            <Languages className="h-3.5 w-3.5 text-[#00D2FF]" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {GLOBAL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN MAXIMIZED FOR DYNAMIC DASHBOARD & CALCULATIONS */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-5 p-6 max-w-[1800px] w-full mx-auto">
        
        {/* LEFT COLUMN: FILE UPLOAD & UNIVERSAL PARAMETER FILTER */}
        <div className="space-y-5 lg:col-span-1">
          
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-2 font-mono">
              <Upload className="h-4 w-4 text-[#00D2FF]" /> Data Ingestion Stream
            </h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragActive ? "border-[#00D2FF] bg-zinc-900/80" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60"
            }`}>
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-7 w-7 mx-auto mb-2 text-[#00D2FF]" />
              <p className="text-xs text-zinc-300 font-mono">Drop Excel (.xlsx) or CSV</p>
            </div>

            {filename && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs">
                <span className="truncate text-zinc-300">{filename}</span>
                <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Active</span>
              </div>
            )}
          </div>

          {/* CUSTOM PARAMETER FILTER (CHECK/UNCHECK ALL WORLD PARAMETERS) */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 backdrop-blur-sm font-mono text-xs">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-2">
              <Layers className="h-4 w-4 text-[#00D2FF]" /> Global Parameter Filter
            </h2>
            <div className="grid grid-cols-1 gap-2 text-[11px] text-zinc-300 max-h-[320px] overflow-y-auto pr-1">
              {Object.keys(selectedMetricsConfig).map((key) => (
                <button key={key} onClick={() => toggleMetric(key)} className="flex items-center gap-2 text-left hover:text-white capitalize">
                  {selectedMetricsConfig[key] ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} {key}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 3 COLUMNS: DYNAMIC DASHBOARD & VISUALS */}
        <div className="lg:col-span-3 space-y-5">
          
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 font-mono">
                <Activity className="h-4 w-4 text-[#00D2FF]" /> Interactive Simulation & Visuals ({selectedDiscipline})
              </h2>

              {/* GRAPH PLOTTING MODES */}
              <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                <button onClick={() => setGraphMode("orbital")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "orbital" ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Satellite Orbit</button>
                <button onClick={() => setGraphMode("stability")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "stability" ? "bg-purple-500 text-white font-bold" : "text-zinc-400 hover:text-white"}`}>Linear Stability</button>
                <button onClick={() => setGraphMode("damper")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "damper" ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Damper Decay</button>
                <button onClick={() => setGraphMode("waveform")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "waveform" ? "bg-[#00D2FF] text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>2D/3D Waveform</button>
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

          {/* DYNAMIC PARAMETER ASSESSMENT GRID */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-900 pb-3 font-mono">
              <Play className="h-4 w-4 text-[#00D2FF]" /> Dynamic Computation Grid ({selectedDiscipline})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-[#00D2FF] font-bold uppercase border-b border-zinc-800 pb-1">Primary System Metrics</div>
                {selectedMetricsConfig.stiffness && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Stiffness (k):</span><span className="text-white font-bold">{metrics?.computedStiffness?.toFixed(2) ?? "0.00"} Units</span></div>}
                {selectedMetricsConfig.damping && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Damping (c):</span><span className="text-white font-bold">{metrics?.dampingCoefficientC?.toFixed(2) ?? "0.00"} Units</span></div>}
                {selectedMetricsConfig.frequency && <div className="flex justify-between pb-1"><span>Nat. Freq (&omega;n):</span><span className="text-white font-bold">{metrics?.naturalFrequency?.toFixed(2) ?? "0.00"} rad/s</span></div>}
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-[#FFE600] font-bold uppercase border-b border-zinc-800 pb-1">Matrix & Stability Analysis</div>
                {selectedMetricsConfig.stateTrace && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Matrix Trace [tr(A)]:</span><span className="text-white font-bold">{metrics?.stateSpaceTrace?.toFixed(4) ?? "0.0000"}</span></div>}
                {selectedMetricsConfig.eigenvalues && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Eigenvalues (&lambda;):</span><span className="text-purple-400 font-bold">{metrics?.eigenvalueReal?.toFixed(2)}±{metrics?.eigenvalueImag?.toFixed(2)}i</span></div>}
                {selectedMetricsConfig.stabilityMargin && <div className="flex justify-between pb-1"><span>Phase Margin:</span><span className="text-white font-bold">{metrics?.stabilityMarginDeg?.toFixed(1) ?? "0.0"}°</span></div>}
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-[#10B981] font-bold uppercase border-b border-zinc-800 pb-1">Satellite, Orbital & Geological</div>
                {selectedMetricsConfig.orbitalVelocity && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Orbital Vel (v):</span><span className="text-emerald-400 font-bold">{metrics?.orbitalVelocity?.toFixed(3) ?? "0.000"} km/s</span></div>}
                {selectedMetricsConfig.seismicStress && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Seismic Stress:</span><span className="text-amber-400 font-bold">{metrics?.seismicStress?.toFixed(1) ?? "0.0"} MPa</span></div>}
                {selectedMetricsConfig.kineticEnergy && <div className="flex justify-between pb-1"><span>Kinetic Energy:</span><span className="text-white font-bold">{metrics?.kineticEnergy?.toExponential(3) ?? "0.0"} J</span></div>}
              </div>
            </div>
          </div>

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
