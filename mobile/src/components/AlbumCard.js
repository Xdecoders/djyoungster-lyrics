import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../config/theme'

export default function AlbumCard({ album, onPress, style }) {
  const image = album.coverImage || 'https://djyoungster.com/default-cover.jpg'
  const artistName = album.artist?.name || ''
  const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={2}>{album.title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{artistName}{year ? ` • ${year}` : ''}</Text>
      <Text style={styles.count}>{album._count?.songs || 0} songs</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: spacing.md,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard2,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
})
