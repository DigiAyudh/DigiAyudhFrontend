import type { User } from '@/types/auth.types';

export interface DummyUser extends User {
  password: string;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    id: 'usr_client_001',
    email: 'client@digiayudh.com',
    password: 'Client@123',
    firstName: 'Aarav',
    lastName: 'Sharma',
    role: 'CLIENT',
    company: 'Luméra Living',
    avatar: 'AS',
    permissions: ['client:read', 'projects:read', 'support:create'],
  },
  {
    id: 'usr_employee_001',
    email: 'employee@digiayudh.com',
    password: 'Employee@123',
    firstName: 'Priya',
    lastName: 'Mehta',
    role: 'EMPLOYEE',
    avatar: 'PM',
    permissions: ['tasks:read', 'tasks:update', 'projects:read'],
  },
  {
    id: 'usr_admin_001',
    email: 'admin@digiayudh.com',
    password: 'Admin@123',
    firstName: 'Rahul',
    lastName: 'Verma',
    role: 'ADMIN',
    avatar: 'RV',
    permissions: ['admin:*', 'clients:*', 'projects:*', 'employees:*'],
  },
  {
    id: 'usr_super_001',
    email: 'superadmin@digiayudh.com',
    password: 'Super@123',
    firstName: 'Neha',
    lastName: 'Kapoor',
    role: 'SUPER_ADMIN',
    avatar: 'NK',
    permissions: ['*'],
  },
];

export function findDummyUser(email: string, password: string): DummyUser | undefined {
  return DUMMY_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
}

export function getDashboardRoute(role: User['role']): string {
  switch (role) {
    case 'CLIENT':
      return '/client/dashboard';
    case 'EMPLOYEE':
      return '/employee/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    default:
      return '/';
  }
}
