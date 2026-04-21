import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create a self-referencing chainable proxy that can resolve at any terminal method
function createSupabaseMock(resolves: Record<string, any> = {}) {
  const chain: any = new Proxy({}, {
    get(_, prop: string) {
      if (prop in resolves) return resolves[prop]
      // Every method call returns the chain itself (for chaining)
      return (..._args: any[]) => chain
    },
  })
  return chain
}

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const { GET, POST } = await import('@/app/api/projects/route')

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(createSupabaseMock())
  })

  describe('GET /api/projects', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await GET()
      expect(res.status).toBe(401)
      expect((await res.json()).error).toBe('Unauthorized')
    })

    it('queries ph_projects table', async () => {
      // The chain returns itself for all methods, so order() returns chain, which is not a promise
      // We need order to return a resolved promise
      mockFrom.mockReturnValue(createSupabaseMock({
        order: () => Promise.resolve({ data: [], error: null }),
      }))
      const res = await GET()
      expect(mockFrom).toHaveBeenCalledWith('ph_projects')
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/projects', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await POST(new Request('http://localhost', {
        method: 'POST', body: JSON.stringify({ name: 'Test' }),
      }))
      expect(res.status).toBe(401)
    })

    it('returns 400 when name is missing', async () => {
      const res = await POST(new Request('http://localhost', {
        method: 'POST', body: JSON.stringify({}),
      }))
      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe('Name required')
    })

    it('queries ph_projects and ph_timeline tables', async () => {
      let tables: string[] = []
      mockFrom.mockImplementation((table: string) => {
        tables.push(table)
        if (table === 'ph_projects') {
          return createSupabaseMock({
            single: () => Promise.resolve({ data: { id: 'p1', name: 'Test' }, error: null }),
          })
        }
        return createSupabaseMock({
          insert: () => Promise.resolve({ error: null }),
        })
      })

      const res = await POST(new Request('http://localhost', {
        method: 'POST', body: JSON.stringify({ name: 'New Project' }),
      }))
      expect(res.status).toBe(201)
      expect(tables).toContain('ph_projects')
      expect(tables).toContain('ph_timeline')
    })
  })
})
