import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { colors } from '../config/theme'

export function Loader({ style }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

export function InlineLoader() {
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  )
}

export function ErrorView({ message = 'Something went wrong', onRetry }) {
  const { TouchableOpacity } = require('react-native')
  return (
    <View style={styles.center}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export function EmptyView({ message = 'Nothing found', icon = '🎵' }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  inline: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#b3b3b3', textAlign: 'center', marginBottom: 16, paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 20 },
  retryText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: '#fff' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#6b7280', textAlign: 'center' },
})
