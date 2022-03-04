// eslint-disable-next-line max-len
import {StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Image} from 'react-native';
import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../constants/colors.js';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

/**
 * View profile screen to display the profile of the user or friend
 * whos profile is requested to be viewed.
 * @return {render} Renders the profile screen.
*/
class ViewProfileScreen extends Component {
  /**
  * Constuctor for the view profile screen component class inheriting
  * properties from the Component class
  * @param {Component} props Inherited properties for the components.
  */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      allPostsData: [],
      userId: '', // ID of user whos profile is being displayed
      friendFirstName: 'My Profile', // Whos profile it is, to display at top
      loggedInAccountUserId: '', // ID of user whos logged in
      userTextToPost: '',
      photo: '',
      // Store all of the draft posts
      allDraftPosts: [],
      draftToPost: '',
      // Whether to display drafts or not
      renderDrafts: false,
      renderDraftsButtonText: 'View drafts',
    };
  }

  /**
  * Instantiate network request to load data, call the function to retrieve data
  */
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getPosts();
    });
    this.getDraftPosts();
  }

  /**
  * Allows the execution of React code when component unmounted from DOM tree
  */
  componentWillUnmount() {
    this.unsubscribe();
  }

  /**
  * Function loading all of the users post to update from the server.
  * @return {fetch} Response from the fetch statement for getting
  * the posts.
  */
  getPosts = async () => {
    try {
    // Store the user id as a constant - retrieved from async storage
      const user = await AsyncStorage.getItem('@user_id');
      const token = await AsyncStorage.getItem('@session_token');
      // Check if to view friends posts or users posts
      try {
        if (this.props.route.params.friendId.toString() !== user.toString()) {
          this.setState({
            userId: this.props.route.params.friendId.toString(),
            friendFirstName:
              this.props.route.params.friendFirstName.toString() +
              '\'s profile',
          });
        }
      } catch (error) {
        this.setState({
          userId: user.toString(),
        });
      }
      return fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId + '/post', {
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
            } else if (response.status === 403) {
              throw new Error('Can only view posts of yourself or friends');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .then((responseJson) => {
            this.setState({
              isLoading: false,
              allPostsData: responseJson,
              loggedInAccountUserId: user,
            });
            this.getProfileImage();
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
  * Function allowing user to post on the profile of the friend or their
  * own profile.
  * @param {String} textToPost The text that the user wants to post from
  * the drafts or directly as a new post.
  * @return {fetch} Response from the fetch statement for
  * posting a post on the profile.
  */
  postOnProfile = async (textToPost) => {
    try {
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId + '/post', {
        method: 'POST',
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToPost.toString(),
        }),
      })
          .then((response) => {
            if (response.status === 201) {
              this.getPosts();
              this.setState({
                userTextToPost: '', // So user can post again
                draftToPost: '',
              });
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 404) {
              throw new Error('Post not found!');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
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
  * Function which sends a POST request to like a post
  * into the the DOM tree from server.
  * @param {int} postId The identifier for the post to like.
  * @return {fetch} Response from the fetch statement for
  * liking a users post.
  */
  likePost = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId + '/post/' + postId.toString() + '/like', {
        method: 'POST', // POST request as sending request to like post
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
        },
      })
          .then((response) => {
            if (response.status === 200) {
              this.getPosts();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 403) {
              throw new Error('You have already liked this post!');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .catch((error) => {
            toast.error('You have already liked this post!');
            console.log(error);
          });
    } catch (error) {
      toast.error('Something went wrong. Please try again!');
      console.log('There was an error making the request: ' + error);
    }
  };

  /**
  * Function which sends a DELETE request to dislike a post
  * into the the DOM tree from server.
  * @param {int} postId The identifier for the post to dislike.
  * @return {fetch} Response from the fetch statement for
  * disliking a users post.
  */
  dislikePost = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId + '/post/' + postId.toString() + '/like', {
        method: 'DELETE', // DELETE request as sending request to dislike post
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
        },
      })
          .then((response) => {
            if (response.status === 200) {
              this.getPosts();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 403) {
              throw new Error('You have not liked this post!');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
            }
          })
          .catch((error) => {
            toast.error('You have not liked this post!');
            console.log(error);
          });
    } catch (error) {
      toast.error('Something went wrong. Please try again!');
      console.log('There was an error making the request: ' + error);
    }
  };

  /**
  * Function which sends a DELETE request to delete a post.
  * @param {int} postId The identifier for the post to delete.
  * @return {fetch} Response from the fetch statement for
  * deleting a users post.
  */
  deletePost = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('@session_token');
      return fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId.toString() + '/post/' + postId.toString(), {
        method: 'DELETE',
        headers: {
          'X-Authorization': token, // Assign the auth key to verify account
        },
      })
          .then((response) => {
            if (response.status === 200) {
              this.getPosts();
            } else if (response.status === 401) {
              this.props.navigation.navigate('LoginScreen');
            } else if (response.status === 403) {
              throw new Error('You can only delete your own posts!');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Something went wrong');
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
  * Function retrieving the users profile image from the server so it can
  * be viewed and updated.
  * @return {fetch} Response from the fetch statement for patch request
  * to get users profile image.
  */
  getProfileImage = async () => {
    try {
      const value = await AsyncStorage.getItem('@session_token');
      fetch('http://localhost:3333/api/1.0.0/user/' + this.state.userId.toString() + '/photo', {
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
            const data = URL.createObjectURL(responseBlob);
            this.setState({photo: data.toString()});
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
  * Function getting draft posts and storing the posts in an array.
  */
  getDraftPosts = async () => {
    try {
      const drafts = await AsyncStorage.getItem('@draft_posts');
      this.setState({allDraftPosts: JSON.parse(drafts)});
    } catch (error) {
      // Error getting data
      console.log(error);
    }
  };

  /**
  * Function saving posts as drafts and storing the posts in async
  * storage to post later.
  * @param {String} draftPost The post text to save as a draft in async storage.
  */
  saveAsDraft = async (draftPost) => {
    try {
      // Check if the post length is bigger than 0
      if (draftPost.toString().length > 0) {
        // Add the draft to the draft post list
        this.setState({allDraftPosts:
          [...this.state.allDraftPosts, draftPost]});
        await AsyncStorage.setItem('@draft_posts',
            JSON.stringify(this.state.allDraftPosts));
        this.setState({userTextToPost: ''});
      }
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  };

  /**
  * Function deleting draft posts from the draft post array.
  * @param {String} draftPostToDelete The post text to delete
  * from async storage.
  */
  deleteDraftPost = (draftPostToDelete) => {
    try {
      for (let i=0; i<this.state.allDraftPosts.length; i++) {
        const draftFound = this.state.allDraftPosts[i].toString();
        if (draftPostToDelete.toString() === draftFound) {
          this.state.allDraftPosts.splice(i, 1);
        }
      }
      this.getPosts();
    } catch (error) {
      // Error deleting data
      console.log(error);
    }
  };

  /**
  * Function posting drafts on the profile and deleting the draft post
  * from the users draft post array.
  * @param {String} draftPost The post text to post and delete from drafts.
  */
  postAndDeleteDraft = (draftPost) => {
    if (this.state.draftToPost.length !== 0) {
      this.postOnProfile(this.state.draftToPost); // Post the changed draft
    } else {
      this.postOnProfile(draftPost); // Post the unchanged draft
    }
    this.deleteDraftPost(draftPost);
  };

  /**
  * Function which toggles the boolean to render drafts on the click of
  * a button.
  */
  toggleRenderDrafts = () => {
    if (this.state.renderDrafts === true) {
      this.setState({
        renderDrafts: false,
        renderDraftsButtonText: 'View drafts',
      });
    } else if (this.state.renderDrafts === false) {
      this.setState({
        renderDrafts: true,
        renderDraftsButtonText: 'Collapse drafts',
      });
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
  * profile screen.
  * @return {View} The container for the profile screen.
  */
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>
            {this.state.friendFirstName}
          </Text>
          <FlatList style={styles.flatList}>
            <Text style={styles.text}>
              {'Loading posts...'}
            </Text>
          </FlatList>
        </View>
      );
    } else {
      return (
        <View style={styles.flexContainer}>
          <Text style={styles.title}>
            <Image style={styles.profileImage}
              source={{uri: this.state.photo}}/>
            {' '}{this.state.friendFirstName}
          </Text>
          <View style={styles.postOnProfileView}>
            <TextInput style={styles.textInput}
              placeholder="New post here..."
              onChangeText={(userTextToPost) => this.setState({userTextToPost})}
              value={this.state.userTextToPost}/>
            <View style={styles.flexContainerButtons}>
              <TouchableOpacity style={styles.button}
                onPress={() => this.postOnProfile(this.state.userTextToPost)}>
                <Text style={styles.buttonText}>
                  {'Post'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}
                onPress={() => this.saveAsDraft(this.state.userTextToPost)}>
                <Text style={styles.buttonText}>
                  {'Save as draft'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lineSeperator}></View>
            <View style={styles.flexContainerButtons}>
              <TouchableOpacity style={styles.button}
                onPress={() => this.toggleRenderDrafts()}>
                <Text style={styles.buttonText}>
                  {this.state.renderDraftsButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.renderDrafts === true ?
            <FlatList style={styles.flatList}
              data={this.state.allDraftPosts}
              keyExtractor={(item, index) => item + index}
              renderItem={({item, index}) => (
                <View style={styles.cardBackground}>
                  <Text style={styles.boldText}>
                    {'Draft post: '} {'\n'}
                  </Text>
                  <TextInput style={styles.textInputDraft}
                    placeholder={item}
                    onChangeText={(draftToPost) =>
                      this.setState({draftToPost})}
                    value={this.state.draftToPost} />
                  <View style={styles.flexContainerButtons}>
                    <TouchableOpacity style={styles.button}
                      onPress={() => this.postAndDeleteDraft(item)}>
                      <Text style={styles.buttonText}>
                        {'Post'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                      onPress={() => console.log('worked')}>
                      <Text style={styles.buttonText}>
                        {'Schedule'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                      onPress={() => this.deleteDraftPost(item)}>
                      <Text style={styles.buttonText}>
                        {'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            /> :
            <></> }
          <View style={styles.lineSeperator}></View>
          <FlatList style={styles.flatList}
            data={this.state.allPostsData}
            keyExtractor={(item, index) => item.post_id.toString()}
            renderItem={({item, index}) => (
              <View style={styles.cardBackground}>
                <Text style={styles.boldText}>
                  {'Post from ' + item.author.first_name + ' ' +
                        item.author.last_name + ':'} {'\n'}{'\n'}
                </Text>
                <Text style={styles.text}>
                  {item.text} {'\n'}{'\n'}
                </Text>
                <Text style={styles.boldText}>
                  {new Date(item.timestamp).getHours() + ':' +
                    new Date(item.timestamp).getMinutes() +
                    ' | ' + new Date(item.timestamp).toDateString() +
                    ' | Likes: ' + item.numLikes} {'\n'}{'\n'}
                </Text>
                <View style={styles.flexContainerButtons}>
                  <TouchableOpacity style={styles.button}
                    onPress={() =>
                      this.props.navigation.navigate('ViewSinglePostScreen', {
                        userId: this.state.userId,
                        postId: item.post_id,
                        postAuthorFirstName: item.author.first_name,
                      })}>
                    <Text style={styles.buttonText}>
                      {'View'}
                    </Text>
                  </TouchableOpacity>
                  {item.author.user_id.toString() !==
                    this.state.loggedInAccountUserId ?
                    <></> :
                    <><TouchableOpacity style={styles.button}
                      onPress={() => this.deletePost(item.post_id)}>
                      <Text style={styles.buttonText}>
                        {'Delete'}
                      </Text>
                    </TouchableOpacity><TouchableOpacity style={styles.button}
                      onPress={() =>
                        this.props.navigation.navigate('UpdatePostScreen', {
                          userId: this.state.userId,
                          postId: item.post_id,
                          friendFirstName: this.state.friendFirstName,
                        })}>
                      <Text style={styles.buttonText}>
                        {'Update'}
                      </Text>
                    </TouchableOpacity></> }
                  {item.author.user_id.toString() ===
                    this.state.loggedInAccountUserId ?
                    <></> :
                    <><TouchableOpacity style={styles.button}
                      onPress={() =>
                        this.likePost(item.post_id)}>
                      <Text style={styles.buttonText}>
                        {'Like'}
                      </Text>
                    </TouchableOpacity><TouchableOpacity style={styles.button}
                      onPress={() =>
                        this.dislikePost(item.post_id)}>
                      <Text style={styles.buttonText}>
                        {'Dislike'}
                      </Text>
                    </TouchableOpacity></> }
                </View>
              </View>
            )}
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
  postOnProfileView: {
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
  textInputDraft: {
    padding: 5,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: Colors.darkerBackground,
    color: Colors.text,
  },
  lineSeperator: {
    margin: 5,
    padding: 1,
    borderRadius: 10,
    backgroundColor: Colors.lineBreak,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 400/2,
    borderWidth: 3,
    borderColor: Colors.text,
  },
});

export default ViewProfileScreen;