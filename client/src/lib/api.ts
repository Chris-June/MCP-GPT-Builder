import type { Role, Memory, ProcessQueryRequest, ProcessQueryResponse, StreamingQueryRequest, StreamingOptions } from '@/types'

export interface CreateMemoryRequest {
  role_id: string
  content: string
  type: string
  importance: string
}

// API Client
const API_BASE = '/api/v1'

export async function fetchRoles(): Promise<Role[]> {
  const response = await fetch(`${API_BASE}/roles`)
  if (!response.ok) {
    throw new Error('Failed to fetch roles')
  }
  const data = await response.json()
  return data.roles
}

export async function fetchRole(roleId: string): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${roleId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch role: ${roleId}`)
  }
  const data = await response.json()
  return data.role
}

export async function createRole(role: Omit<Role, 'is_default'>): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  })
  if (!response.ok) {
    throw new Error('Failed to create role')
  }
  const data = await response.json()
  return data.role
}

export async function updateRole(roleId: string, role: Partial<Role>): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${roleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  })
  if (!response.ok) {
    throw new Error(`Failed to update role: ${roleId}`)
  }
  const data = await response.json()
  return data.role
}

export async function deleteRole(roleId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/roles/${roleId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete role: ${roleId}`)
  }
}

export async function processQuery(request: ProcessQueryRequest): Promise<ProcessQueryResponse> {
  const response = await fetch(`${API_BASE}/roles/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error('Failed to process query')
  }
  return await response.json()
}

/**
 * Process a query with streaming response
 * @param request The streaming query request
 * @param options Callbacks for handling streaming events
 */
export async function processQueryStreaming(
  request: StreamingQueryRequest, 
  options: StreamingOptions
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/roles/process/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to process streaming query: ${response.status}`)
    }
    
    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser')
    }
    
    // Process the stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        // Don't call options.onComplete() here, we'll call it once at the end
        break
      }
      
      // Decode the chunk and process SSE format
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n\n')
      
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
    }
    // Call onComplete once at the end of the stream processing
    options.onComplete()
  } catch (error) {
    options.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

export async function fetchMemories(roleId: string): Promise<Memory[]> {
  const response = await fetch(`${API_BASE}/memories/${roleId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch memories for role: ${roleId}`)
  }
  const data = await response.json()
  return data.memories
}

export async function createMemory(memory: CreateMemoryRequest): Promise<Memory> {
  const response = await fetch(`${API_BASE}/memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memory),
  })
  if (!response.ok) {
    throw new Error('Failed to create memory')
  }
  const data = await response.json()
  return data.memory
}

export async function clearMemories(roleId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/memories/${roleId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to clear memories for role: ${roleId}`)
  }
}
