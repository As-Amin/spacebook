// eslint-disable-next-line max-len
import {StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Image} from 'react-native';
import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../constants/colors.js';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

/**
 * Friends screen to display the friends of the user, allowing users
 * to view, add and interact with profiles.
 * @return {render} Renders the account screen.
*/
class FriendsScreen extends Component {
  /**
  * Constuctor for the friends screen component class inheriting
  * properties from the Component class
  * @param {Component} props Inherited properties for the components.
  */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userFriendsData: [],
      userToFind: '',
      photos: [],
    };
  }

  /**
  * Instantiate network request to load data, call the function to retrieve data
  */
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
    this.getFriends();
  }

  /**
  * Allows the execution of React code when component unmounted from DOM tree
  */
  componentWillUnmount() {
    this.unsubscribe();
  }

  /**
  * Function loading all of the users friends from the server.
  * @return {fetch} Response from the fetch statement for getting all
  * friends.
  */
  getFriends = async () => {
    try {
    // Store the auth key as a constant - retrieved from async storage
      const userId = await AsyncStorage.getItem('@user_id');
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/user/' + userId.toString() + '/friends', {
        method: 'GET',
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
        },
      })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .then((responseJson) => {
            this.setState({
              isLoading: false,
              userFriendsData: responseJson,
            });
            for (let i=0; i<this.state.userFriendsData.length; i++) {
              const item = responseJson[i];
              this.getProfileImage(item.user_id);
            }
          })
          .catch((error) =>{
            console.log(error);
          });
    } catch (error) {
      toast.error('Something went wrong. Please try again!');
      console.log('There was an error making the request: ' + error);
    }
  };

  /**
  * Function loading all of the users friends from the server with
  * keywords in their name included from the search box input.
  * @return {fetch} Response from the fetch statement for getting all
  * friends.
  */
  findUser = async () => {
    try {
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/search?q=' + this.state.userToFind.toString() + '&limit=20&search_in=friends', {
        method: 'GET',
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
        },
      })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .then((responseJson) => {
            this.setState({
              userFriendsData: responseJson,
              userToFind: '', // Reset user to find so can search new users
            });
          })
          .catch((error) => {
            console.log(error);
          });
    } catch (error) {
      toast.error('Something went wrong. Please try again!');
      console.log('There was an error making the request: ' + error);
    }
  };

  /**
  * Function retrieving the users profile image from the server so it can
  * be viewed and updated.
  * @param {int} userToGetImageFor The user id for the user to get the profile
  * image of.
  * @return {fetch} Response from the fetch statement for patch request
  * to get users profile image.
  */
  getProfileImage = async (userToGetImageFor) => {
    try {
      let data = '';
      const value = await AsyncStorage.getItem('@session_token');
      fetch('http://localhost:3333/api/1.0.0/user/' + userToGetImageFor.toString() + '/photo', {
        method: 'GET',
        headers: {
          'X-Authorization': value,
        },
      })
          .then((response) => {
            if (response.status === 200) {
              return response.blob();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .then((responseBlob) => {
            data = URL.createObjectURL(responseBlob);
            this.setState({photos: [...this.state.photos, data]});
          })
          .catch((error) => {
            console.log(error);
          });
    } catch (error) {
      toast.error('Something went wrong. Please try again!');
      console.log('There was an error making the request: ' + error);
    }
  };

  /**
  * Function checking if user is logged in and if they arent,
  * renavigating to the login screen - increasing security.
  */
  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    // If a session token is not found, navigate to login screen
    if (value == null) {
      this.props.navigation.navigate('LoginScreen');
    }
  };

  /**
  * Renders the GUI allowing users to navigate and interact with
  * friends screen.
  * @return {View} The container for the friends screen.
  */
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>
            {'Friends'}
          </Text>
          <FlatList style={styles.flatList}>
            <Text style={styles.text}>
              {'Loading friends...'}
            </Text>
          </FlatList>
        </View>
      );
    } else {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>
            {'Friends'}
          </Text>
          <View style={styles.searchUserView}>
            <TextInput style={styles.textInput}
              placeholder="Enter friend name here..."
              onChangeText={(userToFind) => this.setState({userToFind})}
              value={this.state.userToFind}/>
            <View style={styles.flexContainerButtons}>
              <TouchableOpacity style={styles.button}
                onPress={() => this.findUser(this.state.userToFind)}>
                <Text style={styles.buttonText}>
                  {'Search'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}
                onPress={() => this.getFriends()}>
                <Text style={styles.buttonText}>
                  {'Reset'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lineSeperator}></View>
          </View>
          <FlatList style={styles.flatList}
            data={this.state.userFriendsData}
            renderItem={({item, index}) => (
              <View style={styles.cardBackground}>
                <View style={styles.backgroundNameImage}>
                  <Image style={styles.profileImage}
                    source={{uri: this.state.photos[index]}}/>
                  <Text style={styles.usernameText}>
                    {'  Friend name: ' + item.user_givenname + ' ' +
                  item.user_familyname} {'\n'}{'\n'}
                  </Text>
                </View>
                <View style={styles.flexContainerButtons}>
                  <TouchableOpacity style={styles.button}
                    onPress={() =>
                      this.props.navigation.navigate(
                          'GetFriendsPostsScreen', {
                            friendId: item.user_id,
                            friendFirstName: item.user_givenname,
                          })}>
                    <Text style={styles.buttonText}>
                      {'View and add posts'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}
                    onPress={() =>
                      this.props.navigation.navigate(
                          'FriendViewFriendsScreen', {
                            friendId: item.user_id,
                            friendFirstName: item.user_givenname,
                          })}>
                    <Text style={styles.buttonText}>
                      {'View friends'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => item.user_id.toString()}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  flexContainerButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flatList: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  searchUserView: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  text: {
    fontSize: 16,
    color: Colors.text,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  title: {
    padding: 5,
    margin: 5,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: '250%',
    color: Colors.text,
  },
  cardBackground: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.lighterBackground,
  },
  backgroundNameImage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    padding: 7.5,
    margin: 5,
    fontSize: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.theme,
    color: Colors.text,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  textInput: {
    padding: 5,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: Colors.lighterBackground,
    color: Colors.text,
  },
  lineSeperator: {
    margin: 5,
    padding: 1,
    borderRadius: 10,
    backgroundColor: Colors.lineBreak,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 400/2,
    borderWidth: 3,
    borderColor: Colors.text,
  },
  usernameText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
});

export default FriendsScreen;
