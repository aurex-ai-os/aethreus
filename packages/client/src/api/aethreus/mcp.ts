import { request } from '@/api/client'

export interface AethreusMcpServerConfig {
  type?: 'stdio' | 'streamable_http'
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
  enabled?: boolean
}

export interface AethreusMcpServerInfo {
  name: string
  managed: boolean
  config: AethreusMcpServerConfig
}

export interface AethreusMcpToolInfo {
  name: string
  description: string
}

export async function fetchAethreusMcpServers(): Promise<AethreusMcpServerInfo[]> {
  const response = await request<{ ok: boolean; servers: AethreusMcpServerInfo[] }>('/api/aethreus/mcp/servers')
  return response.servers
}

export async function createAethreusMcpServer(name: string, config: AethreusMcpServerConfig): Promise<AethreusMcpServerInfo> {
  const response = await request<{ ok: boolean; server: AethreusMcpServerInfo }>('/api/aethreus/mcp/servers', {
    method: 'POST',
    body: JSON.stringify({ name, config }),
  })
  return response.server
}

export async function updateAethreusMcpServer(name: string, config: AethreusMcpServerConfig): Promise<AethreusMcpServerInfo> {
  const response = await request<{ ok: boolean; server: AethreusMcpServerInfo }>(`/api/aethreus/mcp/servers/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: JSON.stringify({ config }),
  })
  return response.server
}

export async function setAethreusMcpServerEnabled(name: string, enabled: boolean): Promise<AethreusMcpServerInfo> {
  const response = await request<{ ok: boolean; server: AethreusMcpServerInfo }>(`/api/aethreus/mcp/servers/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  })
  return response.server
}

export async function deleteAethreusMcpServer(name: string): Promise<void> {
  await request(`/api/aethreus/mcp/servers/${encodeURIComponent(name)}`, { method: 'DELETE' })
}

export async function testAethreusMcpServer(name: string): Promise<AethreusMcpToolInfo[]> {
  const response = await request<{ ok: boolean; tools: AethreusMcpToolInfo[] }>(`/api/aethreus/mcp/servers/${encodeURIComponent(name)}/test`, { method: 'POST' })
  return response.tools
}

// Backward-compatibility aliases for Ekko
export type EkkoMcpServerConfig = AethreusMcpServerConfig
export type EkkoMcpServerInfo = AethreusMcpServerInfo
export type EkkoMcpToolInfo = AethreusMcpToolInfo
export const fetchEkkoMcpServers = fetchAethreusMcpServers
export const createEkkoMcpServer = createAethreusMcpServer
export const updateEkkoMcpServer = updateAethreusMcpServer
export const setEkkoMcpServerEnabled = setAethreusMcpServerEnabled
export const deleteEkkoMcpServer = deleteAethreusMcpServer
export const testEkkoMcpServer = testAethreusMcpServer

