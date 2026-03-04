import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, Linking
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { subscribeNewsletter, submitSongRequest, submitReport } from '../api'
import { colors, spacing, radius } from '../config/theme'

export default function MoreScreen({ navigation }) {
  const [activePanel, setActivePanel] = useState(null)

  const MENU = [
    { key: 'newsletter', icon: 'mail-outline', label: 'Subscribe Newsletter', color: '#8b5cf6' },
    { key: 'request', icon: 'musical-notes-outline', label: 'Request a Song', color: colors.primary },
    { key: 'report', icon: 'flag-outline', label: 'Report an Issue', color: '#f59e0b' },
    { key: 'about', icon: 'information-circle-outline', label: 'About DJYoungster', color: '#3b82f6', onPress: () => Linking.openURL('https://djyoungster.com/about-us') },
    { key: 'privacy', icon: 'shield-outline', label: 'Privacy Policy', color: '#6b7280', onPress: () => Linking.openURL('https://djyoungster.com/privacy-policy') },
    { key: 'contact', icon: 'chatbubble-outline', label: 'Contact Us', color: '#10b981', onPress: () => Linking.openURL('https://djyoungster.com/contact-us') },
    { key: 'web', icon: 'globe-outline', label: 'Open Website', color: '#f59e0b', onPress: () => Linking.openURL('https://djyoungster.com') },
  ]

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>djyoungster.com</Text>
      </View>

      <View style={styles.menu}>
        {MENU.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={item.onPress || (() => setActivePanel(activePanel === item.key ? null : item.key))}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {!item.onPress && (
              <Ionicons name={activePanel === item.key ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            )}
            {item.onPress && <Ionicons name="open-outline" size={16} color={colors.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Newsletter Panel */}
      {activePanel === 'newsletter' && <NewsletterPanel onClose={() => setActivePanel(null)} />}
      {activePanel === 'request' && <RequestSongPanel onClose={() => setActivePanel(null)} />}
      {activePanel === 'report' && <ReportPanel onClose={() => setActivePanel(null)} />}

      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} DJYoungster</Text>
        <Text style={styles.footerSub}>Your Lyrics Destination</Text>
      </View>
    </ScrollView>
  )
}

function NewsletterPanel({ onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email.includes('@')) { Alert.alert('Error', 'Enter a valid email'); return }
    setLoading(true)
    try {
      await subscribeNewsletter({ email, name })
      Alert.alert('Subscribed! 🎉', 'You\'ll receive new lyrics straight to your inbox.')
      setEmail(''); setName(''); onClose()
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Already subscribed or an error occurred')
    } finally { setLoading(false) }
  }

  return (
    <View style={panelStyles.panel}>
      <Text style={panelStyles.title}>Subscribe Newsletter</Text>
      <Text style={panelStyles.desc}>Get new lyrics delivered to your inbox</Text>
      <TextInput style={panelStyles.input} placeholder="Your name (optional)" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
      <TextInput style={panelStyles.input} placeholder="Your email *" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity style={panelStyles.btn} onPress={submit} disabled={loading} activeOpacity={0.8}>
        <Text style={panelStyles.btnText}>{loading ? 'Subscribing...' : 'Subscribe'}</Text>
      </TouchableOpacity>
    </View>
  )
}

function RequestSongPanel({ onClose }) {
  const [form, setForm] = useState({ songName: '', artistName: '', email: '' })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.songName || !form.artistName || !form.email) { Alert.alert('Error', 'Please fill all required fields'); return }
    setLoading(true)
    try {
      await submitSongRequest(form)
      Alert.alert('Requested! 🎵', 'We\'ll add your song soon.')
      setForm({ songName: '', artistName: '', email: '' }); onClose()
    } catch { Alert.alert('Error', 'Failed to submit request') }
    finally { setLoading(false) }
  }

  return (
    <View style={panelStyles.panel}>
      <Text style={panelStyles.title}>Request a Song</Text>
      <TextInput style={panelStyles.input} placeholder="Song name *" placeholderTextColor={colors.textMuted} value={form.songName} onChangeText={v => setForm(f => ({ ...f, songName: v }))} />
      <TextInput style={panelStyles.input} placeholder="Artist name *" placeholderTextColor={colors.textMuted} value={form.artistName} onChangeText={v => setForm(f => ({ ...f, artistName: v }))} />
      <TextInput style={panelStyles.input} placeholder="Your email *" placeholderTextColor={colors.textMuted} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity style={panelStyles.btn} onPress={submit} disabled={loading} activeOpacity={0.8}>
        <Text style={panelStyles.btnText}>{loading ? 'Submitting...' : 'Request Song'}</Text>
      </TouchableOpacity>
    </View>
  )
}

function ReportPanel({ onClose }) {
  const [type, setType] = useState('lyrics')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const TYPES = ['lyrics', 'spelling', 'artist', 'album', 'credits', 'other']

  const submit = async () => {
    setLoading(true)
    try {
      await submitReport({ type, description })
      Alert.alert('Reported! 🙏', 'Thanks for helping us improve.')
      onClose()
    } catch { Alert.alert('Error', 'Failed to submit report') }
    finally { setLoading(false) }
  }

  return (
    <View style={panelStyles.panel}>
      <Text style={panelStyles.title}>Report an Issue</Text>
      <View style={panelStyles.typesRow}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} style={[panelStyles.typeChip, type === t && panelStyles.typeChipActive]} onPress={() => setType(t)} activeOpacity={0.7}>
            <Text style={[panelStyles.typeText, type === t && panelStyles.typeTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[panelStyles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Describe the issue..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={panelStyles.btn} onPress={submit} disabled={loading} activeOpacity={0.8}>
        <Text style={panelStyles.btnText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const panelStyles = StyleSheet.create({
  panel: { margin: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg },
  title: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: 4 },
  desc: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted, marginBottom: spacing.md },
  input: { backgroundColor: colors.bgCard2, borderRadius: radius.md, padding: spacing.md, fontSize: 14, fontFamily: 'Poppins_400Regular', color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: '#fff' },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  typeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: 'rgba(29,185,84,0.15)', borderColor: colors.primary },
  typeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary, textTransform: 'capitalize' },
  typeTextActive: { color: colors.primary },
})

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: colors.text },
  headerSub: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: colors.primary },
  menu: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.md },
  menuIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: colors.text },
  footer: { alignItems: 'center', paddingVertical: spacing.xxl },
  footerText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.textMuted },
  footerSub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: colors.textMuted, marginTop: 2 },
})
