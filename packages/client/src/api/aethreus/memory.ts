import { request } from '@/api/client'

export type AethreusMemoryStatus = 'active' | 'superseded' | 'expired' | 'deleted'

export interface AethreusMemoryNode {
  id: string
  parentId?: string
  supersedesId?: string
  profileId: string
  scope?:
    | { type: 'profile' }
    | { type: 'context'; namespace: string; id: string }
    | { type: 'session'; id: string }
  origin?: { host?: string; namespace?: string; contextId?: string }
  domain: string
  categoryPath: string[]
  type: string
  key: string
  revision: number
  valueJson?: unknown
  title: string
  content: string
  status: AethreusMemoryStatus
  confidence: number
  importance: number
  tags: string[]
  entities: string[]
  sourceMessageIds: string[]
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export async function fetchAethreusMemory(input: {
  query?: string
  status?: AethreusMemoryStatus
} = {}): Promise<AethreusMemoryNode[]> {
  const params = new URLSearchParams()
  if (input.query) params.set('query', input.query)
  if (input.status) params.set('status', input.status)
  const suffix = params.size ? `?${params.toString()}` : ''
  const response = await request<{ ok: boolean; memories: AethreusMemoryNode[] }>(`/api/aethreus/memory${suffix}`)
  return response.memories
}

export async function updateAethreusMemory(
  id: string,
  input: { expectedRevision: number; title: string; content: string; tags: string[] },
): Promise<AethreusMemoryNode> {
  const response = await request<{ ok: boolean; memory: AethreusMemoryNode }>(`/api/aethreus/memory/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return response.memory
}

export async function deleteAethreusMemory(id: string, expectedRevision: number): Promise<void> {
  await request(`/api/aethreus/memory/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    body: JSON.stringify({ expectedRevision }),
  })
}

// Backward-compatibility aliases for Ekko
export type EkkoMemoryStatus = AethreusMemoryStatus
export type EkkoMemoryNode = AethreusMemoryNode
export const fetchEkkoMemory = fetchAethreusMemory
export const updateEkkoMemory = updateAethreusMemory
export const deleteEkkoMemory = deleteAethreusMemory

