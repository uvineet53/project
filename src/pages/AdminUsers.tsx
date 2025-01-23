import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { User, UserPlus, Lock, Unlock, Trash2, Download } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      return usersData.map((user: any) => ({
        ...user,
      })) as AdminUser[];
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });
      await supabase.from("users").insert([{ id: data?.user?.id, email: newEmail }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setNewEmail('');
      setNewPassword('');
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error('Error creating user: ' + error.message);
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Error updating user role: ' + error.message);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Error deleting user: ' + error.message);
    },
  });

  const exportEmails = () => {
    if (!users || users.length === 0) {
      toast.error('No users available to export');
      return;
    }
    const emails = users.map((user) => user.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_emails.txt';
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Emails exported successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage users and their permissions
          </p>
        </div>
        <Button onClick={exportEmails}>
          <Download className="h-4 w-4 mr-2" />
          Export Emails
        </Button>
      </div>

      {/* Create User Form */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Create New User</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUser.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={createUser.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </form>
      </div>

      {/* Users List */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.last_sign_in_at
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.last_sign_in_at ? 'Active' : 'Never logged in'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleAdmin.mutate({ userId: user.id, isAdmin: !user.is_admin })
                    }
                  >
                    {user.is_admin ? (
                      <Lock className="h-4 w-4 mr-2 text-blue-600" />
                    ) : (
                      <Unlock className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    {user.is_admin ? 'Admin' : 'User'}
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUser.mutate(user.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
