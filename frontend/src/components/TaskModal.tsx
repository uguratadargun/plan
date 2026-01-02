import { useState, useEffect } from 'react';
import { Task, Person } from '../types';
import { tasksApi } from '../services/api';
import './Modal.css';

interface TaskModalProps {
  task: Task | null;
  person: Person; // Default person when creating from a cell
  persons: Person[]; // All persons for multi-select
  weekStart: string;
  onClose: () => void;
}

export default function TaskModal({ task, person, persons, weekStart, onClose }: TaskModalProps) {
  // Backward compatibility: if name doesn't exist, use description as name
  const initialName = task?.name || task?.description || '';
  const initialDescription = task?.description || '';
  // Backward compatibility: support both personIds and personId
  const initialPersonIds = task?.personIds || (task?.personId ? [task.personId] : [person.id]);
  
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(initialPersonIds);
  const [status, setStatus] = useState<Task['status']>(task?.status || 'pending');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name || task.description || '');
      setDescription(task.description || '');
      const taskPersonIds = task.personIds || (task.personId ? [task.personId] : []);
      setSelectedPersonIds(taskPersonIds);
      setStatus(task.status || 'pending');
    } else {
      setName('');
      setDescription('');
      setSelectedPersonIds([person.id]);
      setStatus('pending');
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
          status 
        });
      } else {
        // Create new task
        await tasksApi.create({
          personIds: selectedPersonIds,
          weekStart,
          name: name.trim(),
          description: description.trim() || undefined,
          status
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
                      borderLeftColor: p.color || '#667eea',
                      backgroundColor: isSelected 
                        ? `${p.color || '#667eea'}15` 
                        : 'transparent'
                    }}
                  >
                    <span 
                      className="person-select-color"
                      style={{ backgroundColor: p.color || '#667eea' }}
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
            <label>Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
            >
              <option value="pending">Beklemede</option>
              <option value="in-progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
            </select>
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

