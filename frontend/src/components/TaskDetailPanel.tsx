import { Task, Person } from '../types';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
  task: Task;
  person: Person;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function TaskDetailPanel({ task, person, position, onClose }: TaskDetailPanelProps) {
  const taskName = task.name || task.description || '';
  const taskDescription = task.description || '';
  const statusLabels = {
    'pending': 'Beklemede',
    'in-progress': 'Devam Ediyor',
    'completed': 'Tamamlandı'
  };

  return (
    <div 
      className="task-detail-panel-overlay"
      onClick={onClose}
    >
      <div 
        className="task-detail-panel"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <div className="task-detail-header">
          <div className="task-detail-title-section">
            <h3 className="task-detail-name">{taskName}</h3>
            <div className="task-detail-meta">
              <span className="task-detail-person" style={{ color: person.color || '#667eea' }}>
                {person.name}
              </span>
              <span className={`task-detail-status task-status-${task.status || 'pending'}`}>
                {statusLabels[task.status || 'pending']}
              </span>
            </div>
          </div>
          <button className="task-detail-close" onClick={onClose}>×</button>
        </div>
        
        {taskDescription && (
          <div className="task-detail-content">
            <div className="task-detail-description">
              {taskDescription}
            </div>
          </div>
        )}
        
        {!taskDescription && (
          <div className="task-detail-empty">
            Detaylı açıklama eklenmemiş
          </div>
        )}
      </div>
    </div>
  );
}

