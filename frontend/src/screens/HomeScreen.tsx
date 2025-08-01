import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useWebNavigation} from '../hooks/useWebNavigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation?: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const webNav = useWebNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome to BallUp! 🏀</Text>
          <Text style={styles.subtitle}>What would you like to do?</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Platform.OS === 'web' ? webNav.navigate('GameSearch') : navigation?.navigate('GameSearch')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Find Games</Text>
            <Text style={styles.actionDescription}>
              Search for pickup games near you
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Platform.OS === 'web' ? webNav.navigate('CreateLocation') : navigation?.navigate('CreateLocation')}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionTitle}>Add Court</Text>
            <Text style={styles.actionDescription}>
              Add a new basketball court location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Platform.OS === 'web' ? webNav.navigate('CreateGame') : navigation?.navigate('CreateGame')}>
            <Text style={styles.actionIcon}>🏀</Text>
            <Text style={styles.actionTitle}>Create Game</Text>
            <Text style={styles.actionDescription}>
              Organize a new pickup game
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Platform.OS === 'web' ? webNav.navigate('Profile') : navigation?.navigate('Profile')}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionTitle}>My Profile</Text>
            <Text style={styles.actionDescription}>
              View and edit your profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Platform.OS === 'web' ? webNav.navigate('MyGames') : navigation?.navigate('MyGames')}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionTitle}>My Games</Text>
            <Text style={styles.actionDescription}>
              View your upcoming and past games
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;