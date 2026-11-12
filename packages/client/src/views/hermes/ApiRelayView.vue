<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import PageLoading from '@/components/common/PageLoading.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import ApiRelayUsageCard from '@/components/hermes/ApiRelayUsageCard.vue'
import { fetchApiRelayUsage, type ApiRelayAccount } from '@/api/hermes/api-relay'

const { t } = useI18n()
const usageLoading = ref(true)
const initialized = ref(false)
const accounts = ref<ApiRelayAccount[]>([])
const loadFailed = ref(false)
const loading = computed(() => !initialized.value)
let requestController: AbortController | undefined

async function loadUsage() {
  if (requestController) return
  const controller = new AbortController()
  requestController = controller
  usageLoading.value = true
  loadFailed.value = false
  try {
    const result = await fetchApiRelayUsage(controller.signal)
    accounts.value = result.accounts
  } catch {
    if (!controller.signal.aborted) loadFailed.value = true
  } finally {
    requestController = undefined
    usageLoading.value = false
    initialized.value = true
  }
}

onMounted(() => { void loadUsage() })
onBeforeUnmount(() => { requestController?.abort() })
</script>

<template>
  <PageLoading :show="loading" initial-only class="api-relay-view">
    <PageHeader>
      <header class="page-header">
        <h2 class="header-title">{{ t('apiRelay.title') }}</h2>
      </header>
    </PageHeader>
    <div class="api-relay-content">
      <section class="api-relay-usage" aria-labelledby="api-relay-usage-heading" :aria-busy="usageLoading">
        <div class="api-relay-usage-header">
          <div>
            <h3 id="api-relay-usage-heading">{{ t('apiRelay.usageTitle') }}</h3>
            <p>{{ t('apiRelay.usageScope') }}</p>
          </div>
          <NButton size="small" secondary :loading="usageLoading" @click="loadUsage">
            {{ t('usage.refresh') }}
          </NButton>
        </div>
        <p v-if="loadFailed" class="api-relay-usage-message" role="status">{{ t('apiRelay.loadFailed') }}</p>
        <div v-else-if="accounts.length" class="api-relay-usage-grid">
          <ApiRelayUsageCard v-for="account in accounts" :key="account.id" :account="account" />
        </div>
        <p v-else-if="initialized" class="api-relay-usage-message" role="status">{{ t('common.noData') }}</p>
      </section>
    </div>
  </PageLoading>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.api-relay-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--theme-content-bg, $bg-main-surface);
}

.api-relay-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: calc(20px * var(--spacing-scale, 1));
  overflow: auto;
  background: linear-gradient(180deg, rgba(var(--accent-primary-rgb), 0.025), transparent 52%);
}

.api-relay-usage {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.api-relay-usage-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(16px * var(--spacing-scale, 1));
  margin-bottom: 16px;

  h3 {
    margin: 0;
    color: $text-primary;
    font-size: calc(var(--font-size-base, 14px) * 16 / 14);
    font-weight: 600;
  }

  p {
    margin: 6px 0 0;
    color: $text-muted;
    font-size: calc(var(--font-size-base, 14px) * 12 / 14);
    line-height: var(--line-height, 1.6);
  }

  :deep(.n-button) {
    flex-shrink: 0;
  }
}

.api-relay-usage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(16px * var(--spacing-scale, 1));
}

.api-relay-usage-message {
  padding: calc(20px * var(--spacing-scale, 1));
  margin: 0;
  color: $text-secondary;
  background: var(--theme-card-bg, $bg-card);
  border: var(--border-width, 1px) solid $border-color;
  border-radius: var(--radius-component, 12px);
  font-size: calc(var(--font-size-base, 14px) * 13 / 14);
}

@media (max-width: $breakpoint-mobile) {
  .api-relay-content {
    padding: calc(12px * var(--spacing-scale, 1));
  }

  .api-relay-usage-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
