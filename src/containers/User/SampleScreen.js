/**
 * User Profile
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, {Component} from 'react';
import {
  View,
  Alert,
  ListView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {TabViewAnimated, TabBar} from 'react-native-tab-view';
import {SocialIcon} from '@rneui/themed';
import {Actions} from 'react-native-router-flux';

// Consts and Libs
import {AppColors, AppStyles} from '@theme/';

// Components
import {
  Alerts,
  Button,
  Card,
  Spacer,
  Text,
  List,
  ListItem,
  FormInput,
  FormLabel,
} from '@components/ui/';

/* Component ==================================================================== */
class UserProfile extends Component {
  static componentName = 'UserProfile';

  constructor(props) {
    super(props);
  }

  render = () => <View />;
}

/* Export Component ==================================================================== */
export default UserProfile;
