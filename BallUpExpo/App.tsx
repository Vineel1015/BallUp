import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simple mock navigation state
const screens = {
  home: 'home',
  login: 'login',
  gameSearch: 'gameSearch',
  createLocation: 'createLocation',
  profile: 'profile',
  myGames: 'myGames',
  createGame: 'createGame',
} as const;

type Screen = keyof typeof screens;

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('home');
  const [user, setUser] = React.useState<{username: string} | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderHomeScreen = () => (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to BallUp! 🏀</Text>
        <Text style={styles.subtitle}>What would you like to do?</Text>
      </View>

      <ScrollView style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('gameSearch')}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionTitle}>Find Games</Text>
          <Text style={styles.actionDescription}>
            Search for pickup games near you
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('createGame')}>
          <Text style={styles.actionIcon}>🏀</Text>
          <Text style={styles.actionTitle}>Create Game</Text>
          <Text style={styles.actionDescription}>
            Organize a new pickup game
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('createLocation')}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionTitle}>Add Court</Text>
          <Text style={styles.actionDescription}>
            Add a new basketball court location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('profile')}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionTitle}>My Profile</Text>
          <Text style={styles.actionDescription}>
            View and edit your profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('myGames')}>
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionTitle}>My Games</Text>
          <Text style={styles.actionDescription}>
            View your upcoming and past games
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderGameSearchScreen = () => (
    <View style={styles.screen}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigate('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Find Games</Text>
      </View>

      <View style={styles.gameCard}>
        <View style={styles.gameHeader}>
          <Text style={styles.locationName}>Central Park Basketball Court</Text>
          <Text style={styles.gameTime}>Mon Jul 29, 6:00 PM</Text>
        </View>
        <Text style={styles.gameDescription}>Casual pickup game, all skill levels welcome!</Text>
        <View style={styles.gameDetails}>
          <Text style={styles.detailText}>Players: 6/10</Text>
          <Text style={styles.detailText}>Duration: 120 min</Text>
          <Text style={styles.skillLevel}>Skill: intermediate</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameCard}>
        <View style={styles.gameHeader}>
          <Text style={styles.locationName}>Community Center Court</Text>
          <Text style={styles.gameTime}>Tue Jul 30, 7:30 PM</Text>
        </View>
        <Text style={styles.gameDescription}>Beginner-friendly game, come learn!</Text>
        <View style={styles.gameDetails}>
          <Text style={styles.detailText}>Players: 3/8</Text>
          <Text style={styles.detailText}>Duration: 90 min</Text>
          <Text style={styles.skillLevel}>Skill: beginner</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateGameScreen = () => (
    <View style={styles.screen}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigate('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Game</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>Organize a Game</Text>
        <Text style={styles.subtitle}>Set up a pickup game for other players to join</Text>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Create Game</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateLocationScreen = () => (
    <View style={styles.screen}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigate('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Court</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>Add New Court</Text>
        <Text style={styles.subtitle}>Help other players discover great places to play</Text>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Add Court</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileScreen = () => (
    <View style={styles.screen}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigate('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>Player Profile</Text>
        <Text style={styles.subtitle}>Manage your basketball profile</Text>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyGamesScreen = () => (
    <View style={styles.screen}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigate('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Games</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>My Games</Text>
        <Text style={styles.subtitle}>Your created and joined games</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏀</Text>
        <Text style={styles.emptyTitle}>No games yet</Text>
        <Text style={styles.emptyDescription}>
          Create or join a game to get started!
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigate('createGame')}>
          <Text style={styles.createButtonText}>Create Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHomeScreen();
      case 'gameSearch':
        return renderGameSearchScreen();
      case 'createGame':
        return renderCreateGameScreen();
      case 'createLocation':
        return renderCreateLocationScreen();
      case 'profile':
        return renderProfileScreen();
      case 'myGames':
        return renderMyGamesScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  actions: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '90%',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    opacity: 0.8,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
    marginBottom: 24,
    width: '100%',
  },
  backButton: {
    fontSize: 18,
    color: '#FF6B35',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  gameTime: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  skillLevel: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    flex: 1,
    width: '100%',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});