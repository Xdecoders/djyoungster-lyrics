import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { getGenre } from '../api'
import { SongCardHorizontal } from '../components/SongCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing } from '../config/theme'

export default function GenreScreen({ route, navigation }) {
  const { slug, name } = route.params
  const [genre, setGenre] = useState(null)
  const [songs, setSongs] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (pg = 1) => {
    try {
      setError(null)
      const res = await getGenre(slug, { page: pg, limit: 20, sort: 'popular' })
      setGenre(res.genre)
      if (pg === 1) setSongs(res.songs || [])
      else setSongs(prev => [...prev, ...(res.songs || [])])
      setHasMore(res.pagination?.hasMore || false)
      setPage(pg)
    } catch { setError('Failed to load') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [slug])

  useEffect(() => { fetchData(1) }, [])

  const loadMore = () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    fetchData(page + 1)
  }

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} onRetry={() => fetchData(1)} /></View>

  return (
    <FlatList
      style={styles.screen}
      data={songs}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.title}>{genre?.name || name}</Text>
          {genre?.description && <Text style={styles.desc}>{genre.description}</Text>}
          <Text style={styles.count}>{genre?.totalSongs} songs</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <SongCardHorizontal song={item} onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })} />
      )}
      ListFooterComponent={() => loadingMore ? <Loader style={{ paddingVertical: 20 }} /> : <View style={{ height: 32 }} />}
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingTop: spacing.xxl, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: spacing.sm },
  title: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: 4 },
  desc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 22 },
  count: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.primary },
})
