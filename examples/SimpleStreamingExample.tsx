/**
 * EXAMPLE COMPONENT - NOT PART OF THE MAIN APPLICATION
 * ====================================================
 * 
 * This is a simplified example implementation of a React component that demonstrates
 * how to use the streaming API. It is NOT meant to be imported or used
 * directly in the client application.
 * 
 * The actual implementation of streaming functionality in the main application
 * can be found in: /client/src/pages/chat.tsx
 * 
 * This file is provided as a reference for developers who want to implement
 * streaming functionality in their own React applications.
 * 
 * Note: This file will show TypeScript errors because it's not part of the
 * main application's build process and doesn't have access to its dependencies.
 */

import React, { useState, useEffect, useRef } from 'react';

interface StreamingExampleProps {
  apiBaseUrl: string;
  roleId: string;
}

export function SimpleStreamingExample({ apiBaseUrl, roleId }: StreamingExampleProps) {
  const [query, setQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when response updates
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsStreaming(true);
    setStreamedResponse('');

    try {
      // Make request to streaming endpoint
      const response = await fetch(`${apiBaseUrl}/roles/process/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role_id: roleId,
          query: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Process the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          break;
        }
        
        // Decode the chunk and process SSE format
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
            } else if (!data.startsWith('Error:')) {
              setStreamedResponse(prev => prev + data);
            } else {
              console.error('Stream error:', data);
              setIsStreaming(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      setStreamedResponse(prev => prev + '\nError: Failed to stream response');
      setIsStreaming(false);
    }
  };

  return (
    <div className="streaming-example p-4 border rounded-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Streaming Example</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="w-full p-2 border rounded"
            disabled={isStreaming}
          />
        </div>
        
        <button
          type="submit"
          disabled={isStreaming || !query.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>
      
      <div className="response-container">
        <h3 className="font-semibold mb-2">Response:</h3>
        <div 
          ref={responseRef}
          className="p-3 border rounded bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto whitespace-pre-wrap"
        >
          {streamedResponse}
          {isStreaming && <span className="inline-block ml-1 animate-pulse">▋</span>}
        </div>
      </div>
    </div>
  );
}
