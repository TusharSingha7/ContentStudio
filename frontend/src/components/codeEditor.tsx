import { Button } from "@/components/ui/button";
import { api_url, websocketyjs_url } from "@/config";
import closeImage from "@/assets/close.png";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import { useNavigate, useParams } from "react-router";

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    switch (label) {
      case "json":
        return new JsonWorker();
      case "css":
      case "scss":
      case "less":
        return new CssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return new HtmlWorker();
      case "typescript":
      case "javascript":
        return new TsWorker();
      default:
        return new EditorWorker();
    }
  },
};

const languageTemplates: Record<string, string> = {
  javascript: 'console.log("Hello from JavaScript");',
  python: 'print("Hello from Python")',
  java: [
    "public class Main {",
    "  public static void main(String[] args) {",
    '    System.out.println("Hello from Java");',
    "  }",
    "}",
  ].join("\n"),
  csharp: [
    "using System;",
    "",
    "public class Program {",
    "  public static void Main() {",
    '    Console.WriteLine("Hello from C#");',
    "  }",
    "}",
  ].join("\n"),
  cpp: [
    "#include <iostream>",
    "",
    "int main() {",
    '  std::cout << "Hello from C++" << std::endl;',
    "  return 0;",
    "}",
  ].join("\n"),
  typescript: 'console.log("Hello from TypeScript");',
};

interface ExecutionResponse {
  language: string;
  compile?: {
    stdout?: string;
    stderr?: string;
    code?: number;
  } | null;
  run?: {
    stdout?: string;
    stderr?: string;
    output?: string;
    code?: number;
    signal?: string;
  } | null;
}

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [stdin, setStdin] = useState("");
  const [executionOutput, setExecutionOutput] = useState("Run code to see output.");
  const [isExecuting, setIsExecuting] = useState(false);
  const { id } = useParams();
  const baseSocketUrl = websocketyjs_url;
  const navigate = useNavigate();

  useEffect(() => {
    if (!editorRef.current || !id) {
      return;
    }

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(baseSocketUrl, `yjs/${id}`, ydoc);
    const yText = ydoc.getText("monaco");
    const editor = monaco.editor.create(editorRef.current, {
      value: languageTemplates.javascript,
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      padding: {
        top: 16,
      },
    });

    monacoRef.current = editor;
    providerRef.current = provider;
    ydocRef.current = ydoc;

    const model = editor.getModel();
    if (!model) {
      return () => {
        provider.disconnect();
        ydoc.destroy();
        editor.dispose();
      };
    }

    if (yText.length === 0) {
      yText.insert(0, languageTemplates.javascript);
    }

    bindingRef.current = new MonacoBinding(yText, model, new Set([editor]));

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      providerRef.current?.disconnect();
      providerRef.current = null;
      ydocRef.current?.destroy();
      ydocRef.current = null;
      monacoRef.current?.dispose();
      monacoRef.current = null;
    };
  }, [baseSocketUrl, id]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    const model = monacoRef.current?.getModel();
    if (!model) {
      return;
    }

    monaco.editor.setModelLanguage(model, newLanguage);
    if (!model.getValue().trim()) {
      model.setValue(languageTemplates[newLanguage] ?? "");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    monaco.editor.setTheme(newTheme === "dark" ? "vs-dark" : "vs");
  };

  const handleRunCode = async () => {
    const code = monacoRef.current?.getValue() ?? "";
    if (!code.trim()) {
      setExecutionOutput("Add some code before running.");
      return;
    }

    setIsExecuting(true);
    setExecutionOutput("Running...");

    try {
      const response = await axios.post<ExecutionResponse>(
        `${api_url}/execute`,
        {
          language,
          code,
          input: stdin,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      const compileOutput = [
        response.data.compile?.stdout,
        response.data.compile?.stderr,
      ]
        .filter(Boolean)
        .join("\n");

      const runOutput =
        response.data.run?.output ??
        [response.data.run?.stdout, response.data.run?.stderr]
          .filter(Boolean)
          .join("\n");

      setExecutionOutput(
        [compileOutput, runOutput].filter(Boolean).join("\n\n") ||
          "Execution finished with no output."
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setExecutionOutput(
          error.response?.data?.details ||
            error.response?.data?.error ||
            error.message
        );
      } else {
        setExecutionOutput("Execution failed.");
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col min-w-0 flex-1 bg-slate-950 text-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-6 py-4">
        <div className="flex-1 min-w-[220px]">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Collaborative Editor
          </p>
          <div className="mt-2 text-xl font-semibold">Session {id}</div>
        </div>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
        </select>
        <Button className="bg-slate-800 hover:bg-slate-700" onClick={toggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-500"
          onClick={handleRunCode}
          disabled={isExecuting}
        >
          {isExecuting ? "Running..." : "Run Code"}
        </Button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800"
          onClick={() => navigate("/")}
          type="button"
        >
          <img src={closeImage} className="h-3 w-3" alt="Close editor" />
        </button>
      </div>

      <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="border-r border-slate-800 bg-slate-950"
          ref={editorRef}
        />

        <div className="flex flex-col border-t border-slate-800 bg-slate-900 lg:border-l lg:border-t-0">
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-sm font-medium text-slate-200">Program Input</p>
            <p className="mt-1 text-xs text-slate-400">
              This is forwarded to the process stdin.
            </p>
          </div>
          <div className="p-5">
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="Type stdin here..."
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
            />
          </div>
          <div className="border-y border-slate-800 px-5 py-4">
            <p className="text-sm font-medium text-slate-200">Output</p>
            <p className="mt-1 text-xs text-slate-400">
              Stdout, stderr, and compiler feedback appear here.
            </p>
          </div>
          <div className="flex-1 p-5">
            <pre className="h-full min-h-[220px] overflow-auto rounded-2xl border border-slate-800 bg-black/40 p-4 text-sm text-emerald-200 whitespace-pre-wrap">
              {executionOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
