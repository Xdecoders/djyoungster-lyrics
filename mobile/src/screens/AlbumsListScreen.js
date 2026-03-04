import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { getAlbums } from '../api'
import AlbumCard from '../components/AlbumCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing } from '../config/theme'

export default function AlbumsListScreen({ navigation }) {
  const [albums, setAlbums] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (pg = 1) => {
    try {
      const res = await getAlbums({ page: pg, limit: 18 })
      if (pg === 1) setAlbums(res.albums || [])
      else setAlbums(prev => [...prev, ...(res.albums || [])])
      setHasMore(pg < (res.pagination?.totalPages || 1))
      setPage(pg)
    } catch { setError('Failed to load') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => { fetchData(1) }, [])

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} onRetry={() => fetchData(1)} /></View>

  return (
    <FlatList
      style={styles.screen}
      data={albums}
      numColumns={2}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.grid}
      onEndReached={() => { if (!hasMore || loadingMore) return; setLoadingMore(true); fetchData(page + 1) }}
      onEndReachedThreshold={0.3}
      renderItem={({ item }) => (
        <AlbumCard
          album={item}
          onPress={() => navigation.navigate('Album', { slug: item.slug, title: item.title })}
          style={{ width: '47%', margin: '1.5%' }}
        />
      )}
      ListFooterComponent={() => loadingMore ? <Loader style={{ paddingVertical: 20 }} /> : <View style={{ height: 32 }} />}
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  grid: { padding: spacing.md },
})
