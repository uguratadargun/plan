import { useState, useEffect } from "react";
import { Task, Person } from "../types";
import { tasksApi } from "../services/api";
import { getCSSVar, COLORS } from "../utils/colors";
import "./Modal.css";

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
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#a855f7", // Violet
    "#ef4444", // Red
    "#84cc16", // Lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function TaskModal({
  task,
  person,
  persons,
  weekStart,
  onClose,
}: TaskModalProps) {
  // Backward compatibility: if name doesn't exist, use description as name
  const initialName = task?.name || task?.description || "";
  const initialDescription = task?.description || "";
  // Backward compatibility: support both personIds and personId
  const initialPersonIds =
    task?.personIds || (task?.personId ? [task.personId] : [person.id]);
  const initialColor = task?.color || generateRandomColor();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPersonIds, setSelectedPersonIds] =
    useState<string[]>(initialPersonIds);
  const [color, setColor] = useState<string>(initialColor);
  const [isSaving, setIsSaving] = useState(false);
  const [duration, setDuration] = useState<number>(1); // Süre (hafta sayısı)
  const [descriptions, setDescriptions] = useState<string[]>([""]); // Her hafta için ayrı description

  useEffect(() => {
    if (task) {
      setName(task.name || task.description || "");
      setDescription(task.description || "");
      const taskPersonIds =
        task.personIds || (task.personId ? [task.personId] : []);
      setSelectedPersonIds(taskPersonIds);
      // Use existing color, don't generate new one
      setColor(task.color || "#3b82f6");
      setDuration(1);
      setDescriptions([""]);
    } else {
      setName("");
      setDescription("");
      setSelectedPersonIds([person.id]);
      // Only generate random color for new tasks
      setColor(generateRandomColor());
      setDuration(1);
      setDescriptions([""]);
    }
  }, [task, person]);

  // Duration değiştiğinde descriptions array'ini güncelle
  useEffect(() => {
    if (!task && duration > 0) {
      setDescriptions((prev) => {
        const newDescriptions = Array(duration)
          .fill("")
          .map((_, index) => prev[index] || "");
        return newDescriptions;
      });
    }
  }, [duration, task]);

  const handlePersonToggle = (personId: string) => {
    setSelectedPersonIds((prev) => {
      if (prev.includes(personId)) {
        // Don't allow removing the last person
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== personId);
      } else {
        return [...prev, personId];
      }
    });
  };

  // Bir hafta ekle (7 gün)
  const addWeek = (dateStr: string, weeks: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + weeks * 7);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Lütfen iş adı girin");
      return;
    }

    if (selectedPersonIds.length === 0) {
      alert("En az bir kişi seçmelisiniz");
      return;
    }

    if (duration < 1 || duration > 52) {
      alert("Süre 1 ile 52 hafta arasında olmalıdır");
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
          color,
        });
      } else {
        // Create multiple tasks for each week
        const tasksToCreate = [];
        for (let i = 0; i < duration; i++) {
          const currentWeekStart = addWeek(weekStart, i);
          const currentDescription = descriptions[i]?.trim() || undefined;

          tasksToCreate.push(
            tasksApi.create({
              personIds: selectedPersonIds,
              weekStart: currentWeekStart,
              name: name.trim(),
              description: currentDescription,
              color,
            })
          );
        }

        // Tüm task'ları paralel olarak oluştur
        await Promise.all(tasksToCreate);
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("İş kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Bu işi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await tasksApi.delete(task.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("İş silinirken bir hata oluştu");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? "İşi Düzenle" : "Yeni İş Ekle"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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
                    className={`person-select-item ${
                      isSelected ? "selected" : ""
                    } ${isDisabled ? "disabled" : ""}`}
                    onClick={() => !isDisabled && handlePersonToggle(p.id)}
                    style={{
                      borderLeftColor:
                        p.color || getCSSVar("--color-accent", COLORS.accent),
                      backgroundColor: isSelected
                        ? `${
                            p.color ||
                            getCSSVar("--color-accent", COLORS.accent)
                          }15`
                        : "transparent",
                    }}
                  >
                    <span
                      className="person-select-color"
                      style={{
                        backgroundColor:
                          p.color || getCSSVar("--color-accent", COLORS.accent),
                      }}
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

          {!task && (
            <div className="form-group">
              <label>Süre (Hafta) *</label>
              <div className="duration-dropdown-wrapper">
                <select
                  className="duration-dropdown"
                  value={duration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setDuration(value);
                  }}
                  required
                >
                  {Array.from({ length: 52 }, (_, i) => i + 1).map(
                    (weekNum) => (
                      <option key={weekNum} value={weekNum}>
                        {weekNum} {weekNum === 1 ? "Hafta" : "Hafta"}
                      </option>
                    )
                  )}
                </select>
                <div className="dropdown-arrow">▼</div>
              </div>
              <small
                style={{
                  color: "#666",
                  fontSize: "0.9em",
                  marginTop: "0.5rem",
                  display: "block",
                }}
              >
                {duration} hafta boyunca yan yana {duration} adet task
                oluşturulacak
              </small>
            </div>
          )}

          {!task && duration > 1 ? (
            <div className="form-group">
              <label>Haftalık Açıklamalar</label>
              {descriptions.map((desc, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      fontSize: "0.9em",
                      color: "#666",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    {index + 1}. Hafta Açıklaması
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => {
                      const newDescriptions = [...descriptions];
                      newDescriptions[index] = e.target.value;
                      setDescriptions(newDescriptions);
                    }}
                    rows={3}
                    placeholder={`${
                      index + 1
                    }. hafta için detaylı açıklama (opsiyonel)...`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="form-group">
              <label>Detaylı Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Detaylı açıklama girin (hover'da görünecek)..."
              />
            </div>
          )}

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
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
