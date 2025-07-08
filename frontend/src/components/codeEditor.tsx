import { Button } from "@/components/ui/button";
import closeImage from "@/assets/close.png";

import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import { websocket_url } from "@/config";
import { useParams } from "react-router";

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    switch (label) {
      case 'json':
        return new JsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker()
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker()
      case 'typescript':
      case 'javascript':
        return new TsWorker()
      default:
        return new EditorWorker()
    }
  }
}

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const {id} = useParams()
  const baseSocketUrl = websocket_url

  useEffect(() => {
    if(!editorRef.current) return;
    if(!id) return;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(`${baseSocketUrl}`, `yjs/${id}`, ydoc);
    const yText = ydoc.getText('monaco');

    monacoRef.current = monaco.editor.create(editorRef.current, {
        value : '// Write your code here...',
        language : "javascript",
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
    });

    // Bind Yjs document to Monaco editor
    if(monacoRef.current) {
        const model = monacoRef.current.getModel();
        if(model) {
            const monacoBinding = new MonacoBinding(
                yText,
                model,
                new Set([monacoRef.current]),
                provider.awareness
            )

            return () => {
                monacoBinding.destroy();
                provider.disconnect();
                ydoc.destroy();
                monacoRef.current?.dispose();
                monacoRef.current = null;
            };
        }
    }
  }, [id,baseSocketUrl]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLang);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
  };

  return (
    <div className="flex flex-col min-w-[80%] bg-[#222831] border border-[#393E46]">
      <div className="flex bg-[#222831] p-4 text-white">
        <div className="flex-1">
          <div>Live Code Session</div>
          <div className="text-sm text-gray-400">
            Session ID: {id}
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center">
          <select
            className="shadow bg-[#393E46] text-white p-2 rounded-lg"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="typescript">Typescript</option>
          </select>
          <Button className="mx-2 bg-[#393E46]" onClick={() => {/* Save handler */}}>
            Save
          </Button>
          <Button className="mx-2 bg-[#393E46]" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <img src={closeImage} className="w-3 h-3 m-3 cursor-pointer" alt="Close" />
        </div>
      </div>
      <div
        className="border border-[#393E46] rounded-lg flex-1 shadow-inner bg-[#222831]"
        ref={editorRef}
      ></div>
    </div>
  );
}
