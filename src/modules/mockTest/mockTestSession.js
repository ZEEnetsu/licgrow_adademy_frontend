const STORAGE_KEY = 'licpro_mocktest_session_v1';

/**
 * Persist exam session locally so reload during dev doesn't lose UX.
 * Backend will own this when PATCH /answers exists.
 */
export function saveExamSession(snapshot) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota */
  }
}

export function loadExamSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearExamSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
