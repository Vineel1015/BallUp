import React from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BrowserRouter} from 'react-router-dom';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const NavigationWrapper = Platform.OS === 'web' ? BrowserRouter : NavigationContainer;
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationWrapper>
          <AppNavigator />
        </NavigationWrapper>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;