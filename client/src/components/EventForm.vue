<template>
  <div class="event-form-card">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="content">
          <span class="label-icon">📄</span>
          内容
        </label>
        <textarea
          id="content"
          v-model="formData.content"
          placeholder="请输入事件详细内容"
          rows="6"
          required
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date">
            <span class="label-icon">📅</span>
            日期
          </label>
          <input
            id="date"
            v-model="formData.date"
            type="date"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label>
          <span class="label-icon">🕐</span>
          时段
        </label>
        <div class="time-period-tags">
          <button
            v-for="period in timePeriods"
            :key="period"
            type="button"
            :class="['time-tag', { active: formData.timePeriod === period }]"
            @click="formData.timePeriod = period"
          >
            {{ period }}
          </button>
        </div>
      </div>

      <button type="submit" class="submit-btn">
        ➕ 添加事件
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'

const emit = defineEmits(['add-event'])

// 时段选项
const timePeriods = ['清晨', '早上', '中午', '午后', '傍晚', '晚上', '深夜']

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDate = () => {
  return dayjs().format('YYYY-MM-DD')
}

// 根据当前时间自动选择时段
const getCurrentTimePeriod = () => {
  const now = dayjs()
  const hour = now.hour()
  const minute = now.minute()
  const totalMinutes = hour * 60 + minute
  
  if (totalMinutes >= 0 && totalMinutes < 9 * 60) {
    // 0:00 - 8:59
    return '清晨'
  } else if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60 + 31) {
    // 9:00 - 11:30
    return '早上'
  } else if (totalMinutes >= 11 * 60 + 31 && totalMinutes < 13 * 60) {
    // 11:31 - 12:59
    return '中午'
  } else if (totalMinutes >= 13 * 60 && totalMinutes < 17 * 60) {
    // 13:00 - 16:59
    return '午后'
  } else if (totalMinutes >= 17 * 60 && totalMinutes < 19 * 60) {
    // 17:00 - 18:59
    return '傍晚'
  } else if (totalMinutes >= 19 * 60 && totalMinutes < 22 * 60) {
    // 19:00 - 21:59
    return '晚上'
  } else {
    // 22:00 - 23:59
    return '深夜'
  }
}

const formData = ref({
  content: '',
  date: getTodayDate(),
  timePeriod: getCurrentTimePeriod(),
  location: '',
  image: ''
})

// 时段到时间的映射
const timePeriodMap = {
  '清晨': '06:00',
  '早上': '10:00',
  '中午': '12:00',
  '午后': '15:00',
  '傍晚': '18:00',
  '晚上': '20:00',
  '深夜': '23:00'
}

const handleSubmit = () => {
  // 将日期和时段合并为时间戳
  const timeStr = timePeriodMap[formData.value.timePeriod] || '12:00'
  const time = `${formData.value.date}T${timeStr}`
  
  // 从内容首行提取标题，或使用日期作为标题
  const contentLines = formData.value.content.trim().split('\n')
  const title = contentLines[0].substring(0, 30) || `${formData.value.date} 事件`
  
  emit('add-event', {
    title: title,
    period: formData.value.timePeriod,
    content: formData.value.content,
    event_time: time,
    location: '',
    image: ''
  })
  
  formData.value = {
    content: '',
    date: getTodayDate(),
    timePeriod: getCurrentTimePeriod(),
    location: '',
    image: ''
  }
}
</script>

<style scoped>
.event-form-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
}

.label-icon {
  margin-right: 0.3rem;
}

input, textarea, select {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
  background-color: white;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea {
  resize: vertical;
}

.time-period-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.time-tag {
  padding: 0.6rem 1.2rem;
  background: #f5f7fa;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.time-tag:focus {
  outline: none;
}

.time-tag:active {
  transform: scale(0.98);
}

.time-tag:hover {
  background: #e8ebf0;
  border-color: #667eea;
  color: #667eea;
}

.time-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}


</style>
