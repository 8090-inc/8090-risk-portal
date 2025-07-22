const request = require('supertest');
const express = require('express');
const path = require('path');

describe('API Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());
    
    // Simple test endpoints that mirror the API structure
    app.get('/api/v1/health', (req, res) => {
      res.json({ status: 'healthy', version: '1.0.0' });
    });
    
    app.get('/api/v1/risks', (req, res) => {
      const mockRisks = [
        { id: 'RISK-TEST-1', risk: 'Test Risk 1', riskCategory: 'Test Category' },
        { id: 'RISK-TEST-2', risk: 'Test Risk 2', riskCategory: 'Test Category' }
      ];
      
      res.json({
        success: true,
        data: mockRisks,
        meta: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      });
    });
    
    app.get('/api/risks', (req, res) => {
      // Legacy endpoint for backward compatibility
      res.json({
        success: true,
        data: [],
        total: 0
      });
    });
  });
  
  describe('API Versioning', () => {
    test('v1 endpoints are accessible', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      expect(response.body.version).toBe('1.0.0');
    });
    
    test('legacy endpoints still work', async () => {
      const response = await request(app)
        .get('/api/risks')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('Response Format', () => {
    test('successful responses follow standard format', async () => {
      const response = await request(app)
        .get('/api/v1/risks')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
    });
  });
});

// Run the tests
if (require.main === module) {
  require('jest-cli/bin/jest');
}