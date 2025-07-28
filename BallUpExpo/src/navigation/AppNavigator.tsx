import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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