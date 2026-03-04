import api from '../config/api'

// Homepage
export const getHomepage = () => api.get('/homepage').then(r => r.data)

// Songs
export const getSongs = (params = {}) => api.get('/songs', { params }).then(r => r.data)
export const getSong = (slug) => api.get(`/songs/${slug}`).then(r => r.data)
export const getSongReactions = (slug) => api.get(`/songs/${slug}/react`).then(r => r.data)
export const toggleReaction = (slug, emoji) => api.post(`/songs/${slug}/react`, { emoji }).then(r => r.data)
export const getSongRating = (slug) => api.get(`/songs/${slug}/rate`).then(r => r.data)
export const rateSong = (slug, rating) => api.post(`/songs/${slug}/rate`, { rating }).then(r => r.data)
export const trackInteraction = (slug, data) => api.post(`/songs/${slug}/interact`, data).then(r => r.data)

// Artists
export const getArtists = (params = {}) => api.get('/artists', { params }).then(r => r.data)
export const getArtist = (slug, params = {}) => api.get(`/artists/${slug}`, { params }).then(r => r.data)
export const rateArtist = (slug, rating) => api.post(`/artists/${slug}/rate`, { rating }).then(r => r.data)

// Albums
export const getAlbums = (params = {}) => api.get('/albums', { params }).then(r => r.data)
export const getAlbum = (slug) => api.get(`/albums/${slug}`).then(r => r.data)
export const rateAlbum = (slug, rating) => api.post(`/albums/${slug}/rate`, { rating }).then(r => r.data)

// Genres
export const getGenres = () => api.get('/genres').then(r => r.data)
export const getGenre = (slug, params = {}) => api.get(`/genres/${slug}`, { params }).then(r => r.data)

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data)
export const getCategory = (slug, params = {}) => api.get(`/categories/${slug}`, { params }).then(r => r.data)

// Movies
export const getMovies = (params = {}) => api.get('/movies', { params }).then(r => r.data)
export const getMovie = (slug) => api.get(`/movies/${slug}`).then(r => r.data)
export const rateMovie = (slug, rating) => api.post(`/movies/${slug}/rate`, { rating }).then(r => r.data)

// Tags
export const getTags = (params = {}) => api.get('/tags', { params }).then(r => r.data)

// Search
export const search = (params = {}) => api.get('/search', { params }).then(r => r.data)
export const autocomplete = (params = {}) => api.get('/search/autocomplete', { params }).then(r => r.data)

// Song Requests
export const submitSongRequest = (data) => api.post('/song-requests', data).then(r => r.data)

// Reports
export const submitReport = (data) => api.post('/reports', data).then(r => r.data)

// Newsletter
export const subscribeNewsletter = (data) => api.post('/newsletter/subscribe', data).then(r => r.data)
export const unsubscribeNewsletter = (data) => api.post('/newsletter/unsubscribe', data).then(r => r.data)

// Site Settings
export const getSiteSettings = () => api.get('/site-settings').then(r => r.data)
