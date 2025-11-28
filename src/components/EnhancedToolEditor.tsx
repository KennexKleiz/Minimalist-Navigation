'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tool, ToolCategory } from '@prisma/client';
import Editor from '@monaco-editor/react';
import { Play, Save, Eye, Code, Settings, Copy, Download, Upload } from 'lucide-react';
// import { toast } from 'sonner';

// 临时 toast 函数
const toast = {
  success: (message: string) => {
    // 简单的成功提示
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 16px; border-radius: 6px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    document.body.appendChild(div);
    setTimeout(() => document.body.removeChild(div), 3000);
  },
  error: (message: string) => {
    // 简单的错误提示
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 16px; border-radius: 6px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    document.body.appendChild(div);
    setTimeout(() => document.body.removeChild(div), 3000);
  }
};

interface EnhancedToolEditorProps {
  tool?: Tool & { category?: ToolCategory };
  categories: ToolCategory[];
  onSave: (tool: Partial<Tool>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// 临时UI组件
const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, type = 'button', className = '' }: any) => (
  <button
    onClick={onClick}
    type={type}
    disabled={disabled}
    className={`px-4 py-2 rounded ${variant === 'outline' ? 'border border-gray-300' : 'bg-blue-500 text-white'} ${disabled ? 'opacity-50' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ id, value, onChange, placeholder, type = 'text', required = false, className = '' }: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded ${className}`}
  />
);

