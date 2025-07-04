import { Button } from "@/components/ui/button";
import closeImage from "@/assets/close.png";

import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState<string>('javascript');
  const [value, setValue] = useState<string>('// Write your code here...');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize Monaco editor once
  useEffect(() => {
    if (editorRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value : '// Write your code here...',
        language : "javascript",
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      });

      // Handle content change
      monacoRef.current.onDidChangeModelContent(() => {
        const currentValue = monacoRef.current?.getValue() || '';
        setValue(currentValue);
      });
    }

    return () => {
      monacoRef.current?.dispose();
      monacoRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

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
            Session ID: _EVYHCeM4DNOzjk_yfj5q
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
