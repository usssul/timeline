<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <!-- 未登录：显示登录/注册页 -->
    <template v-if="!auth.isLoggedIn">
      <router-view />
    </template>

    <!-- 已登录：主界面 -->
    <n-layout v-else class="timeline-app">
      <n-layout-header class="app-header">
        <div class="header-top">
          <h1>📱 事件时间线</h1>
        </div>
        <div class="header-actions">
          <n-button circle @click="showAddModal = true" title="添加事件" secondary size="small">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button circle @click="showImportModal = true" title="导入数据" secondary size="small">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button circle @click="downloadTimeline" title="下载数据" secondary size="small">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button circle @click="handleLogout" title="退出登录" secondary size="small">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <Timeline :events="sortedEvents" @delete-event="deleteEvent" />
      </n-layout-content>

      <n-modal v-model:show="showAddModal" preset="card" title="➕ 添加事件" :bordered="false" style="max-width: 800px">
        <EventForm @add-event="handleAddEvent" />
      </n-modal>

      <n-modal v-model:show="showImportModal" preset="card" title="📥 导入数据" :bordered="false" style="max-width: 800px">
        <ImportData @import-success="handleImportSuccess" @clear-all="handleClearAll" />
      </n-modal>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NButton,
  NIcon,
  NSpace,
  NModal
} from 'naive-ui'
import { useAuthStore } from './stores/auth.js'
import { fetchEvents, createEvent, deleteEvent as apiDeleteEvent, exportEvents } from './api/index.js'
import EventForm from './components/EventForm.vue'
import Timeline from './components/Timeline.vue'
import ImportData from './components/ImportData.vue'

const auth = useAuthStore()
const router = useRouter()

const showAddModal = ref(false)
const showImportModal = ref(false)
const events = ref([])

const themeOverrides = {
  common: {
    primaryColor: '#667eea',
    primaryColorHover: '#764ba2',
    primaryColorPressed: '#5568d3'
  }
}

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const timeA = new Date(a.event_time).getTime()
    const timeB = new Date(b.event_time).getTime()
    return timeB - timeA
  })
})

async function loadEvents() {
  try {
    const data = await fetchEvents()
    events.value = data.events
  } catch (e) {
    console.error('加载事件失败:', e)
  }
}

async function handleAddEvent(event) {
  try {
    await createEvent(event)
    showAddModal.value = false
    await loadEvents()
  } catch (e) {
    console.error('添加事件失败:', e)
  }
}

async function deleteEvent(id) {
  try {
    await apiDeleteEvent(id)
    await loadEvents()
  } catch (e) {
    console.error('删除事件失败:', e)
  }
}

async function handleImportSuccess() {
  showImportModal.value = false
  await loadEvents()
}

async function handleClearAll() {
  events.value = []
}

async function downloadTimeline() {
  try {
    await exportEvents()
  } catch (e) {
    console.error('导出失败:', e)
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

// 登录后自动刷新事件列表
watch(() => auth.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    await loadEvents()
  }
}, { immediate: true })
</script>

<style scoped>
.timeline-app {
  max-width: 1000px;
  margin: 0 auto;
  background: transparent;
  padding: 0 1rem;
  background-color: #fff;
}

.app-header {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.15);
}

.header-top h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.content {
  padding: 0;
}

:deep(.n-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.n-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3) !important;
}
</style>
