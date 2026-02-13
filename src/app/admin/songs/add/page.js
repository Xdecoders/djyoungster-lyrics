'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiSave, FiX, FiMusic, FiUser, FiDisc, FiTag, FiFilm, FiCalendar, FiGlobe, FiImage, FiEye, FiType, FiAlignLeft, FiSearch, FiPlus, FiFolder, FiVideo, FiUpload, FiLink, FiEdit3, FiMic, FiUsers, FiAward, FiStar, FiBookOpen } from 'react-icons/fi'
import { FaSpotify, FaApple } from 'react-icons/fa'

export default function AddSong() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const [genres, setGenres] = useState([])
  const [categories, setCategories] = useState([])
  const [movies, setMovies] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    lyrics: '',
    lyricsRomanized: '',
    lyricsTranslated: '',
    lyricsHindi: '',
    lyricsPunjabi: '',
    meaning: '',
    releaseYear: new Date().getFullYear(),
    artistIds: [],
    albumId: '',
    genreIds: [],
    categoryIds: [],
    tagIds: [],
    movieId: '',
    coverImage: '',
    youtubeUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    lyricist: '',
    composer: '',
    singers: '',
    label: '',
    starring: '',
    producer: '',
    director: '',
    verified: false,
    status: 'published',
    metaTitle: '',
    metaDescription: ''
  })

  const [errors, setErrors] = useState({})

  // Image upload states
  const [imageUploadMode, setImageUploadMode] = useState('url') // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // Lyrics tab state
  const [activeLyricsTab, setActiveLyricsTab] = useState('main')
  const [translating, setTranslating] = useState(false)

  // Artist search states
  const [artistSearch, setArtistSearch] = useState('')
  const [showArtistDropdown, setShowArtistDropdown] = useState(false)
  const [selectedArtists, setSelectedArtists] = useState([])
  const artistSearchRef = useRef(null)

  // Add Artist Modal states
  const [showNewArtistModal, setShowNewArtistModal] = useState(false)
  const [newArtistData, setNewArtistData] = useState({ name: '', country: '' })
  const [savingArtist, setSavingArtist] = useState(false)

  // Movie search states
  const [movieSearch, setMovieSearch] = useState('')
  const [showMovieDropdown, setShowMovieDropdown] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const movieSearchRef = useRef(null)

  // Add Movie Modal states
  const [showNewMovieModal, setShowNewMovieModal] = useState(false)
  const [newMovieData, setNewMovieData] = useState({ title: '', year: '', director: '' })
  const [savingMovie, setSavingMovie] = useState(false)

  // Album search states
  const [albumSearch, setAlbumSearch] = useState('')
  const [showAlbumDropdown, setShowAlbumDropdown] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const albumSearchRef = useRef(null)

  // Add Album Modal states
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false)
  const [newAlbumData, setNewAlbumData] = useState({ title: '', artistId: '', releaseDate: '' })
  const [savingAlbum, setSavingAlbum] = useState(false)

  // Genre search states
  const [genreSearch, setGenreSearch] = useState('')
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState([])
  const genreSearchRef = useRef(null)

  // Add Genre Modal states
  const [showNewGenreModal, setShowNewGenreModal] = useState(false)
  const [newGenreData, setNewGenreData] = useState({ name: '', description: '' })
  const [savingGenre, setSavingGenre] = useState(false)

  // Category search states
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const categorySearchRef = useRef(null)

  // Add Category Modal states
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({ name: '' })
  const [savingCategory, setSavingCategory] = useState(false)

  // Tag search states
  const [tagSearch, setTagSearch] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const tagSearchRef = useRef(null)
  const [savingTag, setSavingTag] = useState(false)

  // Song credits suggestions
  const [creditSuggestions, setCreditSuggestions] = useState({
    lyricists: [],
    composers: [],
    singers: [],
    labels: [],
    starring: [],
    producers: [],
    directors: []
  })

  // Credit field dropdown states
  const [showLyricistDropdown, setShowLyricistDropdown] = useState(false)
  const [showComposerDropdown, setShowComposerDropdown] = useState(false)
  const [showSingersDropdown, setShowSingersDropdown] = useState(false)
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [showStarringDropdown, setShowStarringDropdown] = useState(false)
  const [showProducerDropdown, setShowProducerDropdown] = useState(false)
  const [showDirectorDropdown, setShowDirectorDropdown] = useState(false)

  // Credit field refs
  const lyricistRef = useRef(null)
  const composerRef = useRef(null)
  const singersRef = useRef(null)
  const labelRef = useRef(null)
  const starringRef = useRef(null)
  const producerRef = useRef(null)
  const directorRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (artistSearchRef.current && !artistSearchRef.current.contains(e.target)) {
        setShowArtistDropdown(false)
      }
      if (movieSearchRef.current && !movieSearchRef.current.contains(e.target)) {
        setShowMovieDropdown(false)
      }
      if (albumSearchRef.current && !albumSearchRef.current.contains(e.target)) {
        setShowAlbumDropdown(false)
      }
      if (genreSearchRef.current && !genreSearchRef.current.contains(e.target)) {
        setShowGenreDropdown(false)
      }
      if (categorySearchRef.current && !categorySearchRef.current.contains(e.target)) {
        setShowCategoryDropdown(false)
      }
      if (tagSearchRef.current && !tagSearchRef.current.contains(e.target)) {
        setShowTagDropdown(false)
      }
      if (lyricistRef.current && !lyricistRef.current.contains(e.target)) {
        setShowLyricistDropdown(false)
      }
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        setShowComposerDropdown(false)
      }
      if (singersRef.current && !singersRef.current.contains(e.target)) {
        setShowSingersDropdown(false)
      }
      if (labelRef.current && !labelRef.current.contains(e.target)) {
        setShowLabelDropdown(false)
      }
      if (starringRef.current && !starringRef.current.contains(e.target)) {
        setShowStarringDropdown(false)
      }
      if (producerRef.current && !producerRef.current.contains(e.target)) {
        setShowProducerDropdown(false)
      }
      if (directorRef.current && !directorRef.current.contains(e.target)) {
        setShowDirectorDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync selectedArtists with formData.artistIds
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      artistIds: selectedArtists.map(a => a.id)
    }))
  }, [selectedArtists])

  // Sync selectedMovie with formData.movieId
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      movieId: selectedMovie?.id || ''
    }))
  }, [selectedMovie])

  // Sync selectedAlbum with formData.albumId
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      albumId: selectedAlbum?.id || ''
    }))
  }, [selectedAlbum])

  // Sync selectedGenres with formData.genreIds
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      genreIds: selectedGenres.map(g => g.id)
    }))
  }, [selectedGenres])

  // Sync selectedCategories with formData.categoryIds
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      categoryIds: selectedCategories.map(c => c.id)
    }))
  }, [selectedCategories])

  // Sync selectedTags with formData.tagIds
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tagIds: selectedTags.map(t => t.id)
    }))
  }, [selectedTags])

  // Update image preview when URL changes
  useEffect(() => {
    if (imageUploadMode === 'url' && formData.coverImage) {
      setImagePreview(formData.coverImage)
    }
  }, [formData.coverImage, imageUploadMode])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const [artistsRes, albumsRes, genresRes, categoriesRes, moviesRes, creditsRes, tagsRes] = await Promise.all([
        fetch('/api/admin/artists', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/albums', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/genres', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/movies', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/song-credits', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/tags', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      setArtists(await artistsRes.json())
      setAlbums(await albumsRes.json())
      setGenres(await genresRes.json())
      setCategories(await categoriesRes.json())
      setMovies(await moviesRes.json())
      setAvailableTags(await tagsRes.json())

      const creditsData = await creditsRes.json()
      if (!creditsData.message) {
        setCreditSuggestions(creditsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Filter credit suggestions based on input
  const filterSuggestions = (suggestions, input) => {
    if (!input) return suggestions
    const lowerInput = input.toLowerCase()
    return suggestions.filter(s => s.toLowerCase().includes(lowerInput))
  }

  // Handle selecting a credit suggestion
  const handleCreditSelect = (field, value, setDropdown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setDropdown(false)
  }

  // Handle credit input change with dropdown
  const handleCreditChange = (e, setDropdown) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setDropdown(true)
  }

  // Image upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Maximum size is 5MB.')
        return
      }

      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) return

    setUploadingImage(true)
    try {
      const token = localStorage.getItem('adminToken')
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      })

      const data = await res.json()

      if (res.ok) {
        setFormData(prev => ({ ...prev, coverImage: data.url }))
        setImagePreview(data.url)
        alert('Image uploaded successfully!')
      } else {
        alert(data.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Something went wrong while uploading')
    } finally {
      setUploadingImage(false)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, coverImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadFromUrl = async () => {
    const url = formData.coverImage.trim()
    if (!url) {
      alert('Please enter an image URL')
      return
    }

    setUploadingImage(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url })
      })

      const data = await res.json()

      if (res.ok) {
        setFormData(prev => ({ ...prev, coverImage: data.url }))
        setImagePreview(data.url)
        alert('Image downloaded and saved successfully!')
      } else {
        alert(data.message || 'Failed to download image')
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Something went wrong while downloading')
    } finally {
      setUploadingImage(false)
    }
  }

  // Artist search and selection
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
    !selectedArtists.find(s => s.id === artist.id)
  )

  const handleSelectArtist = (artist) => {
    setSelectedArtists(prev => [...prev, artist])
    setArtistSearch('')
    setShowArtistDropdown(false)
  }

  const handleRemoveArtist = (artistId) => {
    setSelectedArtists(prev => prev.filter(a => a.id !== artistId))
  }

  // Movie search and selection
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(movieSearch.toLowerCase())
  )

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie)
    setMovieSearch('')
    setShowMovieDropdown(false)
  }

  const handleRemoveMovie = () => {
    setSelectedMovie(null)
  }

  // Album search and selection
  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(albumSearch.toLowerCase())
  )

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album)
    setAlbumSearch('')
    setShowAlbumDropdown(false)
  }

  const handleRemoveAlbum = () => {
    setSelectedAlbum(null)
  }

  // Genre search and selection
  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(genreSearch.toLowerCase()) &&
    !selectedGenres.find(s => s.id === genre.id)
  )

  const handleSelectGenre = (genre) => {
    setSelectedGenres(prev => [...prev, genre])
    setGenreSearch('')
    setShowGenreDropdown(false)
  }

  const handleRemoveGenre = (genreId) => {
    setSelectedGenres(prev => prev.filter(g => g.id !== genreId))
  }

  // Category search and selection
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
    !selectedCategories.find(s => s.id === category.id)
  )

  const handleSelectCategory = (category) => {
    setSelectedCategories(prev => [...prev, category])
    setCategorySearch('')
    setShowCategoryDropdown(false)
  }

  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  // Add new artist
  const handleAddNewArtist = async () => {
    if (!newArtistData.name.trim()) return

    setSavingArtist(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newArtistData.name,
          slug: generateSlug(newArtistData.name),
          country: newArtistData.country || null
        })
      })

      if (res.ok) {
        const newArtist = await res.json()
        setArtists(prev => [...prev, newArtist])
        setSelectedArtists(prev => [...prev, newArtist])
        setShowNewArtistModal(false)
        setNewArtistData({ name: '', country: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add artist')
      }
    } catch (error) {
      console.error('Error adding artist:', error)
      alert('Something went wrong')
    } finally {
      setSavingArtist(false)
    }
  }

  // Add new movie
  const handleAddNewMovie = async () => {
    if (!newMovieData.title.trim()) return

    setSavingMovie(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newMovieData.title,
          year: newMovieData.year ? parseInt(newMovieData.year) : null,
          director: newMovieData.director || null
        })
      })

      if (res.ok) {
        const newMovie = await res.json()
        setMovies(prev => [...prev, newMovie])
        setSelectedMovie(newMovie)
        setShowNewMovieModal(false)
        setNewMovieData({ title: '', year: '', director: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add movie')
      }
    } catch (error) {
      console.error('Error adding movie:', error)
      alert('Something went wrong')
    } finally {
      setSavingMovie(false)
    }
  }

  // Add new album
  const handleAddNewAlbum = async () => {
    if (!newAlbumData.title.trim()) return

    setSavingAlbum(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newAlbumData.title,
          slug: generateSlug(newAlbumData.title),
          artistId: newAlbumData.artistId || null,
          releaseDate: newAlbumData.releaseDate || null
        })
      })

      if (res.ok) {
        const newAlbum = await res.json()
        setAlbums(prev => [...prev, newAlbum])
        setSelectedAlbum(newAlbum)
        setShowNewAlbumModal(false)
        setNewAlbumData({ title: '', artistId: '', releaseDate: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add album')
      }
    } catch (error) {
      console.error('Error adding album:', error)
      alert('Something went wrong')
    } finally {
      setSavingAlbum(false)
    }
  }

  // Add new genre
  const handleAddNewGenre = async () => {
    if (!newGenreData.name.trim()) return

    setSavingGenre(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newGenreData.name,
          slug: generateSlug(newGenreData.name),
          description: newGenreData.description || null
        })
      })

      if (res.ok) {
        const newGenre = await res.json()
        setGenres(prev => [...prev, newGenre])
        setSelectedGenres(prev => [...prev, newGenre])
        setShowNewGenreModal(false)
        setNewGenreData({ name: '', description: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add genre')
      }
    } catch (error) {
      console.error('Error adding genre:', error)
      alert('Something went wrong')
    } finally {
      setSavingGenre(false)
    }
  }

  // Add new category
  const handleAddNewCategory = async () => {
    if (!newCategoryData.name.trim()) return

    setSavingCategory(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newCategoryData.name,
          slug: generateSlug(newCategoryData.name)
        })
      })

      if (res.ok) {
        const newCategory = await res.json()
        setCategories(prev => [...prev, newCategory])
        setSelectedCategories(prev => [...prev, newCategory])
        setShowNewCategoryModal(false)
        setNewCategoryData({ name: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Something went wrong')
    } finally {
      setSavingCategory(false)
    }
  }

  // Tag handling functions
  // Tag handlers - searchable dropdown style
  const handleSelectTag = (tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag])
      setFormData(prev => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }))
    }
    setTagSearch('')
    setShowTagDropdown(false)
  }

  const handleRemoveTag = (tagId) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId))
    setFormData(prev => ({ ...prev, tagIds: prev.tagIds.filter(id => id !== tagId) }))
  }

  const handleCreateTag = async () => {
    const tagName = tagSearch.trim()
    if (!tagName) return

    setSavingTag(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: tagName })
      })
      if (res.ok) {
        const newTag = await res.json()
        setAvailableTags(prev => [...prev, newTag])
        handleSelectTag(newTag)
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
    setSavingTag(false)
  }

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.some(t => t.id === tag.id)
  )

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.lyrics.trim()) newErrors.lyrics = 'Lyrics are required'
    if (selectedArtists.length === 0) newErrors.artists = 'Select at least one artist'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        // Show success message with indexing status
        let message = 'Song added successfully!'
        if (data.indexingResult) {
          if (data.indexingResult.success) {
            message += '\n\n✅ Submitted to Google Search Console for indexing.'
          } else {
            message += '\n\n⚠️ Google Indexing: ' + (data.indexingResult.message || 'Not configured')
          }
        }
        alert(message)
        router.push('/admin/songs')
      } else {
        alert(data.message || 'Failed to add song')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoTranslate = async () => {
    if (!formData.lyrics.trim()) return
    setTranslating(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/translate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lyrics: formData.lyrics, title: formData.title })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Translation failed')
      }
      const data = await res.json()
      setFormData(prev => ({
        ...prev,
        lyricsRomanized: data.lyricsRomanized || prev.lyricsRomanized,
        lyricsTranslated: data.lyricsTranslated || prev.lyricsTranslated,
        lyricsHindi: data.lyricsHindi || prev.lyricsHindi,
        lyricsPunjabi: data.lyricsPunjabi || prev.lyricsPunjabi,
        meaning: data.meaning || prev.meaning,
        metaTitle: data.metaTitle || prev.metaTitle,
        metaDescription: data.metaDescription || prev.metaDescription
      }))
    } catch (error) {
      alert('Auto-translate failed: ' + error.message)
    } finally {
      setTranslating(false)
    }
  }

  const lyricsTabs = [
    { id: 'main', label: 'Main Lyrics', field: 'lyrics', required: true },
    { id: 'romanized', label: 'Romanized', field: 'lyricsRomanized' },
    { id: 'translated', label: 'English Translation', field: 'lyricsTranslated' },
    { id: 'hindi', label: 'Hindi', field: 'lyricsHindi' },
    { id: 'punjabi', label: 'Punjabi', field: 'lyricsPunjabi' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/songs" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiX className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiMusic className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Add New Song</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/songs"
                className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium text-sm hidden sm:block"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200 font-medium text-sm"
              >
                <FiSave className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Song'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiType className="w-5 h-5 text-primary" />
                  Basic Information
                </h2>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter song title"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="auto-generated-slug"
                    />
                    <p className="text-sm text-gray-500 mt-1">Auto-generated from title, but you can edit it</p>
                  </div>
                </div>
              </div>

              {/* Lyrics Section with Tabs */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiAlignLeft className="w-5 h-5 text-primary" />
                  Lyrics
                </h2>

                {/* Lyrics Tabs */}
                <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
                  {lyricsTabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveLyricsTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activeLyricsTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label} {tab.required && '*'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={translating || !formData.lyrics.trim()}
                    className="ml-auto px-4 py-2 rounded-lg text-sm font-medium transition bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {translating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></span>
                        Translating...
                      </>
                    ) : (
                      <>
                        <FiGlobe className="w-4 h-4" />
                        Auto-translate
                      </>
                    )}
                  </button>
                </div>

                {/* Active Lyrics Textarea */}
                {lyricsTabs.map(tab => (
                  <div key={tab.id} className={activeLyricsTab === tab.id ? 'block' : 'hidden'}>
                    <textarea
                      name={tab.field}
                      value={formData[tab.field]}
                      onChange={handleChange}
                      rows={15}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono ${
                        errors.lyrics && tab.id === 'main' ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`Paste ${tab.label.toLowerCase()} here...`}
                    />
                    {errors.lyrics && tab.id === 'main' && <p className="text-red-500 text-sm mt-1">{errors.lyrics}</p>}
                  </div>
                ))}
              </div>

              {/* Song Meaning */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBookOpen className="w-5 h-5 text-primary" />
                  Song Meaning / Interpretation
                </h2>
                <textarea
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Explain the meaning or interpretation of this song..."
                />
              </div>

              {/* Cover Image */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiImage className="w-5 h-5 text-primary" />
                  Cover Image
                </h2>

                {/* Upload Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      imageUploadMode === 'file'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiUpload className="w-5 h-5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      imageUploadMode === 'url'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiLink className="w-5 h-5" />
                    From URL
                  </button>
                </div>

                {/* File Upload Mode */}
                {imageUploadMode === 'file' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="coverImageFile"
                      />
                      <label htmlFor="coverImageFile" className="cursor-pointer">
                        <FiUpload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">Click to choose a file</p>
                        <p className="text-sm text-gray-400 mt-1">JPEG, PNG, WebP, GIF (max 5MB)</p>
                      </label>
                    </div>

                    {imageFile && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FiImage className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600 flex-1 truncate">{imageFile.name}</span>
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* URL Mode */}
                {imageUploadMode === 'url' && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={handleDownloadFromUrl}
                        disabled={uploadingImage || !formData.coverImage}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter image URL and click Save to download to server</p>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4 relative">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Song Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Release Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      Release Year
                    </label>
                    <input
                      type="number"
                      name="releaseYear"
                      value={formData.releaseYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  {/* Label */}
                  <div className="relative" ref={labelRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiAward className="w-4 h-4" />
                      Music Label
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={(e) => handleCreditChange(e, setShowLabelDropdown)}
                      onFocus={() => setShowLabelDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Type or select label"
                      autoComplete="off"
                    />
                    {showLabelDropdown && filterSuggestions(creditSuggestions.labels, formData.label).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filterSuggestions(creditSuggestions.labels, formData.label).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCreditSelect('label', suggestion, setShowLabelDropdown)}
                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Song Credits */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-primary" />
                  Song Credits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lyricist */}
                  <div className="relative" ref={lyricistRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiEdit3 className="w-4 h-4" />
                      Lyricist / Writer
                    </label>
                    <input
                      type="text"
                      name="lyricist"
                      value={formData.lyricist}
                      onChange={(e) => handleCreditChange(e, setShowLyricistDropdown)}
                      onFocus={() => setShowLyricistDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Type or select lyricist"
                      autoComplete="off"
                    />
                    {showLyricistDropdown && filterSuggestions(creditSuggestions.lyricists, formData.lyricist).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filterSuggestions(creditSuggestions.lyricists, formData.lyricist).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCreditSelect('lyricist', suggestion, setShowLyricistDropdown)}
                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Composer */}
                  <div className="relative" ref={composerRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiMusic className="w-4 h-4" />
                      Music Composer
                    </label>
                    <input
                      type="text"
                      name="composer"
                      value={formData.composer}
                      onChange={(e) => handleCreditChange(e, setShowComposerDropdown)}
                      onFocus={() => setShowComposerDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Type or select composer"
                      autoComplete="off"
                    />
                    {showComposerDropdown && filterSuggestions(creditSuggestions.composers, formData.composer).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filterSuggestions(creditSuggestions.composers, formData.composer).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCreditSelect('composer', suggestion, setShowComposerDropdown)}
                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Director */}
                  <div className="relative" ref={directorRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiVideo className="w-4 h-4" />
                      Video Director
                    </label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={(e) => handleCreditChange(e, setShowDirectorDropdown)}
                      onFocus={() => setShowDirectorDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Type or select director"
                      autoComplete="off"
                    />
                    {showDirectorDropdown && filterSuggestions(creditSuggestions.directors, formData.director).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filterSuggestions(creditSuggestions.directors, formData.director).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCreditSelect('director', suggestion, setShowDirectorDropdown)}
                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Starring */}
                  <div className="relative" ref={starringRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiStar className="w-4 h-4" />
                      Starring / Models
                    </label>
                    <input
                      type="text"
                      name="starring"
                      value={formData.starring}
                      onChange={(e) => handleCreditChange(e, setShowStarringDropdown)}
                      onFocus={() => setShowStarringDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Type or select starring"
                      autoComplete="off"
                    />
                    {showStarringDropdown && filterSuggestions(creditSuggestions.starring, formData.starring).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filterSuggestions(creditSuggestions.starring, formData.starring).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCreditSelect('starring', suggestion, setShowStarringDropdown)}
                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Actors/models in the music video</p>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">External Links</h2>

                <div className="space-y-4">
                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiVideo className="w-4 h-4 text-red-500" />
                      YouTube Video URL
                    </label>
                    <input
                      type="text"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  {/* Spotify URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaSpotify className="w-4 h-4 text-green-500" />
                      Spotify URL
                    </label>
                    <input
                      type="text"
                      name="spotifyUrl"
                      value={formData.spotifyUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>

                  </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Brief description for search engines..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Status & Verification */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={formData.verified}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiEye className="w-4 h-4" />
                      Verified Lyrics
                    </label>
                  </div>
                </div>
              </div>

              {/* Artists - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-primary" />
                    Artists *
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewArtistModal(true)}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {/* Selected Artists Tags */}
                {selectedArtists.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedArtists.map(artist => (
                      <span
                        key={artist.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {artist.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveArtist(artist.id)}
                          className="hover:text-red-500"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Artist Search Input */}
                <div className="relative" ref={artistSearchRef}>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={artistSearch}
                      onChange={(e) => {
                        setArtistSearch(e.target.value)
                        setShowArtistDropdown(true)
                      }}
                      onFocus={() => setShowArtistDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Search artists..."
                    />
                  </div>

                  {/* Dropdown */}
                  {showArtistDropdown && (artistSearch || filteredArtists.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredArtists.length > 0 ? (
                        filteredArtists.slice(0, 10).map(artist => (
                          <button
                            key={artist.id}
                            type="button"
                            onClick={() => handleSelectArtist(artist)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span>{artist.name}</span>
                            {artist.country && (
                              <span className="text-xs text-gray-400">({artist.country})</span>
                            )}
                          </button>
                        ))
                      ) : artistSearch ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No artists found.
                          <button
                            type="button"
                            onClick={() => {
                              setNewArtistData({ name: artistSearch, country: '' })
                              setShowNewArtistModal(true)
                              setShowArtistDropdown(false)
                            }}
                            className="text-primary hover:underline ml-1"
                          >
                            Create "{artistSearch}"
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {errors.artists && <p className="text-red-500 text-sm mt-2">{errors.artists}</p>}
              </div>

              {/* Categories - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFolder className="w-5 h-5 text-primary" />
                    Categories
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {/* Selected Categories Tags */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCategories.map(category => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category.id)}
                          className="hover:text-red-500"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Category Search Input */}
                <div className="relative" ref={categorySearchRef}>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value)
                        setShowCategoryDropdown(true)
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Search categories..."
                    />
                  </div>

                  {/* Dropdown */}
                  {showCategoryDropdown && (categorySearch || filteredCategories.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.slice(0, 10).map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleSelectCategory(category)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiFolder className="w-4 h-4 text-gray-400" />
                            <span>{category.name}</span>
                          </button>
                        ))
                      ) : categorySearch ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No categories found.
                          <button
                            type="button"
                            onClick={() => {
                              setNewCategoryData({ name: categorySearch })
                              setShowNewCategoryModal(true)
                              setShowCategoryDropdown(false)
                            }}
                            className="text-primary hover:underline ml-1"
                          >
                            Create "{categorySearch}"
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <FiTag className="w-5 h-5 text-primary" />
                  Tags
                </h3>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm capitalize"
                      >
                        #{tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:text-red-500"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Search Input */}
                <div className="relative" ref={tagSearchRef}>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value)
                        setShowTagDropdown(true)
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Search or create tags..."
                    />
                  </div>

                  {/* Tag Dropdown */}
                  {showTagDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                          <div
                            key={tag.id}
                            onClick={() => handleSelectTag(tag)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          >
                            <FiTag className="w-4 h-4 text-gray-400" />
                            <span className="capitalize">#{tag.name}</span>
                            {tag._count?.songs > 0 && (
                              <span className="text-xs text-gray-400">({tag._count.songs} songs)</span>
                            )}
                          </div>
                        ))
                      ) : tagSearch.trim() ? (
                        <div
                          onClick={handleCreateTag}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-primary"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>{savingTag ? 'Creating...' : `Create tag "${tagSearch.trim()}"`}</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Type to search or create a new tag
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">Tags help users find your songs.</p>
              </div>

              {/* Album - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiDisc className="w-5 h-5 text-primary" />
                    Album
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewAlbumModal(true)}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {/* Selected Album Tag */}
                {selectedAlbum && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {selectedAlbum.title}
                      {selectedAlbum.artist && <span className="text-xs">- {selectedAlbum.artist.name}</span>}
                      <button
                        type="button"
                        onClick={handleRemoveAlbum}
                        className="hover:text-red-500"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Album Search Input */}
                {!selectedAlbum && (
                  <div className="relative" ref={albumSearchRef}>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={albumSearch}
                        onChange={(e) => {
                          setAlbumSearch(e.target.value)
                          setShowAlbumDropdown(true)
                        }}
                        onFocus={() => setShowAlbumDropdown(true)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Search albums..."
                      />
                    </div>

                    {/* Dropdown */}
                    {showAlbumDropdown && (albumSearch || filteredAlbums.length > 0) && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredAlbums.length > 0 ? (
                          filteredAlbums.slice(0, 10).map(album => (
                            <button
                              key={album.id}
                              type="button"
                              onClick={() => handleSelectAlbum(album)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FiDisc className="w-4 h-4 text-gray-400" />
                              <span>{album.title}</span>
                              {album.artist && (
                                <span className="text-xs text-gray-400">- {album.artist.name}</span>
                              )}
                            </button>
                          ))
                        ) : albumSearch ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No albums found.
                            <button
                              type="button"
                              onClick={() => {
                                setNewAlbumData({ title: albumSearch, artistId: '', releaseDate: '' })
                                setShowNewAlbumModal(true)
                                setShowAlbumDropdown(false)
                              }}
                              className="text-primary hover:underline ml-1"
                            >
                              Create "{albumSearch}"
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Genres - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiTag className="w-5 h-5 text-primary" />
                    Genres
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewGenreModal(true)}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {/* Selected Genres Tags */}
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedGenres.map(genre => (
                      <span
                        key={genre.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {genre.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveGenre(genre.id)}
                          className="hover:text-red-500"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Genre Search Input */}
                <div className="relative" ref={genreSearchRef}>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={genreSearch}
                      onChange={(e) => {
                        setGenreSearch(e.target.value)
                        setShowGenreDropdown(true)
                      }}
                      onFocus={() => setShowGenreDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Search genres..."
                    />
                  </div>

                  {/* Dropdown */}
                  {showGenreDropdown && (genreSearch || filteredGenres.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredGenres.length > 0 ? (
                        filteredGenres.slice(0, 10).map(genre => (
                          <button
                            key={genre.id}
                            type="button"
                            onClick={() => handleSelectGenre(genre)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiTag className="w-4 h-4 text-gray-400" />
                            <span>{genre.name}</span>
                          </button>
                        ))
                      ) : genreSearch ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No genres found.
                          <button
                            type="button"
                            onClick={() => {
                              setNewGenreData({ name: genreSearch, description: '' })
                              setShowNewGenreModal(true)
                              setShowGenreDropdown(false)
                            }}
                            className="text-primary hover:underline ml-1"
                          >
                            Create "{genreSearch}"
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Movie - Searchable */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFilm className="w-5 h-5 text-primary" />
                    Movie (Optional)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewMovieModal(true)}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {/* Selected Movie Tag */}
                {selectedMovie && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {selectedMovie.title}
                      {selectedMovie.year && <span className="text-xs">({selectedMovie.year})</span>}
                      <button
                        type="button"
                        onClick={handleRemoveMovie}
                        className="hover:text-red-500"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Movie Search Input */}
                {!selectedMovie && (
                  <div className="relative" ref={movieSearchRef}>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={movieSearch}
                        onChange={(e) => {
                          setMovieSearch(e.target.value)
                          setShowMovieDropdown(true)
                        }}
                        onFocus={() => setShowMovieDropdown(true)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Search movies..."
                      />
                    </div>

                    {/* Dropdown */}
                    {showMovieDropdown && (movieSearch || filteredMovies.length > 0) && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredMovies.length > 0 ? (
                          filteredMovies.slice(0, 10).map(movie => (
                            <button
                              key={movie.id}
                              type="button"
                              onClick={() => handleSelectMovie(movie)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FiFilm className="w-4 h-4 text-gray-400" />
                              <span>{movie.title}</span>
                              {movie.year && (
                                <span className="text-xs text-gray-400">({movie.year})</span>
                              )}
                            </button>
                          ))
                        ) : movieSearch ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No movies found.
                            <button
                              type="button"
                              onClick={() => {
                                setNewMovieData({ title: movieSearch, year: '', director: '' })
                                setShowNewMovieModal(true)
                                setShowMovieDropdown(false)
                              }}
                              className="text-primary hover:underline ml-1"
                            >
                              Create "{movieSearch}"
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Add New Artist Modal */}
      {showNewArtistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-primary" />
                Add New Artist
              </h3>
              <button
                onClick={() => {
                  setShowNewArtistModal(false)
                  setNewArtistData({ name: '', country: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={newArtistData.name}
                  onChange={(e) => setNewArtistData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter artist name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={newArtistData.country}
                  onChange={(e) => setNewArtistData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., India, USA"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewArtistModal(false)
                  setNewArtistData({ name: '', country: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewArtist}
                disabled={savingArtist || !newArtistData.name.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {savingArtist ? 'Adding...' : 'Add Artist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Movie Modal */}
      {showNewMovieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFilm className="w-5 h-5 text-primary" />
                Add New Movie
              </h3>
              <button
                onClick={() => {
                  setShowNewMovieModal(false)
                  setNewMovieData({ title: '', year: '', director: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Movie Title *
                </label>
                <input
                  type="text"
                  value={newMovieData.title}
                  onChange={(e) => setNewMovieData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter movie title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year (Optional)
                </label>
                <input
                  type="number"
                  value={newMovieData.year}
                  onChange={(e) => setNewMovieData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., 2024"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director (Optional)
                </label>
                <input
                  type="text"
                  value={newMovieData.director}
                  onChange={(e) => setNewMovieData(prev => ({ ...prev, director: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Director name"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewMovieModal(false)
                  setNewMovieData({ title: '', year: '', director: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewMovie}
                disabled={savingMovie || !newMovieData.title.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {savingMovie ? 'Adding...' : 'Add Movie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Album Modal */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiDisc className="w-5 h-5 text-primary" />
                Add New Album
              </h3>
              <button
                onClick={() => {
                  setShowNewAlbumModal(false)
                  setNewAlbumData({ title: '', artistId: '', releaseDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album Title *
                </label>
                <input
                  type="text"
                  value={newAlbumData.title}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter album title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist (Optional)
                </label>
                <select
                  value={newAlbumData.artistId}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, artistId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Artist</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date (Optional)
                </label>
                <input
                  type="date"
                  value={newAlbumData.releaseDate}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewAlbumModal(false)
                  setNewAlbumData({ title: '', artistId: '', releaseDate: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewAlbum}
                disabled={savingAlbum || !newAlbumData.title.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {savingAlbum ? 'Adding...' : 'Add Album'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Genre Modal */}
      {showNewGenreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiTag className="w-5 h-5 text-primary" />
                Add New Genre
              </h3>
              <button
                onClick={() => {
                  setShowNewGenreModal(false)
                  setNewGenreData({ name: '', description: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre Name *
                </label>
                <input
                  type="text"
                  value={newGenreData.name}
                  onChange={(e) => setNewGenreData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter genre name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newGenreData.description}
                  onChange={(e) => setNewGenreData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewGenreModal(false)
                  setNewGenreData({ name: '', description: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewGenre}
                disabled={savingGenre || !newGenreData.name.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {savingGenre ? 'Adding...' : 'Add Genre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFolder className="w-5 h-5 text-primary" />
                Add New Category
              </h3>
              <button
                onClick={() => {
                  setShowNewCategoryModal(false)
                  setNewCategoryData({ name: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewCategoryModal(false)
                  setNewCategoryData({ name: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewCategory}
                disabled={savingCategory || !newCategoryData.name.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {savingCategory ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
