'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);

  // New admin form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user?.role !== 'SUPER_ADMIN') {
          alert('Access Restricted. Only Super Admins can manage users.');
          router.push('/admin');
          return;
        }
        setCurrentUser(data.user);
      })
      .catch(() => router.push('/admin/login'));

    loadUsers();
  }, [router]);

  const loadUsers = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setName('');
      setEmail('');
      setPassword('');
      setRole('ADMIN');
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (currentUser && id === currentUser.id) {
      alert('Forbidden. You cannot deactivate your own Super Admin account.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (currentUser && id === currentUser.id) {
      alert('Forbidden. You cannot delete your own Super Admin account.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user account "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user account');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management (SIT Super HQ)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, manage, and configure active status of Admin & Super Admin accounts.
          </p>
        </div>

        {/* Create User Form */}
        <div className="sit-card p-6 border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-cyan-600" />
            <span>Create New Admin Account</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium bg-white text-slate-900"
            >
              <option value="ADMIN">Standard Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-xl btn-primary text-xs sm:text-sm shadow-sm disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="sit-card border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="h-4 w-4 text-cyan-600" />
              <span>Registered Accounts</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {users.length} accounts
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Name & Email</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((u) => {
                    const isSelf = currentUser && u.id === currentUser.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6 space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            {isSelf && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {u.role === 'SUPER_ADMIN' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="h-3 w-3" />
                              <span>SUPER ADMIN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <span>ADMIN</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {u.active ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle className="h-3 w-3" />
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-3">
                          {isSelf ? (
                            <span className="text-xs text-slate-400 font-semibold italic">
                              Protected Self Session
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleActive(u.id, u.active)}
                                className={`text-xs font-semibold ${
                                  u.active
                                    ? 'text-amber-600 hover:underline'
                                    : 'text-emerald-600 hover:underline'
                                }`}
                              >
                                {u.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="text-xs text-red-600 hover:underline font-semibold"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
