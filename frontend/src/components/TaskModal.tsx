import { useState, useEffect } from 'react';
import { Task, Person } from '../types';
import { tasksApi } from '../services/api';
import { getCSSVar, COLORS } from '../utils/colors';
import './Modal.css';

interface TaskModalProps {
  task: Task | null;
  person: Person; // Default person when creating from a cell
  persons: Person[]; // All persons for multi-select
  weekStart: string;
  onClose: () => void;
}

// Generate random color from a nice palette
function generateRandomColor(): string {
  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a855f7', // Violet
    '#ef4444', // Red
    '#84cc16', // Lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function TaskModal({ task, person, persons, weekStart, onClose }: TaskModalProps) {
  // Backward compatibility: if name doesn't exist, use description as name
  const initialName = task?.name || task?.description || '';
  const initialDescription = task?.description || '';
  // Backward compatibility: support both personIds and personId
  const initialPersonIds = task?.personIds || (task?.personId ? [task.personId] : [person.id]);
  const initialColor = task?.color || generateRandomColor();
  
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(initialPersonIds);
  const [color, setColor] = useState<string>(initialColor);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name || task.description || '');
      setDescription(task.description || '');
      const taskPersonIds = task.personIds || (task.personId ? [task.personId] : []);
      setSelectedPersonIds(taskPersonIds);
      // Use existing color, don't generate new one
      setColor(task.color || '#3b82f6');
    } else {
      setName('');
      setDescription('');
      setSelectedPersonIds([person.id]);
      // Only generate random color for new tasks
      setColor(generateRandomColor());
    }
  }, [task, person]);

  const handlePersonToggle = (personId: string) => {
    setSelectedPersonIds(prev => {
      if (prev.includes(personId)) {
        // Don't allow removing the last person
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== personId);
      } else {
        return [...prev, personId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Lütfen iş adı girin');
      return;
    }

    if (selectedPersonIds.length === 0) {
      alert('En az bir kişi seçmelisiniz');
      return;
    }

    setIsSaving(true);
    try {
      if (task) {
        // Update existing task
        await tasksApi.update(task.id, { 
          name: name.trim(), 
          description: description.trim() || undefined,
          personIds: selectedPersonIds,
          color
        });
      } else {
        // Create new task
        await tasksApi.create({
          personIds: selectedPersonIds,
          weekStart,
          name: name.trim(),
          description: description.trim() || undefined,
          color
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('İş kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Bu işi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await tasksApi.delete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('İş silinirken bir hata oluştu');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'İşi Düzenle' : 'Yeni İş Ekle'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Kişiler *</label>
            <div className="person-selector">
              {persons.map((p) => {
                const isSelected = selectedPersonIds.includes(p.id);
                const isDisabled = selectedPersonIds.length === 1 && isSelected;
                
                return (
                  <div
                    key={p.id}
                    className={`person-select-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && handlePersonToggle(p.id)}
                    style={{ 
                      borderLeftColor: p.color || getCSSVar('--color-accent', COLORS.accent),
                      backgroundColor: isSelected 
                        ? `${p.color || getCSSVar('--color-accent', COLORS.accent)}15` 
                        : 'transparent'
                    }}
                  >
                    <span 
                      className="person-select-color"
                      style={{ backgroundColor: p.color || getCSSVar('--color-accent', COLORS.accent) }}
                    />
                    <span className="person-select-name">{p.name}</span>
                    {isSelected && (
                      <span className="person-select-check">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="form-group">
            <label>İş Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="İş adını girin (board'da görünecek)..."
              required
            />
          </div>
          
          <div className="form-group">
            <label>Detaylı Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detaylı açıklama girin (hover'da görünecek)..."
            />
          </div>
          
          <div className="form-group">
            <label>Renk</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
              />
              <button
                type="button"
                className="btn-random-color"
                onClick={() => setColor(generateRandomColor())}
                title="Rastgele Renk"
              >
                🎲
              </button>
            </div>
          </div>
          
          <div className="modal-actions">
            {task && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Sil
              </button>
            )}
            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