const Textarea = ({ id, value, onChange, placeholder, rows = 3, required = false, className = '' }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded ${className}`}
  />
);

const Label = ({ htmlFor, children, className = '' }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
    {children}
  </label>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 border-b ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Select = ({ value, onValueChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }: any) => <>{children}</>;
const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;

const Tabs = ({ value, onValueChange, children }: any) => {
  const [activeTab, setActiveTab] = React.useState(value);
  
  React.useEffect(() => {
    setActiveTab(value);
  }, [value]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onValueChange(tab);
  };
  
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange: handleTabChange
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange }: any) => (
  <div className="flex border-b">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childElement = child as React.ReactElement<any>;
        return React.cloneElement(childElement, {
          isActive: childElement.props?.value === activeTab,
          onClick: () => onTabChange(childElement.props?.value)
        });
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ value, children, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 ${isActive ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }: any) => (
  activeTab === value ? <div className="mt-4">{children}</div> : null
);

function EnhancedToolEditorComponent({
  tool,
  categories,
  onSave,
  onCancel,
  isLoading = false
}: EnhancedToolEditorProps) {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    description: tool?.description || '',
    icon: tool?.icon || '🔧',
    code: tool?.code || '',
    categoryId: tool?.categoryId || (categories.length > 0 ? categories[0].id : 0),
    sortOrder: tool?.sortOrder || 0,
    skipSecurityCheck: (tool as any)?.skipSecurityCheck || false
  });

  const [activeTab, setActiveTab] = useState('edit');
  const editorRef = useRef<any>(null);

  // 图标分类列表
  const iconCategories = {
    常用: ['🔧', '📝', '🔤', '⚖️', '🔠', '🔗', '⏰', '😊', '🔐', '🎨', '💻', '🌐', '📊', '🔍', '📈', '🎯', '💡', '🚀', '⚡', '🛠️'],
    电子设备: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🪫', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️'],
    金融: ['💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🪪', '💎', '⚖️'],
    工具: ['🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️'],
    医疗: ['🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '🪬', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩻', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️'],
    家居: ['🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🪮', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟'],
    购物: ['🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🪭', '🏮', '🎐', '🪩', '🧧'],
    文档: ['✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖'],
    文具: ['🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎'],
    安全: ['🔏', '🔐', '🔒', '🔓'],
    符号: ['✔️', '☑️', '🔘', '⚪', '⚫', '🔴', '🔵', '🟤', '🟣', '🟢', '🟡', '🟠', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '⬛', '⬜', '🟧', '🟦', '🟥', '🟫', '🟪', '🟩', '🟨'],
    音频: ['🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢'],
    对话: ['🗨️', '👁️‍🗨️', '💬', '💭', '🗯️'],
    娱乐: ['♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄'],
    时钟: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
    其他: ['♀️', '♂️', '⚧', '⚕️']
  };

  const [showAllIcons, setShowAllIcons] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('常用');

  // HTML模板
  const htmlTemplates = [
    {
      name: '基础模板',
      template: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>工具标题</title>
<style>
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
    padding: 20px; 
    background: #f4f4f5; 
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
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #fafafa; }
    .container { background: #27272a; }
  }
</style>
</head>
<body>
<div class="container">
  <h1>工具标题</h1>
  <p>工具描述和功能区域</p>
</div>
<script>
// 工具的核心逻辑
function main() {
  console.log('工具已加载');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', main);
</script>
</body>
</html>`
    },
    {
      name: '文本处理模板',
      template: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>文本处理工具</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
  button { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background: #4f46e5; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #fafafa; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; border-color: #52525b; color: #fafafa; }
  }
</style>
</head>
<body>
<div class="container">
  <h3>输入文本</h3>
  <textarea id="input" placeholder="请输入要处理的文本..."></textarea>
  <button onclick="processText()">处理</button>
  <h3>处理结果</h3>
  <textarea id="output" readonly></textarea>
</div>
<script>
function processText() {
  const input = document.getElementById('input').value;
  // 在这里添加你的处理逻辑
  const result = input.toUpperCase(); // 示例：转换为大写
  document.getElementById('output').value = result;
}
</script>
</body>
</html>`
    }
  ];

  useEffect(() => {
    if (editorRef.current && formData.code) {
      editorRef.current.setValue(formData.code);
    }
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // 配置编辑器
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('请输入工具名称');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('请输入工具描述');
      return;
    }

    if (!formData.categoryId) {
      toast.error('请选择工具分类');
      return;
    }

    if (!formData.code.trim()) {
      toast.error('请输入工具代码');
      return;
    }

    // 如果是新建工具且 sortOrder 为 0，则不传递 sortOrder 让后端自动计算
    const dataToSave = { ...formData };
    if (!tool && formData.sortOrder === 0) {
      delete (dataToSave as any).sortOrder;
    }

    onSave(dataToSave);
  };

  const insertTemplate = (template: string) => {
    setFormData(prev => ({ ...prev, code: template }));
    if (editorRef.current) {
      editorRef.current.setValue(template);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(formData.code);
    toast.success('代码已复制到剪贴板');
  };

  const downloadCode = () => {
    const blob = new Blob([formData.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'tool'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('代码已下载');
  };

  const uploadCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData(prev => ({ ...prev, code: content }));
        if (editorRef.current) {
          editorRef.current.setValue(content);
        }
        toast.success('代码已上传');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {tool ? '编辑工具' : '创建新工具'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">工具名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入工具名称"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">工具描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述工具的功能和用途"
                rows={2}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>图标</Label>

              {/* 分类选择器 */}
              <div className="flex gap-2 flex-wrap mb-3">
                {Object.keys(iconCategories).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({iconCategories[category as keyof typeof iconCategories].length})
                  </button>
                ))}
              </div>

              {/* 图标网格 */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(showAllIcons
                    ? iconCategories[selectedCategory as keyof typeof iconCategories]
                    : iconCategories[selectedCategory as keyof typeof iconCategories].slice(0, 20)
                  ).map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 text-2xl rounded border transition-all ${
                        formData.icon === icon
                          ? 'border-blue-500 bg-blue-100 shadow-md scale-110'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-white hover:shadow-sm'
                      }`}
                      title={icon}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* 展开/收起按钮 */}
                {iconCategories[selectedCategory as keyof typeof iconCategories].length > 20 && (
                  <button
                    type="button"
                    onClick={() => setShowAllIcons(!showAllIcons)}
                    className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                  >
                    {showAllIcons ? (
                      <>
                        <span>收起</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>查看更多 ({iconCategories[selectedCategory as keyof typeof iconCategories].length - 20} 个)</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 自定义图标输入 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600">或输入自定义图标：</Label>
                <Input
                  type="text"
                  value={formData.icon}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="输入 emoji 或文字"
                  className="w-32 h-10 text-center text-xl"
                />
                {formData.icon && (
                  <span className="text-3xl">{formData.icon}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e: any) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="排序数字，越小越靠前"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="skipSecurityCheck"
                checked={formData.skipSecurityCheck}
                onChange={(e) => setFormData(prev => ({ ...prev, skipSecurityCheck: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="skipSecurityCheck" className="cursor-pointer">
                <span className="font-medium">跳过安全检查</span>
                <span className="text-xs text-gray-500 ml-2">(允许使用任何代码，包括外部脚本)</span>
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              代码编辑器
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyCode}
                disabled={!formData.code}
              >
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button
                variant="outline"
                onClick={downloadCode}
                disabled={!formData.code}
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                上传
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".html,.htm,.txt"
                onChange={uploadCode}
                className="hidden"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="templates">模板</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
              <div className="border rounded-lg">
                <Editor
                  height="500px"
                  defaultLanguage="html"
                  value={formData.code}
                  onChange={(value: any) => setFormData(prev => ({ ...prev, code: value || '' }))}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  支持HTML、CSS、JavaScript的完整功能
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {htmlTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-500 mb-2">
                        {template.template.substring(0, 100)}...
                      </div>
                      <Button
                        onClick={() => insertTemplate(template.template)}
                        className="w-full"
                      >
                        使用模板
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {formData.code && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              实时预览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <iframe
                srcDoc={formData.code}
                className="w-full h-96"
                title="工具预览"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-1" />
          {isLoading ? '保存中...' : (tool ? '更新工具' : '创建工具')}
        </Button>
      </div>
  </div>
  );
}

export default EnhancedToolEditorComponent;
