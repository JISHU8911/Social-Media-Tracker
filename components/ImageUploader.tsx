'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'device' | 'gdrive' | 'onedrive'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size exceeds maximum limit of 10 MB.');
      return;
    }

    // Validate format
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Invalid format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate smooth progress bar
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 15 : prev));
      }, 100);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Server returned non-JSON:', text);
        if (res.status === 413 || text.includes('Request Entity Too Large')) {
          throw new Error('Image size exceeds server upload limit (Request Entity Too Large). Maximum image size is 10 MB.');
        }
        throw new Error(`Upload failed (HTTP ${res.status}): ${text || 'Non-JSON server response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation for Future-Ready Architecture */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'device'
              ? 'border-cyan-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>Device Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gdrive')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'gdrive'
              ? 'border-cyan-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Cloud className="h-4 w-4 text-blue-500" />
          <span>Google Drive</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            Soon
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onedrive')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'onedrive'
              ? 'border-cyan-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Cloud className="h-4 w-4 text-sky-500" />
          <span>OneDrive</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            Soon
          </span>
        </button>
      </div>

      {/* Cloud Drives Disabled Message */}
      {activeTab !== 'device' && (
        <div className="p-6 text-center sit-card space-y-2">
          <Cloud className="h-8 w-8 text-cyan-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Cloud Storage Integration Ready</h4>
          <p className="text-xs text-slate-500">
            {activeTab === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'} picker will connect seamlessly in upcoming enterprise updates. Please use Device Upload.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className="text-xs font-semibold text-cyan-600 hover:underline"
          >
            Switch to Device Upload
          </button>
        </div>
      )}

      {/* Device Upload Area */}
      {activeTab === 'device' && (
        <div className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {value ? (
            /* Uploaded Preview State */
            <div className="relative sit-card overflow-hidden group">
              <div className="relative w-full h-64 bg-slate-100 flex items-center justify-center">
                <img
                  src={value}
                  alt="Uploaded Post Image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex items-center justify-between bg-white border-t border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Image Uploaded Successfully</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Replace Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg btn-danger text-xs font-semibold"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag and Drop Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
              }`}
            >
              <div className="max-w-xs mx-auto space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                  <Upload className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    Click to upload or drag & drop image
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, WEBP (Max 10 MB)
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Uploading image... {progress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
