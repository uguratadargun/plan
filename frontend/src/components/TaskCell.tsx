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
  style?: React.CSSProperties;
}

export default function TaskCell({ tasks, person, persons, weekStart, onTaskUpdate, style }: TaskCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCellClick = () => {
    // Don't open modal if we just finished dragging
    if (draggedTaskId) {
      return;
    }
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    // Don't open modal if we just finished dragging
    if (draggedTaskId === task.id) {
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.stopPropagation();
    setDraggedTaskId(task.id);
    // Close hover panel if open
    setHoveredTask(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      taskId: task.id,
      currentWeekStart: task.weekStart,
      currentPersonIds: task.personIds || (task.personId ? [task.personId] : [])
    }));
    // Add visual feedback
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleCellDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleCellDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're actually leaving the cell
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleCellDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data.taskId) return;

      const taskId = data.taskId;
      const currentWeekStart = data.currentWeekStart;
      const currentPersonIds = data.currentPersonIds;

      // Check if task is being moved to a different location
      const isDifferentWeek = currentWeekStart !== weekStart;
      const isDifferentPerson = !currentPersonIds.includes(person.id);

      if (isDifferentWeek || isDifferentPerson) {
        // Update task
        const updates: Partial<Task> = {};
        
        if (isDifferentWeek) {
          updates.weekStart = weekStart;
        }

        if (isDifferentPerson) {
          // If task is being moved to a different person
          // If the person is already in the list, keep all persons
          // Otherwise, replace with the new person only
          if (currentPersonIds.includes(person.id)) {
            // Person already assigned, keep all persons (no change needed)
            // But if week changed, we still need to update
            if (!isDifferentWeek) {
              return; // No change needed
            }
          } else {
            // New person, replace with new person only
            updates.personIds = [person.id];
          }
        }

        // Import tasksApi
        const { tasksApi } = await import('../services/api');
        await tasksApi.update(taskId, updates);
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }

    setDraggedTaskId(null);
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
      <div 
        className={`task-cell ${isDragOver ? 'drag-over' : ''}`}
        onClick={handleCellClick} 
        onDragOver={handleCellDragOver}
        onDragLeave={handleCellDragLeave}
        onDrop={handleCellDrop}
        style={style}
      >
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
                const hasEpic = !!task.epicUrl;
                const shouldShowHover = hasDescription || hasEpic;
                // Backward compatibility: if color doesn't exist, generate one or use default
                const taskColor = task.color || '#3b82f6';
                const isDragging = draggedTaskId === task.id;
                
                return (
                  <div
                    key={task.id}
                    className={`task-item ${isDragging ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task)}
                    onDragEnd={handleTaskDragEnd}
                    style={{
                      borderLeftColor: taskColor,
                      backgroundColor: `${taskColor}15`,
                      color: taskColor,
                      opacity: isDragging ? 0.5 : 1,
                      cursor: 'grab'
                    }}
                    onClick={(e) => handleTaskClick(e, task)}
                    onMouseEnter={(e) => {
                      if (!draggedTaskId && shouldShowHover) {
                        handleTaskMouseEnter(e, task);
                      }
                    }}
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

