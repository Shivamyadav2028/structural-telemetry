import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, ShieldCheck, Lock } from "lucide-react";
import * as XLSX from "@e965/xlsx";
import { DataGrid, type DataRow } from "./DataGrid";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rows, setRows] = useState<DataRow[]>([]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setUploadStatus("loading");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File empty");

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error("Empty worksheet target");
        
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);
        if (rawRows.length === 0) throw new Error("No data metrics detected");

        const parsedRows: DataRow[] = rawRows.map((row: any, index: number) => {
          const nodeKey = Object.keys(row).find(k => k.toLowerCase().includes("node")) ?? "";
          const posKey = Object.keys(row).find(k => k.toLowerCase().includes("position")) ?? "";
          const dispKey = Object.keys(row).find(k => k.toLowerCase().includes("displacement")) ?? "";
          const freqKey = Object.keys(row).find(k => k.toLowerCase().includes("frequency")) ?? "";
          const paramKey = Object.keys(row).find(k => k.toLowerCase().includes("parameter")) ?? "";

          return {
            id: String(index + 1),
            node: row[nodeKey] ? String(row[nodeKey]) : `N-${1000 + index + 1}`,
            position: row[posKey] !== undefined ? Number(row[posKey]) : 0,
            displacement: row[dispKey] !== undefined ? Number(row[dispKey]) : 0,
            frequency: row[freqKey] !== undefined ? Number(row[freqKey]) : 0,
            parameter: row[paramKey] ? String(row[paramKey]) : "E (Modulus)",
          };
        });

        setRows(parsedRows);
        setUploadStatus("success");
      } catch (error) {
        setRows([]);
        setUploadStatus("error");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"]
    },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileSpreadsheet className="h-5 w-5 text-[#00D2FF]" />
          <span className="text-sm font-bold font-mono tracking-tight text-zinc-100">Structural Telemetry Studio</span>
        </div>
        <span className="inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-zinc-400 ring-1 ring-inset ring-zinc-800 font-mono">
          <ShieldCheck className="mr-1 h-3 w-3 text-emerald-400" /> Proprietary Pipeline Node
        </span>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">Structural Telemetry Processor</h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Multi-disciplinary parser for wave mechanics matrices and laboratory datasets. Instantly map displacements and construct publishable configurations.
          </p>
        </div>

        <div {...getRootProps()} className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all ${
          isDragActive ? "border-[#00D2FF] bg-[#00D2FF]/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
        }`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-5 w-5 text-zinc-500" />
            <p className="text-xs font-medium text-zinc-300">
              {isDragActive ? "Release to process matrix" : "Drag & drop your research Excel (.xlsx) or CSV worksheet here"}
            </p>
          </div>
        </div>

        {uploadStatus === "loading" && <p className="text-xs font-mono text-zinc-500 animate-pulse">Compiling analytical metrics...</p>}
        {uploadStatus === "error" && <p className="text-xs font-mono text-red-400 font-semibold">Schema validation error: Check parameter constraints.</p>}

        {uploadStatus === "success" && rows.length > 0 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-mono text-zinc-400">Active File Node: <span className="text-[#00D2FF]">{fileName}</span></p>
            <DataGrid rows={rows} />
          </div>
        )}

        <section className="pt-6 border-t border-zinc-900 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200">Professional Researcher Plan</h3>
              <p className="text-[11px] text-zinc-500">Uncapped file uploads and deep mathematical RMS processing profiles.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-mono font-bold text-zinc-100">\$29<span className="text-xs text-zinc-500 font-normal"> / month</span></p>
              <button className="w-full rounded-md bg-zinc-100 hover:bg-zinc-200 py-2 text-xs font-semibold text-zinc-950 transition-all">Access Professional Hub</button>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200">Enterprise Laboratory Plan</h3>
              <p className="text-[11px] text-zinc-500">Shared institutional licensing pipelines for complete university departments.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-mono font-bold text-zinc-100 text-orange-500">\$149<span className="text-xs text-zinc-500 font-normal"> / month</span></p>
              <button className="w-full rounded-md bg-orange-500 hover:bg-orange-400 py-2 text-xs font-semibold text-zinc-100 transition-all shadow-lg shadow-orange-500/10">Deploy Laboratory Space</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 px-6 py-4 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
        <p>&copy; {new Date().getFullYear()} Structural Telemetry Studio. All proprietary rights secured.</p>
        <p>Ledger Loop Node Connected.</p>
      </footer>
    </div>
  );
}
