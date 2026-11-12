import { request } from '@/api/client'

export type AethreusReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
export type AethreusReasoningSummary = 'auto' | 'concise' | 'detailed'
export type AethreusCodeExecLanguage = 'node' | 'python'

export interface AethreusSettingsConfig {
  runtime: {
    maxSteps: number
    maxModelRetries: number
    toolFailureRecoveryThreshold: number
    /** @deprecated Retained for older config files. */
    maxConsecutiveToolFailures: number
  }
  model: {
    defaultProvider: string
    defaultModel: string
    requestTimeoutMs: number
    temperature: number | null
    maxTokens: number | null
    reasoningEffort: AethreusReasoningEffort
    reasoningSummary: AethreusReasoningSummary
    authorizationRefreshLeewayMs: number
  }
  tools: {
    enabled: boolean
    executionTimeoutMs: number
    computerUse: {
      enabled: boolean
      timeoutMs: number
    }
    approvals: {
      enabled: boolean
      timeoutMs: number
      permanentAllow: string[]
    }
    codeExec: {
      enabled: boolean
      languages: AethreusCodeExecLanguage[]
      timeoutMs: number
      maxToolCalls: number
      maxOutputBytes: number
      maxStderrBytes: number
      maxSourceBytes: number
    }
  }
  mcp: { enabled: boolean }
  delegation: {
    backgroundEnabled: boolean
    subtaskMaxSteps: number
  }
  compression: {
    enabled: boolean
    threshold: number
    targetRatio: number
    protectLastN: number
    protectFirstN: number
  }
  memory: {
    enabled: boolean
    recentMessageLimit: number
    automaticRecallTokenBudget: number
    searchResultLimit: number
  }
  skills: {
    enabled: boolean
    reviewEveryToolCalls: number
  }
  logging: { maxBytes: number }
  prompt: { instructions: string[] }
}

export interface AethreusSettingsProvider {
  id: string
  label: string
  defaultModel: string
  models: string[]
  authorizationConfigured: boolean
}

export interface AethreusSettingsSnapshot {
  schemaVersion: number
  configPath: string
  config: AethreusSettingsConfig
  providers: AethreusSettingsProvider[]
  runtimeRefresh?: { refreshed: number; deferred: number }
}

export async function fetchAethreusSettings(): Promise<AethreusSettingsSnapshot> {
  return request<AethreusSettingsSnapshot & { ok: boolean }>('/api/aethreus/config')
}

export async function saveAethreusSettings(config: AethreusSettingsConfig): Promise<AethreusSettingsSnapshot> {
  return request<AethreusSettingsSnapshot & { ok: boolean }>('/api/aethreus/config', {
    method: 'PUT',
    body: JSON.stringify({ config }),
  })
}

// Backward-compatibility aliases for Ekko
export type EkkoReasoningEffort = AethreusReasoningEffort
export type EkkoReasoningSummary = AethreusReasoningSummary
export type EkkoCodeExecLanguage = AethreusCodeExecLanguage
export type EkkoSettingsConfig = AethreusSettingsConfig
export type EkkoSettingsProvider = AethreusSettingsProvider
export type EkkoSettingsSnapshot = AethreusSettingsSnapshot
export const fetchEkkoSettings = fetchAethreusSettings
export const saveEkkoSettings = saveAethreusSettings

