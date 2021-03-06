import React from 'react';
import {
  createAppContainer, createMaterialTopTabNavigator, createSwitchNavigator, createStackNavigator,
} from 'react-navigation';
import {Provider, Toast} from '@ant-design/react-native';
import { ThemeProvider } from 'react-native-elements';
import Message from './src/page/message';
import Chat from './src/page/chat';
import Feed from './src/page/feed';
import Live from './src/page/live';
import User from './src/page/user';
import Auth from './src/auth';
import AuthLoading from './src/auth/loading';
import { tabBarOptions, elementTheme, _fontSize, _borderColor } from './src/constants/style';
import axios from 'axios';

const AV = require('leancloud-storage');
const { Realtime } = require('leancloud-realtime');
const APP_ID = 'GhmpwDf9XQ7jWQImfyiJb4dP-gzGzoHsz';
const APP_KEY = 'OFXI74J6oHXXCF0rt9B7Kn91';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
global.realtime = new Realtime({
  appId: APP_ID,
  appKey: APP_KEY,
});

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const message = error.response.data.message;
  Toast.show(message);
  return Promise.reject(message);
});

const TabNavigator = createMaterialTopTabNavigator({
  Chat: {
    screen: Chat,
  },
  Message: {
    screen: Message,
  },
  Live: {
    screen: Live,
  },
  feed: {
    screen: Feed,
  },
  user: {
    screen: User,
  },
}, {
    initialRouteName: 'Live',
    tabBarOptions,
    swipeEnabled: false,
  });
const AuthScreen = createStackNavigator({
  screen: Auth,
}, {
  defaultNavigationOptions: {
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomColor: _borderColor,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
    },
    headerTitleStyle: {
      flex: 1,
      textAlign: 'center',
      fontSize: _fontSize,
    },
  }
});
const AppContainer = createAppContainer(createSwitchNavigator({
  AuthLoading,
  App: TabNavigator,
  Auth: AuthScreen,
  Chat: Chat
}))

export default class Main extends React.Component {
  render() {
    return (
      <Provider>
        <ThemeProvider theme={elementTheme}>
          <AppContainer />
        </ThemeProvider>
      </Provider>
    );
  }
};