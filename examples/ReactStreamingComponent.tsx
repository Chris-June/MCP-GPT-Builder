/**
 * EXAMPLE COMPONENT - NOT PART OF THE MAIN APPLICATION
 * ====================================================
 * 
 * This is an example implementation of a React component that demonstrates
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

import { useState, useEffect, useRef } from 'react';
import { Button, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface StreamingChatProps {
  apiUrl: string;
  availableRoles: Array<{ id: string; name: string }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function StreamingChat({ apiUrl, availableRoles }: StreamingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedRole, setSelectedRole] = useState(availableRoles[0]?.id || '');
  const [streamedResponse, setStreamedResponse] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedResponse]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !selectedRole) return;
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Start loading and streaming states
    setIsLoading(true);
    setIsStreaming(true);
    setStreamedResponse('');
    
    try {
      // Make API request to streaming endpoint
      const response = await fetch(`${apiUrl}/roles/process/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role_id: selectedRole,
          query: input,
          custom_instructions: null
        }),
      });
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Unable to read response stream');
      }
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              // End of stream
              setIsStreaming(false);
            } else if (!data.startsWith('Error:')) {
              // Append to response
              setStreamedResponse(prev => prev + data);
            } else {
              // Handle error
              console.error('Stream error:', data);
              setStreamedResponse(prev => prev + '\nError occurred during streaming.');
              setIsStreaming(false);
            }
          }
        }
      }
      
      // When streaming is complete, add the full message
      setMessages(prev => [...prev, { role: 'assistant', content: streamedResponse }]);
      setStreamedResponse('');
    } catch (error) {
      console.error('Error processing request:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, an error occurred while processing your request.'
      }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-muted/20">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'}`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {/* Streaming response */}
        {isStreaming && streamedResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="whitespace-pre-wrap">
                {streamedResponse}
                <span className="ml-1 animate-pulse">▋</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your message..."
          className="flex-1 min-h-[60px] max-h-[120px]"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim() || !selectedRole}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isStreaming ? 'Streaming...' : 'Loading...'}
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
}
