import { describe, it, expect, vi, beforeEach } from 'vitest'

function createSupabaseMock(resolves: Record<string, any> = {}) {
  const chain: any = new Proxy({}, {
    get(_, prop: string) {
      if (prop in resolves) return resolves[prop]
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

describe('Project Detail API', () => {
  let GET: any, PATCH: any, DELETE: any
  beforeEach(async () => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(createSupabaseMock())
    const mod = await import('@/app/api/projects/[id]/route')
    GET = mod.GET; PATCH = mod.PATCH; DELETE = mod.DELETE
  })

  describe('GET /api/projects/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'p1' }) })
      expect(res.status).toBe(401)
    })

    it('returns project when found', async () => {
      const mockProject = { id: 'p1', name: 'Test', user_id: 'user-1' }
      mockFrom.mockReturnValue(createSupabaseMock({
        single: () => Promise.resolve({ data: mockProject, error: null }),
      }))
      const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'p1' }) })
      expect(res.status).toBe(200)
      expect((await res.json()).project).toEqual(mockProject)
    })

    it('returns 404 when not found', async () => {
      mockFrom.mockReturnValue(createSupabaseMock({
        single: () => Promise.resolve({ data: null, error: { message: 'Not found' } }),
      }))
      const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'bad' }) })
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/projects/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await DELETE(new Request('http://localhost'), { params: Promise.resolve({ id: 'p1' }) })
      expect(res.status).toBe(401)
    })

    it('deletes successfully', async () => {
      // .delete().eq().eq() — the second eq resolves
      mockFrom.mockReturnValue(createSupabaseMock({
        eq: () => createSupabaseMock({
          eq: () => Promise.resolve({ error: null }),
        }),
      }))
      const res = await DELETE(new Request('http://localhost'), { params: Promise.resolve({ id: 'p1' }) })
      expect(res.status).toBe(200)
      expect((await res.json()).success).toBe(true)
    })
  })
})
