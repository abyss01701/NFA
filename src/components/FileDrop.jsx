import { useRef } from 'react';

export default function FileDrop({ accept, onFile, label }) {
  const ref = useRef();

  return (
    <div
      className="border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer"
      onClick={() => ref.current?.click()}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      <p className="mt-2 text-xs text-gray-500">Click to select</p>
    </div>
  );
}
