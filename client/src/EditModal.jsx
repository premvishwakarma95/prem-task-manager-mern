import { useState } from 'react';
import Modal from './Modal.jsx';

export default function EditModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task.title, description: task.description, status: task.status, priority: task.priority,
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    onSave(task._id, { ...form, title: form.title.trim() });
    onClose();
  };

  return (
    <Modal title="Edit task" onClose={onClose}
      footer={<>
        <button type="button" className="ghost" onClick={onClose}>Cancel</button>
        <button type="submit" form="edit-form">Save changes</button>
      </>}>
      <form id="edit-form" className="stack" onSubmit={submit}>
        <label>Title
          <input value={form.title} onChange={set('title')} maxLength={120} autoFocus />
        </label>
        <label>Description
          <textarea value={form.description} onChange={set('description')} rows={4} maxLength={1000} />
        </label>
        <div className="grid2">
          <label>Status
            <select value={form.status} onChange={set('status')}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </Modal>
  );
}
