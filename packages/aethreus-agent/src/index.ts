export * from '../../ekko-agent/dist'
import {
  type EkkoAgentInfo,
  createEkkoAgentInfo,
  AgentRuntime,
  EkkoAgentSetup,
  EkkoAgent,
  type EkkoSession,
  type CreateEkkoSessionInput,
  type UpdateEkkoSessionInput,
  type SetupEkkoAgentOptions,
  type CreateEkkoRuntimeOptions,
  type EkkoProfileDirectoryLayout,
} from '../../ekko-agent/dist'

export interface AethreusAgentInfo {
  name: string
  displayName: string
  packageName: string
}

export function createAethreusAgentInfo(): AethreusAgentInfo {
  return {
    name: 'aethreus-agent',
    displayName: 'Aethreus',
    packageName: 'aethreus-agent',
  }
}

export type AethreusRuntime = AgentRuntime
export const AethreusRuntime = AgentRuntime
export { AgentRuntime as AethreusAgentRuntime }
export type AethreusAgentSetup = EkkoAgentSetup
export const AethreusAgentSetup = EkkoAgentSetup
export type AethreusAgent = EkkoAgent
export const AethreusAgent = EkkoAgent
export type AethreusSession = EkkoSession
export type CreateAethreusSessionInput = CreateEkkoSessionInput
export type UpdateAethreusSessionInput = UpdateEkkoSessionInput
export type SetupAethreusAgentOptions = SetupEkkoAgentOptions
export type CreateAethreusRuntimeOptions = CreateEkkoRuntimeOptions
export type AethreusProfileDirectoryLayout = EkkoProfileDirectoryLayout
