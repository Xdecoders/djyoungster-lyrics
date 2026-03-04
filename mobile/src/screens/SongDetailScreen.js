import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Share, Linking, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { getSong, getSongReactions, getSongRating, toggleReaction, rateSong } from '../api'
import StarRating from '../components/StarRating'
import EmojiReactions from '../components/EmojiReactions'
import { Loader, ErrorView } from '../components/Loader'
import { colors, spacing, radius } from '../config/theme'

const LANG_TABS = [
  { key: 'original', label: 'Lyrics' },
  { key: 'romanized', label: 'Roman' },
  { key: 'translated', label: 'English' },
  { key: 'hindi', label: 'Hindi' },
  { key: 'punjabi', label: 'Punjabi' },
]

export default function SongDetailScreen({ route, navigation }) {
  const { slug } = route.params
  const [song, setSong] = useState(null)
  const [relatedSongs, setRelatedSongs] = useState([])
  const [reactions, setReactions] = useState({})
  const [userReactions, setUserReactions] = useState([])
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, userRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('original')
  const [showFullCredits, setShowFullCredits] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const [songRes, reactRes, rateRes] = await Promise.all([
        getSong(slug),
        getSongReactions(slug).catch(() => ({ reactions: {}, userReactions: [] })),
        getSongRating(slug).catch(() => ({ averageRating: 0, totalRatings: 0, userRating: 0 })),
      ])
      setSong(songRes.song)
      setRelatedSongs(songRes.relatedSongs || [])
      setReactions(reactRes.reactions || {})
      setUserReactions(reactRes.userReactions || [])
      setRatingData(rateRes)
    } catch (e) {
      setError('Failed to load song')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchData() }, [slug])

  const handleReaction = async (emoji) => {
    await toggleReaction(slug, emoji)
  }

  const handleRate = async (rating) => {
    const res = await rateSong(slug, rating)
    setRatingData(res)
  }

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Share.share({
      message: `🎵 ${song.title} Lyrics - Read on DJYoungster\nhttps://djyoungster.com/song/${slug}`,
      title: song.title,
    })
  }

  const getLyricsForTab = () => {
    if (!song) return null
    switch (activeTab) {
      case 'romanized': return song.lyricsRomanized
      case 'translated': return song.lyricsTranslated
      case 'hindi': return song.lyricsHindi
      case 'punjabi': return song.lyricsPunjabi
      default: return song.lyrics
    }
  }

  const availableTabs = LANG_TABS.filter(tab => {
    if (tab.key === 'original') return !!song?.lyrics
    if (tab.key === 'romanized') return !!song?.lyricsRomanized
    if (tab.key === 'translated') return !!song?.lyricsTranslated
    if (tab.key === 'hindi') return !!song?.lyricsHindi
    if (tab.key === 'punjabi') return !!song?.lyricsPunjabi
    return false
  })

  if (loading) return <View style={styles.screen}><Loader /></View>
  if (error) return <View style={styles.screen}><ErrorView message={error} onRetry={fetchData} /></View>
  if (!song) return null

  const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || 'Unknown Artist'
  const year = song.datePublished ? new Date(song.datePublished).getFullYear() : null
  const currentLyrics = getLyricsForTab()

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={['#1a2e1a', colors.bg]} style={styles.headerBg}>
            <Image
              source={{ uri: song.coverImage || 'https://djyoungster.com/default-cover.jpg' }}
              style={styles.cover}
            />
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={3}>{song.title}</Text>
              <TouchableOpacity
                onPress={() => song.artists?.[0]?.artist && navigation.navigate('Artist', { slug: song.artists[0].artist.slug, name: song.artists[0].artist.name })}
              >
                <Text style={styles.artist}>{artistNames}</Text>
              </TouchableOpacity>
              {year && <Text style={styles.year}>{year}</Text>}
              {song.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Music Links */}
        {(song.youtubeUrl || song.spotifyUrl || song.appleMusicUrl) && (
          <View style={styles.links}>
            {song.youtubeUrl && (
              <TouchableOpacity style={[styles.linkBtn, styles.ytBtn]} onPress={() => Linking.openURL(song.youtubeUrl)} activeOpacity={0.8}>
                <Ionicons name="logo-youtube" size={16} color="#fff" />
                <Text style={styles.linkBtnText}>YouTube</Text>
              </TouchableOpacity>
            )}
            {song.spotifyUrl && (
              <TouchableOpacity style={[styles.linkBtn, styles.spotifyBtn]} onPress={() => Linking.openURL(song.spotifyUrl)} activeOpacity={0.8}>
                <Ionicons name="musical-notes" size={16} color="#fff" />
                <Text style={styles.linkBtnText}>Spotify</Text>
              </TouchableOpacity>
            )}
            {song.appleMusicUrl && (
              <TouchableOpacity style={[styles.linkBtn, styles.appleBtn]} onPress={() => Linking.openURL(song.appleMusicUrl)} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={16} color="#fff" />
                <Text style={styles.linkBtnText}>Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.linkBtn, styles.shareBtn]} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social-outline" size={16} color={colors.primary} />
              <Text style={[styles.linkBtnText, { color: colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ratings & Reactions */}
        <View style={styles.interactCard}>
          <StarRating
            rating={ratingData.averageRating}
            totalRatings={ratingData.totalRatings}
            userRating={ratingData.userRating}
            onRate={handleRate}
          />
          <View style={styles.divider} />
          <EmojiReactions
            reactions={reactions}
            userReactions={userReactions}
            onToggle={handleReaction}
          />
        </View>

        {/* Language Tabs */}
        {availableTabs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
            {availableTabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Lyrics */}
        <View style={styles.lyricsCard}>
          {currentLyrics ? (
            <Text style={styles.lyrics}>{currentLyrics}</Text>
          ) : (
            <View style={styles.noLyricsBox}>
              <Text style={styles.noLyricsText}>No lyrics available for this language</Text>
            </View>
          )}
        </View>

        {/* Meaning */}
        {song.meaning && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meaning & Explanation</Text>
            <Text style={styles.cardBody}>{song.meaning}</Text>
          </View>
        )}

        {/* Credits */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.creditsHeader}
            onPress={() => setShowFullCredits(v => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>Song Credits</Text>
            <Ionicons name={showFullCredits ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {showFullCredits && (
            <View style={styles.creditsList}>
              <CreditRow label="Artists" value={artistNames} />
              {song.singers && <CreditRow label="Singers" value={song.singers} />}
              {song.lyricist && <CreditRow label="Lyricist" value={song.lyricist} />}
              {song.composer && <CreditRow label="Composer" value={song.composer} />}
              {song.producer && <CreditRow label="Producer" value={song.producer} />}
              {song.director && <CreditRow label="Director" value={song.director} />}
              {song.label && <CreditRow label="Label" value={song.label} />}
              {song.language && <CreditRow label="Language" value={song.language} />}
              {song.album && <CreditRow label="Album" value={song.album.title} onPress={() => navigation.navigate('Album', { slug: song.album.slug, title: song.album.title })} />}
              {song.movie && <CreditRow label="Movie" value={song.movie.title} onPress={() => navigation.navigate('Movie', { slug: song.movie.slug, title: song.movie.title })} />}
              {year && <CreditRow label="Year" value={year.toString()} />}
              {song.genres?.length > 0 && <CreditRow label="Genres" value={song.genres.map(g => g.genre?.name).join(', ')} />}
              {song.starring && <CreditRow label="Starring" value={song.starring} />}
            </View>
          )}
        </View>

        {/* Tags */}
        {song.tags?.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.cardTitle} style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: colors.text }}>Tags</Text>
            <View style={styles.tags}>
              {song.tags.map(({ tag }) => (
                <TouchableOpacity key={tag.id} style={styles.tagChip} activeOpacity={0.7}>
                  <Text style={styles.tagChipText}>#{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Related Songs */}
        {relatedSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Songs</Text>
            {relatedSongs.map(s => (
              <View key={s.id} style={styles.relatedItem}>
                <Image source={{ uri: s.coverImage }} style={styles.relatedImg} />
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.relatedArtist} numberOfLines={1}>
                    {s.artists?.map(sa => sa.artist?.name).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.relatedBtn}
                  onPress={() => navigation.push('Song', { slug: s.slug, title: s.title })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.relatedBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

function CreditRow({ label, value, onPress }) {
  const content = (
    <View style={creditStyles.row}>
      <Text style={creditStyles.label}>{label}</Text>
      <Text style={[creditStyles.value, onPress && creditStyles.link]}>{value}</Text>
    </View>
  )
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>
  return content
}

const creditStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: colors.textMuted, flex: 1 },
  value: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.text, flex: 2, textAlign: 'right' },
  link: { color: colors.primary },
})

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { marginBottom: spacing.lg },
  headerBg: { padding: spacing.lg, paddingTop: spacing.xxl, flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-end' },
  cover: { width: 120, height: 120, borderRadius: radius.md, backgroundColor: colors.bgCard2 },
  meta: { flex: 1 },
  title: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: 4 },
  artist: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: colors.primary, marginBottom: 2 },
  year: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textMuted },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: colors.primary },

  links: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg, flexWrap: 'wrap' },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  linkBtnText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#fff' },
  ytBtn: { backgroundColor: '#ff0000' },
  spotifyBtn: { backgroundColor: '#1DB954' },
  appleBtn: { backgroundColor: '#fc3c44' },
  shareBtn: { backgroundColor: 'rgba(29,185,84,0.1)', borderWidth: 1, borderColor: colors.primary },

  interactCard: { margin: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
  divider: { height: 1, backgroundColor: colors.divider },

  tabsScroll: { marginBottom: spacing.md },
  tabs: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  lyricsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.xl },
  lyrics: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: colors.text, lineHeight: 30 },
  noLyricsBox: { alignItems: 'center', paddingVertical: spacing.xxl },
  noLyricsText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: colors.textMuted },

  card: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: colors.text, marginBottom: spacing.sm },
  cardBody: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, lineHeight: 24 },
  creditsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditsList: { marginTop: spacing.md },

  tagsSection: { marginBottom: spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  tagChip: { backgroundColor: colors.bgCard2, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 1, borderColor: colors.border },
  tagChipText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },

  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },

  relatedItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.md },
  relatedImg: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.bgCard2 },
  relatedInfo: { flex: 1 },
  relatedTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: colors.text },
  relatedArtist: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  relatedBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, backgroundColor: 'rgba(29,185,84,0.1)', borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary },
  relatedBtnText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: colors.primary },
})
