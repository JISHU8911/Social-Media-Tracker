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
  Trash2,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZATION_SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'MEMBER' | 'USER' | string;
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
        if (data?.user?.role !== 'SUPER_ADMIN' && data?.user?.role !== 'PLATFORM_SUPER_ADMIN' && data?.user?.role !== 'ORGANIZATION_SUPER_ADMIN') {
          alert('Access Restricted. Super Admin rights required.');
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
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
            User Management (SIT HQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
            Create, manage, and configure active status of Admin & Super Admin accounts.
          </p>
        </div>

        {/* Create User Form */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
          <h2 className="text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-[#124E66]" />
            <span>Create New Admin Account</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#748D92] hover:text-[#212A31]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl sit-input text-xs sm:text-sm font-medium bg-white text-[#212A31]"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
            </select>

            <button
              type="submit"
              disabled={creating}
              className="btn-primary py-2.5 px-4 text-xs font-bold shadow-md disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="sit-card bg-white border border-[#748D92] rounded-2xl overflow-hidden shadow-soft">
          <div className="p-5 border-b border-[#748D92]/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#212A31]" />
              <h2 className="text-base font-extrabold text-[#212A31]">Active Administrators</h2>
            </div>
            <span className="text-xs font-bold text-[#2E3944] bg-[#D3D9D4] px-3 py-1 rounded-full border border-[#748D92]">
              {users.length} Total Users
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-[#2E3944]">
              Loading administrator user list...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#2E3944] font-medium">
              No administrator accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#212A31]">
                <thead className="sit-table-header text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Administrator</th>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#748D92]/30 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#D3D9D4]/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#212A31]">{u.name}</td>
                      <td className="px-5 py-4 text-[#2E3944] font-medium">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#212A31] text-white">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            u.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {u.role === 'ORGANIZATION_SUPER_ADMIN' ? (
                          <span className="text-xs font-semibold text-[#124E66] bg-[#D3D9D4] px-3 py-1.5 rounded-lg border border-[#748D92] inline-block">
                            This is the primary organization administrator.
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleActive(u.id, u.active)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                u.active
                                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                  : 'btn-primary'
                              }`}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg text-[#2E3944] hover:text-red-700 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
