# Streaming Responses

## Overview

The MCP application now supports streaming responses, allowing for real-time display of AI-generated content as it's being created. This provides a more interactive and engaging user experience compared to waiting for the entire response to be generated before displaying it.

## Features

- **Real-time Updates**: See AI responses as they're being generated, character by character
- **Toggle Option**: Switch between streaming and non-streaming modes
- **Visual Indicators**: Clear UI feedback showing when streaming is active
- **Seamless Integration**: Works with all existing role-based conversations

## Technical Implementation

### Client-Side

The streaming functionality is implemented using the following components:

1. **API Client**:
   - `processQueryStreaming()` function in `src/lib/api.ts` handles the streaming API requests
   - Uses the Fetch API with stream processing to handle Server-Sent Events (SSE)

2. **Types**:
   - `StreamingQueryRequest` defines the request structure
   - `StreamingOptions` provides callbacks for stream handling

3. **UI Components**:
   - Toggle switch to enable/disable streaming
   - Visual indicators showing streaming status
   - Real-time display of incoming content

### Server-Side

The server implements a streaming endpoint that:

- Accepts the same parameters as the regular query endpoint
- Returns responses in SSE format
- Handles chunked responses from the AI provider

## Usage Example

```typescript
import { processQueryStreaming } from '@/lib/api';

// Basic usage with callbacks
await processQueryStreaming(
  { role_id: 'your-role-id', query: 'Your question here' },
  {
    onChunk: (chunk) => {
      // Handle each chunk of the response
      console.log('Received chunk:', chunk);
      // Update UI with the new content
      setPartialResponse(prev => prev + chunk);
    },
    onComplete: () => {
      // Handle completion of the stream
      console.log('Stream completed');
      // Perform any cleanup or final UI updates
    },
    onError: (error) => {
      // Handle any errors during streaming
      console.error('Streaming error:', error);
      // Show error message to the user
    }
  }
);
```

## Best Practices

1. **Always handle errors**: Streaming connections may fail for various reasons
2. **Provide visual feedback**: Let users know when streaming is active
3. **Offer a fallback**: Allow users to switch to non-streaming mode if needed
4. **Optimize for performance**: Minimize UI updates to prevent rendering bottlenecks

## Limitations

- Requires a browser that supports the Fetch API and ReadableStream
- Network interruptions may cause streaming to fail
- Some complex formatting may appear differently when streamed vs. complete responses

## Implementation Notes

### Bug Fixes

- **Response Persistence**: Fixed an issue where streamed responses would disappear upon completion. The fix uses a local variable to accumulate the response, ensuring that the complete content is available when the stream finishes.
  ```typescript
  // In handleStreamingResponse function
  
  // Keep track of the accumulated response in a local variable
  let accumulatedResponse = ''
  
  // In the streaming callbacks
  onChunk: (chunk) => {
    // Update both the state and our local accumulator
    accumulatedResponse += chunk
    setStreamedResponse(accumulatedResponse)
  },
  onComplete: () => {
    // Use the accumulated response which is guaranteed to be complete
    const newMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: accumulatedResponse, // Use the accumulated response
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    setStreamedResponse('')
    setIsStreaming(false)
  }
  ```

- **Duplicate Responses**: Fixed an issue where responses would appear twice in the chat history. The fix ensures that the `onComplete` callback is only called once at the end of stream processing.
  ```typescript
  // In processQueryStreaming function
  
  // First fix: Don't call onComplete when [DONE] message is received
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.substring(6)
      if (data === '[DONE]') {
        // The server sent a DONE message, we'll call onComplete at the end of the loop
        // Don't call options.onComplete() here to avoid duplicate calls
      } else if (!data.startsWith('Error:')) {
        options.onChunk(data)
      } else {
        options.onError(new Error(data))
      }
    }
  }
  
  // Second fix: Remove the duplicate onComplete call in the reader loop
  while (true) {
    const { done, value } = await reader.read()
    
    if (done) {
      // Don't call options.onComplete() here, we'll call it once at the end
      break
    }
    // ...rest of the loop code
  }
  
  // Call onComplete once at the end of the stream processing
  options.onComplete()
  ```

## Future Improvements

- Add support for streaming with memory creation
- Implement pause/resume functionality for streams
- Enhance error recovery for interrupted streams
- Add typing indicators and other UI enhancements
