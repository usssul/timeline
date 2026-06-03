/**
 * @vitest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ImportData from '../ImportData.vue'

// Mock the API module
vi.mock('../../api/index.js', () => ({
  importEvents: vi.fn().mockResolvedValue({ imported: 1 }),
}))

// Mock fetch for example.txt
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  text: () => Promise.resolve(''),
})

describe('ImportData.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(ImportData)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows import textarea and button', () => {
    const wrapper = mount(ImportData)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.text()).toContain('开始导入')
  })
})
