/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';

import FriendsScreen from './FriendsScreen';
import GetFriendsPosts from '../../components/ProfileAndFriendsScreens/ViewProfileScreen';
import ViewSinglePost from '../../components/ProfileAndFriendsScreens/ViewSinglePost';

const Stack = createStackNavigator();

class FriendsScreenNavigator extends Component {
  /**
 * Main Friends Screen constructor to connect components together.
 * @return {Navigator} The stack navigator for all friends screen components.
 */
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name='FriendsScreen'
          component={FriendsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='GetFriendsPosts'
          component={GetFriendsPosts}
          options={{title: 'Back to friends'}}
        />
        <Stack.Screen
          name='ViewSinglePost'
          component={ViewSinglePost}
          options={{title: 'Back to friends profile'}}
        />
      </Stack.Navigator>
    );
  }
}

export default FriendsScreenNavigator;
