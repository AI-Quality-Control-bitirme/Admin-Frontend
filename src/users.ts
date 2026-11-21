export const company = { id: 'rezona-demo', name: 'Rezona', adminEmail: 'admin@rezona.example' };
export const teams = ['Rezervasyon', 'Satış', 'Misafir İlişkileri', 'Kalite'] as const;
export const assignableRoles = ['HR', 'Operator'] as const;
export type Team = (typeof teams)[number];
export type AssignableRole = (typeof assignableRoles)[number];
export type Role = AssignableRole | 'Company Admin';
export type UserFields = { name: string; email: string; role: AssignableRole; team: Team | ''; active: boolean };
export type User = Omit<UserFields, 'role'> & { id: string; companyId: string; role: Role; date: string };

const storageKey = 'rezona-react-users-v1';
const recent: readonly [string, AssignableRole, Team, number, number][] = [
  ['Ece Yıldız', 'HR', 'Rezervasyon', 14, 24],
  ['Deniz Kaya', 'HR', 'Kalite', 13, 57],
  ['Mert Aksoy', 'Operator', 'Satış', 11, 36],
  ['Selin Demir', 'Operator', 'Misafir İlişkileri', 10, 18],
];
const names = ['Ada Koç','Arda Şen','Aslı Kurt','Berk Doğan','Buse Taş','Can Akın','Ceren Işık','Derya Polat',
  'Efe Uçar','Elif Acar','Emir Çelik','Esra Kılıç','Fırat Eren','Gizem Ay','Hande Ak','Işıl Tunç',
  'Kaan Gür','Leyla Çınar','Naz Karaca','Nil Aras','Oya Keskin','Ömer Bulut','Pelin Kaptan','Sena Toprak',
  'Sibel Er','Tuna Erol','Yağmur Korkmaz','Yusuf Alkan','Zeynep Kaya','Bora Can','İrem Aydın','Ozan Yücel'];

function seedUsers(): User[] {
  const rows: Omit<User, 'id' | 'companyId' | 'email'>[] = recent.map(([name, role, team, hour, minute]) => ({
    name, role, team, active: true, date: new Date(2025, 0, 26, hour, minute).toISOString(),
  }));
  let index = 0;
  for (const [teamIndex, team] of teams.entries()) {
    for (let member = 1; member < [12, 10, 8, 6][teamIndex]; member++) {
      rows.push({ name: names[index], role: team === 'Kalite' ? 'HR' : 'Operator', team, active: true,
        date: new Date(2025, 0, 25, 12, -index).toISOString() });
      index++;
    }
  }
  for (const [i, name] of ['Ayşe Yalın', 'Kerem Akın'].entries()) {
    rows.push({ name, role: 'Operator', team: '', active: false, date: new Date(2025, 0, 24, 13 - i).toISOString() });
  }
  return rows.map((row, i) => ({ ...row, id: String(i + 1), companyId: company.id, email: `kullanici${i + 1}@rezona.example` }));
}

let memory: User[] | undefined;
function read(): User[] {
  if (memory) return memory;
  try {
    const entries: User[] | null = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (Array.isArray(entries)) return entries;
  } catch {
    // The demo also works in environments that disable localStorage.
  }
  return seedUsers();
}

export const companyUsers = {
  list(companyId: string) {
    return read().filter(user => user.companyId === companyId).sort((a, b) => b.date.localeCompare(a.date));
  },
  save(companyId: string, fields: UserFields, id?: string) {
    const users = read();
    const existing = id ? users.find(user => user.id === id && user.companyId === companyId) : undefined;
    if (id && (!existing || existing.role === 'Company Admin')) throw new Error('Bu hesap düzenlenemiyor.');
    const name = fields.name.trim();
    const email = fields.email.trim().toLowerCase();
    if (!name || name.length > 80) throw new Error('Ad soyad 1–80 karakter olmalı.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) throw new Error('Geçerli bir e-posta girin.');
    if (!assignableRoles.includes(fields.role)) throw new Error('HR veya Operator rolünü seçin.');
    if (fields.team && !teams.includes(fields.team)) throw new Error('Geçerli bir takım seçin.');
    if (email === company.adminEmail || users.some(user => user.companyId === companyId && user.id !== id && user.email.toLowerCase() === email)) {
      throw new Error('Bu e-posta zaten kullanılıyor.');
    }
    const entry: User = { ...fields, name, email, companyId, id: id ?? crypto.randomUUID(),
      date: existing?.date ?? new Date().toISOString() };
    const updated = existing ? users.map(user => user === existing ? entry : user) : [entry, ...users];
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      memory = undefined;
      return { entry, persisted: true };
    } catch {
      memory = updated;
      return { entry, persisted: false };
    }
  },
};
