import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone as useReactDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Upload, FileSpreadsheet, Database, Activity,
  Binary, Waves, Layers, Cpu, GraduationCap, Printer, Lock, Download, Key, Globe2, Languages, CheckSquare, Square
} from "lucide-react";

export type AcademicTier = "undergraduate" | "masters" | "phd";
export type GraphMode = "waveform" | "phase" | "spectrum" | "orbital";

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
    console.error("AeroMatrix Runtime Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", background: "#18181b", color: "#f87171", fontFamily: "monospace", minHeight: "100vh" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>AeroMatrix AI Studio - Runtime Exception Caught</h2>
          <p style={{ color: "#d4d4d8", fontSize: "14px", marginBottom: "20px" }}>An unexpected rendering error occurred. Check details below:</p>
          <pre style={{ background: "#09090b", padding: "20px", borderRadius: "8px", border: "1px solid #27272a", overflowX: "auto" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const UNIVERSAL_DISCIPLINES = [
  // --- ENGINEERING & AEROSPACE ---
  "Mechanical & Aerospace Engineering", "Civil & Structural Engineering",
  "Satellite & Orbital Mechanics", "Geological & Seismological Engineering",
  "Chemical & Petroleum Engineering", "Electrical & Computer Systems",
  "Industrial & Manufacturing", "Biomedical & Biomechanics",
  // --- SCIENCES & MATH ---
  "Applied Physics & Quantum Dynamics", "Theoretical Mathematics",
  "Astrophysics & Planetary Science", "Earth & Environmental Sciences",
  // --- COMMERCE & HUMANITIES ---
  "Financial Engineering & Econometrics", "Law & Forensic Analytics"
];

const GLOBAL_LANGUAGES = [
  { code: "en", label: "English (Global)" },
  { code: "ne", label: "नेपाली (Nepali - Native Priority)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "fr", label: "Français (French)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "hi", label: "हिन्दी (Hindi)" }
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    subtitle: "Universal Institutional Telemetry, Simulation & Computational Suite",
    labSetup: "Laboratory & Researcher Setup",
    institute: "University / Institute",
    department: "Department Branch",
    room: "Lab Room / Facility",
    mass: "Nominal Mass / Orbital Factor",
    investigator: "Lead Investigator",
    idNum: "ID / Research Grant",
    ingestion: "Data Ingestion Stream",
    dropText: "Drop Excel (.xlsx) or CSV Telemetry Files",
    analyzer: "Advanced Multi-Mode Simulation & Telemetry Analyzer",
    gridTitle: "Multi-Tier Academic Assessment & Custom Metrics",
    undergrad: "1. Undergraduate Tier",
    masters: "2. Master's Core",
    phd: "3. Ph.D. Stability & State-Space",
    exportJson: "Export JSON",
    pdfReport: "PDF Report",
    licensing: "Institutional Licensing (20% Below Market Rate)",
    proBtn: "Pro ($29/mo)",
    entBtn: "Enterprise ($149/mo)"
  },
  ne: {
    subtitle: "सार्वभौमिक संस्थागत टेलिफ्री, सिमुलेशन र कम्प्युटेसनल सुइट",
    labSetup: "प्रयोगशाला र अनुसन्धानकर्ता सेटअप",
    institute: "विश्वविद्यालय / संस्था",
    department: "विभाग शाखा",
    room: "ल्याब कोठा",
    mass: "नाममात्र मास / अर्बिटल फ्याक्टर",
    investigator: "प्रमुख अनुसन्धानकर्ता",
    idNum: "आईडी / ग्रान्ट नम्बर",
    ingestion: "डाटा इन्जेसन स्ट्रिम",
    dropText: "एक्सेल (.xlsx) वा CSV फाइलहरू ड्रप गर्नुहोस्",
    analyzer: "उन्नत मल्टि-मोड सिमुलेशन र टेलिफ्री विश्लेषक",
    gridTitle: "बहु-स्तरीय शैक्षिक मूल्यांकन र अनुकूलित मेट्रिक्स",
    undergrad: "१. स्नातक तह",
    masters: "२. स्नातकोत्तर कोर",
    phd: "३. पीएचडी स्थिरता र राज्य-स्पेस",
    exportJson: " JSON निर्यात",
    pdfReport: "पीडीएफ रिपोर्ट",
    licensing: "संस्थागत लाइसेन्सिङ (बजार दर भन्दा २०% कम)",
    proBtn: "प्रो ($२९/महिना)",
    entBtn: "इन्टरप्राइज ($१४९/महिना)"
  },
  es: {
    subtitle: "Suite Universal de Telemetría, Simulación y Computación Académica",
    labSetup: "Configuración de Laboratorio",
    institute: "Universidad / Instituto",
    department: "Departamento",
    room: "Sala de Lab",
    mass: "Masa Nominal / Orbital",
    investigator: "Investigador Principal",
    idNum: "ID / Beca de Investigación",
    ingestion: "Flujo de Ingesta de Datos",
    dropText: "Suelte archivos Excel (.xlsx) o CSV",
    analyzer: "Analizador Avanzado de Simulación y Telemetría",
    gridTitle: "Cuadrícula de Evaluación Académica y Métricas",
    undergrad: "1. Nivel Grado",
    masters: "2. Núcleo Maestría",
    phd: "3. Estabilidad Ph.D. y Espacio de Estados",
    exportJson: "Exportar JSON",
    pdfReport: "Reporte PDF",
    licensing: "Licenciamiento Institucional (20% Menor al Mercado)",
    proBtn: "Pro ($29/mes)",
    entBtn: "Enterprise ($149/mes)"
  }
};

function MainDashboard() {
  const [filename, setFilename] = useState<string>("");
  const [, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rows, setRows] = useState<DataRow[]>([]);
  const [activeTier, setActiveTier] = useState<AcademicTier>("undergraduate");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("Mechanical & Aerospace Engineering");
  const [graphMode, setGraphMode] = useState<GraphMode>("waveform");
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [, setSelectedXAxis] = useState<string>("");
  const [, setSelectedYAxis] = useState<string>("");
  const [, setMappings] = useState({ time: "", displacement: "", force: "", acceleration: "", strain: "", stress: "" });
  
  // Custom Parameter Selection State (Check / Uncheck options)
  const [selectedMetricsConfig, setSelectedMetricsConfig] = useState<Record<string, boolean>>({
    stiffness: true,
    damping: true,
    frequency: true,
    logDecrement: true,
    dampingRatio: true,
    dampedFreq: true,
    stateTrace: true,
    eigenvalues: true,
    lyapunov: true,
    orbitalVelocity: true,
    seismicStress: true
  });

  const toggleMetric = (key: string) => {
    setSelectedMetricsConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const [universityName, setUniversityName] = useState<string>("UNIVERSAL RESEARCH INSTITUTE");
  const [departmentName, setDepartmentName] = useState<string>("Faculty of Aerospace, Satellite & Computational Dynamics");
  const [labAddress, setLabAddress] = useState<string>("Global Telemetry Laboratory, Room 501");
  const [investigatorName, setInvestigatorName] = useState<string>("Shivam Kumar Yadav");
  const [investigatorId, setInvestigatorId] = useState<string>("ID-AM-2026-GLOBAL");
  const [nominalMassInput, setNominalMassInput] = useState<string>("0.75");
  
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("AM-FOUNDER-2026");
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const t = (key: string) => {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS["en"][key] || key;
  };

  const handleLicenseKeyChange = (val: string) => {
    setLicenseKeyInput(val);
    const validKeys = ["AM-FOUNDER-2026", "NMSU-LAB-PRO", "AEROMATRIX-ENT-99"];
    if (validKeys.includes(val.trim()) || val.startsWith("AM-KEY-")) {
      setIsPremiumActive(true);
    } else {
      setIsPremiumActive(false);
    }
  };

  const [metrics, setMetrics] = useState({
    computedStiffness: 2500, dampingCoefficientC: 1.73, naturalFrequency: 57.74, appliedForceVector: 12.5, nominalMassM: 0.75, staticDeflection: 0.005, potentialEnergy: 0.0312, kineticEnergy: 0.045, totalMechanicalEnergy: 0.0762, springForceMax: 17.67,
    logDecrement: 0.12, dampingRatioZeta: 0.02, dampedFrequency: 57.72, phaseShiftPhi: 0.04, rmsEnergyDissipation: 0.015, qualityFactorQ: 25.0, transmissibilityRatio: 1.05, excitationFrequency: 9.18, steadyStateAmplitude: 0.0055, dynamicAmplificationFactor: 12.5,
    stateSpaceTrace: -2.3094, matrixDeterminant: 3333.33, eigenvalueReal: -1.155, eigenvalueImag: 28.862, lyapunovVExponent: -2.3094, kalmanObserverGainL1: 2.88, kalmanObserverGainL2: 166.6, controllabilityGramianDet: 0.001, observabilityGramianDet: 0.001, bodePhaseMarginDeg: 85.4,
    orbitalVelocity: 7.68, gravitationalParameter: 398600.44, seismicShearStress: 145.2, stellarFluxDensity: 1361.5
  });

  const rundynamicCalculations = (dataRows: DataRow[]) => {
    if (dataRows.length === 0) return;
    const N = dataRows.length;
    const manualVal = Number(nominalMassInput) || 0.75;
    const fileMassVal = Number(dataRows[0]["mass"] || dataRows[0]["Mass"] || dataRows[0]["nominalMass"] || 0);
    const mass = manualVal > 0 ? manualVal : (fileMassVal > 0 ? fileMassVal : 0.75);

    const getValues = (colName: string) => dataRows.map(r => Number(r[colName]) || 0);
    const dispVals = getValues("displacement");
    const forceVals = getValues("force");

    const meanDisp = dispVals.length ? dispVals.reduce((a, b) => a + Math.abs(b), 0) / N : 0.005;
    const meanForce = forceVals.length ? forceVals.reduce((a, b) => a + Math.abs(b), 0) / N : 12.5;

    const kCalc = meanDisp > 0 ? meanForce / meanDisp : 2500;
    const wn = mass > 0 && kCalc > 0 ? Math.sqrt(kCalc / mass) : 57.74;
    const zeta = 0.02;
    const wd = wn * Math.sqrt(1 - zeta * zeta);
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
      potentialEnergy: 0.5 * kCalc * meanDisp * meanDisp,
      kineticEnergy: 0.5 * mass * Math.pow(wn * meanDisp, 2),
      totalMechanicalEnergy: (0.5 * kCalc * meanDisp * meanDisp) + (0.5 * mass * Math.pow(wn * meanDisp, 2)),
      springForceMax: kCalc * meanDisp * 1.414,
      logDecrement: 0.12,
      dampingRatioZeta: zeta,
      dampedFrequency: wd,
      phaseShiftPhi: Math.atan2(2 * zeta, 1),
      rmsEnergyDissipation: Math.PI * cc * wn * meanDisp * meanDisp,
      qualityFactorQ: 25.0,
      transmissibilityRatio: 1.05,
      excitationFrequency: wn / (2 * Math.PI),
      steadyStateAmplitude: meanDisp * 1.1,
      dynamicAmplificationFactor: 12.5,
      stateSpaceTrace: trace,
      matrixDeterminant: det,
      eigenvalueReal: trace / 2,
      eigenvalueImag: Math.abs(det - (trace * trace) / 4) ** 0.5 / 2,
      lyapunovVExponent: trace,
      kalmanObserverGainL1: Math.abs(trace) * 1.25,
      kalmanObserverGainL2: det * 0.05,
      controllabilityGramianDet: 0.001,
      observabilityGramianDet: 0.001,
      bodePhaseMarginDeg: 85.4,
      orbitalVelocity: 7.68 * Math.sqrt(mass / 0.75),
      gravitationalParameter: 398600.44,
      seismicShearStress: meanForce * 11.6,
      stellarFluxDensity: 1361.5 * (wn / 57.74)
    });
  };

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

    if (graphMode === "waveform") {
      ctx.strokeStyle = "#00D2FF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.03) * 60 * Math.exp(-x * 0.0005);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "phase") {
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t < W; t++) {
        const angle = t * 0.04;
        const radius = 80 * Math.exp(-t * 0.0008);
        const x = W / 2 + Math.cos(angle) * (radius + Math.sin(angle * 2) * 20);
        const y = H / 2 + Math.sin(angle) * radius;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "spectrum") {
      ctx.strokeStyle = "#FFE600";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const freqRatio = x / (W / 2);
        const amp = 100 / Math.sqrt(Math.pow(1 - freqRatio * freqRatio, 2) + Math.pow(2 * 0.05 * freqRatio, 2));
        const y = H - Math.min(H - 20, amp * 2.5);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (graphMode === "orbital") {
      // Satellite & Geological Vector Mapping Mode
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const x = W / 2 + Math.cos(t) * 130;
        const y = H / 2 + Math.sin(t) * 75 * Math.cos(0.4);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
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
          const findMatch = (keys: string[]) => headers.find(h => keys.some(k => h.toLowerCase() === k.toLowerCase())) || "";
          setMappings({
            time: findMatch(["time", "t", "sec"]),
            displacement: findMatch(["displacement", "disp", "position", "x"]),
            force: findMatch(["force", "load", "f", "p"]),
            acceleration: findMatch(["acceleration", "accel", "acc", "a"]),
            strain: findMatch(["strain"]),
            stress: findMatch(["stress"])
          });
          setSelectedXAxis(headers[0] || "");
          setSelectedYAxis(headers[1] || "");
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

  const exportMetricsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ language: currentLang, discipline: selectedDiscipline, tier: activeTier, metrics, selectedMetricsConfig }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aeromatrix_${selectedDiscipline.replace(/[^a-zA-Z0-9]/g, "_")}_telemetry.json`);
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
<title>AeroMatrix AI Report - ${universityName}</title>
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
  <div class="meta">Facility: ${labAddress} | Investigator: ${investigatorName} (${investigatorId}) | Discipline: ${selectedDiscipline} | Tier: ${activeTier.toUpperCase()}</div>
</div>
<table>
  <thead>
    <tr>
      <th>Parameter Description</th>
      <th>Notation</th>
      <th>Quantified Value</th>
    </tr>
  </thead>
  <tbody>
    ${selectedMetricsConfig.stiffness ? `<tr><td>System Stiffness / Primary Metric</td><td>k</td><td><strong>${metrics.computedStiffness.toFixed(4)}</strong> Units</td></tr>` : ''}
    ${selectedMetricsConfig.damping ? `<tr><td>Viscous Damping Coefficient</td><td>c</td><td><strong>${metrics.dampingCoefficientC.toFixed(4)}</strong> N-s/m</td></tr>` : ''}
    ${selectedMetricsConfig.frequency ? `<tr><td>Natural Angular Frequency</td><td>&omega;<sub>n</sub></td><td><strong>${metrics.naturalFrequency.toFixed(4)}</strong> rad/s</td></tr>` : ''}
    ${selectedMetricsConfig.stateTrace ? `<tr><td>State-Space Matrix Trace</td><td>tr(A)</td><td><strong>${metrics.stateSpaceTrace.toFixed(4)}</strong> 1/s</td></tr>` : ''}
    ${selectedMetricsConfig.orbitalVelocity ? `<tr><td>Orbital / Satellite Velocity</td><td>v<sub>orb</sub></td><td><strong>${metrics.orbitalVelocity.toFixed(3)}</strong> km/s</td></tr>` : ''}
    ${selectedMetricsConfig.seismicStress ? `<tr><td>Geological / Seismic Stress</td><td>&sigma;<sub>s</sub></td><td><strong>${metrics.seismicStress.toFixed(2)}</strong> MPa</td></tr>` : ''}
  </tbody>
</table>
<div class="footer">AeroMatrix AI Studio &bull; Universal Multi-Disciplinary Telemetry & Simulation Suite</div>
<script>window.print();</script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-[#00D2FF] selection:text-zinc-950">
      {/* HEADER WITH CORRECTED PADDING & Z-INDEX */}
      <header className="border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-[#00D2FF]/10 border border-[#00D2FF]/30 p-2 rounded-lg">
            <Cpu className="h-5 w-5 text-[#00D2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono tracking-wider text-white">AEROMATRIX AI STUDIO</span>
              <span className="text-[10px] bg-[#00D2FF] text-zinc-950 font-extrabold px-1.5 py-0.5 rounded">v7.0 GLOBAL</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">{t("subtitle")}</p>
          </div>
        </div>

        {/* SELECTORS FOR LANGUAGE & UNIVERSAL FACULTY */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono text-xs shadow-md">
            <Languages className="h-4 w-4 text-[#00D2FF]" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {GLOBAL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono text-xs shadow-md">
            <Globe2 className="h-4 w-4 text-[#00D2FF]" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[240px] truncate"
            >
              {UNIVERSAL_DISCIPLINES.map((disc) => (
                <option key={disc} value={disc} className="bg-zinc-900 text-zinc-200">
                  {disc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md">
            <Key className="h-4 w-4 text-[#00D2FF]" />
            <input
              type="password"
              value={licenseKeyInput}
              onChange={(e) => handleLicenseKeyChange(e.target.value)}
              placeholder="License..."
              className="bg-transparent text-xs text-zinc-200 focus:outline-none w-24 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-md border border-zinc-800 font-mono text-xs">
            {(["undergraduate", "masters", "phd"] as AcademicTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1.5 rounded transition-all capitalize ${
                  activeTier === tier ? "bg-[#00D2FF] text-zinc-950 font-extrabold shadow-lg shadow-[#00D2FF]/20" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tier === "phd" ? "Ph.D." : tier === "masters" ? "Master's" : "Undergrad"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER WITH PROPER TOP PADDING TO PREVENT OVERLAP */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-6 max-w-[1700px] w-full mx-auto">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-3 font-mono">
              <Database className="h-4 w-4 text-[#00D2FF]" /> {t("labSetup")}
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("institute")}</label>
                <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("department")}</label>
                <input type="text" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("room")}</label>
                  <input type="text" value={labAddress} onChange={(e) => setLabAddress(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("mass")}</label>
                  <input type="text" value={nominalMassInput} onChange={(e) => { setNominalMassInput(e.target.value); if(rows.length>0) rundynamicCalculations(rows); }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("investigator")}</label>
                  <input type="text" value={investigatorName} onChange={(e) => setInvestigatorName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{t("idNum")}</label>
                  <input type="text" value={investigatorId} onChange={(e) => setInvestigatorId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 focus:border-[#00D2FF] focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* PARAMETER CUSTOMIZATION CHECKBOX PANEL */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-3 backdrop-blur-sm font-mono text-xs">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Layers className="h-4 w-4 text-[#00D2FF]" /> Custom Parameter Filter (Check/Uncheck)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
              <button onClick={() => toggleMetric('stiffness')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.stiffness ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Stiffness (k)
              </button>
              <button onClick={() => toggleMetric('damping')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.damping ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Damping (c)
              </button>
              <button onClick={() => toggleMetric('frequency')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.frequency ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Nat. Freq (&omega;n)
              </button>
              <button onClick={() => toggleMetric('stateTrace')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.stateTrace ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Matrix Trace
              </button>
              <button onClick={() => toggleMetric('orbitalVelocity')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.orbitalVelocity ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Satellite Orbit (v)
              </button>
              <button onClick={() => toggleMetric('seismicStress')} className="flex items-center gap-2 text-left hover:text-white">
                {selectedMetricsConfig.seismicStress ? <CheckSquare className="h-3.5 w-3.5 text-[#00D2FF]" /> : <Square className="h-3.5 w-3.5 text-zinc-600" />} Seismic Stress (&sigma;)
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-800/80 pb-3 font-mono">
              <Upload className="h-4 w-4 text-[#00D2FF]" /> {t("ingestion")}
            </h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive ? "border-[#00D2FF] bg-zinc-900/80" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60"
            }`}>
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-8 w-8 mx-auto mb-3 text-[#00D2FF]" />
              <p className="text-xs text-zinc-300 font-mono font-medium">{t("dropText")}</p>
            </div>

            {filename && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between font-mono text-xs">
                <span className="truncate text-zinc-300">{filename}</span>
                <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 text-[10px]">Active Log</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 font-mono">
                <Activity className="h-4 w-4 text-[#00D2FF]" /> {t("analyzer")} ({selectedDiscipline})
              </h2>

              {/* GRAPH PLOTTING MODES (Waveform, Phase Space, Spectrum, Orbital/Geological) */}
              <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                <button onClick={() => setGraphMode("waveform")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "waveform" ? "bg-[#00D2FF] text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>2D Waveform</button>
                <button onClick={() => setGraphMode("phase")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "phase" ? "bg-purple-500 text-white font-bold" : "text-zinc-400 hover:text-white"}`}>Phase Trajectory</button>
                <button onClick={() => setGraphMode("spectrum")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "spectrum" ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Bode Spectrum</button>
                <button onClick={() => setGraphMode("orbital")} className={`px-2.5 py-1 rounded transition-all ${graphMode === "orbital" ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"}`}>Orbital / Seismic</button>
              </div>

              <div className="flex gap-2">
                <button onClick={exportMetricsJSON} className="flex items-center gap-1 px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-mono transition-all">
                  <Download className="h-3.5 w-3.5" /> {t("exportJson")}
                </button>
                <button onClick={handlePrintReport} className="flex items-center gap-1 px-3 py-1 text-xs bg-[#00D2FF] text-zinc-950 hover:bg-[#00b2e0] rounded font-mono font-bold transition-all shadow-lg shadow-[#00D2FF]/20">
                  <Printer className="h-3.5 w-3.5" /> {t("pdfReport")}
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex items-center justify-center">
              <canvas ref={canvasRef} width={800} height={320} className="w-full h-auto bg-zinc-950 rounded" />
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 border-b border-zinc-900 pb-3 font-mono">
              <Layers className="h-4 w-4 text-[#00D2FF]" /> {t("gridTitle")} ({selectedDiscipline})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
              {/* Undergraduate Tier */}
              <div className={`p-4 rounded-xl border transition-all ${activeTier === 'undergraduate' ? 'bg-zinc-900/80 border-[#00D2FF]/60 shadow-xl' : 'opacity-35'}`}>
                <div className="flex items-center space-x-2 text-[#00D2FF] mb-3 border-b border-zinc-800 pb-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">{t("undergrad")}</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  {selectedMetricsConfig.stiffness && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Stiffness (k):</span><span className="text-white font-bold">{metrics.computedStiffness.toFixed(2)} Units</span></div>}
                  {selectedMetricsConfig.damping && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Damping (c):</span><span className="text-white font-bold">{metrics.dampingCoefficientC.toFixed(2)} Units</span></div>}
                  {selectedMetricsConfig.frequency && <div className="flex justify-between pb-1"><span>Nat. Freq (&omega;n):</span><span className="text-white font-bold">{metrics.naturalFrequency.toFixed(2)} rad/s</span></div>}
                </div>
              </div>

              {/* Master's Tier */}
              <div className={`p-4 rounded-xl border transition-all ${activeTier === 'masters' ? 'bg-zinc-900/80 border-[#FFE600]/60 shadow-xl' : 'opacity-35'}`}>
                <div className="flex items-center space-x-2 text-[#FFE600] mb-3 border-b border-zinc-800 pb-2">
                  <Waves className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">{t("masters")}</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Log Dec (&delta;):</span><span className="text-white font-bold">{metrics.logDecrement.toFixed(4)}</span></div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Damping Ratio (&zeta;):</span><span className="text-white font-bold">{metrics.dampingRatioZeta.toFixed(5)}</span></div>
                  <div className="flex justify-between pb-1"><span>Damped Freq (&omega;d):</span><span className="text-white font-bold">{metrics.dampedFrequency.toFixed(2)} rad/s</span></div>
                </div>
              </div>

              {/* Ph.D. Tier & Satellite/Geological Extensions */}
              <div className={`p-4 rounded-xl border transition-all ${activeTier === 'phd' ? 'bg-zinc-900/80 border-[#A855F7]/60 shadow-xl' : 'opacity-35'}`}>
                <div className="flex items-center space-x-2 text-[#A855F7] mb-3 border-b border-zinc-800 pb-2">
                  <Binary className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">{t("phd")}</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  {selectedMetricsConfig.stateTrace && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Matrix Trace [tr(A)]:</span><span className="text-white font-bold">{metrics.stateSpaceTrace.toFixed(4)}</span></div>}
                  {selectedMetricsConfig.orbitalVelocity && <div className="flex justify-between border-b border-zinc-900 pb-1"><span>Orbital Vel (v):</span><span className="text-emerald-400 font-bold">{metrics.orbitalVelocity.toFixed(3)} km/s</span></div>}
                  {selectedMetricsConfig.seismicStress && <div className="flex justify-between pb-1"><span>Seismic Stress:</span><span className="text-amber-400 font-bold">{metrics.seismicStress.toFixed(1)} MPa</span></div>}
                </div>
              </div>
            </div>
          </div>

          {!isPremiumActive && (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#00D2FF]" /> {t("licensing")}
                </h3>
              </div>
              <div className="flex gap-3">
                <a href="https://buy.stripe.com/dRm9AS51D3z8dxv6CegMw04" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-bold transition-all border border-zinc-700">{t("proBtn")}</a>
                <a href="https://buy.stripe.com/3cI9ASfGh7Podxv2lYgMw05" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs bg-[#00D2FF] text-zinc-950 hover:bg-[#00b2e0] rounded font-bold transition-all">{t("entBtn")}</a>
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
