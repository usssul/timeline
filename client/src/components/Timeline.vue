<template>
  <div class="timeline-container">
    <!-- 标题和筛选按钮 -->
    <div class="header-row" v-if="filteredEvents.length">
      <div @click="showFilters = !showFilters" class="timeline-title">
        筛选
        <span class="arrow" :class="{ 'rotated': showFilters }">▼</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div v-show="showFilters" class="filter-bar">
      <div class="filter-row">
        <select v-model="filterYear" class="filter-select">
          <option value="">全部年份</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
        </select>

        <select v-model="filterMonth" class="filter-select" :disabled="!filterYear">
          <option value="">全部月份</option>
          <option v-for="month in 12" :key="month" :value="month">{{ month }}月</option>
        </select>

        <select v-model="filterDay" class="filter-select" :disabled="!filterMonth">
          <option value="">全部日期</option>
          <option v-for="day in 31" :key="day" :value="day">{{ day }}日</option>
        </select>

        <input v-model="keyword" type="text" placeholder="搜索关键字..." class="filter-input" />

        <button v-if="filterYear || filterMonth || filterDay || keyword" @click="clearFilters" class="clear-btn">
          🔄 清空筛选
        </button>
      </div>
    </div>

    <n-empty v-if="filteredEvents.length === 0" description="暂无事件记录" class="empty-state">
      <template #extra>
        <div class="empty-extra">
          <p v-if="events.length > 0" class="empty-hint">没有找到匹配的事件，试试调整筛选条件</p>
          <p v-else class="empty-hint">还没有添加任何事件，点击右上角的 ➕ 按钮添加第一个事件吧！</p>
        </div>
      </template>
    </n-empty>

    <div v-else class="timeline">
      <!-- 按年份分组显示 -->
      <div v-for="yearGroup in groupedEvents" :key="yearGroup.year" class="year-group">
        <div class="year-header">{{ yearGroup.year }}年</div>
        <div v-for="event in yearGroup.timelineGroups" :key="event.id" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <n-card :bordered="false" class="event-card">
              <div class="event-header">
                <div class="title-area">
                  <span class="event-title">{{ formatDate(event.event_time) }}</span>
                  <n-tag v-if="event.period" type="primary" size="small" round>
                    {{ event.period }}
                  </n-tag>
                </div>
                <n-button text style="font-size: 1.2rem" @click="handleDeleteEvent(event.id)">
                  🗑️
                </n-button>
              </div>

              <div class="event-content" :class="{ 'truncated': !showFullContent[event.id] }"
                v-html="formatContent(event.content)"></div>

              <!-- 查看详情按钮 -->
              <div v-if="shouldShowToggle(event.content)" class="content-toggle">
                <n-button text type="primary" @click="toggleContent(event.id)" style="color: #999">
                  {{ showFullContent[event.id] ? '收起详情' : '查看详情' }}
                </n-button>
              </div>

              <div v-if="event.image" class="event-image">
                <img :src="event.image" :alt="event.title" />
              </div>
            </n-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  NCard,
  NEmpty,
  NTag
} from 'naive-ui'

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['delete-event'])

// 控制筛选栏显示
const showFilters = ref(false)
// 控制详情显示
const showFullContent = ref({})

// 筛选条件
const filterYear = ref('')
const filterMonth = ref('')
const filterDay = ref('')
const keyword = ref('')

