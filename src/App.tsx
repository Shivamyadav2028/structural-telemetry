mport { useState, useCallback, useEffect, useRef } from "react";
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
