import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Keyboard, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { search, autocomplete } from '../api'
import SearchBar from '../components/SearchBar'
import { Loader, EmptyView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

const TABS = ['All', 'Songs', 'Artists', 'Albums', 'Movies']

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const debounceTimer = useRef(null)

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    if (query.length < 2) { setSuggestions(null); setResults(null); return }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const [autoRes, searchRes] = await Promise.all([
          autocomplete({ q: query }).catch(() => null),
          search({ q: query, type: 'all' }).catch(() => null),
        ])
        setSuggestions(autoRes)
        setResults(searchRes)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(debounceTimer.current)
  }, [query])

  const navigate = (type, item) => {
    Keyboard.dismiss()
    switch (type) {
      case 'song': return navigation.navigate('Song', { slug: item.slug, title: item.title })
      case 'artist': return navigation.navigate('Artist', { slug: item.slug, name: item.name })
      case 'album': return navigation.navigate('Album', { slug: item.slug, title: item.title })
      case 'movie': return navigation.navigate('Movie', { slug: item.slug, title: item.title })
    }
  }

  const songs = results?.songs || []
  const artists = results?.artists || []
  const albums = results?.albums || []
  const movies = results?.movies || []

  const getTabData = () => {
    switch (activeTab) {
      case 'Songs': return songs
      case 'Artists': return artists
      case 'Albums': return albums
      case 'Movies': return movies
      default: return [...songs.slice(0, 5), ...artists.slice(0, 3), ...albums.slice(0, 3), ...movies.slice(0, 2)]
    }
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => { setQuery(''); setSuggestions(null); setResults(null) }}
          style={styles.searchBar}
          autoFocus={false}
        />
      </View>

      {/* Empty state */}
      {!query && (
        <ScrollView contentContainerStyle={styles.empty}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyTitle}>Search DJYoungster</Text>
          <Text style={styles.emptyDesc}>Find lyrics for any song, artist, album or movie</Text>
        </ScrollView>
      )}

      {/* Loading */}
      {loading && query.length >= 2 && (
        <View style={styles.loadingRow}>
          <Loader style={{ flex: 0, paddingVertical: 20 }} />
        </View>
      )}

      {/* Results */}
      {!loading && results && (
        <>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
            {TABS.map(tab => {
              const count = tab === 'All' ? results.counts?.total : results.counts?.[tab.toLowerCase() + 's']
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab} {count ? `(${count})` : ''}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <FlatList
            data={getTabData()}
            keyExtractor={(item, i) => item.id || i.toString()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<EmptyView message="No results found" icon="🔍" />}
            renderItem={({ item }) => {
              const type = item.type || (item.slug && songs.find(s => s.id === item.id) ? 'song' : item._count?.songs !== undefined ? 'artist' : 'album')
              return <ResultItem item={item} type={item.type || guessType(item, songs, artists, albums, movies)} onPress={navigate} />
            }}
          />
        </>
      )}
    </View>
  )
}

function guessType(item, songs, artists, albums, movies) {
  if (songs.find(s => s.id === item.id)) return 'song'
  if (artists.find(a => a.id === item.id)) return 'artist'
  if (albums.find(a => a.id === item.id)) return 'album'
  if (movies.find(m => m.id === item.id)) return 'movie'
  return 'song'
}

function ResultItem({ item, type, onPress }) {
  const getImage = () => {
    if (type === 'artist') return item.imageUrl || item.image
    return item.coverImage || item.posterUrl || item.image
  }
  const getSubtitle = () => {
    if (type === 'song') return item.artists?.map(sa => sa.artist?.name || sa.name).join(', ')
    if (type === 'artist') return `${item._count?.songs || item.songCount || 0} songs`
    if (type === 'album') return item.artist?.name || item.artist
    if (type === 'movie') return item.year ? `${item.year}` : 'Movie'
    return ''
  }
  const getTypeIcon = () => {
    switch (type) {
      case 'artist': return 'person-outline'
      case 'album': return 'disc-outline'
      case 'movie': return 'film-outline'
      default: return 'musical-notes-outline'
    }
  }
  const title = item.title || item.name
  return (
    <TouchableOpacity style={styles.result} onPress={() => onPress(type, item)} activeOpacity={0.7}>
      <View style={[styles.resultImgWrap, type === 'artist' && styles.resultImgCircle]}>
        {getImage() ? (
          <Image source={{ uri: getImage() }} style={[styles.resultImg, type === 'artist' && styles.resultImgRound]} />
        ) : (
          <View style={[styles.resultImgPlaceholder, type === 'artist' && styles.resultImgRound]}>
            <Ionicons name={getTypeIcon()} size={20} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.resultSub} numberOfLines={1}>{getSubtitle()}</Text>
      </View>
      <View style={styles.resultTypeBadge}>
        <Text style={styles.resultTypeText}>{type}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, backgroundColor: colors.bg },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: spacing.md },
  searchBar: { },
  loadingRow: { paddingVertical: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  tabsScroll: { maxHeight: 50 },
  tabs: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  result: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.divider },
  resultImgWrap: {},
  resultImg: { width: 50, height: 50, borderRadius: radius.sm, backgroundColor: colors.bgCard2, marginRight: spacing.md },
  resultImgRound: { borderRadius: 25 },
  resultImgPlaceholder: { width: 50, height: 50, borderRadius: radius.sm, backgroundColor: colors.bgCard2, marginRight: spacing.md, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: colors.text, marginBottom: 2 },
  resultSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  resultTypeBadge: { paddingHorizontal: 7, paddingVertical: 2, backgroundColor: colors.bgCard3, borderRadius: radius.sm },
  resultTypeText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: colors.textMuted, textTransform: 'capitalize' },
})
