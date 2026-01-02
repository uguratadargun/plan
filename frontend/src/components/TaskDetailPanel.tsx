import { Task, Person } from '../types';
import { getCSSVar, COLORS } from '../utils/colors';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
  task: Task;
  persons: Person[];
  position: { x: number; y: number };
  onClose: () => void;
}

export default function TaskDetailPanel({ task, persons, position, onClose }: TaskDetailPanelProps) {
  const taskName = task.name || task.description || '';
  const taskDescription = task.description || '';
  // Backward compatibility: support both personIds and personId
  const taskPersonIds = task.personIds || (task.personId ? [task.personId] : []);
  const taskPersons = persons.filter(p => taskPersonIds.includes(p.id));
  const taskColor = task.color || '#3b82f6';

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
        <div 
          className="task-detail-header"
          style={{ borderLeftColor: taskColor }}
        >
          <div className="task-detail-title-section">
            <h3 className="task-detail-name">{taskName}</h3>
            <div className="task-detail-meta">
              <div className="task-detail-persons">
                {taskPersons.map((p) => (
                  <span 
                    key={p.id}
                    className="task-detail-person" 
                    style={{ 
                      color: p.color || getCSSVar('--color-accent', COLORS.accent),
                      backgroundColor: `${p.color || getCSSVar('--color-accent', COLORS.accent)}15`
                    }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
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

