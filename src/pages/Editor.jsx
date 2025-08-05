import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import ChatBox from "../component/chatBox";
export default function CodeEditorLayout() {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState("// Write your code here");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Output will be shown here...");
  const [activeTab, setActiveTab] = useState("preview");

  const handleRun = () => {
    // Dummy run logic
    setOutput(`You wrote:\n${code}\n\nWith input:\n${input}`);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-3 bg-gray-900 text-white shadow-md z-10">
        {/* Language Dropdown */}
        <select
          className="px-2 py-1 bg-gray-700 rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        {/* Theme Dropdown */}
        <select
          className="px-2 py-1 bg-gray-700 rounded"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <button
          onClick={handleRun}
          className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
        >
          Run
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-grow" style={{ height: "85vh" }}>
        <Editor
          height="100%"
          width="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      {/* Output / Terminal Tabs */}
      <div className="bg-gray-100 text-black">
        {/* Tabs */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 ${activeTab === "preview" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-4 py-2 ${activeTab === "terminal" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            Terminal
          </button>
        </div>

        {/* Content */}
        <div className="p-3 h-[100px] overflow-auto bg-white border-t border-gray-300 text-sm">
          {activeTab === "preview" ? (
            <pre>{output}</pre>
          ) : (
            <pre>// Console log or terminal output</pre>
          )}
        </div>

        {/* Input Field */}
        <textarea
          placeholder="Enter input here"
          className="w-full p-2 border-t resize-none h-[60px] text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <ChatBox />
    </div>
  );
}
