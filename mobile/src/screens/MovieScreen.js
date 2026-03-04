import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getMovie, rateMovie } from '../api'
import StarRating from '../components/StarRating'
import { SongCardHorizontal } from '../components/SongCard'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

export default function MovieScreen({ route, navigation }) {
  const { slug } = route.params
  const [data, setData] = useState(null)
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, userRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMovie(slug)
      .then(res => setData(res.movie || res))
      .catch(() => setError('Failed to load movie'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} /></View>
  if (!data) return null

  const movie = data
  const songs = movie.songs || []

  return (
    <FlatList
      style={styles.screen}
      data={songs}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <>
          <LinearGradient colors={['#1a1a2e', colors.bg]} style={styles.hero}>
            {movie.posterUrl ? (
              <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]}>
                <Text style={{ fontSize: 48 }}>🎬</Text>
              </View>
            )}
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.metaRow}>
              {movie.year && <Text style={styles.metaChip}>{movie.year}</Text>}
              {movie.language && <Text style={styles.metaChip}>{movie.language}</Text>}
              {movie.genre && <Text style={styles.metaChip}>{movie.genre}</Text>}
            </View>
            <StarRating rating={ratingData.averageRating} totalRatings={ratingData.totalRatings} userRating={ratingData.userRating} onRate={async (r) => { const res = await rateMovie(slug, r); setRatingData(res) }} />
          </LinearGradient>

          {/* Details */}
          <View style={styles.card}>
            {movie.director && <DetailRow label="Director" value={movie.director} />}
            {movie.producer && <DetailRow label="Producer" value={movie.producer} />}
            {movie.musicDirector && <DetailRow label="Music" value={movie.musicDirector} />}
            {movie.cast && <DetailRow label="Cast" value={movie.cast} />}
          </View>

          {movie.description && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.desc}>{movie.description}</Text>
            </View>
          )}

          {songs.length > 0 && <Text style={styles.sectionTitle}>Songs</Text>}
        </>
      )}
      renderItem={({ item }) => (
        <SongCardHorizontal song={item} onPress={() => navigation.navigate('Song', { slug: item.slug, title: item.title })} />
      )}
      ListFooterComponent={<View style={{ height: 32 }} />}
    />
  )
}

function DetailRow({ label, value }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  )
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted, flex: 1 },
  value: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.text, flex: 2, textAlign: 'right' },
})

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  poster: { width: 140, height: 200, borderRadius: radius.lg, backgroundColor: colors.bgCard2, marginBottom: spacing.sm },
  posterPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: colors.text, textAlign: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  metaChip: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted, backgroundColor: colors.bgCard2, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  card: { margin: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: spacing.sm },
  desc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, lineHeight: 22 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: colors.text, paddingHorizontal: spacing.lg, marginVertical: spacing.md },
})
