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
  const [epicUrl, setEpicUrl] = useState<string>(task?.epicUrl || "");
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
      setEpicUrl(task.epicUrl || "");
      setDuration(1);
      setDescriptions([""]);
    } else {
      setName("");
      setDescription("");
      setSelectedPersonIds([person.id]);
      // Only generate random color for new tasks
      setColor(generateRandomColor());
      setEpicUrl("");
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
          epicUrl: epicUrl.trim() || undefined,
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
              epicUrl: epicUrl.trim() || undefined,
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

            {/* Seçili kişiler - ayrı bölüm */}
            {selectedPersonIds.length > 0 && (
              <div className="person-selector-section">
                <div className="person-selector-label">Atanan Kişiler</div>
                <div className="person-selector assigned-persons">
                  {persons
                    .filter((p) => selectedPersonIds.includes(p.id))
                    .map((p) => {
                      const isDisabled = selectedPersonIds.length === 1;

                      return (
                        <div
                          key={p.id}
                          className={`person-select-item selected ${
                            isDisabled ? "disabled" : ""
                          }`}
                          onClick={() =>
                            !isDisabled && handlePersonToggle(p.id)
                          }
                          style={{
                            borderLeftColor:
                              p.color ||
                              getCSSVar("--color-accent", COLORS.accent),
                            backgroundColor: `${
                              p.color ||
                              getCSSVar("--color-accent", COLORS.accent)
                            }15`,
                          }}
                        >
                          <span
                            className="person-select-color"
                            style={{
                              backgroundColor:
                                p.color ||
                                getCSSVar("--color-accent", COLORS.accent),
                            }}
                          />
                          <span className="person-select-name">{p.name}</span>
                          <span className="person-select-check">✓</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Seçili olmayan kişiler */}
            {persons.filter((p) => !selectedPersonIds.includes(p.id)).length >
              0 && (
              <div className="person-selector-section">
                {selectedPersonIds.length > 0 && (
                  <div className="person-selector-label">Diğer Kişiler</div>
                )}
                <div className="person-selector">
                  {persons
                    .filter((p) => !selectedPersonIds.includes(p.id))
                    .map((p) => {
                      return (
                        <div
                          key={p.id}
                          className="person-select-item"
                          onClick={() => handlePersonToggle(p.id)}
                          style={{
                            borderLeftColor:
                              p.color ||
                              getCSSVar("--color-accent", COLORS.accent),
                            backgroundColor: "transparent",
                          }}
                        >
                          <span
                            className="person-select-color"
                            style={{
                              backgroundColor:
                                p.color ||
                                getCSSVar("--color-accent", COLORS.accent),
                            }}
                          />
                          <span className="person-select-name">{p.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
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
            <label>Epic URL (GitLab)</label>
            <div className="epic-url-input-wrapper">
              <div className="epic-url-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <input
                type="url"
                className="epic-url-input"
                value={epicUrl}
                onChange={(e) => setEpicUrl(e.target.value)}
                placeholder="https://gitlab.com/group/project/-/epics/123"
              />
              {epicUrl.trim() && (
                <a
                  href={epicUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="epic-url-test-link"
                  onClick={(e) => e.stopPropagation()}
                  title="Epic'i yeni sekmede aç"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              )}
            </div>
            {epicUrl.trim() && (
              <small className="epic-url-preview">
                Epic bağlantısı: <span>{epicUrl.trim()}</span>
              </small>
            )}
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
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
