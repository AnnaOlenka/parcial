import { useState, useEffect } from 'react';
import type { User } from '../types';

const STORAGE_KEY = 'users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const addUser = (user: User) => {
    // Control de duplicados por documento (requisito).
    setUsers(prev => {
      const exists = prev.some(u => u.documentNumber === user.documentNumber);
      if (exists) return prev;
      return [...prev, user];
    });
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const getUserByDocument = (documentNumber: string) =>
    users.find(u => u.documentNumber === documentNumber);

  return { users, addUser, updateUser, getUserById, getUserByDocument };
}
