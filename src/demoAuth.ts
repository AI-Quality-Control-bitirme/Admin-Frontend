import { company, companyUsers, type Role, type User } from './users';

export type Session = Pick<User, 'id' | 'companyId' | 'role' | 'name' | 'email'>;
const storageKey = 'rezona-demo-session-v1';
export const demoPassword = 'RezonaDemo123';
const administrator: Session = {
  id: 'company-admin',
  companyId: company.id,
  role: 'Company Admin',
  name: 'Rezona Yöneticisi',
  email: company.adminEmail,
};
export const demoAccounts: ReadonlyArray<{ role: Role; email: string }> = [
  { role: 'Company Admin', email: administrator.email },
  { role: 'HR', email: 'kullanici1@rezona.example' },
  { role: 'Operator', email: 'kullanici3@rezona.example' },
];

function accountList(): Session[] {
  return [administrator, ...companyUsers.list(company.id).filter(user => user.active).map(
    ({ id, companyId, role, name, email }) => ({ id, companyId, role, name, email })
  )];
}

export function restoreSession(): Session | null {
  try {
    const id = sessionStorage.getItem(storageKey);
    return accountList().find(account => account.id === id) ?? null;
  } catch {
    return null;
  }
}

export function signIn(email: string, password: string): Session {
  const account = accountList().find(entry => entry.email === email.trim().toLowerCase());
  if (!account || password !== demoPassword) throw new Error('E-posta veya demo parolası hatalı.');
  try { sessionStorage.setItem(storageKey, account.id); } catch { /* In-memory session remains available. */ }
  return account;
}

export function signOut() {
  try { sessionStorage.removeItem(storageKey); } catch { /* There is no persisted session to remove. */ }
}
