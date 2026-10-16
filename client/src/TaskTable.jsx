const LABEL = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

export default function TaskTable({ tasks, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id} className={t.status === 'done' ? 'done' : ''}>
              <td className="cell-title">{t.title}</td>
              <td className="cell-desc">{t.description || <span className="muted">—</span>}</td>
              <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
              <td><span className={`pill ${t.status}`}>{LABEL[t.status]}</span></td>
              <td className="muted nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
              <td className="col-actions">
                <button className="ghost sm" onClick={() => onEdit(t)}>Edit</button>
                <button className="ghost sm danger" onClick={() => onDelete(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
