import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { Clipboard, Check } from 'lucide-react'

interface LowlightExtension {
  options: {
    lowlight: {
      listLanguages: () => string[];
    };
  };
}

export default function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: {
  node: { attrs: { language?: string } }; // languageをオプショナルに
  updateAttributes: (attributes: { language: string }) => void;
  extension: LowlightExtension;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = document.querySelector('.code-block code')?.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <NodeViewWrapper
      className={`relative code-block group p-4 rounded-md bg-gray-100 dark:bg-gray-800 text-sm leading-6 ${isClicked ? 'border border-gray-300 dark:border-gray-700' : ''}`}
      onClick={() => setIsClicked(true)}
      onBlur={() => setIsClicked(false)}
    >
      {isClicked && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Clipboard className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <select
            contentEditable={false}
            value={node.attrs.language || ""} // languageがない場合に対応
            onChange={(event) => updateAttributes({ language: event.target.value })}
            className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 shadow-sm focus:ring focus:ring-blue-200 dark:focus:ring-blue-800"
          >
            console.log(value);
            <option value="null">auto</option>
            <option disabled>—</option>
            {extension.options.lowlight.listLanguages().map((lang: string) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      )}
      <pre className="overflow-auto">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
