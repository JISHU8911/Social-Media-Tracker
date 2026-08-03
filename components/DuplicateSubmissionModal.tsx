'use client';

import { AlertTriangle, Edit3 } from 'lucide-react';

interface DuplicateSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  employeeName: string;
  designationName: string;
}

export default function DuplicateSubmissionModal({
  isOpen,
  onClose,
  onEdit,
  employeeName,
  designationName,
}: DuplicateSubmissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212A31]/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md sit-card bg-white border border-[#748D92] rounded-2xl shadow-2xl overflow-hidden text-[#212A31]">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D3D9D4] text-[#124E66] border border-[#748D92]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#212A31]">
              Already Submitted
            </h3>
            <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
              You have already submitted an interaction for this campaign post.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#D3D9D4]/50 border border-[#748D92]/60 text-xs text-[#212A31] space-y-1">
            <p className="font-extrabold">{employeeName}</p>
            <p className="text-[#124E66] font-bold font-mono text-[11px]">{designationName}</p>
          </div>

          <p className="text-xs text-[#2E3944] font-medium">
            Would you like to update your existing engagement details?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onEdit}
              className="w-full sm:w-1/2 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-primary"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Submission</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
