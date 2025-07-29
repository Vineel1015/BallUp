import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type MyGamesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MyGames'
>;

interface Props {
  navigation: MyGamesScreenNavigationProp;
}

const MyGamesScreen: React.FC<Props> = ({navigation}) => {
  const mockGames = [
    {
      id: '1',
      locationName: 'Central Park Basketball Court',
      date: 'Mon Jul 29, 6:00 PM',
      description: 'Casual pickup game, all skill levels welcome!',
      players: '6/10',
      duration: '120 min',
      skillLevel: 'intermediate',
      role: 'Creator',
    },
    {
      id: '2',
      locationName: 'Community Center Court',
      date: 'Wed Jul 31, 7:30 PM',
      description: 'Competitive game for advanced players',
      players: '8/8',
      duration: '90 min',
      skillLevel: 'advanced',
      role: 'Participant',
    },
  ];

  const handleLeaveGame = (gameId: string, gameName: string) => {
    Alert.alert(
      'Leave Game',
      `Are you sure you want to leave the game at ${gameName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Leave', onPress: () => Alert.alert('Left', 'You have left the game')},
      ]
    );
  };

  const handleCancelGame = (gameId: string, gameName: string) => {
    Alert.alert(
      'Cancel Game',
      `Are you sure you want to cancel the game at ${gameName}? This will notify all participants.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Cancelled', 'Game has been cancelled')},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Games</Text>
          <Text style={styles.subtitle}>Your created and joined games</Text>
        </View>

        {mockGames.length === 0 ? (
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
            {mockGames.map((game) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.locationName}>{game.locationName}</Text>
                  <Text style={styles.gameTime}>{game.date}</Text>
                </View>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.gameDetails}>
                  <Text style={styles.detailText}>Players: {game.players}</Text>
                  <Text style={styles.detailText}>Duration: {game.duration}</Text>
                  <Text style={[styles.detailText, styles.roleText]}>
                    Role: {game.role}
                  </Text>
                </View>
                {game.role === 'Creator' ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelGame(game.id, game.locationName)}>
                    <Text style={styles.cancelButtonText}>Cancel Game</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={() => handleLeaveGame(game.id, game.locationName)}>
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
});

export default MyGamesScreen;