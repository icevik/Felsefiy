const express = require('express');
const router = express.Router();
const { RequestBuilder } = require('../services/requestBuilder');

const requestBuilder = new RequestBuilder();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sessions: true }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const {
      name,
      description,
      targetUrl,
      method,
      headers,
      bodyTemplate,
      attackerModel,
      moderatorModel
    } = req.body;

    // Validate configuration
    const validation = requestBuilder.validateConfig({
      url: targetUrl,
      method,
      headers,
      bodyTemplate
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid configuration',
        details: validation.errors 
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        targetUrl,
        method: method || 'POST',
        headers: typeof headers === 'string' ? JSON.parse(headers) : headers,
        bodyTemplate: bodyTemplate || '{"prompt": "{{prompt}}"}',
        attackerModel: attackerModel || 'anthropic/claude-3-haiku',
        moderatorModel: moderatorModel || 'anthropic/claude-3-haiku'
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const {
      name,
      description,
      targetUrl,
      method,
      headers,
      bodyTemplate,
      attackerModel,
      moderatorModel
    } = req.body;

    // Validate if URL/method/body provided
    if (targetUrl || method || bodyTemplate) {
      const validation = requestBuilder.validateConfig({
        url: targetUrl,
        method: method || 'POST',
        headers,
        bodyTemplate
      });

      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Invalid configuration',
          details: validation.errors 
        });
      }
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(targetUrl && { targetUrl }),
        ...(method && { method }),
        ...(headers && { headers: typeof headers === 'string' ? JSON.parse(headers) : headers }),
        ...(bodyTemplate && { bodyTemplate }),
        ...(attackerModel && { attackerModel }),
        ...(moderatorModel && { moderatorModel })
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Test target connection
router.post('/:id/test', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const testPrompt = req.body.prompt || 'Merhaba, bu bir test mesajıdır.';
    
    const result = await requestBuilder.execute(
      {
        url: project.targetUrl,
        method: project.method,
        headers: project.headers,
        bodyTemplate: project.bodyTemplate
      },
      testPrompt
    );

    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Connection test failed', message: error.message });
  }
});

module.exports = router;
