import React, { useState, useEffect, useRef } from "react";
import { evaluate } from "mathjs";
import { 
  Calculator, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle, 
  Flame, 
  Share2, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Play,
  RotateCcw,
  Plus,
  Minus,
  Binary
} from "lucide-react";

interface MathSandboxProps {
  onClose: () => void;
  setNotification: (notif: { message: string; type: "success" | "error" | "info" } | null) => void;
}

interface HistoricCalculation {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  success: boolean;
}

const PRESET_EXPRESSIONS = [
  { label: "User Prompt Example", expr: "25 * 8 + 100", desc: "Standard algebraic computation" },
  { label: "Unit Conversion", expr: "5 cm + 2 inch to mm", desc: "Interactive unit and dimensional analysis" },
  { label: "Algebraic Variables", expr: "a = 15; b = 3.5; a^2 - 4*b", desc: "Setting symbols & computing formulas" },
  { label: "Matrix Determinant", expr: "det([2, -1, 3; 0, 5, -2; 8, 1, 4])", desc: "Linear algebra matrix determinants" },
  { label: "Trigonometric Identity", expr: "sin(45 deg) ^ 2 + cos(45 deg) ^ 2", desc: "Calculated with angular inputs" },
  { label: "Logarithmic Functions", expr: "log(1000, 10) * e ^ 1.5", desc: "Logarithm exponents with transcendentals" }
];

const PLOT_PRESETS = [
  { label: "Sine Wave", formula: "sin(x)" },
  { label: "Damped Oscillation", formula: "sin(x) * exp(-0.15 * x)" },
  { label: "Parabolic Curve", formula: "0.15 * x ^ 2 - 4" },
  { label: "Polynomial Wave", formula: "sin(x) + cos(0.5 * x) * 0.8" }
];

