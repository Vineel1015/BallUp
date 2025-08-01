import React from 'react';
import {Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Routes, Route, Navigate} from 'react-router-dom';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import GameSearchScreen from '../screens/GameSearchScreen';
import CreateLocationScreen from '../screens/CreateLocationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyGamesScreen from '../screens/MyGamesScreen';
import CreateGameScreen from '../screens/CreateGameScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  GameSearch: undefined;
  CreateLocation: undefined;
  Profile: undefined;
  MyGames: undefined;
  CreateGame: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  if (Platform.OS === 'web') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/games" element={<GameSearchScreen />} />
        <Route path="/create-location" element={<CreateLocationScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/my-games" element={<MyGamesScreen />} />
        <Route path="/create-game" element={<CreateGameScreen />} />
      </Routes>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{title: 'Create Account'}}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{title: 'BallUp'}}
      />
      <Stack.Screen 
        name="GameSearch" 
        component={GameSearchScreen}
        options={{title: 'Find Games'}}
      />
      <Stack.Screen 
        name="CreateLocation" 
        component={CreateLocationScreen}
        options={{title: 'Add Court'}}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: 'My Profile'}}
      />
      <Stack.Screen 
        name="MyGames" 
        component={MyGamesScreen}
        options={{title: 'My Games'}}
      />
      <Stack.Screen 
        name="CreateGame" 
        component={CreateGameScreen}
        options={{title: 'Create Game'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;