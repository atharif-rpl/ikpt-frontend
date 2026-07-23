"use client";

import dynamic from "next/dynamic";
// Ubah import css-nya
import "react-quill-new/dist/quill.snow.css"; 

// Ubah import komponennya
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-sm text-gray-500">Memuat text editor...</div>
}) as any; 

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        className="text-gray-900 dark:text-white"
      />
    </div>
  );
}