import { useState, type FormEvent } from 'react';
import { Brand } from './Icon';
import { demoAccounts, demoPassword, signIn, type Session } from './demoAuth';

export function SignIn({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onSuccess(signIn(email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Giriş yapılamadı.');
    }
  }
  return <main className="login-shell">
    <div className="login-brand"><Brand /></div>
    <section className="panel login-panel reveal" aria-labelledby="login-title">
      <div className="login-intro">
        <h1 id="login-title">Rezona’ya giriş yap</h1>
        <p>Şirket çalışma alanına demo hesabınla eriş.</p>
      </div>
      <form onSubmit={submit}>
        <label>E-posta
          <input name="email" type="email" autoComplete="username" value={email} required
            onChange={event => { setEmail(event.target.value); setError(''); }} />
        </label>
        <label>Demo parolası
          <input name="password" type="password" autoComplete="current-password" value={password} required
            onChange={event => { setPassword(event.target.value); setError(''); }} />
        </label>
        {error ? <p className="message" role="alert">{error}</p> : null}
        <button className="primary" type="submit">Giriş yap</button>
      </form>
      <div className="demo-options">
        <h2>Demo hesapları</h2>
        <p>Formu doldurmak için bir rol seç.</p>
        <div className="demo-roles">{demoAccounts.map(account =>
          <button key={account.role} className="secondary" type="button" onClick={() => {
            setEmail(account.email);
            setPassword(demoPassword);
            setError('');
          }}>{account.role}</button>)}</div>
      </div>
    </section>
  </main>;
}
