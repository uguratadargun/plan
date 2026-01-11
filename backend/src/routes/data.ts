import { Router } from 'express';
import { database, Database } from '../db.js';

const router = Router();

// GET /api/data/export - Return full database dump
router.get('/export', (req, res) => {
  try {
    const data = database.exportData();
    const filename = `plan-data-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: 'Veriler dışa aktarılırken bir hata oluştu' });
  }
});

// POST /api/data/import - Replace database with payload
router.post('/import', (req, res) => {
  try {
    const payload = req.body as Partial<Database> | undefined;
    if (!payload || !Array.isArray(payload.persons) || !Array.isArray(payload.tasks)) {
      return res.status(400).json({ error: 'persons ve tasks alanları zorunludur' });
    }

    const result = database.importData({
      persons: payload.persons,
      tasks: payload.tasks
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error importing database:', error);
    res.status(500).json({ error: 'Veriler içe aktarılırken bir hata oluştu' });
  }
});

export default router;
