'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Briefcase, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Designation {
  id: string;
  designationName: string;
  active: boolean;
  createdAt: string;
}

export default function DesignationsManagementPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [newDesignationName, setNewDesignationName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/designations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDesignations(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load designations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleAddDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignationName.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designationName: newDesignationName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add designation');
      }

      setNewDesignationName('');
      fetchDesignations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (des: Designation) => {
    setEditingId(des.id);
    setEditingName(des.designationName);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setError(null);

    try {
      const res = await fetch(`/api/designations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designationName: editingName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update designation');
      }

      setEditingId(null);
      fetchDesignations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setError(null);
    try {
      const res = await fetch(`/api/designations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle status');
      }

      fetchDesignations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete designation "${name}"?`)) return;
    setError(null);

    try {
      const res = await fetch(`/api/designations/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete designation');
      }

      fetchDesignations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
            Designation Management
          </h1>
          <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
            Configure member job titles and designations used for interaction tracking.
          </p>
        </div>

        {/* Add Designation Form */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
          <h2 className="text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center space-x-2">
            <Plus className="h-4 w-4 text-[#124E66]" />
            <span>Add New Designation</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddDesignation} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDesignationName}
              onChange={(e) => setNewDesignationName(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Marketing Lead..."
              className="flex-1 px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Designation'}
            </button>
          </form>
        </div>

        {/* Designation List */}
        <div className="sit-card bg-white border border-[#748D92] rounded-2xl overflow-hidden shadow-soft">
          <div className="p-5 border-b border-[#748D92]/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-[#212A31]" />
              <h2 className="text-base font-extrabold text-[#212A31]">Active Designations</h2>
            </div>
            <span className="text-xs font-bold text-[#2E3944] bg-[#D3D9D4] px-3 py-1 rounded-full border border-[#748D92]">
              {designations.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-[#2E3944]">
              Loading designation list...
            </div>
          ) : designations.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#2E3944] font-medium">
              No designations configured yet. Add your first designation above.
            </div>
          ) : (
            <div className="divide-y divide-[#748D92]/30 font-medium">
              {designations.map((des) => (
                <div
                  key={des.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#D3D9D4]/30 transition-colors"
                >
                  {editingId === des.id ? (
                    <div className="flex items-center space-x-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg sit-input text-xs font-medium w-full"
                      />
                      <button
                        onClick={() => handleSaveEdit(des.id)}
                        className="px-3 py-1.5 rounded-lg btn-primary text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-sm text-[#212A31]">
                        {des.designationName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          des.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {des.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {editingId !== des.id && (
                      <button
                        onClick={() => handleStartEdit(des)}
                        className="p-2 rounded-lg text-[#212A31] hover:bg-[#D3D9D4] transition-colors"
                        title="Edit Designation Name"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(des.id, des.active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        des.active
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'btn-primary'
                      }`}
                    >
                      {des.active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDelete(des.id, des.designationName)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Designation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
