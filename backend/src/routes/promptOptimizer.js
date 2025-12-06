const express = require('express');
const router = express.Router();
const { PromptOptimizerService } = require('../services/promptOptimizer');

let optimizerService = null;

// Middleware to initialize service
router.use((req, res, next) => {
  if (!optimizerService) {
    optimizerService = new PromptOptimizerService(req.prisma);
  }
  req.optimizer = optimizerService;
  next();
});

/**
 * GET /api/optimizer/suggestions/:projectId
 * Proje için önerilen promptları getir
 */
router.get('/suggestions/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const suggestions = await req.optimizer.getSuggestedPrompts(projectId);
    res.json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/optimizer/successful-attacks/:projectId
 * Başarılı saldırıları analiz et
 */
router.get('/successful-attacks/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const attacks = await req.optimizer.analyzeSuccessfulAttacks(projectId);
    res.json(attacks);
  } catch (error) {
    console.error('Analyze attacks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/optimize
 * Promptu iyileştir
 */
router.post('/optimize', async (req, res) => {
  try {
    const { projectId, prompt, optimizationType, model } = req.body;
    
    if (!projectId || !prompt) {
      return res.status(400).json({ error: 'projectId ve prompt gerekli' });
    }

    const result = await req.optimizer.optimizePrompt(
      projectId,
      prompt,
      optimizationType || 'ENHANCE',
      model || 'anthropic/claude-3-haiku'
    );

    // Sadece gerekli alanları döndür - temiz çıktı
    const analysis = result.analysis || {};
    res.json({
      id: result.id,
      optimizedPrompt: result.optimizedPrompt,
      originalPrompt: result.originalPrompt,
      optimizationType: result.optimizationType,
      improvements: result.improvements || analysis.improvements || [],
      reasoning: analysis.reasoning || '',
      expectedEffectiveness: analysis.expectedEffectiveness || 70,
      detectionRisk: analysis.detectionRisk || 'medium',
      techniques: analysis.techniques || []
    });
  } catch (error) {
    console.error('Optimize prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/combine
 * Başarılı promptları birleştir
 */
router.post('/combine/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { model } = req.body;

    const result = await req.optimizer.combineSuccessfulPrompts(
      projectId,
      model || 'anthropic/claude-3-haiku'
    );

    res.json(result);
  } catch (error) {
    console.error('Combine prompts error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/analyze
 * Prompt analizi ve iyileştirme önerileri
 */
router.post('/analyze', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt gerekli' });
    }

    const result = await req.optimizer.getImprovementSuggestions(
      prompt,
      model || 'anthropic/claude-3-haiku'
    );

    res.json(result);
  } catch (error) {
    console.error('Analyze prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/optimizer/optimized/:projectId
 * Optimize edilmiş promptları getir
 */
router.get('/optimized/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const prompts = await req.prisma.optimizedPrompt.findMany({
      where: { projectId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(prompts);
  } catch (error) {
    console.error('Get optimized prompts error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/optimizer/optimized/:id
 * Optimize edilmiş promptu sil
 */
router.delete('/optimized/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await req.prisma.optimizedPrompt.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete optimized prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/performance/:id
 * Prompt performansını güncelle
 */
router.post('/performance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { wasSuccessful } = req.body;

    await req.optimizer.updatePromptPerformance(id, wasSuccessful);
    res.json({ success: true });
  } catch (error) {
    console.error('Update performance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEMPLATES ====================

/**
 * GET /api/optimizer/templates
 * Tüm şablonları getir
 */
router.get('/templates', async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = { isActive: true };
    if (category) where.category = category;

    const templates = await req.prisma.promptTemplate.findMany({
      where,
      orderBy: { successRate: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/templates
 * Yeni şablon oluştur
 */
router.post('/templates', async (req, res) => {
  try {
    const { name, description, category, template, tags } = req.body;
    
    if (!name || !category || !template) {
      return res.status(400).json({ error: 'name, category ve template gerekli' });
    }

    const result = await req.optimizer.createTemplate(
      name, description, category, template, tags || []
    );

    res.json(result);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/templates/:id/generate
 * Şablondan prompt üret
 */
router.post('/templates/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;

    const prompt = await req.optimizer.generateFromTemplate(id, variables || {});
    res.json({ prompt });
  } catch (error) {
    console.error('Generate from template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/optimizer/templates/:id
 * Şablonu sil
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await req.prisma.promptTemplate.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/optimizer/templates/seed
 * Varsayılan şablonları oluştur
 */
router.post('/templates/seed', async (req, res) => {
  try {
    const count = await req.optimizer.seedDefaultTemplates();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Seed templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SUCCESSFUL ATTACKS ====================

/**
 * POST /api/optimizer/save-attack
 * Başarılı saldırıyı kaydet
 */
router.post('/save-attack', async (req, res) => {
  try {
    const { projectId, sessionId, attackPrompt, targetResponse, technique, analysis } = req.body;
    
    if (!projectId || !sessionId || !attackPrompt || !targetResponse) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    const result = await req.optimizer.saveSuccessfulAttack(
      projectId, sessionId, attackPrompt, targetResponse, technique, analysis
    );

    res.json(result);
  } catch (error) {
    console.error('Save attack error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/optimizer/attacks/:projectId
 * Projenin başarılı saldırılarını getir
 */
router.get('/attacks/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const attacks = await req.prisma.successfulAttack.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attacks);
  } catch (error) {
    console.error('Get attacks error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
