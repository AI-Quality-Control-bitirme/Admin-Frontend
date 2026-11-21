import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Brand, Icon, type IconName } from './Icon';
import { UserEditor } from './UserEditor';
import { SignIn } from './SignIn';
import { restoreSession, signOut, type Session } from './demoAuth';
import { assignableRoles, company, companyUsers, teams, type User, type UserFields } from './users';

const pages = [
  { path: '/admin', icon: 'home', label: 'Genel Bakış' },
  { path: '/admin/users', icon: 'users', label: 'Kullanıcılar' },
  { path: '/admin/teams', icon: 'team', label: 'Takımlar' },
] as const;
const dates = new Intl.DateTimeFormat('tr-TR', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;
const userUrl = (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return '#/admin/users' + (query ? '?' + query : '');
};

function Heading({ title, description }: { title: string; description: string }) {
  return <div className="heading reveal"><h1>{title}</h1><p>{description}</p></div>;
}

function NewUser({ onClick }: { onClick: () => void }) {
  return <button type="button" className="primary" onClick={onClick}><Icon name="plus" />Yeni kullanıcı</button>;
}

function UserTable({ users, onEdit, full = false }: { users: User[]; onEdit: (user: User) => void; full?: boolean }) {
  if (!users.length) return <p className="empty">Filtrelere uygun kullanıcı bulunamadı.</p>;
  return <div className="table-wrap" tabIndex={0} aria-label="Kullanıcı tablosu">
    <table>
      <thead><tr>
        <th scope="col">Kullanıcı</th><th scope="col">Rol</th><th scope="col">Takım</th>
        {full ? <th scope="col">Durum</th> : null}
        <th scope="col">Eklenme tarihi</th><th scope="col" className="actions"><span className="sr">İşlemler</span></th>
      </tr></thead>
      <tbody>{users.map(user => <tr key={user.id}>
        <td><span className="person"><span className="avatar"><Icon name="user" /></span>
          <span>{user.name}{full ? <small className="account-email">{user.email}</small> : null}</span>
        </span></td>
        <td><span className="role" data-role={user.role}>{user.role}</span></td>
        <td>{user.team || 'Atama bekliyor'}</td>
        {full ? <td>{user.active ? 'Aktif' : 'Pasif'}</td> : null}
        <td>{dates.format(new Date(user.date))}</td>
        <td className="actions">{user.role === 'Company Admin' ? null : <button type="button"
          className="icon-button" onClick={() => onEdit(user)} aria-label={user.name + ' düzenle'}><Icon name="dots" /></button>}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function Counter({ value }: { value: number }) {
  const text = useRef<HTMLElement>(null);
  const current = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.current = value;
      if (text.current) text.current.textContent = String(value);
      return;
    }
    const start = current.current;
    const began = performance.now();
    let frame = 0;
    function count(now: number) {
      const progress = Math.max(0, Math.min(1, (now - began) / 640));
      current.current = Math.round(start + (value - start) * (1 - (1 - progress) ** 3));
      if (text.current) text.current.textContent = String(current.current);
      if (progress < 1) frame = requestAnimationFrame(count);
    }
    frame = requestAnimationFrame(count);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <strong ref={text} aria-label={String(value)}>{value}</strong>;
}

function Metric({ icon, label, value, target, index }: {
  icon: IconName; label: string; value: number; target: string; index: number;
}) {
  return <a className="metric reveal" style={delay(index * 65)} href={target}>
    <span className="tile"><Icon name={icon} /></span>
    <span><span className="metric-label">{label}</span><Counter value={value} /></span>
    <span className="mini" aria-hidden="true">{[29, 49, 73, 100].map((height, i) =>
      <i key={height} style={{ ...delay(130 + i * 85 + index * 50), '--h': height + '%',
        '--c': ['#d4e4fd','#abc8ff','#86b0fd','#4775fa'][i] } as CSSProperties} />)}</span>
  </a>;
}

type UserViewProps = { users: User[]; onNew: () => void; onEdit: (user: User) => void };
function Overview({ users, onNew, onEdit }: UserViewProps) {
  const activeUsers = users.filter(user => user.active);
  const assigned = activeUsers.filter(user => user.team);
  return <>
    <Heading title="Yönetici Paneli" description="Rezona otel çağrı kalitesi uygulamasını yönetin." />
    <section className="metrics" aria-label="Kullanıcı ve takım özeti">
      <Metric icon="users" label="Aktif kullanıcı" value={activeUsers.length} target={userUrl({ state: 'active' })} index={0} />
      <Metric icon="team" label="Takım" value={teams.length} target="#/admin/teams" index={1} />
      <Metric icon="clock" label="Atama bekleyen" value={users.filter(user => !user.team).length} target={userUrl({ team: 'unassigned' })} index={2} />
    </section>
    <div className="columns">
      <section className="panel reveal" style={delay(125)}>
        <div className="panel-top"><h2>Son eklenen kullanıcılar</h2><NewUser onClick={onNew} /></div>
        <UserTable users={users.slice(0, 4)} onEdit={onEdit} />
      </section>
      <section className="panel reveal" style={delay(190)}>
        <h2>Takım dağılımı</h2>
        <div className="distribution">{teams.map((team, i) => {
          const count = assigned.filter(user => user.team === team).length;
          const percentage = assigned.length ? Math.round(100 * count / assigned.length) : 0;
          return <a className="team-line" key={team} href={userUrl({ team, state: 'active' })}>
            <span className="team-name">{team} <span className="share"><b>{count}</b> (%{percentage})</span></span>
            <div className="track" aria-hidden="true"><div className="fill" style={{ ...delay(180 + i * 90), '--w': percentage + '%' } as CSSProperties} /></div>
          </a>;
        })}</div>
      </section>
    </div>
  </>;
}

function Directory({ users, onNew, onEdit, params }: UserViewProps & { params: URLSearchParams }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState(params.get('team') ?? '');
  const [state, setState] = useState(params.get('state') ?? '');
  const search = useRef<HTMLInputElement>(null);
  const focusSearch = params.has('search');
  useEffect(() => { if (focusSearch) search.current?.focus(); }, [focusSearch]);
  const needle = query.trim().toLocaleLowerCase('tr-TR');
  const filtered = users.filter(user =>
    (!needle || (user.name + ' ' + user.email).toLocaleLowerCase('tr-TR').includes(needle)) &&
    (!role || user.role === role) && (!team || (user.team || 'unassigned') === team) &&
    (!state || state === (user.active ? 'active' : 'inactive')));
  return <>
    <Heading title="Kullanıcılar" description="Şirket kullanıcılarını, rollerini ve takım atamalarını yönetin." />
    <section className="panel reveal">
      <div className="panel-top"><h2>Kullanıcı listesi <span className="directory-count">({filtered.length})</span></h2><NewUser onClick={onNew} /></div>
      <div className="filterbar">
        <input ref={search} id="user-search" type="search" placeholder="Ad veya e-posta ara" aria-label="Kullanıcı ara" value={query} onChange={event => setQuery(event.target.value)} />
        <select aria-label="Role göre filtrele" value={role} onChange={event => setRole(event.target.value)}>
          <option value="">Tüm roller</option>{assignableRoles.map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Takıma göre filtrele" value={team} onChange={event => setTeam(event.target.value)}>
          <option value="">Tüm takımlar</option><option value="unassigned">Atama bekleyen</option>
          {teams.map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Hesap durumuna göre filtrele" value={state} onChange={event => setState(event.target.value)}>
          <option value="">Tüm durumlar</option><option value="active">Aktif</option><option value="inactive">Pasif</option>
        </select>
      </div>
      <UserTable users={filtered} onEdit={onEdit} full />
    </section>
  </>;
}

function TeamPage({ users, membershipLinks = false }: { users: User[]; membershipLinks?: boolean }) {
  return <>
    <Heading title="Takımlar" description="Şirket takımlarını ve üyelerini görüntüleyin." />
    <div className="team-grid">{teams.map((team, i) => {
      const members = users.filter(user => user.team === team);
      const activeCount = members.filter(user => user.active).length;
      return <section className="panel reveal" key={team} style={delay(i * 65)}>
        <h2>{team}</h2><p>{members.length} üye · {activeCount} aktif</p>
        {membershipLinks ? <a className="secondary" href={userUrl({ team })}>Üyeleri görüntüle</a> : null}
      </section>;
    })}</div>
  </>;
}

function Toolbar({ waiting, session, onSignOut }: { waiting: number; session: Session; onSignOut: () => void }) {
  const [open, setOpen] = useState<'alerts' | 'profile' | null>(null);
  const [seen, setSeen] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const admin = session.role === 'Company Admin';
  useEffect(() => {
    function close() { setOpen(null); }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !area.current?.contains(event.target)) close();
    }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') close(); }
    window.addEventListener('hashchange', close);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('hashchange', close);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  return <div ref={area} className="toolbar">
    <div className="tools" role="group" aria-label="Üst araç çubuğu">
      {admin ? <>
        <button type="button" className="tool" aria-label="Kullanıcı ara" onClick={() => {
          setOpen(null);
          const input = document.getElementById('user-search');
          if (input) input.focus();
          else location.hash = userUrl({ search: '1' });
        }}><Icon name="search" /></button>
        <button type="button" className={'tool' + (waiting && !seen ? ' unread' : '')} aria-label="Bildirimler" aria-expanded={open === 'alerts'}
          onClick={() => { setSeen(true); setOpen(open === 'alerts' ? null : 'alerts'); }}><Icon name="bell" /></button>
      </> : null}
      <button type="button" className="tool profile" aria-label="Hesap menüsü" aria-expanded={open === 'profile'}
        onClick={() => setOpen(open === 'profile' ? null : 'profile')}><Icon name="user" /><Icon name="down" /></button>
    </div>
    {open === 'alerts' ? <div className="popover"><h2>Bildirimler</h2>
      <p>{waiting ? `${waiting} kullanıcı takım ataması bekliyor.` : 'Bekleyen takım ataması yok.'}</p>
      {waiting ? <a className="secondary" href={userUrl({ team: 'unassigned' })} onClick={() => setOpen(null)}>Kullanıcıları görüntüle</a> : null}
    </div> : null}
    {open === 'profile' ? <div className="popover"><h2>{session.name}</h2><p>{session.role} · {company.name}<br />{session.email}</p>
      <button type="button" className="secondary" onClick={onSignOut}>Çıkış yap</button>
    </div> : null}
  </div>;
}

function AccessDenied({ home }: { home: string }) {
  return <>
    <Heading title="Erişim yok" description="Bu ekran için hesabının yetkisi bulunmuyor." />
    <a className="secondary" href={'#' + home}>Çalışma alanına dön</a>
  </>;
}

function OperatorPage({ user, session }: { user: User | undefined; session: Session }) {
  return <>
    <Heading title="Hesabım" description="Kendi hesap ve takım bilgilerini görüntüle." />
    <section className="panel profile-panel reveal">
      <h2>{session.name}</h2>
      <dl>
        <div><dt>E-posta</dt><dd>{session.email}</dd></div>
        <div><dt>Rol</dt><dd>{session.role}</dd></div>
        <div><dt>Takım</dt><dd>{user?.team || 'Atama bekliyor'}</dd></div>
        <div><dt>Şirket</dt><dd>{company.name}</dd></div>
      </dl>
    </section>
  </>;
}

const roleHome = {
  'Company Admin': '/admin',
  HR: '/hr',
  Operator: '/operator',
};

function Workspace({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [hash, setHash] = useState(() => location.hash);
  const [users, setUsers] = useState(() => companyUsers.list(session.companyId));
  const [editor, setEditor] = useState<User | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const home = roleHome[session.role];
  const admin = session.role === 'Company Admin';
  useEffect(() => {
    function change() {
      setHash(location.hash);
      setEditor(null);
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3800);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const [rawPath, query] = hash.slice(1).split('?');
  const path = !rawPath || rawPath === '/login' ? home : rawPath;
  const allowedPages = admin ? pages : [{ path: home, icon: 'home', label: session.role === 'HR' ? 'Takımlar' : 'Hesabım' }] as const;
  const allowed = allowedPages.some(page => page.path === path);
  const viewProps: UserViewProps = { users, onNew: () => setEditor('new'), onEdit: setEditor };
  function save(fields: UserFields, id?: string) {
    if (!admin) return;
    const { persisted } = companyUsers.save(session.companyId, fields, id);
    setUsers(companyUsers.list(session.companyId));
    setEditor(null);
    setNotice(persisted ? (id ? 'Kullanıcı güncellendi.' : 'Yeni kullanıcı eklendi.') : 'Değişiklik yalnızca bu oturumda saklanıyor.');
  }
  let content;
  if (!allowed) content = <AccessDenied home={home} />;
  else if (path === '/operator') content = <OperatorPage user={users.find(user => user.id === session.id)} session={session} />;
  else if (path === '/hr') content = <TeamPage users={users} />;
  else if (path === '/admin/users') content = <Directory key={hash} params={new URLSearchParams(query)} {...viewProps} />;
  else if (path === '/admin/teams') content = <TeamPage users={users} membershipLinks />;
  else content = <Overview {...viewProps} />;

  return <>
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Çalışma alanı menüsü">
        {allowedPages.map(page => <a key={page.path} href={'#' + page.path} aria-current={path === page.path ? 'page' : undefined}><Icon name={page.icon} />{page.label}</a>)}
      </nav>
    </aside>
    <main className="workspace">
      <Toolbar waiting={users.filter(user => !user.team).length} session={session} onSignOut={onSignOut} />
      <div className="route-content">{content}</div>
    </main>
    {admin && editor ? <UserEditor user={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSave={save} /> : null}
    <div className="toast" role="status" aria-live="polite">{notice}</div>
  </>;
}

export function App() {
  const [session, setSession] = useState(restoreSession);
  if (!session) return <SignIn onSuccess={account => {
    location.hash = roleHome[account.role];
    setSession(account);
  }} />;
  return <Workspace session={session} onSignOut={() => {
    signOut();
    location.hash = '/login';
    setSession(null);
  }} />;
}
