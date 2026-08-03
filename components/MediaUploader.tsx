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

  const currentMediaType = mediaType || selectedMediaType;

  const handleFile = async (file: File) => {
    setError(null);

    const isVid =
      file.type.startsWith('video/') ||
      ['.mp4', '.mov', '.webm'].some((ext) => file.name.toLowerCase().endsWith(ext));

    const isImg =
      file.type.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => file.name.toLowerCase().endsWith(ext));

    // Mode Validation
    if (currentMediaType === 'IMAGE' && !isImg) {
      setError('Invalid format for Image mode. Allowed formats: JPG, PNG, WEBP. Switch to Video mode for video files.');
      return;
    }

    if (currentMediaType === 'VIDEO' && !isVid) {
      setError('Invalid format for Video mode. Allowed formats: MP4, MOV, WEBM. Switch to Image mode for image files.');
      return;
    }

    const maxLimit = currentMediaType === 'VIDEO' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxLimit) {
      setError(
        currentMediaType === 'VIDEO'
          ? `Video size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of 100 MB.`
          : `Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of 10 MB.`
      );
      return;
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (
      currentMediaType === 'IMAGE' &&
      !allowedImageTypes.includes(file.type) &&
      !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    ) {
      setError('Invalid image format. Allowed formats: JPG, PNG, WEBP.');
      return;
    }

    if (
      currentMediaType === 'VIDEO' &&
      !allowedVideoTypes.includes(file.type) &&
      !['.mp4', '.mov', '.webm'].includes(ext)
    ) {
      setError('Invalid video format. Allowed formats: MP4, MOV, WEBM.');
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

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Server returned non-JSON response:', text);
        if (res.status === 413 || text.includes('Request Entity Too Large')) {
          throw new Error('File size exceeds server payload upload limit (Request Entity Too Large). Maximum video upload size is 100 MB.');
        }
        throw new Error(`Upload failed (HTTP ${res.status}): ${text || 'Non-JSON server response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Upload failed with status code ${res.status}`);
      }

      const returnedMediaType: 'IMAGE' | 'VIDEO' = currentMediaType;
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

  const handleSwitchMediaType = (type: 'IMAGE' | 'VIDEO') => {
    setSelectedMediaType(type);
    onChange('', type);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Media Type Selector */}
      {allowedTypes === 'ALL' && (
        <div className="flex items-center space-x-3 bg-[#D3D9D4] p-1.5 rounded-xl max-w-xs border border-[#748D92]">
          <button
            type="button"
            onClick={() => handleSwitchMediaType('IMAGE')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              currentMediaType === 'IMAGE'
                ? 'bg-[#124E66] text-white shadow-sm'
                : 'text-[#212A31] hover:text-[#124E66]'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMediaType('VIDEO')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              currentMediaType === 'VIDEO'
                ? 'bg-[#124E66] text-white shadow-sm'
                : 'text-[#212A31] hover:text-[#124E66]'
            }`}
          >
            <VideoIcon className="h-4 w-4" />
            <span>Video</span>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-[#748D92]/30">
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'device'
              ? 'border-[#124E66] text-[#212A31]'
              : 'border-transparent text-[#2E3944] hover:text-[#212A31]'
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>Device Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gdrive')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'gdrive'
              ? 'border-[#124E66] text-[#212A31]'
              : 'border-transparent text-[#2E3944] hover:text-[#212A31]'
          }`}
        >
          <Cloud className="h-4 w-4 text-[#212A31]" />
          <span>Google Drive</span>
          <span className="text-[10px] bg-[#D3D9D4] text-[#212A31] px-1.5 py-0.5 rounded font-mono border border-[#748D92]">
            Soon
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onedrive')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'onedrive'
              ? 'border-[#124E66] text-[#212A31]'
              : 'border-transparent text-[#2E3944] hover:text-[#212A31]'
          }`}
        >
          <Cloud className="h-4 w-4 text-[#212A31]" />
          <span>OneDrive</span>
          <span className="text-[10px] bg-[#D3D9D4] text-[#212A31] px-1.5 py-0.5 rounded font-mono border border-[#748D92]">
            Soon
          </span>
        </button>
      </div>

      {activeTab !== 'device' && (
        <div className="p-6 text-center sit-card space-y-2">
          <Cloud className="h-8 w-8 text-[#124E66] mx-auto" />
          <h4 className="text-sm font-bold text-[#212A31]">Cloud Storage Integration Ready</h4>
          <p className="text-xs text-[#2E3944]">
            {activeTab === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'} picker will connect
            seamlessly in upcoming updates. Please use Device Upload.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className="text-xs font-semibold text-[#124E66] hover:underline"
          >
            Switch to Device Upload
          </button>
        </div>
      )}

      {activeTab === 'device' && (
        <div className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {value ? (
            <div className="relative sit-card overflow-hidden group border border-[#748D92] shadow-md">
              <div className="relative w-full min-h-[220px] max-h-[360px] bg-[#212A31] flex items-center justify-center overflow-hidden">
                {currentMediaType === 'VIDEO' ? (
                  <video
                    src={value}
                    controls
                    className="w-full max-h-[360px] object-contain"
                  />
                ) : (
                  <img
                    src={value}
                    alt="Uploaded Media Preview"
                    className="w-full h-full object-cover max-h-[360px]"
                  />
                )}
              </div>

              <div className="p-4 flex flex-wrap items-center justify-between gap-2 bg-white border-t border-[#748D92]">
                <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700">
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
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#124E66] bg-[#D3D9D4]/60'
                  : 'border-[#748D92] hover:border-[#212A31] bg-white'
              }`}
            >
              <div className="max-w-xs mx-auto space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-[#D3D9D4] flex items-center justify-center text-[#124E66] border border-[#748D92]">
                  {currentMediaType === 'VIDEO' ? (
                    <VideoIcon className="h-6 w-6 text-[#124E66]" />
                  ) : (
                    <Upload className="h-6 w-6 text-[#124E66]" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#212A31]">
                    Click to upload or drag & drop {currentMediaType === 'VIDEO' ? 'video' : 'image'}
                  </p>
                  <p className="text-[11px] text-[#2E3944]">
                    {currentMediaType === 'VIDEO'
                      ? 'Supported formats: MP4, MOV, WEBM (Max 100 MB)'
                      : 'Supported formats: JPG, PNG, WEBP (Max 10 MB)'}
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full h-2 bg-[#D3D9D4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#124E66] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-[#2E3944] font-mono">
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
