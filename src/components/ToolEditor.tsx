'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Eye, EyeOff, Play, RotateCcw } from 'lucide-react';

interface ToolEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ToolEditor({ value, onChange, placeholder }: ToolEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // 设置编辑器主题
    editor.updateOptions({
      minimap: { enabled: false },
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      fontSize: 14,
      scrollBeyondLastLine: false,
    });
  };

  const handlePreview = () => {
    setPreviewHtml(value);
    setShowPreview(true);
  };

  const handleReset = () => {
    const defaultTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>工具</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      background-color: #f4f4f5;
      color: #18181b;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    /* 在这里添加你的CSS样式 */
  </style>
</head>
<body>
  <div class="container">
    <h1>我的工具</h1>
    <!-- 在这里添加你的HTML内容 -->
  </div>
  
  <script>
    // 在这里添加你的JavaScript代码
    console.log('工具已加载');
  </script>
</body>
</html>`;
    
    onChange(defaultTemplate);
    if (editorRef.current) {
      editorRef.current.setValue(defaultTemplate);
    }
  };

  const insertTemplate = (template: string) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      const model = editorRef.current.getModel();
      const currentContent = model.getValue();
      const newContent = currentContent + template;
      
      onChange(newContent);
      editorRef.current.setValue(newContent);
    }
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-sm"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? '隐藏预览' : '显示预览'}
        </button>
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          运行预览
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          重置模板
        </button>
        
        {/* 快速模板插入 */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">快速模板:</span>
          <button
            onClick={() => insertTemplate('<button onclick="alert(\'Hello!\')">点击我</button>')}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            按钮
          </button>
          <button
            onClick={() => insertTemplate('<input type="text" placeholder="输入内容..." />')}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            输入框
          </button>
          <button
            onClick={() => insertTemplate('<textarea placeholder="多行文本..."></textarea>')}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            文本域
          </button>
        </div>
      </div>

      {/* 编辑器和预览区域 */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* 代码编辑器 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">代码编辑器</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="500px"
              defaultLanguage="html"
              value={value}
              onChange={(newValue) => onChange(newValue || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">实时预览</label>
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[500px]"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="工具预览"
              />
            </div>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>提示:</strong> 你可以编写完整的HTML代码，包括CSS和JavaScript。预览将在沙箱环境中运行，确保安全性。
        </p>
      </div>
    </div>
  );
}
