import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type CreateGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateGame'
>;

interface Props {
  navigation: CreateGameScreenNavigationProp;
}

const CreateGameScreen: React.FC<Props> = ({navigation}) => {
  const [selectedCourt, setSelectedCourt] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('90');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [skillLevel, setSkillLevel] = useState('');
  const [description, setDescription] = useState('');

  const mockCourts = [
    'Central Park Basketball Court',
    'Community Center Court',
    'Downtown Sports Complex',
    'University Recreation Center',
  ];

  const handleCreateGame = () => {
    if (!selectedCourt || !dateTime || !duration || !maxPlayers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

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
            <TouchableOpacity style={styles.input}>
              <Text style={[styles.inputText, !selectedCourt && styles.placeholder]}>
                {selectedCourt || 'Choose a court...'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date & Time *</Text>
            <TextInput
              style={styles.input}
              value={dateTime}
              onChangeText={setDateTime}
              placeholder="e.g., Mon Jul 29, 6:00 PM"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TouchableOpacity style={styles.input}>
              <Text style={styles.inputText}>
                {duration === '60' && '1 hour'}
                {duration === '90' && '1.5 hours'}
                {duration === '120' && '2 hours'}
                {duration === '150' && '2.5 hours'}
                {duration === '180' && '3 hours'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Players *</Text>
            <TouchableOpacity style={styles.input}>
              <Text style={styles.inputText}>{maxPlayers} players</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <TouchableOpacity style={styles.input}>
              <Text style={[styles.inputText, !skillLevel && styles.placeholder]}>
                {skillLevel || 'Any skill level'}
              </Text>
            </TouchableOpacity>
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

          <TouchableOpacity style={styles.createButton} onPress={handleCreateGame}>
            <Text style={styles.createButtonText}>Create Game</Text>
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
});

export default CreateGameScreen;