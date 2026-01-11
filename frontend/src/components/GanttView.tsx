import { useEffect, useMemo, useRef, useState } from 'react';
import { Person, Task, Week } from '../types';
import TaskModal from './TaskModal';
import TaskDetailPanel from './TaskDetailPanel';
import { getCSSVar, COLORS } from '../utils/colors';
import './GanttView.css';

interface GanttViewProps {
  persons: Person[];
  weeks: Week[];
  tasks: Task[];
  personsColumnWidth: number;
  weekWidths: Map<string, number>;
  onTaskUpdate: () => void;
}

const DEFAULT_WEEK_WIDTH = 200;
const BAR_HEIGHT = 18;
const BAR_GAP = 6;
const ROW_PADDING = 10;
const BAR_INSET = 8;

const getPersonIds = (task: Task): string[] => {
  return task.personIds || (task.personId ? [task.personId] : []);
};

export default function GanttView({
  persons,
  weeks,
  tasks,
  personsColumnWidth,
  weekWidths,
  onTaskUpdate
}: GanttViewProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const weekHeadersRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalContext, setModalContext] = useState<{
    person: Person;
    weekStart: string;
  } | null>(null);

  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const weekLayout = useMemo(() => {
    const widths = weeks.map((week) => weekWidths.get(week.startDate) || DEFAULT_WEEK_WIDTH);
    const offsets = new Map<string, number>();
    let acc = 0;
    weeks.forEach((week, index) => {
      offsets.set(week.startDate, acc);
      acc += widths[index];
    });
    return {
      widths,
      offsets,
      totalWidth: acc,
      gridTemplateColumns: widths.map((width) => `${width}px`).join(' ')
    };
  }, [weeks, weekWidths]);

  useEffect(() => {
    // Sync header and body scroll
    let isScrolling = false;
    const syncScrollFromHeader = () => {
      if (isScrolling) return;
      isScrolling = true;
      if (headerScrollRef.current && bodyScrollRef.current) {
        bodyScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
      }
      setTimeout(() => {
        isScrolling = false;
      }, 10);
    };

    const syncScrollFromBody = () => {
      if (isScrolling) return;
      isScrolling = true;
      if (headerScrollRef.current && bodyScrollRef.current) {
        headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
      }
      setTimeout(() => {
        isScrolling = false;
      }, 10);
    };

    const headerScroll = headerScrollRef.current;
    const bodyScroll = bodyScrollRef.current;

    if (headerScroll) {
      headerScroll.addEventListener('scroll', syncScrollFromHeader);
    }
    if (bodyScroll) {
      bodyScroll.addEventListener('scroll', syncScrollFromBody);
    }

    return () => {
      if (headerScroll) {
        headerScroll.removeEventListener('scroll', syncScrollFromHeader);
      }
      if (bodyScroll) {
        bodyScroll.removeEventListener('scroll', syncScrollFromBody);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to current week
    const currentWeek = weeks.find((week) => week.isCurrent);
    if (currentWeek && headerScrollRef.current && bodyScrollRef.current) {
      const weekHeader = weekHeadersRef.current.get(currentWeek.startDate);
      if (weekHeader) {
        const scrollContainer = headerScrollRef.current;
        const weekLeft = weekHeader.offsetLeft;
        const weekWidth = weekHeader.offsetWidth;
        const containerWidth = scrollContainer.offsetWidth;
        const scrollPosition = weekLeft - containerWidth / 2 + weekWidth / 2;
        const scrollLeft = Math.max(0, scrollPosition);
        headerScrollRef.current.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
        bodyScrollRef.current.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [weeks]);

  const getRowHeight = (personId: string): number => {
    const personTasks = tasks.filter((task) => getPersonIds(task).includes(personId));
    if (personTasks.length === 0) {
      return ROW_PADDING * 2 + BAR_HEIGHT;
    }

    const tasksByWeek = new Map<string, number>();
    personTasks.forEach((task) => {
      const count = tasksByWeek.get(task.weekStart) || 0;
      tasksByWeek.set(task.weekStart, count + 1);
    });

    const maxTasksInWeek = Math.max(1, ...Array.from(tasksByWeek.values()));
    return ROW_PADDING * 2 + maxTasksInWeek * BAR_HEIGHT + (maxTasksInWeek - 1) * BAR_GAP;
  };

  const openNewTask = (person: Person, weekStart: string) => {
    setEditingTask(null);
    setModalContext({ person, weekStart });
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task, person: Person) => {
    setEditingTask(task);
    setModalContext({ person, weekStart: task.weekStart });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setModalContext(null);
    onTaskUpdate();
  };

  const handleTaskMouseEnter = (e: React.MouseEvent, task: Task) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const panelWidth = 400;
    const panelHeight = 300;
    const spacing = 10;

    let x = rect.right + spacing;
    let y = rect.top;

    if (x + panelWidth > window.innerWidth) {
      x = rect.left - panelWidth - spacing;
    }
    if (x < 0) {
      x = rect.right + spacing;
    }
    if (y + panelHeight > window.innerHeight) {
      y = window.innerHeight - panelHeight - spacing;
    }
    if (y < spacing) {
      y = rect.bottom + spacing;
    }

    setHoverPosition({ x, y });
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTask(task);
    }, 300);
  };

  const handleTaskMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.task-detail-panel')) {
      return;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
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
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-header-left" style={{ width: `${personsColumnWidth}px` }}>
          <span className="gantt-header-title">Kişiler</span>
        </div>
        <div className="gantt-header-right" ref={headerScrollRef}>
          <div className="gantt-week-headers" style={{ gridTemplateColumns: weekLayout.gridTemplateColumns }}>
            {weeks.map((week) => (
              <div
                key={week.startDate}
                ref={(el) => {
                  if (el) weekHeadersRef.current.set(week.startDate, el);
                }}
                className={`gantt-week-header ${week.isCurrent ? 'current-week' : ''}`}
              >
                <div className="gantt-week-title">{week.displayText}</div>
                {week.isCurrent && <div className="current-indicator">Bugün</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gantt-body">
        <div className="gantt-persons" style={{ width: `${personsColumnWidth}px` }}>
          {persons.map((person) => {
            const rowHeight = getRowHeight(person.id);
            return (
              <div
                key={person.id}
                className="gantt-person-row"
                style={{ height: `${rowHeight}px`, borderLeftColor: person.color || getCSSVar('--color-accent', COLORS.accent) }}
              >
                <div className="gantt-person-info">
                  <span
                    className="gantt-person-color"
                    style={{ backgroundColor: person.color || getCSSVar('--color-accent', COLORS.accent) }}
                  />
                  <span className="gantt-person-name">{person.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="gantt-timeline" ref={bodyScrollRef}>
          {persons.map((person) => {
            const rowHeight = getRowHeight(person.id);
            const personTasks = tasks.filter((task) => getPersonIds(task).includes(person.id));
            const tasksByWeek = new Map<string, Task[]>();

            personTasks.forEach((task) => {
              const list = tasksByWeek.get(task.weekStart) || [];
              list.push(task);
              tasksByWeek.set(task.weekStart, list);
            });

            tasksByWeek.forEach((list, weekStart) => {
              list.sort((a, b) => (a.name || a.description || '').localeCompare(b.name || b.description || ''));
              tasksByWeek.set(weekStart, list);
            });

            return (
              <div
                key={person.id}
                className="gantt-row"
                style={{ height: `${rowHeight}px`, width: `${weekLayout.totalWidth}px` }}
              >
                <div
                  className="gantt-row-grid"
                  style={{ gridTemplateColumns: weekLayout.gridTemplateColumns }}
                >
                  {weeks.map((week) => (
                    <div
                      key={week.startDate}
                      className={`gantt-cell ${week.isCurrent ? 'current-week' : ''}`}
                      onClick={() => openNewTask(person, week.startDate)}
                    />
                  ))}
                </div>

                {weeks.map((week) => {
                  const weekTasks = tasksByWeek.get(week.startDate) || [];
                  const leftOffset = weekLayout.offsets.get(week.startDate) || 0;

                  return weekTasks.map((task, index) => {
                    const taskName = task.name || task.description || '';
                    const taskColor = task.color || '#3b82f6';
                    const barTop = ROW_PADDING + index * (BAR_HEIGHT + BAR_GAP);
                    const barWidth = (weekWidths.get(week.startDate) || DEFAULT_WEEK_WIDTH) - BAR_INSET * 2;

                    return (
                      <div
                        key={task.id}
                        className="gantt-bar"
                        style={{
                          left: `${leftOffset + BAR_INSET}px`,
                          top: `${barTop}px`,
                          width: `${barWidth}px`,
                          height: `${BAR_HEIGHT}px`,
                          backgroundColor: taskColor
                        }}
                        title={taskName}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTask(task, person);
                        }}
                        onMouseEnter={(e) => {
                          const description = task.description || '';
                          const hasDescription = description && description !== taskName;
                          if (hasDescription) {
                            handleTaskMouseEnter(e, task);
                          }
                        }}
                        onMouseLeave={handleTaskMouseLeave}
                      >
                        <span className="gantt-bar-label">{taskName}</span>
                      </div>
                    );
                  });
                })}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && modalContext && (
        <TaskModal
          task={editingTask}
          person={modalContext.person}
          persons={persons}
          weekStart={modalContext.weekStart}
          onClose={handleCloseModal}
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
    </div>
  );
}
