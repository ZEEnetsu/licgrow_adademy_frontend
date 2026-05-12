/**
 * Response helpers aligned with `APIdocs.md` §1 (Standard Response Envelope).
 */

/**
 * Normalize session payloads after `unwrapApiData` when backends emit snake_case
 * (`access_token`, `user_id`, …).
 */
export function normalizeAuthSessionData(data) {
  if (!data || typeof data !== 'object') return {};
  const accessToken =
    data.accessToken ??
    data.access_token ??
    (typeof data.token === 'string' ? data.token : null);
  const refreshToken = data.refreshToken ?? data.refresh_token ?? null;

  let user = data.user;
  if (user && typeof user === 'object') {
    user = {
      ...user,
      userId: user.userId ?? user.user_id ?? null,
    };
  }

  let admin = data.admin;
  if (admin && typeof admin === 'object') {
    admin = {
      ...admin,
      adminId: admin.adminId ?? admin.admin_id ?? null,
    };
  }

  return { ...data, accessToken, refreshToken, user, admin };
}

/** Navbar / sidebar user card from login or `GET /users/me`. */
export function normalizeUserDeskProfile(entity) {
  if (!entity || typeof entity !== 'object') return null;
  const username = entity.username ?? '';
  const fullName =
    entity.fullName ?? entity.full_name ?? (username || 'Learner');
  return {
    userId:
      entity.userId ??
      entity.user_id ??
      entity.adminId ??
      entity.admin_id ??
      null,
    username,
    fullName,
    email: entity.email ?? '',
    phone: entity.phone ?? '',
    hasActiveEnrollment: Boolean(
      entity.hasActiveEnrollment ?? entity.has_active_enrollment,
    ),
  };
}

/** Unwrap `{ success, data }` or return the value as-is. */
export function unwrapApiData(response) {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data !== undefined
  ) {
    return response.data;
  }
  return response;
}

/**
 * List responses may be a bare array in `data`, or paginated at the top level:
 * `{ success, data: [...], total, page, totalPages }`.
 */
export function unwrapListResponse(response) {
  if (!response || typeof response !== 'object') {
    return { items: [], total: undefined, page: undefined, totalPages: undefined };
  }
  const raw = response.data;
  const items = Array.isArray(raw) ? raw : Array.isArray(response) ? response : [];
  return {
    items,
    total: typeof response.total === 'number' ? response.total : undefined,
    page: typeof response.page === 'number' ? response.page : undefined,
    totalPages: typeof response.totalPages === 'number' ? response.totalPages : undefined,
  };
}

/**
 * Human-readable message from API error payloads (APIdocs §14 + FastAPI-style `detail`).
 */
export function pickApiErrorMessage(body) {
  if (body == null) {
    return 'Something went wrong. Try again.';
  }
  if (typeof body === 'string') {
    const t = body.trim();
    return t || 'Something went wrong. Try again.';
  }
  if (typeof body !== 'object') {
    return 'Something went wrong. Try again.';
  }

  // APIdocs: { success: false, error: { code, message, issues? } }
  if (body.success === false && body.error && typeof body.error === 'object') {
    const err = body.error;
    if (Array.isArray(err.issues) && err.issues.length) {
      const parts = err.issues.map((i) => {
        if (typeof i === 'string') return i;
        if (i && typeof i === 'object') {
          const field = i.field ? `${i.field}: ` : '';
          return `${field}${i.message ?? ''}`.trim();
        }
        return '';
      });
      const joined = parts.filter(Boolean).join(' ');
      if (joined) return joined;
    }
    if (typeof err.message === 'string' && err.message.trim()) return err.message;
    if (typeof err.code === 'string') return err.code;
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  const d = body.detail;
  if (typeof d === 'string' && d.trim()) return d;
  if (Array.isArray(d)) {
    const parts = d.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof item.msg === 'string') {
        return item.msg;
      }
      return '';
    });
    const joined = parts.filter(Boolean).join(' ');
    if (joined) return joined;
  }
  if (d && typeof d === 'object' && typeof d.msg === 'string') return d.msg;
  if (typeof body.error === 'string') return body.error;
  return 'Something went wrong. Try again.';
}

/** RTK Query `FetchBaseQueryError` → user-facing string. */
export function formatMutationError(error) {
  if (!error) return '';
  if (typeof error.error === 'string' && error.error.trim()) return error.error;
  return pickApiErrorMessage(error.data);
}
