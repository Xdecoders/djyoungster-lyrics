'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BlogPostForm } from '../add/page'

export default function AdminBlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    const res = await fetch(`/api/admin/blog/${params.id}`, { headers: authHeaders() })
    if (res.ok) {
      setInitialData(await res.json())
    } else {
      router.push('/admin/blog')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return <BlogPostForm mode="edit" initialData={initialData} postId={params.id} />
}
