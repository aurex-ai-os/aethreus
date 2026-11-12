import { isHermesAgentAvailable } from '../modules/studio/public/agent-status-registry'
import { configurePrimaryAgentOps } from '../modules/studio/public/agent-ops'
import {
  AgentBridgeClient,
  getAgentBridgeManager,
} from '../modules/hermes/services/bridge'

configurePrimaryAgentOps({
  getBridgeRuntimeState: () => getAgentBridgeManager().getRuntimeState(),
  pingBridge: async endpoint => {
    if (!isHermesAgentAvailable()) {
      return {}
    }
    return (
      await new AgentBridgeClient({ endpoint, timeoutMs: 2000, connectRetryMs: 0 }).ping()
    ) as Record<string, unknown>
  },
})
