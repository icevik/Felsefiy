const express = require('express');
const router = express.Router();
const { ReportGeneratorService } = require('../services/reportGenerator');

// Generate and save report for a project
router.post('/generate/:projectId', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { projectId } = req.params;
    
    // Use moderator model from env or default
    const model = process.env.DEFAULT_MODERATOR_MODEL || 'anthropic/claude-sonnet-4';

    const reportService = new ReportGeneratorService(prisma);
    const report = await reportService.generateReport(projectId, model);

    // Save report to database
    const savedReport = await prisma.report.create({
      data: {
        projectId,
        projectName: report.projectName,
        model: report.model,
        totalSessions: report.rawData.totalSessions,
        successfulAttacks: report.rawData.successfulAttacks,
        failedAttacks: report.rawData.failedAttacks,
        detectedAttacks: report.rawData.detectedAttacks,
        successRate: report.statistics.successRate,
        avgRounds: report.statistics.avgRounds,
        strategyStats: report.statistics.strategyStats,
        executiveSummary: report.sections.executiveSummary,
        vulnerabilityAnalysis: report.sections.vulnerabilityAnalysis,
        attackPatterns: report.sections.attackPatterns,
        successfulTechniques: report.sections.successfulTechniques,
        riskAssessment: report.sections.riskAssessment,
        recommendations: report.sections.recommendations
      }
    });

    res.json({ ...report, id: savedReport.id });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message 
    });
  }
});

// Get all reports for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { projectId } = req.params;

    const reports = await prisma.report.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        projectName: true,
        model: true,
        totalSessions: true,
        successfulAttacks: true,
        successRate: true,
        createdAt: true
      }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Format response to match generated report structure
    res.json({
      id: report.id,
      projectId: report.projectId,
      projectName: report.projectName,
      generatedAt: report.createdAt.toISOString(),
      model: report.model,
      statistics: {
        successRate: report.successRate,
        avgRounds: report.avgRounds,
        strategyStats: report.strategyStats
      },
      sections: {
        executiveSummary: report.executiveSummary,
        vulnerabilityAnalysis: report.vulnerabilityAnalysis,
        attackPatterns: report.attackPatterns,
        successfulTechniques: report.successfulTechniques,
        riskAssessment: report.riskAssessment,
        recommendations: report.recommendations
      },
      rawData: {
        totalSessions: report.totalSessions,
        successfulAttacks: report.successfulAttacks,
        failedAttacks: report.failedAttacks,
        detectedAttacks: report.detectedAttacks
      }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { id } = req.params;

    await prisma.report.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Export report as Markdown
router.post('/export/:projectId', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { projectId } = req.params;
    const { format = 'markdown' } = req.body;
    
    // Use moderator model from env or default
    const model = process.env.DEFAULT_MODERATOR_MODEL || 'anthropic/claude-sonnet-4';

    const reportService = new ReportGeneratorService(prisma);
    const report = await reportService.generateReport(projectId, model);

    if (format === 'markdown') {
      const markdown = reportService.generateMarkdown(report);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="report-${projectId}.md"`);
      res.send(markdown);
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ 
      error: 'Failed to export report',
      message: error.message 
    });
  }
});

// Get quick stats for a project (without full AI analysis)
router.get('/stats/:projectId', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sessions: {
          include: {
            strategy: true,
            _count: { select: { messages: true } }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sessions = project.sessions;
    const successfulSessions = sessions.filter(s => s.result === 'SUCCESS');
    const failedSessions = sessions.filter(s => s.result === 'FAILED');
    const detectedSessions = sessions.filter(s => s.result === 'DETECTED');

    // Strategy stats
    const strategyStats = {};
    sessions.forEach(session => {
      const stratName = session.strategy?.name || 'Otomatik';
      if (!strategyStats[stratName]) {
        strategyStats[stratName] = { total: 0, success: 0, detected: 0, failed: 0 };
      }
      strategyStats[stratName].total++;
      if (session.result === 'SUCCESS') strategyStats[stratName].success++;
      if (session.result === 'DETECTED') strategyStats[stratName].detected++;
      if (session.result === 'FAILED') strategyStats[stratName].failed++;
    });

    // Time-based analysis
    const sessionsByDate = {};
    sessions.forEach(session => {
      const date = new Date(session.startedAt).toLocaleDateString('tr-TR');
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = { total: 0, success: 0 };
      }
      sessionsByDate[date].total++;
      if (session.result === 'SUCCESS') sessionsByDate[date].success++;
    });

    res.json({
      projectId,
      projectName: project.name,
      statistics: {
        totalSessions: sessions.length,
        successfulAttacks: successfulSessions.length,
        failedAttacks: failedSessions.length,
        detectedAttacks: detectedSessions.length,
        successRate: sessions.length > 0 
          ? Math.round((successfulSessions.length / sessions.length) * 100) 
          : 0,
        avgRounds: sessions.length > 0
          ? Math.round(sessions.reduce((acc, s) => acc + s.totalRounds, 0) / sessions.length)
          : 0,
        totalMessages: sessions.reduce((acc, s) => acc + s._count.messages, 0)
      },
      strategyStats,
      sessionsByDate,
      runningSessions: sessions.filter(s => s.status === 'RUNNING').length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