// 获取所有可用的年份
const availableYears = computed(() => {
  const years = new Set()
  props.events.forEach(event => {
    const date = new Date(event.event_time)
    years.add(date.getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
})

// 筛选后的事件列表
const filteredEvents = computed(() => {
  let filtered = props.events

  // 年份筛选
  if (filterYear.value) {
    filtered = filtered.filter(event => {
      const date = new Date(event.event_time)
      return date.getFullYear() === parseInt(filterYear.value)
    })
  }

  // 月份筛选
  if (filterMonth.value) {
    filtered = filtered.filter(event => {
      const date = new Date(event.event_time)
      return date.getMonth() + 1 === parseInt(filterMonth.value)
    })
  }

  // 日期筛选
  if (filterDay.value) {
    filtered = filtered.filter(event => {
      const date = new Date(event.event_time)
      return date.getDate() === parseInt(filterDay.value)
    })
  }

  // 关键字筛选
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(event => {
      return (
        (event.title && event.title.toLowerCase().includes(kw)) ||
        (event.content && event.content.toLowerCase().includes(kw)) ||
        (event.period && event.period.toLowerCase().includes(kw))
      )
    })
  }

  return filtered
})

// 按年份分组的事件列表
const groupedEvents = computed(() => {
  const groups = {}

  filteredEvents.value.forEach(event => {
    const year = new Date(event.event_time).getFullYear()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(event)
  })

  return Object.keys(groups)
    .map(year => parseInt(year))
    .sort((a, b) => b - a)
    .map(year => ({
      year: year,
      timelineGroups: groups[year]
    }))
})

// 清空筛选
const clearFilters = () => {
  filterYear.value = ''
  filterMonth.value = ''
  filterDay.value = ''
  keyword.value = ''
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

// 格式化日期（用于事件显示）
const formatDate = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${month}月${day}日`
}

// 格式化内容，将链接转为a标签
const formatContent = (content) => {
  if (!content) return ''

  // 匹配http/https链接
  const urlRegex = /(https?:\/\/[^\s<]+)/g

  // 将文本中的链接转换为a标签
  let formattedContent = content.replace(urlRegex, '<a href="$1" target="_blank" class="content-link">$1</a>')

  // 保留换行
  formattedContent = formattedContent.replace(/\n/g, '<br>')

  return formattedContent
}

// 处理删除事件
const handleDeleteEvent = (eventId) => {
  if (confirm('确定要删除这个事件吗？')) {
    emit('delete-event', eventId)
  }
}

// 切换内容显示状态
const toggleContent = (eventId) => {
  showFullContent.value[eventId] = !showFullContent.value[eventId]
}

// 判断是否需要显示切换按钮
const shouldShowToggle = (content) => {
  // 创建一个临时元素来计算行数
  const tempDiv = document.createElement('div')
  tempDiv.style.width = '100%'
  tempDiv.style.fontSize = '14px'
  tempDiv.style.lineHeight = '1.8'
  tempDiv.style.visibility = 'hidden'
  tempDiv.style.position = 'absolute'
  tempDiv.style.whiteSpace = 'pre-wrap'
  tempDiv.style.wordWrap = 'break-word'
  tempDiv.textContent = content

  document.body.appendChild(tempDiv)
  const lineHeight = parseInt(window.getComputedStyle(tempDiv).lineHeight)
  const height = tempDiv.offsetHeight
  document.body.removeChild(tempDiv)

  // 如果超过3行则显示切换按钮
  return height > lineHeight * 3
}
</script>

<style scoped>
.timeline-container {
  padding: 0 1rem;
}

/* 标题行 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeline-title {
  margin: 0;
  color: #333;
  font-size: .8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  user-select: none;
}

.arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}

/* 筛选栏样式 */
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-row {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 120px;
  padding: 0.6rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.3s;
  cursor: pointer;
}

.filter-select:hover:not(:disabled) {
  border-color: #667eea;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-input {
  flex: 2;
  min-width: 200px;
  padding: 0.6rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  padding: 0.6rem 1.2rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.clear-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.timeline {
  position: relative;
  padding-left: 0.5rem;
  margin-bottom: 2rem;
}

.year-group {
  margin-bottom: 3rem;
}

.year-header {
  font-size: 1.4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
  position: relative;
}

.year-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}


.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: .5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -1.6rem;
  top: 0;
  width: 1.4rem;
  height: 1.4rem;
  background: white;
  border: 4px solid #667eea;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  z-index: 2;
}

.timeline-content {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.event-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.title-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.event-title {
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.event-content {
  color: #555;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.event-content.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-content :deep(.content-link) {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
  word-break: break-all;
}

.event-content :deep(.content-link:hover) {
  color: #764ba2;
  border-bottom-color: #764ba2;
}

.content-toggle {
  text-align: center;
  margin-top: 1rem;
  cursor: pointer;
}

.content-toggle :deep(.n-button__content) {
  font-weight: 500;
}

.event-image {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s;
}

.event-image:hover img {
  transform: scale(1.02);
}

/* 空状态样式 */
.empty-state {
  margin-top: 2rem;
}

:deep(.empty-state .n-empty__description) {
  font-size: 1.2rem !important;
  color: #667eea !important;
}

.empty-extra {
  text-align: center;
  padding: 1rem;
}

.empty-hint {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* 添加美化样式 */
:deep(.n-card) {
  border-radius: 12px !important;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.n-card:hover) {
  transform: translateX(5px) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

:deep(.n-select) {
  border-radius: 8px !important;
}

:deep(.n-input) {
  border-radius: 8px !important;
}

:deep(.n-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.n-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
}

.header-row {
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.timeline-title {
  text-align: center;
  justify-content: center;
}

.filter-bar {
  padding: 1rem;
}

.filter-row {
  flex-direction: column;
}

.filter-select {
  width: 100%;
  min-width: auto;
}

.filter-input {
  width: 100%;
  min-width: auto;
}

.clear-btn {
  width: 100%;
}

.timeline {
  padding-left: 1.5rem;
}

.year-header {
  font-size: 1.2rem;
}

.event-title {
  font-size: 1.1rem;
}
</style>
