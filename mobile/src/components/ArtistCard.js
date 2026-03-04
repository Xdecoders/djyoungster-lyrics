import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../config/theme'

export default function ArtistCard({ artist, onPress, style }) {
  const image = artist.imageUrl || artist.thumbnail || 'https://djyoungster.com/default-artist.jpg'
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={2}>{artist.name}</Text>
      <Text style={styles.count}>{artist._count?.songs || 0} songs</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.bgCard2,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.bgCard3,
  },
  name: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  count: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
})
