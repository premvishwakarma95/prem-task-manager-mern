const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body && JSON.stringify(options.body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.errors || ['Request failed']).join(', '));
  return data;
}

export const api = {
  list: (params = {}) => request(`/tasks?${new URLSearchParams(params)}`),
  create: (task) => request('/tasks', { method: 'POST', body: task }),
  update: (id, patch) => request(`/tasks/${id}`, { method: 'PATCH', body: patch }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
