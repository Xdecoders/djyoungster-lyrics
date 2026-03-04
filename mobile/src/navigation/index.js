import React from 'react'
import { TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/HomeScreen'
import SearchScreen from '../screens/SearchScreen'
import BrowseScreen from '../screens/BrowseScreen'
import MoreScreen from '../screens/MoreScreen'
import SongDetailScreen from '../screens/SongDetailScreen'
import ArtistScreen from '../screens/ArtistScreen'
import AlbumScreen from '../screens/AlbumScreen'
import GenreScreen from '../screens/GenreScreen'
import CategoryScreen from '../screens/CategoryScreen'
import MovieScreen from '../screens/MovieScreen'
import AllSongsScreen from '../screens/AllSongsScreen'

import { colors } from '../config/theme'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Browse: ['grid', 'grid-outline'],
  More: ['ellipsis-horizontal-circle', 'ellipsis-horizontal-circle-outline'],
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['circle', 'circle-outline']
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_600SemiBold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: 'Poppins_700Bold', fontSize: 16 },
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />

        <Stack.Screen
          name="Song"
          component={SongDetailScreen}
          options={({ route }) => ({
            title: route.params?.title || 'Song Lyrics',
            headerStyle: { backgroundColor: '#1a1a1a' },
          })}
        />

        <Stack.Screen
          name="Artist"
          component={ArtistScreen}
          options={({ route }) => ({ title: route.params?.name || 'Artist' })}
        />

        <Stack.Screen
          name="Album"
          component={AlbumScreen}
          options={({ route }) => ({ title: route.params?.title || 'Album' })}
        />

        <Stack.Screen
          name="Genre"
          component={GenreScreen}
          options={({ route }) => ({ title: route.params?.name || 'Genre' })}
        />

        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }) => ({ title: route.params?.name || 'Category' })}
        />

        <Stack.Screen
          name="Movie"
          component={MovieScreen}
          options={({ route }) => ({ title: route.params?.title || 'Movie' })}
        />

        <Stack.Screen
          name="AllSongs"
          component={AllSongsScreen}
          options={({ route }) => ({ title: route.params?.title || 'All Songs' })}
        />

        <Stack.Screen
          name="Artists"
          component={require('../screens/ArtistsListScreen').default}
          options={{ title: 'Artists' }}
        />

        <Stack.Screen
          name="Albums"
          component={require('../screens/AlbumsListScreen').default}
          options={{ title: 'Albums' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
