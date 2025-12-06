const axios = require('axios');

/**
 * OpenRouter API Service
 * Handles all communication with OpenRouter for AI model interactions
 */
class OpenRouterService {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  /**
   * Send a chat completion request to OpenRouter
   * @param {string} model - Model identifier (e.g., 'anthropic/claude-3-haiku')
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<string>} - The assistant's response content
   */
  async chat(model, messages, options = {}) {
    try {
      console.log('OpenRouter Request:', {
        model,
        messageCount: messages.length,
        firstMessageRole: messages[0]?.role,
        apiKeyExists: !!this.apiKey
      });

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://felsefiy.local',
            'X-Title': 'Felsefiy Red Team Platform'
          },
          timeout: 60000
        }
      );

      console.log('OpenRouter Response status:', response.status);
      console.log('OpenRouter Response choices:', response.data.choices?.length);
      
      const content = response.data.choices[0]?.message?.content || '';
      console.log('OpenRouter Content length:', content.length);
      
      return content;
    } catch (error) {
      const errorDetail = error.response?.data?.error || error.response?.data || error.message;
      console.error('OpenRouter API Error:', JSON.stringify(errorDetail, null, 2));
      console.error('Model:', model);
      console.error('API Key exists:', !!this.apiKey);
      console.error('API Key prefix:', this.apiKey?.substring(0, 10) + '...');
      throw new Error(`OpenRouter API Error: ${JSON.stringify(errorDetail)}`);
    }
  }

  /**
   * Get available models from OpenRouter
   * @returns {Promise<Array>} - List of available models
   */
  async getModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch models:', error.message);
      return [];
    }
  }
}

module.exports = { OpenRouterService };
