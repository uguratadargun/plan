import { useState, useEffect, useRef } from 'react';
import { Person, Task, Week } from '../types';
import { personsApi, tasksApi, weeksApi } from '../services/api';
import { getCSSVar, COLORS } from '../utils/colors';
import TaskCell from './TaskCell';
import PersonModal from './PersonModal';
import './WeeklyTable.css';

export default function WeeklyTable() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const taskRowsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const personRowsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const weekHeadersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Sync person row heights with task row heights
    const syncHeights = () => {
      taskRowsRef.current.forEach((taskRow, personId) => {
        const personRow = personRowsRef.current.get(personId);
        if (taskRow && personRow) {
          personRow.style.height = `${taskRow.offsetHeight}px`;
        }
      });
    };

    // Scroll to current week
    const scrollToCurrentWeek = () => {
      const currentWeek = weeks.find(w => w.isCurrent);
      if (currentWeek && headerScrollRef.current && bodyScrollRef.current) {
        const weekHeader = weekHeadersRef.current.get(currentWeek.startDate);
        if (weekHeader) {
          const scrollContainer = headerScrollRef.current;
          const weekLeft = weekHeader.offsetLeft;
          const weekWidth = weekHeader.offsetWidth;
          const containerWidth = scrollContainer.offsetWidth;
          const scrollPosition = weekLeft - (containerWidth / 2) + (weekWidth / 2);
          
          const scrollLeft = Math.max(0, scrollPosition);
          scrollContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
          
          // Sync body scroll
          if (bodyScrollRef.current) {
            bodyScrollRef.current.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // Sync header and body scroll (prevent infinite loop)
    let isScrolling = false;
    const syncScrollFromHeader = () => {
      if (isScrolling) return;
      isScrolling = true;
      if (headerScrollRef.current && bodyScrollRef.current) {
        bodyScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
      }
      setTimeout(() => { isScrolling = false; }, 10);
    };
    
    const syncScrollFromBody = () => {
      if (isScrolling) return;
      isScrolling = true;
      if (headerScrollRef.current && bodyScrollRef.current) {
        headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
      }
      setTimeout(() => { isScrolling = false; }, 10);
    };

    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      syncHeights();
      scrollToCurrentWeek();
    }, 100);
    
    window.addEventListener('resize', syncHeights);
    
    const headerScroll = headerScrollRef.current;
    const bodyScroll = bodyScrollRef.current;
    
    if (headerScroll) {
      headerScroll.addEventListener('scroll', syncScrollFromHeader);
    }
    if (bodyScroll) {
      bodyScroll.addEventListener('scroll', syncScrollFromBody);
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', syncHeights);
      if (headerScroll) {
        headerScroll.removeEventListener('scroll', syncScrollFromHeader);
      }
      if (bodyScroll) {
        bodyScroll.removeEventListener('scroll', syncScrollFromBody);
      }
    };
  }, [persons, tasks, weeks, isLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [personsData, weeksData, tasksData] = await Promise.all([
        personsApi.getAll(),
        weeksApi.getAll(),
        tasksApi.getAll()
      ]);
      
      setPersons(personsData);
      setWeeks(weeksData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = () => {
    setEditingPerson(null);
    setIsPersonModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handlePersonModalClose = () => {
    setIsPersonModalOpen(false);
    setEditingPerson(null);
    loadData();
  };

  const getTasksForCell = (personId: string, weekStart: string): Task[] => {
    return tasks.filter(task => {
      // Backward compatibility: support both personIds and personId
      const taskPersonIds = task.personIds || (task.personId ? [task.personId] : []);
      return taskPersonIds.includes(personId) && task.weekStart === weekStart;
    });
  };

  const [draggedPersonId, setDraggedPersonId] = useState<string | null>(null);
  const [dragOverPersonId, setDragOverPersonId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, personId: string) => {
    setDraggedPersonId(personId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', personId);
  };

  const handleDragOver = (e: React.DragEvent, personId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedPersonId && draggedPersonId !== personId) {
      setDragOverPersonId(personId);
    }
  };

  const handleDragLeave = () => {
    setDragOverPersonId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPersonId: string) => {
    e.preventDefault();
    setDragOverPersonId(null);
    
    if (!draggedPersonId || draggedPersonId === targetPersonId) {
      setDraggedPersonId(null);
      return;
    }

    const draggedIndex = persons.findIndex(p => p.id === draggedPersonId);
    const targetIndex = persons.findIndex(p => p.id === targetPersonId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPersonId(null);
      return;
    }

    // Reorder persons array
    const newPersons = [...persons];
    const [removed] = newPersons.splice(draggedIndex, 1);
    newPersons.splice(targetIndex, 0, removed);

    // Update order in backend
    try {
      const personIds = newPersons.map(p => p.id);
      await personsApi.reorder(personIds);
      setPersons(newPersons);
    } catch (error) {
      console.error('Error reordering persons:', error);
      alert('Kişilerin sırası güncellenirken bir hata oluştu');
    }
    
    setDraggedPersonId(null);
  };

  const handleDragEnd = () => {
    setDraggedPersonId(null);
    setDragOverPersonId(null);
  };

  if (isLoading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <>
      <div className="weekly-table-container">
        <div className="table-header">
          <div className="table-header-left">
            <button className="btn-add-person" onClick={handleAddPerson}>
              + Kişi Ekle
            </button>
          </div>
          <div className="table-header-right" ref={headerScrollRef}>
            <div className="week-headers">
              {weeks.map((week) => (
                <div
                  key={week.startDate}
                  ref={(el) => {
                    if (el) weekHeadersRef.current.set(week.startDate, el);
                  }}
                  className={`week-header ${week.isCurrent ? 'current-week' : ''}`}
                >
                  <div className="week-title">{week.displayText}</div>
                  {week.isCurrent && (
                    <div className="current-indicator">Bugün</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-body">
          <div className="persons-column">
            {persons.map((person) => (
              <div
                key={person.id}
                ref={(el) => {
                  if (el) personRowsRef.current.set(person.id, el);
                }}
                className={`person-row ${draggedPersonId === person.id ? 'dragging' : ''} ${dragOverPersonId === person.id ? 'drag-over' : ''}`}
                style={{ borderLeftColor: person.color || getCSSVar('--color-accent', COLORS.accent) }}
                draggable
                onDragStart={(e) => handleDragStart(e, person.id)}
                onDragOver={(e) => handleDragOver(e, person.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, person.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="person-drag-handle">⋮⋮</div>
                <div className="person-info">
                  <div
                    className="person-color"
                    style={{ backgroundColor: person.color || getCSSVar('--color-accent', COLORS.accent) }}
                  />
                  <span className="person-name">{person.name}</span>
                </div>
                <button
                  className="person-edit-btn"
                  onClick={() => handleEditPerson(person)}
                  title="Düzenle"
                >
                  ✎
                </button>
              </div>
            ))}
            {persons.length === 0 && (
              <div className="empty-state">
                Henüz kişi eklenmemiş. Kişi eklemek için yukarıdaki butona tıklayın.
              </div>
            )}
          </div>

          <div className="tasks-grid" ref={bodyScrollRef}>
            {persons.map((person) => (
              <div
                key={person.id}
                ref={(el) => {
                  if (el) taskRowsRef.current.set(person.id, el);
                }}
                className="person-tasks-row"
              >
                {weeks.map((week) => (
                  <TaskCell
                    key={`${person.id}-${week.startDate}`}
                    tasks={getTasksForCell(person.id, week.startDate)}
                    person={person}
                    persons={persons}
                    weekStart={week.startDate}
                    onTaskUpdate={loadData}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isPersonModalOpen && (
        <PersonModal
          person={editingPerson}
          onClose={handlePersonModalClose}
        />
      )}
    </>
  );
}

