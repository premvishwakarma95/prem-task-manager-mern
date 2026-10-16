import { useState } from 'react';

const empty = { title: '', description: '', priority: 'medium' };

export default function TaskForm({ onAdd }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setBusy(true);
    try {
      await onAdd(form);
      setForm(empty);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <label className="field">Title
        <input placeholder="What needs to be done?" value={form.title} onChange={set('title')} maxLength={120} />
      </label>
      <label className="field">Description
        <textarea placeholder="Description (optional)" value={form.description} onChange={set('description')} maxLength={1000} rows={2} />
      </label>
      <div className="row form-foot">
        <label className="field">Priority
          <select value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add task'}</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
