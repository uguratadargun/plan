import { Router } from 'express';
import { database } from '../db.js';
import { Task } from '../models/Task.js';

const router = Router();

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const { personId, weekStart } = req.query;
    
    const filters: { personId?: string; weekStart?: string } = {};
    if (personId) filters.personId = personId as string;
    if (weekStart) filters.weekStart = weekStart as string;
    
    const tasks = database.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

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

// POST /api/tasks
router.post('/', (req, res) => {
  try {
    const { personIds, personId, weekStart, name, description, color } = req.body;
    
    // Backward compatibility: support both personIds and personId
    const finalPersonIds = personIds || (personId ? [personId] : []);
    
    if (!finalPersonIds.length || !weekStart || !name) {
      return res.status(400).json({ error: 'personIds (or personId), weekStart, and name are required' });
    }
    
    const task: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      personIds: finalPersonIds,
      weekStart,
      name,
      description: description || undefined,
      color: color || generateRandomColor()
    };
    
    const created = database.addTask(task);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = database.updateTask(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = database.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

