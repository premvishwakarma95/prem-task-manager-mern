import Modal from './Modal.jsx';

export default function ConfirmDelete({ task, onConfirm, onClose }) {
  return (
    <Modal danger title="Delete task?" onClose={onClose}
      footer={<>
        <button className="ghost" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={() => { onConfirm(task._id); onClose(); }}>Delete task</button>
      </>}>
      <div className="warn">
        <span className="warn-icon" aria-hidden="true">!</span>
        <p>
          You are about to permanently delete <strong>{task.title}</strong>.
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}
