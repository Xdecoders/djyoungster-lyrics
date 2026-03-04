import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getArtist, rateArtist } from '../api'
import StarRating from '../components/StarRating'
import { SongCardHorizontal } from '../components/SongCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

export default function ArtistScreen({ route, navigation }) {
  const { slug } = route.params
  const [artist, setArtist] = useState(null)
  const [songs, setSongs] = useState([])
  const [featuredSongs, setFeaturedSongs] = useState([])
  const [genres, setGenres] = useState([])
  const [albums, setAlbums] = useState([])
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, userRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeGenre, setActiveGenre] = useState(null)

  const fetchData = useCallback(async (pg = 1, genre = null) => {
    try {
      setError(null)
      const res = await getArtist(slug, { page: pg, limit: 20, sort: 'popular', genre: genre || undefined })
      setArtist(res.artist)
      setFeaturedSongs(res.featuredSongs || [])
      setGenres(res.genres || [])
      if (pg === 1) {
        setSongs(res.songs || [])
        setAlbums(res.artist?.albums || [])
        if (res.artist?.ratings) setRatingData(res.artist.ratings)
      } else {
        setSongs(prev => [...prev, ...(res.songs || [])])
      }
      setHasMore(res.pagination?.hasMore || false)
      setPage(pg)
    } catch { setError('Failed to load artist') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [slug])

  useEffect(() => { fetchData(1) }, [])

  const loadMore = () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    fetchData(page + 1, activeGenre)
  }

  const filterByGenre = (genreSlug) => {
    const newGenre = activeGenre === genreSlug ? null : genreSlug
    setActiveGenre(newGenre)
    setLoading(true)
    fetchData(1, newGenre)
  }

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} onRetry={() => fetchData(1)} /></View>
  if (!artist) return null

  return (
    <FlatList
      style={styles.screen}
      data={songs}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={() => (
        <>
          {/* Hero */}
          <LinearGradient colors={['#1a2e1a', colors.bg]} style={styles.hero}>
            <Image
              source={{ uri: artist.imageUrl || 'https://djyoungster.com/default-artist.jpg' }}
              style={styles.artistImg}
            />
            <Text style={styles.name}>{artist.name}</Text>
            {artist.country && <Text style={styles.country}><Ionicons name="location-outline" size={12} /> {artist.country}</Text>}
            <Text style={styles.songCount}>{artist.totalSongs} songs</Text>
            <StarRating rating={ratingData.averageRating} totalRatings={ratingData.totalRatings} userRating={ratingData.userRating} onRate={(r) => rateArtist(slug, r)} />
          </LinearGradient>

          {/* Bio */}
          {artist.bio && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.bio}>{artist.bio}</Text>
            </View>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Albums</Text>
              <FlatList
                data={albums}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.albumCard}
                    onPress={() => navigation.navigate('Album', { slug: item.slug, title: item.title })}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.coverImage }} style={styles.albumImg} />
                    <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                    {item.releaseDate && <Text style={styles.albumYear}>{new Date(item.releaseDate).getFullYear()}</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Featured */}
          {featuredSongs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Songs</Text>
              {featuredSongs.map(song => (
                <SongCardHorizontal
                  key={song.id}
                  song={song}
                  onPress={() => navigation.navigate('Song', { slug: song.slug, title: song.title })}
                />
              ))}
            </View>
          )}

          {/* Genre Filter */}
          {genres.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll} contentContainerStyle={styles.genreTabs}>
              <TouchableOpacity style={[styles.genreTab, !activeGenre && styles.genreTabActive]} onPress={() => filterByGenre(null)} activeOpacity={0.7}>
                <Text style={[styles.genreTabText, !activeGenre && styles.genreTabTextActive]}>All</Text>
              </TouchableOpacity>
              {genres.map(g => (
                <TouchableOpacity key={g.id} style={[styles.genreTab, activeGenre === g.slug && styles.genreTabActive]} onPress={() => filterByGenre(g.slug)} activeOpacity={0.7}>
                  <Text style={[styles.genreTabText, activeGenre === g.slug && styles.genreTabTextActive]}>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>All Songs</Text>
        </>
      )}
      renderItem={({ item }) => (
        <SongCardHorizontal
          song={item}
          onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })}
        />
      )}
      ListFooterComponent={() => loadingMore ? <Loader style={{ paddingVertical: 20 }} /> : <View style={{ height: 32 }} />}
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  artistImg: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.bgCard2, borderWidth: 3, borderColor: colors.primary },
  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: colors.text, textAlign: 'center' },
  country: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
  songCount: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.primary },
  card: { margin: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: spacing.sm },
  bio: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, lineHeight: 22 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md, marginTop: spacing.md },
  hList: { paddingLeft: spacing.lg, paddingRight: spacing.sm },
  albumCard: { width: 110, marginRight: spacing.md },
  albumImg: { width: 110, height: 110, borderRadius: radius.md, backgroundColor: colors.bgCard2, marginBottom: spacing.xs },
  albumTitle: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.text },
  albumYear: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
  genreScroll: { marginBottom: spacing.md },
  genreTabs: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  genreTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border },
  genreTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genreTabText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  genreTabTextActive: { color: '#fff' },
})
