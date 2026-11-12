import { request } from '@/api/client'
import type { ExternalDirEntry, SkillFileEntry, SkillSource } from '@/api/hermes/skills'

export interface AethreusSkillSummary {
  name: string
  description: string
  category: string
  source: Exclude<SkillSource, 'hub'>
  sourcePath?: string
  enabled: boolean
  managedByAethreus: boolean
  builtIn: boolean
}

export interface AethreusSkillDetail extends AethreusSkillSummary {
  content: string
}

export async function fetchAethreusSkills(query = ''): Promise<AethreusSkillSummary[]> {
  const suffix = query ? `?query=${encodeURIComponent(query)}` : ''
  const response = await request<{ ok: boolean; skills: AethreusSkillSummary[] }>(`/api/aethreus/skills${suffix}`)
  return response.skills
}

export async function fetchAethreusSkill(name: string): Promise<AethreusSkillDetail> {
  const response = await request<{ ok: boolean; skill: AethreusSkillDetail }>(`/api/aethreus/skills/${encodeURIComponent(name)}`)
  return response.skill
}

export async function createAethreusSkill(input: {
  name: string
  content: string
  category?: string
}): Promise<AethreusSkillDetail> {
  const response = await request<{ ok: boolean; skill: AethreusSkillDetail }>('/api/aethreus/skills', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.skill
}

export async function updateAethreusSkill(name: string, content: string): Promise<AethreusSkillDetail> {
  const response = await request<{ ok: boolean; skill: AethreusSkillDetail }>(`/api/aethreus/skills/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
  return response.skill
}

export async function deleteAethreusSkill(name: string): Promise<void> {
  await request(`/api/aethreus/skills/${encodeURIComponent(name)}`, { method: 'DELETE' })
}

export async function toggleAethreusSkill(name: string, enabled: boolean): Promise<void> {
  await request(`/api/aethreus/skills/${encodeURIComponent(name)}/toggle`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  })
}

export async function importAethreusSkill(input: {
  repoUrl: string
  branch?: string
  skillPath?: string
}): Promise<{ ok: boolean; imported: string[]; count: number }> {
  return request('/api/aethreus/skills/import', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchAethreusSkillFiles(name: string): Promise<SkillFileEntry[]> {
  const response = await request<{ ok: boolean; files: SkillFileEntry[] }>(
    `/api/aethreus/skills/${encodeURIComponent(name)}/files`,
  )
  return response.files
}

export async function fetchAethreusSkillFileContent(name: string, path: string): Promise<string> {
  const response = await request<{ ok: boolean; content: string }>(
    `/api/aethreus/skills/${encodeURIComponent(name)}/file?path=${encodeURIComponent(path)}`,
  )
  return response.content
}

export async function fetchAethreusSkillExternalDirectories(): Promise<ExternalDirEntry[]> {
  const response = await request<{ ok: boolean; directories: ExternalDirEntry[] }>(
    '/api/aethreus/skills/external-directories',
  )
  return response.directories
}

export async function saveAethreusSkillExternalDirectories(directories: ExternalDirEntry[]): Promise<void> {
  await request('/api/aethreus/skills/external-directories', {
    method: 'PUT',
    body: JSON.stringify({ directories }),
  })
}

// Backward-compatibility aliases for Ekko
export type EkkoSkillSummary = AethreusSkillSummary
export type EkkoSkillDetail = AethreusSkillDetail
export const fetchEkkoSkills = fetchAethreusSkills
export const fetchEkkoSkill = fetchAethreusSkill
export const createEkkoSkill = createAethreusSkill
export const updateEkkoSkill = updateAethreusSkill
export const deleteEkkoSkill = deleteAethreusSkill
export const toggleEkkoSkill = toggleAethreusSkill
export const importEkkoSkill = importAethreusSkill
export const fetchEkkoSkillFiles = fetchAethreusSkillFiles
export const fetchEkkoSkillFileContent = fetchAethreusSkillFileContent
export const fetchEkkoSkillExternalDirectories = fetchAethreusSkillExternalDirectories
export const saveEkkoSkillExternalDirectories = saveAethreusSkillExternalDirectories

