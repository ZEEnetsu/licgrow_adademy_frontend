/**
 * Shown while `bootstrapAuth()` decides whether there's a session to restore.
 *
 * Without this, a page refresh on a guarded route flashes the login screen:
 * the access token lives in memory only, so a cold load is briefly
 * indistinguishable from being signed out.
 */
const AuthSplash = () => (
  <div className="min-h-screen bg-bg text-text-muted flex items-center justify-center">
    <div className="flex items-center gap-3 text-sm">
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
      Restoring your session…
    </div>
  </div>
);

export default AuthSplash;
