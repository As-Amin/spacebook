/* eslint-disable require-jsdoc */
/* eslint-disable react/jsx-no-undef */
import {StyleSheet, View, Text, ScrollView,
  TouchableOpacity, TextInput} from 'react-native';
import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../constants/colors.js';

class AccountScreen extends Component {
  constructor(props) {
    super(props);

    // State object to store all data
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isLoading: true,
      listData: [],
    };
  }

  /**
  * Instantiate network request to load data, call the function to retrieve data
  */
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
    this.getUserInfo();
  }

  /**
  * Allows the execution of React code when component unmounted from DOM tree
  */
  componentWillUnmount() {
    this.unsubscribe();
  }

  /**
  * Function loading users information into the the DOM tree from server.
  * @return {state} The states loading config and list data
  */
  getUserInfo = async () => {
    // Store the user id as a constant - retrieved from async storage
    const user = await AsyncStorage.getItem('@user_id');
    const token = await AsyncStorage.getItem('@session_token');

    return fetch('http://localhost:3333/api/1.0.0/user/' + user.toString(), {
      method: 'GET',
      headers: {
        'X-Authorization': token, // Assign the auth key to verify account
      },
    })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 401) {
            this.props.navigation.navigate('Login');
          } else if (response.status === 404) {
            throw new Error('Cannot find user');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then((responseJson) => {
          this.setState({
            isLoading: false,
            listData: responseJson,
          });
        })
        .catch((error) =>{
          console.log(error);
        });
  };

  logOut = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    await AsyncStorage.removeItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'POST', // POST request as sending request to like post
      headers: {
        'X-Authorization': token, // Assign the auth key to verify account
      },
    })
        .then((response) => {
          if (response.status === 200) {
            this.props.navigation.navigate('Login');
          } else if (response.status === 401) {
            this.props.navigation.navigate('Login');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then((responseJson) => {})
        .catch((error) =>{
          console.log(error);
        });
  };

  updateUserInfo = async () => {
    // Validation here
    const user = await AsyncStorage.getItem('@user_id');
    const token = await AsyncStorage.getItem('@session_token');

    return fetch('http://localhost:3333/api/1.0.0/user/' + user.toString(), {
      method: 'PATCH',
      headers: {
        'X-Authorization': token, // Assign the auth key to verify account
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        password: this.state.password,
      }),
    })
        .then((response) => {
          if (response.status === 200) {
            this.logOut();
          } else if (response.status === 400) {
            throw new Error('Failed validation');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .catch((error) => {
          console.log(error);
        });
  };

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    // If a session token is not found, navigate to login screen
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.text}>
            Loading account settings...
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>Account</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.cardBackground}>
              <Text style={styles.boldText}>
                {'First name: '}{this.state.listData.first_name}{'\n'}{'\n'}
              </Text>
              <Text style={styles.boldText}>
                {'Last name: '}{this.state.listData.last_name}{'\n'}{'\n'}
              </Text>
              <Text style={styles.boldText}>
                {'Email: '}{this.state.listData.email}{'\n'}
              </Text>
            </View>
            <View style={styles.lineSeperator}></View>
            <TextInput style={styles.textInput}
              placeholder="New first name..."
              onChangeText={(firstName) => this.setState({firstName})}
              value={this.state.firstName}
            />
            <TextInput style={styles.textInput}
              placeholder="New last name..."
              onChangeText={(lastName) => this.setState({lastName})}
              value={this.state.lastName}
            />
            <TextInput style={styles.textInput}
              placeholder="New email..."
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
            />
            <TextInput style={styles.textInput}
              placeholder="New password..."
              onChangeText={(password) => this.setState({password})}
              value={this.state.password}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button}
              onPress={() => this.updateUserInfo()}>
              <Text style={styles.buttonText}>Update information</Text>
            </TouchableOpacity>
            <View style={styles.lineSeperator}></View>
            <TouchableOpacity style={styles.button}
              onPress={() => this.logOut() &&
                      this.props.navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Log out</Text>
            </TouchableOpacity>
          </ScrollView>
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
  },
  scrollView: {
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
    fontSize: '300%',
    color: Colors.text,
  },
  cardBackground: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.lighterBackground,
  },
  button: {
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
});

export default AccountScreen;