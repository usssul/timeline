<template>
    <div class="import-section">
        <div class="import-card">
            <p class="import-hint">请粘贴你的大事记数据，或直接使用已加载的示例数据：</p>
            <pre class="format-example">2022年

12月17日深夜
王力宏前妻李靓蕾微博发长文控诉...

12月19日
腾讯音乐娱乐集团...</pre>
            <p class="import-hint-small">默认已加载示例数据，可直接点击“开始导入”按钮</p>
            <textarea v-model="importText" placeholder="请粘贴大事记数据..." rows="15" class="import-textarea"></textarea>
            <div class="import-actions">
                <button @click="handleImport" class="import-btn">📥 开始导入</button>
                <button @click="clearAllData" class="clear-btn">🗑️ 清空所有数据</button>
            </div>
            <p v-if="importMessage" :class="['import-message', importSuccess ? 'success' : 'error']">
                {{ importMessage }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { importEvents } from '../api/index.js'

const emit = defineEmits(['import-success', 'clear-all'])

const importText = ref('')
const importMessage = ref('')
const importSuccess = ref(false)

// 加载示例数据
const loadExampleData = async () => {
  try {
    const response = await fetch('/example.txt')
    if (response.ok) {
      const text = await response.text()
      importText.value = text
    }
  } catch (error) {
    console.warn('Failed to load example data:', error)
  }
}

// 组件挂载时加载示例数据
onMounted(() => {
  loadExampleData()
})

// 处理导入（直接发送文本到后端解析）
const handleImport = async () => {
  if (!importText.value.trim()) {
    importMessage.value = '请输入要导入的数据'
    importSuccess.value = false
    return
  }

  try {
    const result = await importEvents(importText.value)
    importMessage.value = `成功导入 ${result.imported} 条事件！`
    importSuccess.value = true
    importText.value = ''
    emit('import-success')

    setTimeout(() => {
      importMessage.value = ''
    }, 3000)
  } catch (error) {
    importMessage.value = `导入失败：${error.message}`
    importSuccess.value = false
  }
}

// 清空所有数据
const clearAllData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    emit('clear-all')
    importMessage.value = '已清空所有数据'
    importSuccess.value = true
    setTimeout(() => {
      importMessage.value = ''
    }, 2000)
  }
}
</script>

<style scoped>
.import-section {
    max-width: 800px;
    margin: 0 auto;
}

.import-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.import-card h2 {
    color: #667eea;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.import-hint {
    color: #666;
    margin-bottom: 1rem;
}

.import-hint-small {
    color: #888;
    font-size: 0.85rem;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
    text-align: center;
}

.format-example {
    background: #f5f7fa;
    padding: 1rem;
    border-radius: 8px;
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    overflow-x: auto;
}

.import-textarea {
    width: 100%;
    max-width: 100%;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 1rem;
    box-sizing: border-box;
}

.import-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.import-actions {
    display: flex;
    gap: 1rem;
}

.import-btn {
    flex: 1;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
}

.import-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.clear-btn {
    padding: 1rem 2rem;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
}

.clear-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 71, 87, 0.4);
}

.import-message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
}

.import-message.success {
    background: #d4edda;
    color: #155724;
}

.import-message.error {
    background: #f8d7da;
    color: #721c24;
}

</style>
