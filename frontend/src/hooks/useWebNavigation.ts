import {Platform} from 'react-native';
import {useNavigate} from 'react-router-dom';

export const useWebNavigation = () => {
  const navigate = useNavigate();
  
  const webNavigate = (screenName: string) => {
    const routeMap: {[key: string]: string} = {
      'GameSearch': '/games',
      'CreateLocation': '/create-location',
      'CreateGame': '/create-game',
      'Profile': '/profile',
      'MyGames': '/my-games',
      'Home': '/home',
      'Login': '/login',
      'Register': '/register',
    };
    
    if (Platform.OS === 'web') {
      navigate(routeMap[screenName] || '/');
    }
  };
  
  return {navigate: webNavigate};
};