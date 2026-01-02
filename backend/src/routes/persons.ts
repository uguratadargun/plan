import { Router } from 'express';
import { database } from '../db.js';
import { Person } from '../models/Person.js';

const router = Router();

// GET /api/persons
router.get('/', (req, res) => {
  try {
    const persons = database.getPersons();
    // Sort by order, then by id if order is not set
    const sorted = persons.sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.id.localeCompare(b.id);
    });
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
});

// POST /api/persons
router.post('/', (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Get max order to add new person at the end
    const existingPersons = database.getPersons();
    const maxOrder = existingPersons.reduce((max, p) => Math.max(max, p.order ?? 0), -1);
    
    const person: Person = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      order: maxOrder + 1
    };
    
    const created = database.addPerson(person);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// PUT /api/persons/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = database.updatePerson(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// DELETE /api/persons/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = database.deletePerson(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// POST /api/persons/reorder - Update person order
router.post('/reorder', (req, res) => {
  try {
    const { personIds } = req.body; // Array of person IDs in new order
    
    if (!Array.isArray(personIds)) {
      return res.status(400).json({ error: 'personIds must be an array' });
    }
    
    // Update order for each person
    personIds.forEach((personId: string, index: number) => {
      database.updatePerson(personId, { order: index });
    });
    
    const updatedPersons = database.getPersons();
    res.json(updatedPersons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder persons' });
  }
});

export default router;

