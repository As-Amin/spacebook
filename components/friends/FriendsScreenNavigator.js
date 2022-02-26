import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import FriendsScreen from './FriendsScreen';
import GetFriendsPosts from '../profile-and-friends/ViewProfileScreen';
import ViewSinglePost from '../profile-and-friends/ViewSinglePost';
import UpdatePostScreen from '../profile-and-friends/UpdatePostScreen';

const Stack = createStackNavigator();

/**
 * Friends screen stack navigator allowing users to navigate
 * through every screen related to the friends screen
 * @return {render} Renders the stack navigator.
*/
class FriendsScreenNavigator extends Component {
  /**
  * Renders the stack navgigator for the friends related screens.
  * @return {Stack.Navigator} The stack navigator.
  */
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name='FriendsScreen'
          component={FriendsScreen}
          options={{headerShown: false}}/>
        <Stack.Screen
          name='GetFriendsPostsScreen'
          component={GetFriendsPosts}
          options={{title: 'Back to friends'}}/>
        <Stack.Screen
          name='ViewSinglePostScreen'
          component={ViewSinglePost}
          options={{title: 'Back to friends profile'}}/>
        <Stack.Screen
          name='UpdatePostScreen'
          component={UpdatePostScreen}
          options={{title: 'Back to friends profile'}}/>
      </Stack.Navigator>
    );
  }
}

export default FriendsScreenNavigator;
