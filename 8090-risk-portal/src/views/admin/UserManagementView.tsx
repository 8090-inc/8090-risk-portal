// User management view for administrators

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Check, X, Search } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { authService } from '../../services/authService';
import { useAuthStore, useCurrentUser } from '../../store/authStore';
import { User, UserRole, CreateUserRequest } from '../../types/auth.types';
import { RISK_OWNERS } from '../../constants/riskOwners';
import { format } from 'date-fns';

export const UserManagementView: React.FC = () => {
  const currentUser = useCurrentUser();
  const { loading } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    name: '',
    password: '',
    role: 'viewer',
    department: '' as any
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await authService.createUser(currentUser.id, formData);
      await loadUsers();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedUser) return;

    try {
      await authService.updateUser(currentUser.id, selectedUser.email, {
        name: formData.name,
        role: formData.role,
        department: formData.department
      });
      await loadUsers();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!currentUser) return;
    
    if (user.id === currentUser.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await authService.updateUser(currentUser.id, user.email, { isActive: false });
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'viewer',
      department: '' as any
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      department: user.department
    });
    setShowEditModal(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      default: return 'default';
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <PageHeader
        title="User Management"
        description="Manage user accounts and permissions"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add User
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
          >
            <option value="all">All Departments</option>
            {RISK_OWNERS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Department</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Role</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Last Login</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-[#0055D4] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        {user.id === currentUser?.id && (
                          <p className="text-xs text-slate-500">(You)</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{user.department}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">
                      {user.lastLogin ? format(new Date(user.lastLogin), 'PP') : 'Never'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1 text-slate-600 hover:text-[#0055D4] transition-colors"
                        disabled={user.id === currentUser?.id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as any }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            >
              <option value="">Select department</option>
              {RISK_OWNERS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            >
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={generateRandomPassword}
              >
                Generate
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              User will be required to change this on first login
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as any }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            >
              {RISK_OWNERS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4]"
            >
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Update User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};