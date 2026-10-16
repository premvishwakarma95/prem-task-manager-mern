import { useEffect, useState } from 'react';
import { api } from './api.js';
import TaskForm from './TaskForm.jsx';
import TaskTable from './TaskTable.jsx';
import EditModal from './EditModal.jsx';
import ConfirmDelete from './ConfirmDelete.jsx';
import Pagination from './Pagination.jsx';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const PAGE_SIZE = 10;
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false; // ignore stale responses when filters change quickly
    const t = setTimeout(async () => {
      try {
        const params = { limit: PAGE_SIZE, page };
        if (status) params.status = status;
        if (q.trim()) params.q = q.trim();
        const data = await api.list(params);
        if (!cancelled) {
          setTasks(data.items);
          setMeta({ pages: data.pages, total: data.total });
          if (data.page !== page) setPage(data.page); // server clamped (e.g. last item on a page was deleted)
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200); // debounce search typing
    return () => { cancelled = true; clearTimeout(t); };
  }, [status, q, page, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const changeStatus = (v) => { setStatus(v); setPage(1); };
  const changeQuery = (v) => { setQ(v); setPage(1); };

  const add = async (task) => {
    await api.create(task); // form shows its own error on failure
    if (page !== 1) setPage(1); else reload(); // newest tasks appear on page 1
  };

  // Optimistic update: change UI immediately, roll back if the server rejects it.
  const update = async (id, patch) => {
    const before = tasks;
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...patch } : t)));
    try {
      await api.update(id, patch);
      reload(); // re-sync (a status change may move the task out of the current filter)
    } catch (e) {
      setTasks(before);
      setError(e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.remove(id);
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="app">
      <header className="page-head">
        <h1>Task Manager</h1>
        <p className="muted">Create, track and complete your tasks.</p>
      </header>
      <TaskForm onAdd={add} />

      <section className="panel">
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.value} role="tab" aria-selected={status === f.value}
              className={status === f.value ? 'active' : ''} onClick={() => changeStatus(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="search" placeholder="Search tasks…" value={q} onChange={(e) => changeQuery(e.target.value)} />
      </div>

      {error && <p className="error" role="alert" onClick={() => setError('')}>{error} (click to dismiss)</p>}
      {loading ? <p className="muted">Loading…</p> : tasks.length === 0 ? (
        <p className="muted">No tasks found.</p>
      ) : (
        <TaskTable tasks={tasks} onEdit={setEditing} onDelete={setDeleting} />
      )}
      <Pagination page={page} pages={meta.pages} total={meta.total} limit={PAGE_SIZE} onChange={setPage} />
      </section>
      {editing && <EditModal task={editing} onSave={update} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDelete task={deleting} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </main>
  );
}
