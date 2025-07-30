import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import { apiService, setAuthToken } from '../services/api';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateInputs = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiService.login({ email, password });
      
      // Store the auth token
      await setAuthToken(response.data.token);
      
      Alert.alert('Success', 'Login successful!');
      navigation.navigate('Home');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏀 BallUp</Text>
        <Text style={styles.subtitle}>Find your next game</Text>

        <View style={styles.form}>
          <View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: undefined});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={isLoading}>
            <Text style={[styles.registerButtonText, isLoading && styles.registerButtonTextDisabled]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FF6B35',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  form: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    color: '#FFFFFF',
    width: '90%',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#2A1A1A',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonTextDisabled: {
    color: '#ccc',
  },
});

export default LoginScreen;