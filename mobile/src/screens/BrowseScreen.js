import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getGenres, getCategories, getArtists, getAlbums, getMovies } from '../api'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

const SECTIONS = ['Genres', 'Categories', 'Artists', 'Albums', 'Movies']

export default function BrowseScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState('Genres')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (data[activeSection]) return
    loadSection(activeSection)
  }, [activeSection])

  const loadSection = async (section) => {
    setLoading(true)
    setError(null)
    try {
      let res
      switch (section) {
        case 'Genres': res = await getGenres(); break
        case 'Categories': res = await getCategories(); break
        case 'Artists': res = (await getArtists({ limit: 36, sort: 'popular' })).artists; break
        case 'Albums': res = (await getAlbums({ limit: 30 })).albums; break
        case 'Movies': res = (await getMovies({ limit: 30 })).movies; break
      }
      setData(prev => ({ ...prev, [section]: res }))
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }

  const navigate = (item) => {
    switch (activeSection) {
      case 'Genres': return navigation.navigate('Genre', { slug: item.slug, name: item.name })
      case 'Categories': return navigation.navigate('Category', { slug: item.slug, name: item.name })
      case 'Artists': return navigation.navigate('Artist', { slug: item.slug, name: item.name })
      case 'Albums': return navigation.navigate('Album', { slug: item.slug, title: item.title })
      case 'Movies': return navigation.navigate('Movie', { slug: item.slug, title: item.title })
    }
  }

  const currentData = data[activeSection] || []

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {SECTIONS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, activeSection === s && styles.tabActive]}
            onPress={() => setActiveSection(s)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeSection === s && styles.tabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <Loader />}
      {error && <ErrorView message={error} onRetry={() => loadSection(activeSection)} />}

      {!loading && !error && (
        <FlatList
          data={currentData}
          keyExtractor={item => item.id}
          numColumns={activeSection === 'Artists' ? 3 : 2}
          key={activeSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <BrowseItem item={item} section={activeSection} onPress={() => navigate(item)} />}
        />
      )}
    </View>
  )
}

function BrowseItem({ item, section, onPress }) {
  const image = item.imageUrl || item.coverImage || item.posterUrl || item.thumbnail
  const title = item.name || item.title
  const count = item._count?.songs
  const isArtist = section === 'Artists'

  if (isArtist) {
    return (
      <TouchableOpacity style={styles.artistItem} onPress={onPress} activeOpacity={0.7}>
        <Image source={{ uri: image || 'https://djyoungster.com/default-artist.jpg' }} style={styles.artistImg} />
        <Text style={styles.artistName} numberOfLines={1}>{title}</Text>
        <Text style={styles.artistCount}>{count} songs</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.gridImgWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.gridImg} />
        ) : (
          <View style={styles.gridImgPlaceholder}>
            <Ionicons name="musical-notes" size={32} color={colors.primary} />
          </View>
        )}
        <View style={styles.gridOverlay}>
          <Text style={styles.gridTitle} numberOfLines={2}>{title}</Text>
          {count !== undefined && <Text style={styles.gridCount}>{count} songs</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: colors.text },
  tabsScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tabs: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full },
  tabActive: { backgroundColor: 'rgba(29,185,84,0.15)', borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  grid: { padding: spacing.md, gap: spacing.md },

  // Grid item
  gridItem: { flex: 1, margin: spacing.xs },
  gridImgWrap: { borderRadius: radius.lg, overflow: 'hidden', aspectRatio: 1, backgroundColor: colors.bgCard2 },
  gridImg: { width: '100%', height: '100%' },
  gridImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(29,185,84,0.08)' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.6)' },
  gridTitle: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: '#fff' },
  gridCount: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Artist
  artistItem: { flex: 1, margin: spacing.xs, alignItems: 'center', paddingVertical: spacing.md },
  artistImg: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bgCard2, marginBottom: spacing.sm },
  artistName: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.text, textAlign: 'center' },
  artistCount: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: colors.textMuted, textAlign: 'center' },
})
