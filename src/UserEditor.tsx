import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { assignableRoles, teams, type User, type UserFields } from './users';

export function UserEditor({ user, onClose, onSave }: {
  user: User | null;
  onClose: () => void;
  onSave: (fields: UserFields, id?: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { if (element?.open) element.close(); };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      onSave({
        name: String(fields.get('name')), email: String(fields.get('email')),
        role: fields.get('role') as UserFields['role'], team: fields.get('team') as UserFields['team'],
        active: fields.get('active') === 'true',
      }, user?.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kayıt tamamlanamadı.');
    }
  }
  return <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={onClose}>
    <div className="dialog-top">
      <h2 id="dialog-title">{user ? 'Kullanıcıyı düzenle' : 'Yeni kullanıcı'}</h2>
      <button type="button" className="icon-button" aria-label="Kapat" onClick={onClose}><Icon name="close" /></button>
    </div>
    <form onSubmit={submit}>
      <label>Ad soyad<input name="name" autoComplete="name" required maxLength={80} defaultValue={user?.name} /></label>
      <label>E-posta<input name="email" autoComplete="email" type="email" required maxLength={120} defaultValue={user?.email} /></label>
      <label>Rol<select name="role" required defaultValue={user?.role ?? ''}>
        <option value="" disabled>Rol seçin</option>
        {assignableRoles.map(role => <option key={role}>{role}</option>)}
      </select></label>
      <label>Takım<select name="team" defaultValue={user?.team ?? ''}>
        <option value="">Takım seçilmedi</option>
        {teams.map(team => <option key={team}>{team}</option>)}
      </select></label>
      <label>Hesap durumu<select name="active" defaultValue={String(user?.active ?? true)}>
        <option value="true">Aktif</option><option value="false">Pasif</option>
      </select></label>
      {error ? <p className="message" role="alert">{error}</p> : null}
      <div className="dialog-actions">
        <button className="secondary" type="button" onClick={onClose}>Vazgeç</button>
        <button className="primary" type="submit">Kaydet</button>
      </div>
    </form>
  </dialog>;
}
