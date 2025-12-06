const axios = require('axios');

/**
 * Request Builder Service
 * Builds and executes dynamic HTTP requests to target APIs
 */
class RequestBuilder {
  /**
   * Build and execute a request to the target API
   * @param {Object} config - Target configuration
   * @param {string} config.url - Target URL
   * @param {string} config.method - HTTP method (GET, POST, etc.)
   * @param {Object} config.headers - Request headers
   * @param {string} config.bodyTemplate - Body template with {{prompt}} placeholder
   * @param {string} prompt - The attack prompt to inject
   * @returns {Promise<Object>} - Response from target
   */
  async execute(config, prompt) {
    try {
      const { url, method, headers, bodyTemplate } = config;

      // Parse headers if string
      const parsedHeaders = typeof headers === 'string' 
        ? JSON.parse(headers) 
        : headers;

      // Build request body by replacing {{prompt}} placeholder
      let body = null;
      if (bodyTemplate && method.toUpperCase() !== 'GET') {
        const bodyString = typeof bodyTemplate === 'string' 
          ? bodyTemplate 
          : JSON.stringify(bodyTemplate);
        
        // Replace all occurrences of {{prompt}}
        const processedBody = bodyString.replace(/\{\{prompt\}\}/g, this.escapeJsonString(prompt));
        
        try {
          body = JSON.parse(processedBody);
        } catch {
          // If not valid JSON, send as raw string
          body = processedBody;
        }
      }

      // Build axios config
      const axiosConfig = {
        method: method.toUpperCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders
        },
        timeout: 120000, // 120 second timeout
      };

      if (body && method.toUpperCase() !== 'GET') {
        axiosConfig.data = body;
      }

      // Execute request
      const response = await axios(axiosConfig);

      return {
        success: true,
        status: response.status,
        data: response.data,
        content: this.extractContent(response.data)
      };
    } catch (error) {
      console.error('Request Builder Error:', error.message);
      
      // Handle axios errors
      if (error.response) {
        return {
          success: false,
          status: error.response.status,
          error: error.response.data,
          content: `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
        };
      }

      return {
        success: false,
        status: 0,
        error: error.message,
        content: `Request failed: ${error.message}`
      };
    }
  }

  /**
   * Extract content from various response formats
   * @param {any} data - Response data
   * @returns {string} - Extracted content
   */
  extractContent(data) {
    if (typeof data === 'string') {
      return data;
    }

    // Common response formats
    const contentPaths = [
      'text',
      'content',
      'message',
      'response',
      'answer',
      'output',
      'result',
      'choices[0].message.content',
      'choices[0].text',
      'data.text',
      'data.content',
      'data.response'
    ];

    for (const path of contentPaths) {
      const value = this.getNestedValue(data, path);
      if (value && typeof value === 'string') {
        return value;
      }
    }

    // Fallback: stringify the entire response
    return JSON.stringify(data, null, 2);
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {any} - Value at path
   */
  getNestedValue(obj, path) {
    try {
      return path.split('.').reduce((current, key) => {
        // Handle array notation like choices[0]
        const match = key.match(/^(\w+)\[(\d+)\]$/);
        if (match) {
          return current?.[match[1]]?.[parseInt(match[2])];
        }
        return current?.[key];
      }, obj);
    } catch {
      return undefined;
    }
  }

  /**
   * Escape special characters for JSON string
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  escapeJsonString(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Validate target configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(config.url);
      } catch {
        errors.push('Invalid URL format');
      }
    }

    if (!config.method) {
      errors.push('HTTP method is required');
    } else if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      errors.push('Invalid HTTP method');
    }

    if (config.headers && typeof config.headers === 'string') {
      try {
        JSON.parse(config.headers);
      } catch {
        errors.push('Headers must be valid JSON');
      }
    }

    if (config.bodyTemplate && typeof config.bodyTemplate === 'string') {
      // Check if {{prompt}} placeholder exists
      if (!config.bodyTemplate.includes('{{prompt}}')) {
        errors.push('Body template must contain {{prompt}} placeholder');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = { RequestBuilder };
