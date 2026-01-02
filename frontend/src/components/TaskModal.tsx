import { useState, useEffect } from 'react';
import { Task, Person } from '../types';
import { tasksApi } from '../services/api';
import './Modal.css';

interface TaskModalProps {
  task: Task | null;
  person: Person;
  weekStart: string;
  onClose: () => void;
}

export default function TaskModal({ task, person, weekStart, onClose }: TaskModalProps) {
  // Backward compatibility: if name doesn't exist, use description as name
  const initialName = task?.name || task?.description || '';
  const initialDescription = task?.description || '';
  
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<Task['status']>(task?.status || 'pending');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name || task.description || '');
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
    } else {
      setName('');
      setDescription('');
      setStatus('pending');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Lütfen iş adı girin');
      return;
    }

    setIsSaving(true);
    try {
      if (task) {
        // Update existing task
        await tasksApi.update(task.id, { 
          name: name.trim(), 
          description: description.trim() || undefined,
          status 
        });
      } else {
        // Create new task
        await tasksApi.create({
          personId: person.id,
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
            <label>Kişi</label>
            <input type="text" value={person.name} disabled />
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