export default function MathSandbox({ onClose, setNotification }: MathSandboxProps) {
  const [expression, setExpression] = useState("25 * 8 + 100");
  const [liveResult, setLiveResult] = useState<string>("");
  const [liveError, setLiveError] = useState<string | null>(null);
  
  // Plotting state
  const [plotFormula, setPlotFormula] = useState("sin(x) * exp(-0.1 * x)");
  const [plotRangeMin, setPlotRangeMin] = useState(-10);
  const [plotRangeMax, setPlotRangeMax] = useState(10);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const plotContainerRef = useRef<SVGSVGElement | null>(null);

  // Variable Assignments Dashboard
  const [customVariables, setCustomVariables] = useState<Array<{ name: string; value: string }>>([
    { name: "x_speed", value: "24.5" },
    { name: "time_s", value: "8.2" }
  ]);

  // History state
  const [history, setHistory] = useState<HistoricCalculation[]>(() => {
    const saved = localStorage.getItem("velora_math_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { id: "init-1", expression: "25 * 8 + 100", result: "300", timestamp: "12:40:00", success: true },
      { id: "init-2", expression: "50 inch to cm", result: "127 cm", timestamp: "12:38:15", success: true }
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExpr, setCopiedExpr] = useState(false);

  // Persist history
  useEffect(() => {
    localStorage.setItem("velora_math_history", JSON.stringify(history));
  }, [history]);

  // Compute live expression in real-time
  useEffect(() => {
    const trimmed = expression.trim();
    if (!trimmed) {
      setLiveResult("");
      setLiveError(null);
      return;
    }

    try {
      // Build variable scope
      const scope: Record<string, number> = {};
      customVariables.forEach(v => {
        if (v.name.trim() && v.value.trim()) {
          try {
            scope[v.name.trim()] = evaluate(v.value);
          } catch (e) {
            // Silence scope evaluation bugs
          }
        }
      });

      const res = evaluate(trimmed, scope);
      if (res === undefined || res === null) {
        setLiveResult("");
        setLiveError(null);
      } else if (typeof res === "function") {
        setLiveResult("Function / Operator defined");
        setLiveError(null);
      } else {
        // Stringify neatly
        let output = "";
        if (typeof res === "object" && res.entries && Array.isArray(res.entries)) {
          // It's a matrix or vector
          output = `Matrix: [${res.entries.map((row: any) => 
            Array.isArray(row) ? `[${row.join(", ")}]` : row.toString()
          ).join("; ")}]`;
        } else if (res.toString) {
          output = res.toString();
        } else {
          output = String(res);
        }
        setLiveResult(output);
        setLiveError(null);
      }
    } catch (err: any) {
      setLiveResult("");
      setLiveError(err.message || "Syntactically incomplete formula.");
    }
  }, [expression, customVariables]);

  const handleEvaluateClick = () => {
    const trimmed = expression.trim();
    if (!trimmed) return;

    try {
      const scope: Record<string, number> = {};
      customVariables.forEach(v => {
        if (v.name.trim() && v.value.trim()) {
          try { scope[v.name.trim()] = evaluate(v.value); } catch (e) {}
        }
      });

      const res = evaluate(trimmed, scope);
      const output = res !== undefined && res !== null ? (res.toString ? res.toString() : String(res)) : "No output";
      
      const newCalc: HistoricCalculation = {
        id: Math.random().toString(36).substring(7),
        expression: trimmed,
        result: output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success: true
      };

      setHistory(prev => [newCalc, ...prev].slice(0, 30));
      setNotification({ message: `Successfully computed: ${output}`, type: "success" });
    } catch (err: any) {
      const failedCalc: HistoricCalculation = {
        id: Math.random().toString(36).substring(7),
        expression: trimmed,
        result: err.message || "Computation error",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success: false
      };
      setHistory(prev => [failedCalc, ...prev]);
      setNotification({ message: err.message || "Evaluation failed.", type: "error" });
    }
  };

  const handleKeyboardPress = (val: string) => {
    if (val === "C") {
      setExpression("");
    } else if (val === "⌫") {
      setExpression(prev => prev.slice(0, -1));
    } else if (val === "=") {
      handleEvaluateClick();
    } else {
      setExpression(prev => prev + val);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setNotification({ message: "Mathematical computation history cleared.", type: "info" });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    setNotification({ message: "Calculated value copied to clipboard.", type: "success" });
  };

  // Generate plotting nodes SVG path
  const generatePlotPath = () => {
    try {
      const width = 500;
      const height = 240;
      const points = [];
      const step = (plotRangeMax - plotRangeMin) / 100;

      for (let x = plotRangeMin; x <= plotRangeMax; x += step) {
        try {
          const y = evaluate(plotFormula, { x });
          if (typeof y === "number" && !isNaN(y) && isFinite(y)) {
            points.push({ x, y });
          }
        } catch (e) {
          // ignore evaluation error for individual coordinate sample
        }
      }

      if (points.length === 0) return { path: "", rawPoints: [] };

      // Find boundaries to scale beautifully
      const ys = points.map(p => p.y);
      let yMin = Math.min(...ys);
      let yMax = Math.max(...ys);

      // Add symmetric cushions
      const yDelta = yMax - yMin;
      if (yDelta < 0.1) {
        yMin -= 1;
        yMax += 1;
      } else {
        yMin -= yDelta * 0.1;
        yMax += yDelta * 0.1;
      }

      // Convert coordinates to pixels
      const mapX = (rx: number) => ((rx - plotRangeMin) / (plotRangeMax - plotRangeMin)) * width;
      const mapY = (ry: number) => height - ((ry - yMin) / (yMax - yMin)) * height;

      let dString = "";
      const pxPoints: Array<{ rx: number; ry: number; px: number; py: number }> = [];

      points.forEach((pt, idx) => {
        const px = mapX(pt.x);
        const py = mapY(pt.y);
        pxPoints.push({ rx: pt.x, ry: pt.y, px, py });

        if (idx === 0) {
          dString += `M ${px} ${py}`;
        } else {
          dString += ` L ${px} ${py}`;
        }
      });

      // Axis pixel lines
      const yAxisPx = mapX(0);
      const xAxisPx = mapY(0);

      return {
        path: dString,
        rawPoints: pxPoints,
        yAxisPx: yAxisPx >= 0 && yAxisPx <= width ? yAxisPx : null,
        xAxisPx: xAxisPx >= 0 && xAxisPx <= height ? xAxisPx : null,
        yMin,
        yMax
      };
    } catch (e) {
      return { path: "", rawPoints: [] };
    }
  };

  const { path: plotPath, rawPoints, yAxisPx, xAxisPx, yMin, yMax } = generatePlotPath();

  // Track hover coordinate
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!plotContainerRef.current || rawPoints.length === 0) return;
    const rect = plotContainerRef.current.getBoundingClientRect();
    const cursorPx = e.clientX - rect.left;
    const scaleFactorWidth = 500 / rect.width;
    const virtualX = cursorPx * scaleFactorWidth;

    // Find nearest point
    let nearest = rawPoints[0];
    let minDist = Math.abs(rawPoints[0].px - virtualX);

    for (let i = 1; i < rawPoints.length; i++) {
      const dist = Math.abs(rawPoints[i].px - virtualX);
      if (dist < minDist) {
        minDist = dist;
        nearest = rawPoints[i];
      }
    }

    setHoveredPoint({
      x: nearest.rx,
      y: nearest.ry,
      px: nearest.px,
      py: nearest.py
    });
  };

  const handleSvgMouseLeave = () => {
    setHoveredPoint(null);
  };

  const addCustomVariable = () => {
    setCustomVariables(prev => [...prev, { name: "v_" + prev.length, value: "1.5" }]);
  };

  const removeCustomVariable = (index: number) => {
    setCustomVariables(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleVariableChange = (index: number, key: "name" | "value", val: string) => {
    setCustomVariables(prev => prev.map((item, idx) => idx === index ? { ...item, [key]: val } : item));
  };

  return (
    <div id="math-sandbox-root" className="w-full flex flex-col xl:flex-row gap-6 text-slate-200">
      {/* Dynamic Computation Panel (Left Column) */}
      <div className="flex-1 space-y-6">
        
        {/* Sleek Workspace Screen */}
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-850/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-white tracking-tight">Quantum Calculation Engine</h2>
                <p className="text-[10px] text-zinc-500 font-mono">powered by Math.js sandbox environment</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 px-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              Back to Chat
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Display / Input Monitor */}
            <div className="bg-black/80 rounded-2xl border border-zinc-850 overflow-hidden relative">
              <div className="p-4 flex flex-col justify-between min-h-[110px] font-mono relative z-10">
                <div className="text-[11px] text-zinc-500 flex items-center justify-between select-none">
                  <span>INPUT EXPRESSION</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-blue-900/20 text-blue-400 border border-blue-950 px-1.5 py-0.5 rounded">
                      MathJS Evaluate Enabled
                    </span>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g., 25 * 8 + 100"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-base md:text-lg font-bold selection:bg-blue-600/35 selection:text-white mt-1 pr-12 w-full p-0"
                />

                <div className="mt-3 pt-2.5 border-t border-zinc-850/40 flex items-center justify-between min-h-[28px]">
                  {liveError ? (
                    <span className="text-[10px] text-red-400/90 leading-tight block pr-4">
                      ⚠ {liveError}
                    </span>
                  ) : liveResult !== "" ? (
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span className="text-[10px] text-zinc-500 uppercase select-none">Result:</span>
                      <span className="text-sm md:text-base font-extrabold text-blue-400 font-mono selection:bg-blue-600/40">
                        {liveResult}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-600">Pending user equation...</span>
                  )}
                  
                  {liveResult && (
                    <button
                      onClick={() => copyToClipboard(liveResult, "live")}
                      className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                      title="Copy Output"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Vertical evaluation command line triggers code snippet from user request */}
              <div className="absolute right-3.5 top-11 z-20">
                <button
                  onClick={handleEvaluateClick}
                  className="h-8 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-mono flex items-center justify-center transition-all shadow-md cursor-pointer text-xs"
                  title="Compute safe evaluation"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Scientific Keyboard Matrix */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 pt-1">
              {[
                "sin(", "cos(", "tan(", "log(", "sqrt(", "C", "⌫", "(",
                "det(", "deg", "pi", "e", "i", " ", ")", "/",
                "[", "]", "7", "8", "9", "*", "^", "to ",
                "cm", "inch", "4", "5", "6", "-", "mm", " m",
                "degC", "degF", "1", "2", "3", "+", "%", "=",
                "0", ".", ",", ";", "a", "b", "x_speed", "time_s"
              ].map((key, idx) => (
                <button
                  key={idx}
                  onClick={() => handleKeyboardPress(key)}
                  className={`py-2 px-1 text-[11px] font-mono border rounded-xl transition-all cursor-pointer select-none active:scale-95 flex items-center justify-center ${
                    key === "="
                      ? "bg-blue-600 text-white border-blue-500 font-extrabold shadow-md hover:bg-blue-500 col-span-1"
                      : key === "C" || key === "⌫"
                      ? "bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/30 hover:text-red-300 font-semibold"
                      : ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."].includes(key)
                      ? "bg-black/40 border-zinc-850 hover:bg-zinc-900/60 text-white"
                      : ["+", "-", "*", "/", "%", "^"].includes(key)
                      ? "bg-[#18181b]/70 border-zinc-810 text-amber-500 hover:text-amber-400 font-bold"
                      : "bg-[#18181b]/50 border-zinc-850 hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Live Variable Declarer Scope */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                  <Sliders className="h-3 w-3 text-indigo-400" />
                  Local Symbolic Variables Scoping
                </span>
                <button
                  type="button"
                  onClick={addCustomVariable}
                  className="text-[10.5px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 border border-zinc-800 px-2 py-0.5 rounded-lg hover:bg-zinc-900/40 transition-all cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Var
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {customVariables.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-2 bg-black/30 border border-zinc-850 rounded-xl">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleVariableChange(idx, "name", e.target.value)}
                      placeholder="var_name"
                      className="w-1/3 bg-black border border-zinc-800 focus:border-indigo-500 rounded-lg p-1 text-[11px] font-mono text-zinc-200 focus:outline-none"
                    />
                    <span className="text-zinc-600 font-mono text-xs">=</span>
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => handleVariableChange(idx, "value", e.target.value)}
                      placeholder="expression"
                      className="flex-1 bg-black border border-zinc-800 focus:border-indigo-500 rounded-lg p-1 text-[11px] font-mono text-blue-350 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomVariable(idx)}
                      className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Preset equations for rapid user testing */}
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl relative">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-850/40">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-white tracking-tight">Interactive Mathematical Demonstrations</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_EXPRESSIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setExpression(preset.expr)}
                className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                  expression === preset.expr
                    ? "bg-blue-950/20 border-blue-500/40 text-blue-300"
                    : "bg-black/30 border-zinc-850 hover:bg-zinc-900/40 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-white text-[11.5px]">{preset.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono italic p-0.5 rounded">Preset #{idx + 1}</span>
                </div>
                <code className="font-mono text-[11px] text-blue-400 font-semibold truncate select-all">{preset.expr}</code>
                <span className="text-[10.5px] text-zinc-500 truncate leading-relaxed text-slate-400">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coordinate Function Plotter & Historic Stack (Right Column) */}
      <div className="w-full xl:w-[440px] shrink-0 space-y-6">
        
        {/* Plotter Visual Frame */}
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl h-fit relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              INTEGRATED FUNCTION PLOTTER
            </span>
            <span className="text-[9px] font-mono text-zinc-600 bg-black border border-zinc-850 px-2 py-0.5 rounded-md">
              LIVE 2D GRAPH
            </span>
          </div>

          <div className="space-y-3.5 z-10 relative">
            <div>
              <input
                type="text"
                value={plotFormula}
                onChange={(e) => setPlotFormula(e.target.value)}
                placeholder="Function recipe e.g. sin(x)"
                className="w-full text-xs font-mono bg-black hover:border-zinc-750 border border-zinc-850 focus:border-indigo-500 rounded-xl p-2 text-indigo-300 placeholder-zinc-700 focus:outline-none"
              />
            </div>

            {/* Responsive Math Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PLOT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPlotFormula(p.formula)}
                  className={`p-1 px-2 rounded-lg text-[9.5px] font-mono border transition-all ${
                    plotFormula === p.formula
                      ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
                      : "bg-black/50 border-zinc-850 hover:bg-[#1c1c1e] text-zinc-450 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Vector Coordinate System Render Plot */}
            <div className="w-full aspect-[2/1] min-h-[190px] rounded-xl bg-black border border-zinc-850 relative overflow-hidden select-none">
              
              {plotPath ? (
                <svg
                  ref={plotContainerRef}
                  viewBox="0 0 500 240"
                  className="w-full h-full cursor-crosshair"
                  onMouseMove={handleSvgMouseMove}
                  onMouseLeave={handleSvgMouseLeave}
                >
                  {/* Subtle Grid Lines */}
                  {[1, 2, 3, 4].map((i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 100}
                      y1={0}
                      x2={i * 100}
                      y2={240}
                      stroke="#141416"
                      strokeWidth="1"
                    />
                  ))}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={i * 40}
                      x2={500}
                      y2={i * 40}
                      stroke="#141416"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Horizontal X Axis */}
                  {xAxisPx !== null && (
                    <line
                      x1={0}
                      y1={xAxisPx}
                      x2={500}
                      y2={xAxisPx}
                      stroke="#2d2d30"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Vertical Y Axis */}
                  {yAxisPx !== null && (
                    <line
                      x1={yAxisPx}
                      y1={0}
                      x2={yAxisPx}
                      y2={240}
                      stroke="#2d2d30"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Dynamic function wave path */}
                  <path
                    d={plotPath}
                    fill="none"
                    stroke="#4338ca"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-in fade-in zoom-in-95 duration-500"
                  />

                  {/* Hover tracing details */}
                  {hoveredPoint && (
                    <>
                      {/* Vertical projection cursor tracking */}
                      <line
                        x1={hoveredPoint.px}
                        y1={0}
                        x2={hoveredPoint.px}
                        y2={240}
                        stroke="#6366f1"
                        strokeWidth="0.75"
                        strokeDasharray="4,4"
                      />
                      {/* Horizontal projection cursor tracking */}
                      <line
                        x1={0}
                        y1={hoveredPoint.py}
                        x2={500}
                        y2={hoveredPoint.py}
                        stroke="#6366f1"
                        strokeWidth="0.75"
                        strokeDasharray="4,4"
                      />
                      {/* Anchor vertex dot marker */}
                      <circle
                        cx={hoveredPoint.px}
                        cy={hoveredPoint.py}
                        r="5.5"
                        fill="#3b82f6"
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    Unable to map coordinates. Ensure your function math is correct.
                  </span>
                </div>
              )}

              {/* Coordinates readouts absolute tags overlay */}
              <div className="absolute bottom-2 left-2 px-2 py-1.5 bg-black/80 border border-zinc-850 rounded text-[9.5px] font-mono text-zinc-400 space-y-0.5 pointer-events-none">
                <div>Y-MIN: {typeof yMin === "number" ? yMin.toFixed(2) : "-"}</div>
                <div>Y-MAX: {typeof yMax === "number" ? yMax.toFixed(2) : "-"}</div>
              </div>

              {hoveredPoint && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-950/80 border border-blue-500/35 rounded text-[10px] font-mono text-blue-300 pointer-events-none shadow-md">
                  X: {hoveredPoint.x.toFixed(3)} | Y: {hoveredPoint.y.toFixed(3)}
                </div>
              )}
            </div>

            {/* Horizontal parameters controller */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                Range Min:
                <input
                  type="number"
                  value={plotRangeMin}
                  onChange={(e) => setPlotRangeMin(Number(e.target.value))}
                  className="w-12 bg-black border border-zinc-850 text-indigo-300 rounded px-1.5 text-center focus:outline-none focus:border-indigo-500"
                />
              </span>
              <span className="flex items-center gap-1">
                Range Max:
                <input
                  type="number"
                  value={plotRangeMax}
                  onChange={(e) => setPlotRangeMax(Number(e.target.value))}
                  className="w-12 bg-black border border-zinc-850 text-indigo-300 rounded px-1.5 text-center focus:outline-none focus:border-indigo-500"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Computation History stack */}
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850/40">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <Binary className="h-3.5 w-3.5 text-emerald-400" />
              COMPUTATION HISTORY LOG
            </span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[9.5px] font-mono text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                Clear Log
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-[10px] text-zinc-650 font-mono">No previous logs cached</span>
              </div>
            ) : (
              history.map((h, i) => (
                <div 
                  key={h.id} 
                  className={`p-3 rounded-xl border text-xs relative group transition-all ${
                    h.success 
                      ? "bg-black/40 border-zinc-850/70 hover:bg-zinc-900/30" 
                      : "bg-red-950/10 border-red-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 select-none text-[9.5px] font-mono text-zinc-650">
                    <span>{h.timestamp}</span>
                    <span className={h.success ? "text-blue-500" : "text-red-500"}>
                      {h.success ? "Success" : "Error"}
                    </span>
                  </div>

                  <div 
                    onClick={() => setExpression(h.expression)} 
                    className="font-mono text-zinc-300 hover:text-white cursor-pointer select-all truncate font-semibold transition-colors text-[11px]"
                    title="Load expression back into workspace"
                  >
                    {h.expression}
                  </div>

                  <div className="mt-1 font-mono text-[11px] flex justify-between items-center text-blue-350 pr-8 select-all">
                    <span className="truncate">{h.result}</span>
                  </div>

                  {/* Absolute copy button shown on hover */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button
                      onClick={() => copyToClipboard(h.result, h.id)}
                      className="p-1 rounded bg-[#17171d] border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Copy result text"
                    >
                      {copiedId === h.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
