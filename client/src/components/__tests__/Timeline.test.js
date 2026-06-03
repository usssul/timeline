/**
 * @vitest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Timeline from '../Timeline.vue'

// Mock Naive UI
vi.mock('naive-ui', () => ({
  NCard: { template: '<div class="mock-card"><slot /></div>', props: ['bordered'] },
  NEmpty: { template: '<div class="mock-empty"><slot name="extra" /></div>', props: ['description'] },
  NTag: { template: '<span class="mock-tag"><slot /></span>', props: ['type', 'size', 'round'] },
  NButton: { template: '<button><slot /></button>', props: ['text', 'type', 'style'] },
}))

describe('Timeline.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(Timeline, {
      props: {
        events: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays events when provided', () => {
    const events = [
      {
        id: 1,
        title: 'Test Event',
        content: 'This is a test event',
        event_time: '2022-12-01T12:00',
        period: '上午',
      }
    ]

    const wrapper = mount(Timeline, {
      props: { events }
    })

    expect(wrapper.text()).toContain('This is a test event')
  })
})
