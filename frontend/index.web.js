import { AppRegistry } from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('ballup', () => App);
AppRegistry.runApplication('ballup', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});