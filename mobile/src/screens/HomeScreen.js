import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, StatusBar, Image
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getHomepage } from '../api'
import SongCard, { SongCardHorizontal } from '../components/SongCard'
import ArtistCard from '../components/ArtistCard'
import AlbumCard from '../components/AlbumCard'
import SectionHeader from '../components/SectionHeader'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await getHomepage()
      setData(res)
    } catch (e) {
      setError('Failed to load content')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [])

  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} onRetry={fetchData} /></View>

  const { latestSongs = [], trendingSongs = [], categories = [], artists = [], albums = [], tags = [], lyricStories = [] } = data || {}

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Hero */}
        <LinearGradient colors={['#1a2e1a', colors.bg]} style={styles.hero}>
          <Text style={styles.heroSub}>Lyrics for every song</Text>
          <Text style={styles.heroTitle}>DJYoungster</Text>
          <TouchableOpacity
            style={styles.heroSearch}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <Text style={styles.heroSearchText}>Search songs, artists...</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Lyric Stories */}
        {lyricStories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Lyric Stories" />
            <FlatList
              data={lyricStories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.storyCard}
                  onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.coverImage }} style={styles.storyImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.storyGradient}>
                    <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.storyArtist} numberOfLines={1}>
                      {item.artists?.map(sa => sa.artist?.name).join(', ')}
                    </Text>
                  </LinearGradient>
                  <View style={styles.storyBadge}>
                    <Ionicons name="play-circle" size={14} color={colors.primary} />
                    <Text style={styles.storyBadgeText}>Story</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Latest Songs */}
        {latestSongs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Latest Lyrics" onSeeAll={() => navigation.navigate('AllSongs', { sort: 'latest' })} />
            <FlatList
              data={latestSongs}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <SongCard
                  song={item}
                  onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })}
                />
              )}
            />
          </View>
        )}

        {/* Trending */}
        {trendingSongs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Trending Now" onSeeAll={() => navigation.navigate('AllSongs', { sort: 'popular' })} />
            <View style={styles.trendingList}>
              {trendingSongs.slice(0, 6).map((song, i) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.trendingItem}
                  onPress={() => navigation.navigate('Song', { slug: song.slug, title: song.title })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.trendingNum}>{i + 1}</Text>
                  <Image source={{ uri: song.coverImage }} style={styles.trendingImg} />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.trendingArtist} numberOfLines={1}>
                      {song.artists?.map(sa => sa.artist?.name).join(', ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Popular Artists" onSeeAll={() => navigation.navigate('Artists')} />
            <FlatList
              data={artists}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ArtistCard
                  artist={item}
                  onPress={() => navigation.navigate('Artist', { slug: item.slug, name: item.name })}
                />
              )}
            />
          </View>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Albums" onSeeAll={() => navigation.navigate('Albums')} />
            <FlatList
              data={albums}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <AlbumCard
                  album={item}
                  onPress={() => navigation.navigate('Album', { slug: item.slug, title: item.title })}
                />
              )}
            />
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Browse Categories" onSeeAll={() => navigation.navigate('Browse')} />
            <View style={styles.catGrid}>
              {categories.slice(0, 6).map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catCard}
                  onPress={() => navigation.navigate('Category', { slug: cat.slug, name: cat.name })}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#1a2e1a', '#0d1a0d']} style={styles.catGradient}>
                    <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                    <Text style={styles.catCount}>{cat._count?.songs || 0} songs</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Popular Tags */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Popular Tags" />
            <View style={styles.tags}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.tag}
                  onPress={() => navigation.navigate('AllSongs', { tagSlug: tag.slug, title: '#' + tag.name })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>#{tag.name}</Text>
                  <Text style={styles.tagCount}>{tag.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { marginBottom: spacing.xxl },
  hList: { paddingLeft: spacing.lg, paddingRight: spacing.sm },

  // Hero
  hero: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.xxl },
  heroSub: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  heroTitle: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: spacing.lg },
  heroSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  heroSearchText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: colors.textMuted },

  // Lyric Stories
  storyCard: { width: 140, height: 200, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.md },
  storyImage: { width: '100%', height: '100%' },
  storyGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.sm },
  storyTitle: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#fff' },
  storyArtist: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)' },
  storyBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  storyBadgeText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: colors.primary },

  // Trending
  trendingList: { paddingHorizontal: spacing.lg },
  trendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  trendingNum: { width: 22, fontSize: 14, fontFamily: 'Poppins_700Bold', color: colors.primary, textAlign: 'center' },
  trendingImg: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.bgCard2 },
  trendingInfo: { flex: 1 },
  trendingTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: colors.text },
  trendingArtist: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },

  // Categories grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  catCard: { width: '48%', borderRadius: radius.md, overflow: 'hidden' },
  catGradient: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  catName: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: 2 },
  catCount: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: colors.textMuted },

  // Tags
  tags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.bgCard2, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.border,
  },
  tagText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  tagCount: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
})
