const icons = {
  home:'<path d="m2.5 10 9.5-7.5 9.5 7.5v11h-7v-7h-5v7h-7z"/>',
  users:'<path d="M16 21H2v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2zm5 0v-2a5 5 0 0 0-4-4.9M16 3.2a4 4 0 0 1 0 7.6"/><circle cx="9" cy="7" r="4"/>',
  team:'<path d="m2 7 10-5 10 5-10 5-10-5zm0 5 10 5 10-5M2 17l10 5 10-5"/>',
  clock:'<circle cx="12" cy="12" r="9.5"/><path d="M12 6v6l4 3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9zm-8 12a2 2 0 0 0 4 0"/>',
  user:'<circle cx="12" cy="7" r="4.1"/><path d="M3 22v-2a9 9 0 0 1 18 0v2z"/>',
  down:'<path d="m5 9 7 7 7-7"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};

export type IconName = keyof typeof icons;

export function Icon({ name }: { name: IconName }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[name] }} />;
}

export function Brand() {
  return <div className="brand">
    <svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="blue-mark"><stop stopColor="#6b9aff"/><stop offset="100%" stopColor="#2757ff"/></linearGradient></defs><path fill="url(#blue-mark)" d="M26 4h5c10 0 14 5 13 12-.7 6-5.6 11-12 13l9 15h-9L20 29z"/><path fill="#fff" d="M16 4h14l-8 27c-.9 3-2.4 5.2-5.1 6.6L3 44 13 8c.6-2.4 1.6-4 3-4z"/><path fill="#b8ccff" d="m22 31 8-27-9 35-4-1.4c2.7-1.4 4.2-3.6 5-6.6z"/></svg>
    <div><strong>Rezona</strong><small>Otel Çağrı Kalitesi</small></div>
  </div>;
}
