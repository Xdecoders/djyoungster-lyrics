import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { discoverSongUrls } from '@/lib/scrapers/sitemap'
import { scrapeAndSaveSong } from '@/lib/scrapers/bulk-processor'

// GET - List all bulk imports
export async function GET() {
  try {
    const imports = await prisma.bulkImport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { urls: true }
        }
      }
    })
    return NextResponse.json(imports)
  } catch (error) {
    console.error('Bulk import list error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// POST - Perform actions on bulk imports
export async function POST(request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'discover':
        return handleDiscover(body)
      case 'add-urls':
        return handleAddUrls(body)
      case 'process-next':
        return handleProcessNext(body)
      case 'pause':
        return handlePause(body)
      case 'resume':
        return handleResume(body)
      case 'delete':
        return handleDelete(body)
      case 'retry-failed':
        return handleRetryFailed(body)
      default:
        return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk import action error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// Discover URLs from sitemap
async function handleDiscover({ site }) {
  if (!site) {
    return NextResponse.json({ message: 'site is required' }, { status: 400 })
  }

  // Create the import record
  const bulkImport = await prisma.bulkImport.create({
    data: { site, status: 'discovering' }
  })

  try {
    const urls = await discoverSongUrls(site)

    if (urls.length === 0) {
      await prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: { status: 'completed', totalUrls: 0 }
      })
      return NextResponse.json({ importId: bulkImport.id, totalUrls: 0 })
    }

    // Batch insert URLs (in chunks to avoid query size limits)
    const chunkSize = 500
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize)
      await prisma.bulkImportUrl.createMany({
        data: chunk.map(url => ({
          importId: bulkImport.id,
          url
        })),
        skipDuplicates: true
      })
    }

    await prisma.bulkImport.update({
      where: { id: bulkImport.id },
      data: { status: 'pending', totalUrls: urls.length }
    })

    return NextResponse.json({ importId: bulkImport.id, totalUrls: urls.length })
  } catch (error) {
    await prisma.bulkImport.update({
      where: { id: bulkImport.id },
      data: { status: 'completed' }
    })
    return NextResponse.json({ message: `Discovery failed: ${error.message}` }, { status: 500 })
  }
}

// Add URLs manually (for Genius)
async function handleAddUrls({ site, urls }) {
  if (!site || !urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ message: 'site and urls[] are required' }, { status: 400 })
  }

  // Filter valid URLs
  const validUrls = urls.filter(u => {
    try { new URL(u); return true } catch { return false }
  })

  if (validUrls.length === 0) {
    return NextResponse.json({ message: 'No valid URLs provided' }, { status: 400 })
  }

  const bulkImport = await prisma.bulkImport.create({
    data: { site, status: 'pending', totalUrls: validUrls.length }
  })

  await prisma.bulkImportUrl.createMany({
    data: validUrls.map(url => ({
      importId: bulkImport.id,
      url: url.trim()
    })),
    skipDuplicates: true
  })

  return NextResponse.json({ importId: bulkImport.id, totalUrls: validUrls.length })
}

// Process next pending URL in an import
async function handleProcessNext({ importId }) {
  if (!importId) {
    return NextResponse.json({ message: 'importId is required' }, { status: 400 })
  }

  const bulkImport = await prisma.bulkImport.findUnique({ where: { id: importId } })
  if (!bulkImport) {
    return NextResponse.json({ message: 'Import not found' }, { status: 404 })
  }

  if (bulkImport.status === 'paused') {
    return NextResponse.json({ status: 'paused', message: 'Import is paused' })
  }

  // Set to running if pending
  if (bulkImport.status === 'pending') {
    await prisma.bulkImport.update({
      where: { id: importId },
      data: { status: 'running' }
    })
  }

  // Get next pending URL
  const nextUrl = await prisma.bulkImportUrl.findFirst({
    where: { importId, status: 'pending' },
    orderBy: { createdAt: 'asc' }
  })

  if (!nextUrl) {
    // All done
    await prisma.bulkImport.update({
      where: { id: importId },
      data: { status: 'completed' }
    })
    return NextResponse.json({ status: 'completed', message: 'All URLs processed' })
  }

  // Process this URL
  const result = await scrapeAndSaveSong(nextUrl.url)

  // Update the URL record
  await prisma.bulkImportUrl.update({
    where: { id: nextUrl.id },
    data: {
      status: result.status,
      songId: result.songId || null,
      error: result.reason || null
    }
  })

  // Update import counters
  const updateData = {}
  if (result.status === 'scraped') updateData.scraped = { increment: 1 }
  if (result.status === 'failed') updateData.failed = { increment: 1 }
  if (result.status === 'skipped') updateData.skipped = { increment: 1 }

  const updatedImport = await prisma.bulkImport.update({
    where: { id: importId },
    data: updateData
  })

  // Check if all done
  const pendingCount = await prisma.bulkImportUrl.count({
    where: { importId, status: 'pending' }
  })

  if (pendingCount === 0) {
    await prisma.bulkImport.update({
      where: { id: importId },
      data: { status: 'completed' }
    })
  }

  return NextResponse.json({
    status: 'processing',
    processed: {
      url: nextUrl.url,
      result: result.status,
      reason: result.reason || null,
      songId: result.songId || null,
      title: result.title || null
    },
    progress: {
      scraped: updatedImport.scraped,
      failed: updatedImport.failed,
      skipped: updatedImport.skipped,
      total: updatedImport.totalUrls,
      pending: pendingCount - 1
    }
  })
}

// Pause an import
async function handlePause({ importId }) {
  await prisma.bulkImport.update({
    where: { id: importId },
    data: { status: 'paused' }
  })
  return NextResponse.json({ status: 'paused' })
}

// Resume an import
async function handleResume({ importId }) {
  await prisma.bulkImport.update({
    where: { id: importId },
    data: { status: 'running' }
  })
  return NextResponse.json({ status: 'running' })
}

// Delete an import (cascade deletes URLs)
async function handleDelete({ importId }) {
  await prisma.bulkImport.delete({ where: { id: importId } })
  return NextResponse.json({ status: 'deleted' })
}

// Retry failed URLs
async function handleRetryFailed({ importId }) {
  const result = await prisma.bulkImportUrl.updateMany({
    where: { importId, status: 'failed' },
    data: { status: 'pending', error: null }
  })

  // Reset failed counter and set status back to pending
  const bulkImport = await prisma.bulkImport.findUnique({ where: { id: importId } })
  await prisma.bulkImport.update({
    where: { id: importId },
    data: {
      status: 'pending',
      failed: 0
    }
  })

  return NextResponse.json({ status: 'pending', retriedCount: result.count })
}
