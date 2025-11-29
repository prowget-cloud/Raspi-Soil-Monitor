import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { User, UserRole } from '../../types';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';

const UserForm: React.FC<{ user?: User; onSave: (user: Partial<User>) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<User>>(user || { name: '', email: '', role: UserRole.Viewer, password_hash: '' });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card title={user ? 'Edit User' : 'Add New User'} className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              name="password_hash" 
              placeholder={user ? 'Leave blank to keep unchanged' : ''}
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" 
              required={!user} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
              <option value={UserRole.Admin}>Admin</option>
              <option value={UserRole.Viewer}>Viewer</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-agri-green text-white rounded-md hover:bg-agri-green-dark">Save</button>
          </div>
        </form>
      </Card>
    </div>
  );
};


const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error) {
       showToast('Failed to fetch users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (userData: Partial<User>) => {
    try {
      if (userData.user_id) {
        await api.updateUser(userData as User);
        showToast('User updated successfully!', 'success');
      } else {
        await api.addUser(userData as Omit<User, 'user_id'>);
        showToast('User added successfully!', 'success');
      }
      fetchUsers();
      setShowForm(false);
      setEditingUser(undefined);
    } catch (error) {
       showToast('Failed to save user.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        showToast('User deleted successfully.', 'success');
        fetchUsers();
      } catch (error) {
        showToast('Failed to delete user.', 'error');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <button onClick={() => { setEditingUser(undefined); setShowForm(true); }} className="px-4 py-2 bg-agri-green text-white rounded-md hover:bg-agri-green-dark flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
             Add User
        </button>
      </div>
      <Card>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="text-center p-4">Loading users...</td></tr>
            ) : (
              users.map(user => (
              <tr key={user.user_id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{user.user_id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <button onClick={() => { setEditingUser(user); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(user.user_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        </div>
      </Card>
      {showForm && <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingUser(undefined); }} />}
    </div>
  );
};

export default ManageUsers;