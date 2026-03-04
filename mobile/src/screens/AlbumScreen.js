import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getAlbum, rateAlbum } from '../api'
import StarRating from '../components/StarRating'
import { SongCardHorizontal } from '../components/SongCard'
import AlbumCard from '../components/AlbumCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

export default function AlbumScreen({ route, navigation }) {
  const { slug } = route.params
  const [data, setData] = useState(null)
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, userRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAlbum(slug)
      .then(res => { setData(res); })
      .catch(() => setError('Failed to load album'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} /></View>
  if (!data) return null

  const { album, moreAlbums = [] } = data
  const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null

  const formatViews = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n?.toString() || '0'
  }

  return (
    <FlatList
      style={styles.screen}
      data={album.songs || []}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <>
          <LinearGradient colors={['#1a2e1a', colors.bg]} style={styles.hero}>
            <Image source={{ uri: album.coverImage || 'https://djyoungster.com/default-cover.jpg' }} style={styles.cover} />
            <Text style={styles.title}>{album.title}</Text>
            {album.artist && (
              <TouchableOpacity onPress={() => navigation.navigate('Artist', { slug: album.artist.slug, name: album.artist.name })} activeOpacity={0.7}>
                <Text style={styles.artist}>{album.artist.name}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.metaRow}>
              {year && <Text style={styles.metaChip}>{year}</Text>}
              {album.label && <Text style={styles.metaChip}>{album.label}</Text>}
              <Text style={styles.metaChip}>{album.totalSongs} songs</Text>
              {album.totalViews > 0 && <Text style={styles.metaChip}>{formatViews(album.totalViews)} views</Text>}
            </View>
            <StarRating rating={ratingData.averageRating} totalRatings={ratingData.totalRatings} userRating={ratingData.userRating} onRate={async (r) => { const res = await rateAlbum(slug, r); setRatingData(res) }} />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Songs</Text>
        </>
      )}
      renderItem={({ item }) => (
        <SongCardHorizontal
          song={item}
          onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })}
        />
      )}
      ListFooterComponent={() => (
        moreAlbums.length > 0 ? (
          <View style={styles.moreSection}>
            <Text style={styles.sectionTitle}>More Albums</Text>
            <FlatList
              data={moreAlbums}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <AlbumCard album={item} onPress={() => navigation.push('Album', { slug: item.slug, title: item.title })} />
              )}
            />
            <View style={{ height: 32 }} />
          </View>
        ) : <View style={{ height: 32 }} />
      )}
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  cover: { width: 160, height: 160, borderRadius: radius.lg, backgroundColor: colors.bgCard2, marginBottom: spacing.sm },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: colors.text, textAlign: 'center' },
  artist: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: colors.primary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  metaChip: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted, backgroundColor: colors.bgCard2, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: colors.text, paddingHorizontal: spacing.lg, marginVertical: spacing.md },
  moreSection: {},
})
