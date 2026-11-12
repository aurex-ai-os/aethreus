import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  AethreusRuntime,
  createAethreusAgentInfo,
  createEkkoAgentInfo,
  AethreusAgent,
  setupAethreusAgent,
  AethreusDirectoryManager,
} from '../../packages/aethreus-agent/src'

describe('aethreus-agent package exports', () => {
  it('creates canonical AethreusAgentInfo', () => {
    const info = createAethreusAgentInfo()
    expect(info.name).toBe('aethreus-agent')
    expect(info.displayName).toBe('Aethreus')
    expect(info.packageName).toBe('aethreus-agent')
  })

  it('preserves legacy createEkkoAgentInfo', () => {
    const info = createEkkoAgentInfo()
    expect(info.name).toBe('ekko-agent')
    expect(info.displayName).toBe('Aethreus')
  })

  it('exports AethreusRuntime constructor', () => {
    expect(typeof AethreusRuntime).toBe('function')
  })

  it('exports AethreusAgent and setupAethreusAgent', () => {
    expect(typeof AethreusAgent).toBe('function')
    expect(typeof setupAethreusAgent).toBe('function')
  })

  it('resolves directory layout and respects environment overrides', () => {
    const testBase = join(tmpdir(), 'aethreus-test-' + Date.now())
    const dm = new AethreusDirectoryManager(testBase)
    expect(dm.baseDirectory).toBe(testBase)
    expect(dm.databasePath).toBeDefined()

    const customHome = join(tmpdir(), 'aethreus-custom-' + Date.now())
    process.env.AETHREUS_HOME = customHome
    const dmEnv = new AethreusDirectoryManager(testBase)
    expect(dmEnv.rootDirectory).toBe(customHome)
    delete process.env.AETHREUS_HOME
  })
})
