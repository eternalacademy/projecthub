import { describe, it, expect, vi, beforeEach } from 'vitest'

// Shared mock
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const chainable: Record<string, any> = {}

const makeChainable = () => {
  const methods = ['select', 'insert', 'eq', 'order', 'single', 'delete', 'update']
  for (const m of methods) {
    chainable[m] = vi.fn().mockReturnValue(chainable)
  }
  return chainable
}

makeChainable()
mockFrom.mockReturnValue(chainable)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

describe('Tasks API - POST /api/projects/[id]/tasks', () => {
  let POST: any
  beforeEach(async () => {
    vi.clearAllMocks()
    makeChainable()
    mockFrom.mockReturnValue(chainable)
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mod = await import('@/app/api/projects/[id]/tasks/route')
    POST = mod.POST
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'Task 1' }) }),
      { params: Promise.resolve({ id: 'p1' }) }
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Mock project ownership check
    chainable.single.mockResolvedValueOnce({ data: { id: 'p1' }, error: null })

    const res = await POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) }),
      { params: Promise.resolve({ id: 'p1' }) }
    )
    expect(res.status).toBe(400)
  })
})

describe('Notes API - POST /api/projects/[id]/notes', () => {
  let POST: any
  beforeEach(async () => {
    vi.clearAllMocks()
    makeChainable()
    mockFrom.mockReturnValue(chainable)
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mod = await import('@/app/api/projects/[id]/notes/route')
    POST = mod.POST
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'Note 1', content: 'content' }) }),
      { params: Promise.resolve({ id: 'p1' }) }
    )
    expect(res.status).toBe(401)
  })
})
