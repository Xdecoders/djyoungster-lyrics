import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radius } from '../config/theme'

const EMOJIS = [
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'heart', emoji: '❤️', label: 'Love' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'party', emoji: '🎉', label: 'Party' },
  { key: 'hundred', emoji: '💯', label: '100' },
]

export default function EmojiReactions({ reactions = {}, userReactions = [], onToggle }) {
  const [localReactions, setLocalReactions] = useState(reactions)
  const [localUserReactions, setLocalUserReactions] = useState(userReactions)

  const handlePress = async (emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const isActive = localUserReactions.includes(emoji)
    const newCount = (localReactions[emoji] || 0) + (isActive ? -1 : 1)
    setLocalReactions(prev => ({ ...prev, [emoji]: Math.max(0, newCount) }))
    setLocalUserReactions(prev =>
      isActive ? prev.filter(e => e !== emoji) : [...prev, emoji]
    )
    try { await onToggle?.(emoji) } catch {}
  }

  const formatCount = (n) => {
    if (!n || n === 0) return ''
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <View style={styles.container}>
      {EMOJIS.map(({ key, emoji }) => {
        const isActive = localUserReactions.includes(key)
        const count = localReactions[key] || 0
        return (
          <TouchableOpacity
            key={key}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            {count > 0 && <Text style={[styles.count, isActive && styles.countActive]}>{formatCount(count)}</Text>}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  btnActive: {
    backgroundColor: 'rgba(29,185,84,0.15)',
    borderColor: colors.primary,
  },
  emoji: { fontSize: 16 },
  count: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  countActive: { color: colors.primary },
})
