const SESSION_KEY = 'hp_visitor_session';

export interface VisitorSession {
  name: string;
  loggedInAt: string;
}

export function getVisitorSession(): VisitorSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorSession;
  } catch {
    return null;
  }
}

export function setVisitorSession(name: string): VisitorSession {
  const session: VisitorSession = {
    name: name.trim() || 'Visitor',
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearVisitorSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return getVisitorSession() !== null;
}
