// import { StatusBar } from 'expo-status-bar';
import React, {Component} from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import PostScreen from './PostScreen';
import FriendsScreen from './FriendsScreen';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from './constants/colors.js';

const Tab = createBottomTabNavigator();

// eslint-disable-next-line require-jsdoc
class TabNavigateScreen extends Component {
  /**
 * Renders the tab navigator at the bottom of the screen.
 * @return {NavigationContainer} The tab navigator.
 */
  render() {
    return (
      <Tab.Navigator
        screenOptions={({route}) => (
          {tabBarIcon: ({color, size}) => {
            if (route.name == 'Home') {
              return <IonIcons
                name={'planet-outline'}
                size={size}
                color={color} />;
            } else if (route.name == 'New Post') {
              return <IonIcons
                name={'add-circle-outline'}
                size={size}
                color={color} />;
            } else if (route.name == 'Friends') {
              return <IonIcons
                name={'people-outline'}
                size={size}
                color={color} />;
            } else if (route.name == 'Settings') {
              return <IonIcons
                name={'settings-outline'}
                size={size}
                color={color} />;
            }
          },
          tabBarActiveTintColor: Colors.theme,
          tabBarInactiveTintColor: 'gray',
          })}>

        <Tab.Screen name='Home' component={HomeScreen}/>
        <Tab.Screen name='New Post' component={PostScreen} />
        <Tab.Screen name='Friends' component={SettingsScreen} />
        <Tab.Screen name='Settings' component={SettingsScreen} />
      </Tab.Navigator>
    );
  }
}

export default TabNavigateScreen;