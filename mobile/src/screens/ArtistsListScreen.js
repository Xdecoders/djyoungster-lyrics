import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Text } from 'react-native'
import { getArtists } from '../api'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

export default function ArtistsListScreen({ navigation }) {
  const [artists, setArtists] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (pg = 1) => {
    try {
      const res = await getArtists({ page: pg, limit: 24, sort: 'popular' })
      if (pg === 1) setArtists(res.artists || [])
      else setArtists(prev => [...prev, ...(res.artists || [])])
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
      data={artists}
      numColumns={3}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.grid}
      onEndReached={() => { if (!hasMore || loadingMore) return; setLoadingMore(true); fetchData(page + 1) }}
      onEndReachedThreshold={0.3}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Artist', { slug: item.slug, name: item.name })}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.imageUrl || item.thumbnail || 'https://djyoungster.com/default-artist.jpg' }} style={styles.img} />
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.count}>{item._count?.songs || 0} songs</Text>
        </TouchableOpacity>
      )}
      ListFooterComponent={() => loadingMore ? <Loader style={{ paddingVertical: 20 }} /> : <View style={{ height: 32 }} />}
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  grid: { padding: spacing.md },
  item: { flex: 1, margin: spacing.xs, alignItems: 'center', paddingVertical: spacing.md },
  img: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bgCard2, marginBottom: spacing.sm },
  name: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.text, textAlign: 'center' },
  count: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
})
