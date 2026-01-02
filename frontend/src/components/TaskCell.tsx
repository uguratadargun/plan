import { useState, useRef } from 'react';
import { Task, Person } from '../types';
import TaskModal from './TaskModal';
import TaskDetailPanel from './TaskDetailPanel';
import './TaskCell.css';

interface TaskCellProps {
  tasks: Task[];
  person: Person;
  persons: Person[];
  weekStart: string;
  onTaskUpdate: () => void;
}

export default function TaskCell({ tasks, person, persons, weekStart, onTaskUpdate }: TaskCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCellClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    onTaskUpdate();
  };

  const handleTaskMouseEnter = (e: React.MouseEvent, task: Task) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Get task item position
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate position for panel (prefer right side, then left, then top)
    const panelWidth = 400;
    const panelHeight = 300;
    const spacing = 10;

    let x = rect.right + spacing;
    let y = rect.top;

    // If panel would go off screen to the right, show on left
    if (x + panelWidth > window.innerWidth) {
      x = rect.left - panelWidth - spacing;
    }

    // If panel would go off screen to the left, show on right
    if (x < 0) {
      x = rect.right + spacing;
    }

    // If panel would go off screen to the bottom, adjust
    if (y + panelHeight > window.innerHeight) {
      y = window.innerHeight - panelHeight - spacing;
    }

    // If panel would go off screen to the top, show below
    if (y < spacing) {
      y = rect.bottom + spacing;
    }

    setHoverPosition({ x, y });
    
    // Show panel after a short delay
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTask(task);
    }, 300);
  };

  const handleTaskMouseLeave = (e: React.MouseEvent) => {
    // Don't close if moving to panel
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.task-detail-panel')) {
      return;
    }
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Add delay before closing to allow moving to panel
    setTimeout(() => {
      const panel = document.querySelector('.task-detail-panel');
      if (!panel || !panel.matches(':hover')) {
        setHoveredTask(null);
      }
    }, 100);
  };

  const handlePanelClose = () => {
    setHoveredTask(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  return (
    <>
      <div className="task-cell" onClick={handleCellClick}>
        {tasks.length === 0 ? (
          <div className="task-cell-empty">+ İş Ekle</div>
        ) : (
          <>
            {tasks.length > 1 && (
              <div className="task-count-badge">{tasks.length} iş</div>
            )}
            <div className={`task-list ${tasks.length > 1 ? 'has-multiple' : ''}`}>
              {tasks.map((task) => {
                // Backward compatibility: if name doesn't exist, use description as name
                const taskName = task.name || task.description || '';
                const taskDescription = task.description || '';
                const hasDescription = taskDescription && taskDescription !== taskName;
                
                return (
                  <div
                    key={task.id}
                    className={`task-item task-${task.status || 'pending'}`}
                    onClick={(e) => handleTaskClick(e, task)}
                    onMouseEnter={(e) => hasDescription && handleTaskMouseEnter(e, task)}
                    onMouseLeave={handleTaskMouseLeave}
                  >
                    <span className="task-name">{taskName}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          person={person}
          persons={persons}
          weekStart={weekStart}
          onClose={handleClose}
        />
      )}
      
      {hoveredTask && (
        <TaskDetailPanel
          task={hoveredTask}
          persons={persons}
          position={hoverPosition}
          onClose={handlePanelClose}
        />
      )}
    </>
  );
}

