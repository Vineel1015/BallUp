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
import { clearAuthToken } from '../services/api';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const skillLevelOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const positionOptions = [
    { label: 'Point Guard', value: 'point_guard' },
    { label: 'Shooting Guard', value: 'shooting_guard' },
    { label: 'Small Forward', value: 'small_forward' },
    { label: 'Power Forward', value: 'power_forward' },
    { label: 'Center', value: 'center' },
    { label: 'Any Position', value: 'any' },
  ];

  useEffect(() => {
    // TODO: Implement fetchUserProfile when user API is available
    // For now, set some mock data
    setTimeout(() => {
      setUsername('Player123');
      setEmail('player@example.com');
      setSkillLevel('intermediate');
      setPosition('point_guard');
      setBio('Love playing basketball and meeting new players!');
      setFirstName('John');
      setLastName('Doe');
      setLoadingProfile(false);
    }, 1000);
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement actual API call when user profile update API is available
      // const profileData = {
      //   firstName,
      //   lastName,
      //   bio,
      //   skillLevel,
      //   preferredPosition: position,
      // };
      // await apiService.updateProfile(profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout', 
          onPress: async () => {
            try {
              await clearAuthToken();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              navigation.navigate('Login'); // Still navigate even if clear fails
            }
          }
        },
      ]
    );
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Player Profile</Text>
          <Text style={styles.subtitle}>Manage your basketball profile</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={username}
              editable={false}
            />
            <Text style={styles.helpText}>Username cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
            />
            <Text style={styles.helpText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <CustomDropdown
              options={skillLevelOptions}
              selectedValue={skillLevel}
              onValueChange={setSkillLevel}
              placeholder="Select your skill level"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Position</Text>
            <CustomDropdown
              options={positionOptions}
              selectedValue={position}
              onValueChange={setPosition}
              placeholder="Select your preferred position"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder="Tell other players about yourself..."
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, loading && styles.updateButtonDisabled]} 
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={[styles.updateButtonText, { marginLeft: 8 }]}>Updating...</Text>
              </View>
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
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
  readOnlyInput: {
    backgroundColor: '#333333',
    color: '#CCCCCC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  updateButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    width: '90%',
    alignSelf: 'center',
  },
  updateButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginTop: 8,
    width: '90%',
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 12,
  },
  helpText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;