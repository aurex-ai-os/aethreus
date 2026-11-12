import type { ChatCodingAgentId, CodingAgentApiMode } from '@/api/coding-agents'
import type { AvailableModelGroup } from '@/api/hermes/system'
import type { ProviderApiMode } from '@/api/studio/provider-api-mode'

export function providerModelApiMode(group?: AvailableModelGroup, model = ''): ProviderApiMode | undefined {
  return (group?.api_mode_by_model ? group.api_mode_by_model[model] : group?.api_mode) ?? undefined
}

/** An absent/unsupported mode keeps the existing manual protocol selection available. */
export function configuredProviderApiMode(group?: AvailableModelGroup, model = ''): CodingAgentApiMode | undefined {
  const value = providerModelApiMode(group, model)
  return value === 'chat_completions' || value === 'codex_responses' || value === 'anthropic_messages' ? value : undefined
}

const SCOPED_EXTERNAL_AGENT_AUTH_PROVIDERS = new Set([
  'openai-codex',
  'copilot',
  'xai-oauth',
  'qwen-oauth',
  'nous',
  'claude-oauth',
  'minimax-oauth',
])

export function isAuthModelProvider(provider?: string): boolean {
  return SCOPED_EXTERNAL_AGENT_AUTH_PROVIDERS.has(String(provider || '').trim().toLowerCase())
}

export function isAethreusAgent(agent?: string | null): boolean {
  const a = String(agent || '').trim().toLowerCase()
  return a === 'aethreus' || a === 'aethreus-agent' || a === 'ekko' || a === 'ekko-agent' || a === 'ekko_agent'
}

export function canScopedCodingAgentUseProvider(
  agentId: ChatCodingAgentId,
  provider?: string,
): boolean {
  return String(provider || '').trim().toLowerCase() !== 'moa'
    && (isAethreusAgent(agentId) || !isAuthModelProvider(provider))
}

export function usesServerManagedProviderAuth(
  agentId: ChatCodingAgentId,
  provider?: string,
): boolean {
  if (isAethreusAgent(agentId)) return true
  return isAuthModelProvider(provider)
}
