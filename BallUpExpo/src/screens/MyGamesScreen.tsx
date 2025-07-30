import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import { apiService } from '../services/api';
import { Game } from '../types';

type MyGamesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MyGames'
>;

interface Props {
  navigation: MyGamesScreenNavigationProp;
}

interface GameWithRole extends Game {
  role: 'Creator' | 'Participant';
}

const MyGamesScreen: React.FC<Props> = ({navigation}) => {
  const [games, setGames] = useState<GameWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyGames();
  }, []);

  const loadMyGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all games and then filter for user's games
      const response = await apiService.getGames();
      
      // Transform the data to ensure compatibility
      const allGames = response.data;
      const myGames: GameWithRole[] = allGames.map((game: any) => ({
        ...game,
        // Map backend fields to frontend compatibility
        scheduledTime: game.scheduledAt || game.scheduledTime,
        skillLevelRequired: game.skillLevel || game.skillLevelRequired || 'any',
        // For now, assume all games are participant role
        // In a real app, you'd check if currentUserId === game.creatorId
        role: 'Participant' as const,
      }));
      
      setGames(myGames);
    } catch (err: any) {
      console.error('Error loading my games:', err);
      setError(err.response?.data?.error || 'Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGame = async (gameId: string, gameName: string) => {
    Alert.alert(
      'Leave Game',
      `Are you sure you want to leave the game at ${gameName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Leave', 
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.leaveGame(gameId);
              Alert.alert('Left', 'You have left the game');
              await loadMyGames(); // Refresh the list
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to leave game');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleCancelGame = async (gameId: string, gameName: string) => {
    Alert.alert(
      'Cancel Game',
      `Are you sure you want to cancel the game at ${gameName}? This will notify all participants.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.deleteGame(gameId);
              Alert.alert('Cancelled', 'Game has been cancelled');
              await loadMyGames(); // Refresh the list
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to cancel game');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading && games.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading your games...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading games</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMyGames}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMyGames}
            tintColor="#FF6B35"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Games</Text>
          <Text style={styles.subtitle}>Your created and joined games</Text>
        </View>

        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏀</Text>
            <Text style={styles.emptyTitle}>No games yet</Text>
            <Text style={styles.emptyDescription}>
              Create or join a game to get started!
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateGame')}>
              <Text style={styles.createButtonText}>Create Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gamesList}>
            {games.map((game) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.locationName}>
                    {game.location?.name || 'Unknown Location'}
                  </Text>
                  <Text style={styles.gameTime}>
                    {formatDate(game.scheduledTime || game.scheduledAt)}
                  </Text>
                </View>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>
                  {game.description || 'No description available'}
                </Text>
                <View style={styles.gameDetails}>
                  <Text style={styles.detailText}>
                    Players: {game.currentPlayers}/{game.maxPlayers}
                  </Text>
                  {game.duration && (
                    <Text style={styles.detailText}>Duration: {game.duration} min</Text>
                  )}
                  <Text style={[styles.detailText, styles.roleText]}>
                    Role: {game.role}
                  </Text>
                </View>
                {game.role === 'Creator' ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelGame(game.id, game.location?.name || 'this game')}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Game</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={() => handleLeaveGame(game.id, game.location?.name || 'this game')}
                    disabled={loading}
                  >
                    <Text style={styles.leaveButtonText}>Leave Game</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    color: '#CCCCCC',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    width: '90%',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gamesList: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FF6B35',
    width: '90%',
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
    color: '#CCCCCC',
  },
  roleText: {
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cancelButton: {
    backgroundColor: '#cc3333',
    paddingVertical: 12,
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    width: '90%',
    alignSelf: 'center',
  },
  leaveButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyGamesScreen;