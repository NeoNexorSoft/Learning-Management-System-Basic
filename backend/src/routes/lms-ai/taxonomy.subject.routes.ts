import { Router } from 'express';
import taxonomyController from '../../controllers/lms-ai/generate/subjects/taxonomy.controller';

const router = Router();

// GET /api/subjects - Alias for /api/taxonomy/subjects
router.get('/', taxonomyController.fetchSubjects);

// POST /api/subjects/topics - Alias for /api/taxonomy/topics
router.post('/topics', taxonomyController.fetchTopics);

// POST /api/subjects/subtopics - Alias for /api/taxonomy/subtopics
router.post('/subtopics', taxonomyController.fetchSubtopics);

export default router;
