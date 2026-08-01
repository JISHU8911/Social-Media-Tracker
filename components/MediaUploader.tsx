'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  RefreshCw,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

interface MediaUploaderProps {
  value: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  onChange: (url: string, mediaType: 'IMAGE' | 'VIDEO') => void;
  allowedTypes?: 'ALL' | 'IMAGE_ONLY' | 'VIDEO_ONLY';
}

export default function MediaUploader({
  value,
  mediaType = 'IMAGE',
  onChange,
  allowedTypes = 'ALL',
}: MediaUploaderProps) {
  const [selectedMediaType, setSelectedMediaType] = useState<'IMAGE' | 'VIDEO'>(mediaType);
  const [activeTab, setActiveTab] = useState<'device' | 'gdrive' | 'onedrive'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    const isVid =
      file.type.startsWith('video/') ||
      ['.mp4', '.mov', '.webm'].some((ext) => file.name.toLowerCase().endsWith(ext));

    const fileCategory: 'IMAGE' | 'VIDEO' = isVid ? 'VIDEO' : 'IMAGE';

    // Check size limit (10MB for image, 50MB for video)
    const maxLimit = isVid ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxLimit) {
      setError(
        isVid
          ? 'Video size exceeds maximum limit of 50 MB.'
          : 'Image size exceeds maximum limit of 10 MB.'
      );
      return;
    }

    // Format check
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (
      fileCategory === 'IMAGE' &&
      !allowedImageTypes.includes(file.type) &&
      !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    ) {
      setError('Invalid format. Allowed images: JPG, PNG, WEBP.');
      return;
    }

    if (
      fileCategory === 'VIDEO' &&
      !allowedVideoTypes.includes(file.type) &&
      !['.mp4', '.mov', '.webm'].includes(ext)
    ) {
      setError('Invalid format. Allowed videos: MP4, MOV, WEBM.');
      return;
    }

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 150);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const returnedMediaType: 'IMAGE' | 'VIDEO' = data.mediaType || fileCategory;
      setSelectedMediaType(returnedMediaType);
      onChange(data.url, returnedMediaType);
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

  const currentMediaType = mediaType || selectedMediaType;

  return (
    <div className="space-y-4">
      {/* Media Type Selector (Image vs Video) */}
      {allowedTypes === 'ALL' && (
        <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-xl max-w-xs">
          <button
            type="button"
            onClick={() => setSelectedMediaType('IMAGE')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              currentMediaType === 'IMAGE'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMediaType('VIDEO')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              currentMediaType === 'VIDEO'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VideoIcon className="h-4 w-4" />
            <span>Video</span>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
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

      {activeTab !== 'device' && (
        <div className="p-6 text-center sit-card space-y-2">
          <Cloud className="h-8 w-8 text-cyan-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Cloud Storage Integration Ready</h4>
          <p className="text-xs text-slate-500">
            {activeTab === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'} picker will connect
            seamlessly in upcoming enterprise updates. Please use Device Upload.
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

      {activeTab === 'device' && (
        <div className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {value ? (
            /* Uploaded Preview State (Image or Playable Video) */
            <div className="relative sit-card overflow-hidden group border border-slate-200 shadow-md">
              <div className="relative w-full min-h-[220px] max-h-[360px] bg-slate-900 flex items-center justify-center overflow-hidden">
                {currentMediaType === 'VIDEO' ? (
                  <video
                    src={value}
                    controls
                    className="w-full max-h-[360px] object-contain"
                  />
                ) : (
                  <img
                    src={value}
                    alt="Uploaded Media"
                    className="w-full h-full object-cover max-h-[360px]"
                  />
                )}
              </div>

              <div className="p-4 flex flex-wrap items-center justify-between gap-2 bg-white border-t border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {currentMediaType === 'VIDEO' ? 'Video' : 'Image'} Uploaded Successfully
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Replace Media</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange('', currentMediaType)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg btn-danger text-xs font-semibold"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone */
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
                  {currentMediaType === 'VIDEO' ? (
                    <VideoIcon className="h-6 w-6 text-purple-600" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    Click to upload or drag & drop {currentMediaType === 'VIDEO' ? 'video' : 'image'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentMediaType === 'VIDEO'
                      ? 'Supported formats: MP4, MOV, WEBM (Max 50 MB)'
                      : 'Supported formats: JPG, PNG, WEBP (Max 10 MB)'}
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
                      Uploading {currentMediaType === 'VIDEO' ? 'video' : 'image'}... {progress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={
              currentMediaType === 'VIDEO'
                ? 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm'
                : 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
            }
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
