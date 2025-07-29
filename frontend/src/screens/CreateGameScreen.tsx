import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomDropdown from '../components/CustomDropdown';
import { apiService } from '../services/api';

type CreateGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateGame'
>;

interface Props {
  navigation: CreateGameScreenNavigationProp;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

const CreateGameScreen: React.FC<Props> = ({navigation}) => {
  const [selectedCourt, setSelectedCourt] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('90');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [skillLevel, setSkillLevel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const durationOptions = [
    { label: '1 hour', value: '60' },
    { label: '1.5 hours', value: '90' },
    { label: '2 hours', value: '120' },
    { label: '2.5 hours', value: '150' },
    { label: '3 hours', value: '180' },
  ];

  const maxPlayersOptions = [
    { label: '4 players', value: '4' },
    { label: '6 players', value: '6' },
    { label: '8 players', value: '8' },
    { label: '10 players', value: '10' },
    { label: '12 players', value: '12' },
    { label: '14 players', value: '14' },
    { label: '16 players', value: '16' },
    { label: '18 players', value: '18' },
    { label: '20 players', value: '20' },
  ];

  const skillLevelOptions = [
    { label: 'Any skill level', value: 'any' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await apiService.getLocations();
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to load courts. Please try again.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const locationOptions = locations.map(location => ({
    label: `${location.name} - ${location.address}`,
    value: location.id,
  }));

  const handleCreateGame = async () => {
    if (!selectedCourt || !dateTime || !duration || !maxPlayers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Basic date validation - user should enter a date in format like "Jul 29, 2024 6:00 PM"
    const gameDate = new Date(dateTime);
    if (isNaN(gameDate.getTime()) || gameDate <= new Date()) {
      Alert.alert('Error', 'Please enter a valid future date and time');
      return;
    }

    try {
      setLoading(true);
      
      const gameData = {
        locationId: selectedCourt,
        title: `Basketball Game - ${gameDate.toLocaleDateString()}`,
        description: description || 'Join us for a pickup basketball game!',
        dateTime: gameDate.toISOString(),
        maxPlayers: parseInt(maxPlayers),
        skillLevel: skillLevel || 'any',
      };

      await apiService.createGame(gameData);

      Alert.alert(
        'Success',
        'Game created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setSelectedCourt('');
              setDateTime('');
              setDuration('90');
              setMaxPlayers('8');
              setSkillLevel('');
              setDescription('');
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert(
        'Error',
        'Failed to create game. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Organize a Game</Text>
          <Text style={styles.subtitle}>Set up a pickup game for other players to join</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Court *</Text>
            {loadingLocations ? (
              <View style={[styles.input, styles.loadingContainer]}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.loadingText}>Loading courts...</Text>
              </View>
            ) : (
              <CustomDropdown
                options={locationOptions}
                selectedValue={selectedCourt}
                onValueChange={setSelectedCourt}
                placeholder="Choose a court..."
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date & Time *</Text>
            <TextInput
              style={styles.input}
              value={dateTime}
              onChangeText={setDateTime}
              placeholder="e.g., Jul 29, 2024 6:00 PM"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration *</Text>
            <CustomDropdown
              options={durationOptions}
              selectedValue={duration}
              onValueChange={setDuration}
              placeholder="Select duration..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Players *</Text>
            <CustomDropdown
              options={maxPlayersOptions}
              selectedValue={maxPlayers}
              onValueChange={setMaxPlayers}
              placeholder="Select max players..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <CustomDropdown
              options={skillLevelOptions}
              selectedValue={skillLevel}
              onValueChange={setSkillLevel}
              placeholder="Any skill level"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your game, what to expect, etc."
              placeholderTextColor="#CCCCCC"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]} 
            onPress={handleCreateGame}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={[styles.createButtonText, { marginLeft: 8 }]}>Creating Game...</Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>Create Game</Text>
            )}
          </TouchableOpacity>
        </View>
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
  form: {
    gap: 16,
    width: '90%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    minHeight: 48,
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  inputText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholder: {
    color: '#CCCCCC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    width: '90%',
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CreateGameScreen;