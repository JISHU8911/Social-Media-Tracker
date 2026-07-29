'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Briefcase,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface DesignationItem {
  id: string;
  designationName: string;
  active: boolean;
  createdAt: string;
}

export default function DesignationManagementPage() {
  const router = useRouter();
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDesignationName, setNewDesignationName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));

    loadDesignations();
  }, [router]);

  const loadDesignations = () => {
    fetch('/api/designations?includeInactive=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDesignations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

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
      if (!res.ok) throw new Error(data.error || 'Failed to add designation');

      setNewDesignationName('');
      loadDesignations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/designations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      loadDesignations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStartEdit = (desig: DesignationItem) => {
    setEditingId(desig.id);
    setEditingName(desig.designationName);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch('/api/designations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, designationName: editingName }),
      });

      if (!res.ok) throw new Error('Failed to save designation');
      setEditingId(null);
      loadDesignations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure employee roles and designations available in the public interaction form.
          </p>
        </div>

        {/* Add Designation Form */}
        <div className="sit-card p-6 border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <Plus className="h-4 w-4 text-cyan-600" />
            <span>Add New Designation</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddDesignation} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDesignationName}
              onChange={(e) => setNewDesignationName(e.target.value.toUpperCase())}
              placeholder="e.g. SENIOR SOFTWARE ENGINEER"
              className="flex-1 px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium uppercase tracking-wide placeholder:normal-case"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 rounded-xl btn-primary text-xs sm:text-sm shadow-sm disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Designation'}
            </button>
          </form>
        </div>

        {/* Designation List Table */}
        <div className="sit-card border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-cyan-600" />
              <span>Current Designations</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {designations.length} stored
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading designations...</div>
          ) : designations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No designations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Designation Name</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {designations.map((desig) => (
                    <tr key={desig.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {editingId === desig.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value.toUpperCase())}
                              className="px-3 py-1 rounded-lg sit-input text-xs font-bold uppercase"
                            />
                            <button
                              onClick={() => handleSaveEdit(desig.id)}
                              className="px-2.5 py-1 rounded-lg btn-primary text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-slate-500 text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span>{desig.designationName}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {desig.active ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <XCircle className="h-3 w-3" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 whitespace-nowrap text-xs text-slate-500">
                        {new Date(desig.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-3">
                        <button
                          onClick={() => handleStartEdit(desig)}
                          className="text-xs text-cyan-600 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(desig.id, desig.active)}
                          className={`text-xs font-semibold ${
                            desig.active
                              ? 'text-amber-600 hover:underline'
                              : 'text-emerald-600 hover:underline'
                          }`}
                        >
                          {desig.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
