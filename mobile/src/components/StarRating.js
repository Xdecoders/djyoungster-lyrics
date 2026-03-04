import React, { useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../config/theme'

export default function StarRating({ rating = 0, totalRatings = 0, userRating = 0, onRate, size = 22 }) {
  const [selected, setSelected] = useState(userRating)
  const display = rating > 0 ? rating.toFixed(1) : '—'

  const handlePress = async (star) => {
    if (!onRate) return
    setSelected(star)
    try { await onRate(star) } catch { setSelected(userRating) }
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => handlePress(star)} activeOpacity={0.7} style={styles.star}>
            <Ionicons
              name={star <= (selected || rating) ? 'star' : 'star-outline'}
              size={size}
              color={star <= (selected || rating) ? '#f59e0b' : colors.bgCard3}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.info}>{display} {totalRatings > 0 ? `(${totalRatings})` : ''}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  stars: { flexDirection: 'row', marginBottom: 4 },
  star: { marginHorizontal: 2 },
  info: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
})
