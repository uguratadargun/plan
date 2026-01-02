import { useState, useEffect } from 'react';
import { Person } from '../types';
import { personsApi } from '../services/api';
import './Modal.css';

interface PersonModalProps {
  person: Person | null;
  onClose: () => void;
}

export default function PersonModal({ person, onClose }: PersonModalProps) {
  const [name, setName] = useState(person?.name || '');
  const [color, setColor] = useState(person?.color || '#667eea');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (person) {
      setName(person.name);
      setColor(person.color || '#667eea');
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Lütfen kişi adı girin');
      return;
    }

    setIsSaving(true);
    try {
      if (person) {
        // Update existing person
        await personsApi.update(person.id, { name: name.trim(), color });
      } else {
        // Create new person
        await personsApi.create({ name: name.trim(), color });
      }
      onClose();
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Kişi kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!person || !confirm('Bu kişiyi ve tüm işlerini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await personsApi.delete(person.id);
      onClose();
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Kişi silinirken bir hata oluştu');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{person ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Kişi Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kişi adını girin..."
              required
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
                placeholder="#667eea"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            {person && (
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

