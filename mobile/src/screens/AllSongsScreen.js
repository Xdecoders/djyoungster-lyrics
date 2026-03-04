import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { getSongs } from '../api'
import { SongCardHorizontal } from '../components/SongCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

const SORTS = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'alphabetical', label: 'A–Z' },
]

export default function AllSongsScreen({ route, navigation }) {
  const { sort: initSort = 'latest', title: screenTitle = 'All Songs' } = route.params || {}
  const [songs, setSongs] = useState([])
  const [sort, setSort] = useState(initSort)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (pg = 1, s = sort) => {
    try {
      setError(null)
      const res = await getSongs({ page: pg, limit: 20, sort: s })
      if (pg === 1) setSongs(res.songs || [])
      else setSongs(prev => [...prev, ...(res.songs || [])])
      setHasMore(pg < (res.pagination?.totalPages || 1))
      setPage(pg)
    } catch { setError('Failed to load songs') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [sort])

  useEffect(() => { fetchData(1) }, [sort])

  const changeSort = (s) => { setSort(s); setLoading(true) }
  const loadMore = () => { if (!hasMore || loadingMore) return; setLoadingMore(true); fetchData(page + 1) }

  return (
    <View style={styles.screen}>
      {/* Sort tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll} contentContainerStyle={styles.sortTabs}>
        {SORTS.map(s => (
          <TouchableOpacity key={s.key} style={[styles.sortTab, sort === s.key && styles.sortTabActive]} onPress={() => changeSort(s.key)} activeOpacity={0.7}>
            <Text style={[styles.sortTabText, sort === s.key && styles.sortTabTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <Loader />}
      {error && <ErrorView message={error} onRetry={() => fetchData(1)} />}

      {!loading && !error && (
        <FlatList
          data={songs}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <SongCardHorizontal song={item} onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })} />
          )}
          ListFooterComponent={() => loadingMore ? <Loader style={{ paddingVertical: 20 }} /> : <View style={{ height: 32 }} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  sortScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: colors.divider },
  sortTabs: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  sortTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full },
  sortTabActive: { backgroundColor: 'rgba(29,185,84,0.15)' },
  sortTabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.textMuted },
  sortTabTextActive: { color: colors.primary },
})
