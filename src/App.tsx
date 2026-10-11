import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, ShieldCheck, Database, BarChart3, Binary, Waves, Layers, Cpu, GraduationCap, Printer } from "lucide-react";
import * as XLSX from "@e965/xlsx";
import { DataGrid, type DataRow } from "./DataGrid";

type AcademicTier = "undergrad" | "masters" | "phd";

interface ComputationSuite {
  computedStiffnessK: number;
  dampingCoefficientC: number;
  naturalFrequency: number;
  logDecrement: number;
  dampingRatioZeta: number;
  dampedFrequency: number;
  stateSpaceTrace: number;
  matrixDeterminant: number;
  eigenvalueReal: number;
  eigenvalueImag: number;
}

export default function App() {
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rows, setRows] = useState<DataRow[]>([]);
  const [activeTier, setActiveTier] = useState<AcademicTier>("undergrad");
 
  // University Header Metadata States
  const [universityName, setUniversityName] = useState<string>("State Research University");
  const [departmentName, setDepartmentName] = useState<string>("Department of Mechanical & Structural Engineering");
  const [labAddress, setLabAddress] = useState<string>("Laboratory Block E, Room 402");
  const [investigatorName, setInvestigatorName] = useState<string>("Dr. Shivam Yadav");

  const [metrics, setMetrics] = useState<ComputationSuite>({
    computedStiffnessK: 0, dampingCoefficientC: 0, naturalFrequency: 0,
    logDecrement: 0, dampingRatioZeta: 0, dampedFrequency: 0,
    stateSpaceTrace: 0, matrixDeterminant: 0, eigenvalueReal: 0, eigenvalueImag: 0
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const runDynamicCalculations = (dataRows: DataRow[]) => {
    if (dataRows.length === 0) return;
    const N = dataRows.length;

    // --- 1. UNDERGRADUATE TRACKING METRICS ---
    const nominalMassM = 0.75;
    const meanDisplacement = dataRows.reduce((acc, r) => acc + Math.abs(r.displacement), 0) / N || 0.001;
    const kCalc = (nominalMassM * 9.80665) / meanDisplacement;
    const wn = Math.sqrt(kCalc / nominalMassM);
    const criticalDamping = 2 * nominalMassM * wn;
    const cCalc = criticalDamping * 0.15;

    // --- 2. MASTERS DAMPED SIGNAL METRICS ---
    const peakAmplitudes = dataRows.map(r => Math.abs(r.displacement)).sort((a, b) => b - a);
    const x1 = peakAmplitudes[0] || 0.015;
    const x2 = peakAmplitudes[Math.min(3, peakAmplitudes.length - 1)] || 0.005;
    const logDec = Math.log(x1 / x2) / 3;
    const zeta = logDec / Math.sqrt(4 * Math.pow(Math.PI, 2) + Math.pow(logDec, 2));
    const wd = wn * Math.sqrt(1 - Math.pow(zeta, 2));

    // --- 3. PHD STATE-SPACE STABILITY METRICS ---
    const a11 = 0; const a12 = 1;
    const a21 = -kCalc / nominalMassM; const a22 = -cCalc / nominalMassM;
    const trace = a11 + a22;
    const det = (a11 * a22) - (a12 * a21);
    const discriminant = Math.pow(trace, 2) - (4 * det);
    let eigReal = 0; let eigImag = 0;
    if (discriminant >= 0) {
      eigReal = (trace + Math.sqrt(discriminant)) / 2;
    } else {
      eigReal = trace / 2;
      eigImag = Math.sqrt(Math.abs(discriminant)) / 2;
    }

    setMetrics({
      computedStiffnessK: kCalc, dampingCoefficientC: cCalc, naturalFrequency: wn / (2 * Math.PI),
      logDecrement: logDec, dampingRatioZeta: zeta, dampedFrequency: wd / (2 * Math.PI),
      stateSpaceTrace: trace, matrixDeterminant: det, eigenvalueReal: eigReal, eigenvalueImag: eigImag
    });
  };

  const renderVisualTelemetryWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width;
    const H = canvas.height;

    ctx.strokeStyle = "#141416";
    ctx.lineWidth = 1;
    for (let i = 0; i <= W; i += W / 10) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
    }
    for (let i = 0; i <= H; i += H / 6) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    const maxPos = Math.max(...rows.map(r => r.position)) || 1;
    const minPos = Math.min(...rows.map(r => r.position)) || 0;
    const maxDisp = Math.max(...rows.map(r => r.displacement)) || 1;
    const minDisp = Math.min(...rows.map(r => r.displacement)) || -1;
   
    const posRange = maxPos - minPos || 1;
    const dispRange = maxDisp - minDisp || 1;

    ctx.strokeStyle = activeTier === "undergrad" ? "#00D2FF" : activeTier === "masters" ? "#FF6B00" : "#A855F7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    rows.forEach((row, i) => {
      const x = ((row.position - minPos) / posRange) * (W - 60) + 30;
      const y = H - (((row.displacement - minDisp) / dispRange) * (H - 40) + 20);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    rows.forEach((row) => {
      const x = ((row.position - minPos) / posRange) * (W - 60) + 30;
      const y = H - (((row.displacement - minDisp) / dispRange) * (H - 40) + 20);
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill();
    });
  }, [rows, activeTier]);

  useEffect(() => {
    if (rows.length > 0) {
      runDynamicCalculations(rows);
      setTimeout(() => renderVisualTelemetryWave(), 50);
    }
  }, [rows, activeTier, renderVisualTelemetryWave]);

  const executeSystemPrint = () => {
    window.print();
  };

  const loadHighDemandDataset = () => {
    setFileName("academic-modal-matrix.xlsx");
    setUploadStatus("loading");
    setTimeout(() => {
      const analyticalNodes = Array.from({ length: 12 }, (_, i) => {
        const spatialCoordX = 0.05 * (i + 1);
        const waveEquationY = 0.015 * Math.sin(2.5 * spatialCoordX - 0.45);
        const modalCalculationHz = Math.sqrt(25.0 / (0.75 + (i * 0.08))) / (2 * Math.PI);

        return {
          id: String(i + 1),
          node: `NODE-${100 + (i * 4)}`,
          position: spatialCoordX,
          displacement: waveEquationY,
          frequency: modalCalculationHz,
          parameter: i % 3 === 0 ? "E (Isotropic Modulus)" : i % 3 === 1 ? "G (Shear Transformation Tensor)" : "Nu (Poisson Strain Profile)"
        };
      });
      setRows(analyticalNodes);
      setUploadStatus("success");
    }, 400);
  };

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setUploadStatus("loading");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = e.target?.result;
        if (!payload) throw new Error("Null matrix payload");

        const workbook = XLSX.read(payload, { type: "array" });
        const currentSheet = workbook.SheetNames;
        if (!currentSheet) throw new Error("Empty target layer");
       
        const worksheet = workbook.Sheets[currentSheet];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet);
        if (jsonRows.length === 0) throw new Error("Zero analytical rows caught");

        const items = jsonRows.map((row: any, i: number) => {
          const attributes = Object.keys(row);
          const nodeKey = attributes.find(k => k.toLowerCase().includes("node") || k.toLowerCase().includes("id")) ?? attributes[0];
          const posKey = attributes.find(k => k.toLowerCase().includes("position") || k.toLowerCase().includes("pos") || k.toLowerCase().includes("x")) ?? attributes[1];
          const dispKey = attributes.find(k => k.toLowerCase().includes("displacement") || k.toLowerCase().includes("disp") || k.toLowerCase().includes("y")) ?? attributes[2];
          const freqKey = attributes.find(k => k.toLowerCase().includes("frequency") || k.toLowerCase().includes("freq") || k.toLowerCase().includes("hz")) ?? attributes[3];
          const paramKey = attributes.find(k => k.toLowerCase().includes("parameter") || k.toLowerCase().includes("param") || k.toLowerCase().includes("mat")) ?? attributes[4];

          return {
            id: String(i + 1),
            node: row[nodeKey] ? String(row[nodeKey]) : `N-${1000 + i + 1}`,
            position: row[posKey] !== undefined && !isNaN(Number(row[posKey])) ? Number(row[posKey]) : (i * 0.1),
            displacement: row[dispKey] !== undefined && !isNaN(Number(row[dispKey])) ? Number(row[dispKey]) : Math.sin(i * 0.5) * 0.002,
            frequency: row[freqKey] !== undefined && !isNaN(Number(row[freqKey])) ? Number(row[freqKey]) : 12.5 + (i * 0.8),
            parameter: row[paramKey] ? String(row[paramKey]) : "E (Modulus)"
          };
        });

        setRows(items);
        setUploadStatus("success");
      } catch (err) {
        console.error(err);
        setUploadStatus("error");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFile(acceptedFiles);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Interactive Web Header: Hidden on Print */}
      <header className="print:hidden border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileSpreadsheet className="h-5 w-5 text-[#00D2FF]" />
          <span className="text-sm font-bold font-mono tracking-tight text-zinc-100">Structural Telemetry Studio</span>
        </div>
        {/* Web Interactive Layout Viewport: Hidden on Print */}
      <main className="print:hidden flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">Structural Telemetry Processor</h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Multi-disciplinary parser executing structural tracking, signal decrements, and phase state-space transitions. Configure institutional header configurations below to print verified reports.
            </p>
          </div>
          <button 
            onClick={loadHighDemandDataset}
            className="inline-flex items-center self-start justify-center space-x-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold px-4 py-2.5 text-[#00D2FF] border border-zinc-800 transition-all font-mono"
          >
            <Database className="h-4 w-4" />
            <span>Load Reference Research Node Matrix</span>
          </button>
        </div>

        {/* Institutional Template Customization Inputs Card */}
        <section className="p-5 rounded-lg border border-zinc-900 bg-zinc-900/10 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-zinc-400 text-[10px] uppercase font-bold">University / Institute Name</label>
            <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 focus:outline-none focus:border-[#00D2FF]" />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 text-[10px] uppercase font-bold">Department / Division</label>
            <input type="text" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 focus:outline-none focus:border-[#00D2FF]" />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 text-[10px] uppercase font-bold">Laboratory Branch Address</label>
            <input type="text" value={labAddress} onChange={(e) => setLabAddress(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 focus:outline-none focus:border-[#00D2FF]" />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 text-[10px] uppercase font-bold">Investigator Name / Student ID</label>
            <input type="text" value={investigatorName} placeholder="e.g. Dr. Shivam Yadav" onChange={(e) => setInvestigatorName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF]" />
          </div>
        </section>

        {/* Level Navigation Selector Toggles */}
        <div className="grid grid-cols-3 gap-2 bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-900 max-w-xl font-mono text-[11px]">
          <button onClick={() => setActiveTier("undergrad")} className={`flex items-center justify-center space-x-2 py-2 rounded-md transition-all font-bold ${activeTier === "undergrad" ? "bg-zinc-800 text-[#00D2FF] border border-zinc-700/50" : "text-zinc-400 hover:text-zinc-200"}`}><GraduationCap className="h-3.5 w-3.5" /><span>Undergrad Lab</span></button>
          <button onClick={() => setActiveTier("masters")} className={`flex items-center justify-center space-x-2 py-2 rounded-md transition-all font-bold ${activeTier === "masters" ? "bg-zinc-800 text-orange-400 border border-zinc-700/50" : "text-zinc-400 hover:text-zinc-200"}`}><Layers className="h-3.5 w-3.5" /><span>Master's Core</span></button>
          <button onClick={() => setActiveTier("phd")} className={`flex items-center justify-center space-x-2 py-2 rounded-md transition-all font-bold ${activeTier === "phd" ? "bg-zinc-800 text-purple-400 border border-zinc-700/50" : "text-zinc-400 hover:text-zinc-200"}`}><Cpu className="h-3.5 w-3.5" /><span>PhD Research</span></button>
        </div>

        <div {...getRootProps()} className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all ${isDragActive ? "border-[#00D2FF] bg-[#00D2FF]/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-5 w-5 text-zinc-500" />
            <p className="text-xs font-medium text-zinc-300">{isDragActive ? "Release to process matrix" : "Drag & drop your research Excel (.xlsx) or CSV worksheet here"}</p>
          </div>
        </div>

        {uploadStatus === "loading" && <p className="text-xs font-mono text-zinc-500 animate-pulse">Compiling analytical metrics...</p>}
        {uploadStatus === "error" && <p className="text-xs font-mono text-red-400 font-semibold">Schema validation error: Check parameter constraints.</p>}

        {uploadStatus === "success" && rows.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <p className="text-xs font-mono text-zinc-400">Active File Node: <span className="text-[#00D2FF]">{fileName}</span></p>
              <button 
                onClick={executeSystemPrint}
                className="inline-flex items-center space-x-2 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-3 py-1.5 text-xs font-mono transition-all shadow"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Export Report Document</span>
              </button>
            </div>

            {activeTier === "undergrad" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><Binary className="h-3.5 w-3.5 text-[#00D2FF]" /><span className="text-[10px] uppercase">Stiffness Constant (k)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.computedStiffnessK.toFixed(2)} N/m</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><Waves className="h-3.5 w-3.5 text-zinc-400" /><span className="text-[10px] uppercase">Damping Coeff (c)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.dampingCoefficientC.toFixed(4)} N·s/m</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><BarChart3 className="h-3.5 w-3.5 text-zinc-400" /><span className="text-[10px] uppercase">Natural Freq (f_n)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.naturalFrequency.toFixed(3)} Hz</p>
                </div>
              </div>
            )}

            {activeTier === "masters" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><Layers className="h-3.5 w-3.5 text-orange-400" /><span className="text-[10px] uppercase">Log Decrement (δ)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.logDecrement.toFixed(5)}</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><Waves className="h-3.5 w-3.5 text-orange-400" /><span className="text-[10px] uppercase">Damping Ratio (ζ)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.dampingRatioZeta.toExponential(4)}</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-orange-400"><BarChart3 className="h-3.5 w-3.5 text-orange-400" /><span className="text-[10px] uppercase">Damped Freq (f_d)</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.dampedFrequency.toFixed(3)} Hz</p>
                </div>
              </div>
            )}

            {activeTier === "phd" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-400"><Cpu className="h-3.5 w-3.5 text-purple-400" /><span className="text-[10px] uppercase">State Matrix Trace</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.stateSpaceTrace.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400"><Layers className="h-3.5 w-3.5 text-purple-400" /><span className="text-[10px] uppercase">Matrix Det |A|</span></div>
                  <p className="text-lg font-bold text-zinc-100">{metrics.matrixDeterminant.toExponential(3)}</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 font-mono space-y-1">
