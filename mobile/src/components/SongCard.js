import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../config/theme'

export default function SongCard({ song, onPress, style, size = 'md' }) {
  const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || 'Unknown Artist'
  const isSmall = size === 'sm'

  return (
    <TouchableOpacity style={[styles.container, isSmall && styles.containerSm, style]} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: song.coverImage || 'https://djyoungster.com/default-cover.jpg' }}
        style={[styles.image, isSmall && styles.imageSm]}
      />
      <View style={styles.info}>
        <Text style={[styles.title, isSmall && styles.titleSm]} numberOfLines={2}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artistNames}</Text>
        {song.views > 0 && !isSmall && (
          <Text style={styles.views}>{formatViews(song.views)} views</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export function SongCardHorizontal({ song, onPress, style }) {
  const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || 'Unknown Artist'
  return (
    <TouchableOpacity style={[styles.row, style]} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: song.coverImage || 'https://djyoungster.com/default-cover.jpg' }}
        style={styles.rowImage}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.rowArtist} numberOfLines={1}>{artistNames}</Text>
      </View>
      {song.views > 0 && (
        <Text style={styles.rowViews}>{formatViews(song.views)}</Text>
      )}
    </TouchableOpacity>
  )
}

function formatViews(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: spacing.md,
  },
  containerSm: {
    width: 120,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard2,
    marginBottom: spacing.sm,
  },
  imageSm: {
    width: 120,
    height: 120,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  titleSm: {
    fontSize: 12,
  },
  artist: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textSecondary,
  },
  views: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowImage: {
    width: 50,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCard2,
    marginRight: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  rowArtist: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textSecondary,
  },
  rowViews: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
})
