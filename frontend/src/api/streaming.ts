/**
 * Streaming API client for real-time analysis
 * Inspired by Claude Code's AsyncGenerator pattern
 */

export interface StreamEvent {
  status: 'initializing' | 'calculating' | 'analyzing' | 'generating' | 'finalizing' | 'complete' | 'error';
  progress?: number;
  message?: string;
  chunk?: string;
  result?: any;
  error?: string;
}

/**
 * Stream divination analysis with real-time progress updates
 */
export async function* analyzeBondStreaming(data: any): AsyncGenerator<StreamEvent> {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "https://deepseek-oracle-backend-production.up.railway.app";
  
  const response = await fetch(`${apiBaseUrl}/api/divination/analyze-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6)) as StreamEvent;
            yield event;
          } catch (e) {
            console.error('Failed to parse SSE data:', line, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stream full report generation with text chunks
 */
export async function* generateReportStreaming(data: any): AsyncGenerator<StreamEvent> {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "https://deepseek-oracle-backend-production.up.railway.app";
  
  const response = await fetch(`${apiBaseUrl}/api/divination/report-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6)) as StreamEvent;
            yield event;
          } catch (e) {
            console.error('Failed to parse SSE data:', line, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
