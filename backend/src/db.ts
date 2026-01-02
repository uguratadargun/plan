import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Person } from './models/Person.js';
import { Task } from './models/Task.js';

const DB_PATH = './data/db.json';

interface Database {
  persons: Person[];
  tasks: Task[];
}

let db: Database = {
  persons: [],
  tasks: []
};

// Initialize database file if it doesn't exist
function initializeDB(): void {
  if (!existsSync('./data')) {
    mkdirSync('./data', { recursive: true });
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
}

// Initialize on module load
initializeDB();

// Load database from file
function loadDB(): Database {
  try {
    if (existsSync(DB_PATH)) {
      const data = readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
    db = { persons: [], tasks: [] };
  }
  return db;
}

// Save database to file
function saveDB(): void {
  try {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize on import
loadDB();

export const database = {
  getPersons: (): Person[] => {
    loadDB();
    return db.persons;
  },
  
  getPerson: (id: string): Person | undefined => {
    loadDB();
    return db.persons.find(p => p.id === id);
  },
  
  addPerson: (person: Person): Person => {
    loadDB();
    db.persons.push(person);
    saveDB();
    return person;
  },
  
  updatePerson: (id: string, updates: Partial<Person>): Person | null => {
    loadDB();
    const index = db.persons.findIndex(p => p.id === id);
    if (index === -1) return null;
    db.persons[index] = { ...db.persons[index], ...updates };
    saveDB();
    return db.persons[index];
  },
  
  deletePerson: (id: string): boolean => {
    loadDB();
    const index = db.persons.findIndex(p => p.id === id);
    if (index === -1) return false;
    db.persons.splice(index, 1);
    // Also remove this person from all tasks and delete tasks with no persons
    db.tasks = db.tasks.map(t => {
      const personIds = t.personIds || (t.personId ? [t.personId] : []);
      const newPersonIds = personIds.filter(pid => pid !== id);
      if (newPersonIds.length === 0) {
        return null; // Mark for deletion
      }
      return { ...t, personIds: newPersonIds, personId: undefined };
    }).filter(t => t !== null) as Task[];
    saveDB();
    return true;
  },
  
  getTasks: (filters?: { personId?: string; weekStart?: string }): Task[] => {
    loadDB();
    let tasks = db.tasks;
    
    // Generate random color function
    const generateRandomColor = (): string => {
      const colors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
        '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
        '#ef4444', '#84cc16'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    let needsSave = false;
    
    // Backward compatibility: convert personId to personIds and add color if missing
    tasks = tasks.map(task => {
      let updatedTask = { ...task };
      let taskNeedsUpdate = false;
      
      if (task.personId && !task.personIds) {
        updatedTask = { ...updatedTask, personIds: [task.personId], personId: undefined };
        taskNeedsUpdate = true;
      }
      
      if (!updatedTask.color) {
        updatedTask = { ...updatedTask, color: generateRandomColor() };
        taskNeedsUpdate = true;
      }
      
      if (taskNeedsUpdate) {
        needsSave = true;
        // Update task in database
        const index = db.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          db.tasks[index] = updatedTask;
        }
      }
      
      return updatedTask;
    });
    
    // Save if any tasks were updated
    if (needsSave) {
      saveDB();
    }
    
    if (filters?.personId) {
      tasks = tasks.filter(t => {
        const personIds = t.personIds || (t.personId ? [t.personId] : []);
        return personIds.includes(filters.personId!);
      });
    }
    
    if (filters?.weekStart) {
      tasks = tasks.filter(t => t.weekStart === filters.weekStart);
    }
    
    return tasks;
  },
  
  getTask: (id: string): Task | undefined => {
    loadDB();
    return db.tasks.find(t => t.id === id);
  },
  
  addTask: (task: Task): Task => {
    loadDB();
    db.tasks.push(task);
    saveDB();
    return task;
  },
  
  updateTask: (id: string, updates: Partial<Task>): Task | null => {
    loadDB();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    db.tasks[index] = { ...db.tasks[index], ...updates };
    saveDB();
    return db.tasks[index];
  },
  
  deleteTask: (id: string): boolean => {
    loadDB();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    db.tasks.splice(index, 1);
    saveDB();
    return true;
  }
};

