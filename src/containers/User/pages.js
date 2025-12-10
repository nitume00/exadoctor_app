/**
 * Pages
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ListView,
  Alert,
  ScrollView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    pages: state.user.pages,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  input: {
    margin: 15,
    height: 20,
  },
  label: {
    color: '#a8a8aa',
    fontSize: 16,
  },
  inputBlock: {
    borderBottomWidth: 2,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class Pages extends Component {
  static componentName = 'Pages';
  constructor(props) {
    super(props);
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      user: props.user ? props.user : '',
      pages: props.pages ? props.pages : '',
      page: props.page ? props.page : '',
      url: props.url ? props.url : '',
      title: props.title ? props.title : '',
      open_url: props.open_url ? props.open_url : '',
    };
    console.log('urlll ' + props.url);
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    if (this.state.url)
      Image.getSize(this.state.url, (width, height) => {
        this.setState({width, height});
      });
  }

  render = () => {
    if (this.state.url === '' && this.state.open_url === '') {
      var description = 'No content addded.';
      var title = 'Page';
      for (var i = 0; i < this.state.pages.length; i++) {
        console.log(
          'pages === rr == ' +
            JSON.stringify(this.state.pages[i].slug) +
            '==' +
            this.state.page,
        );
        if (this.state.pages[i].slug == this.state.page) {
          description = this.state.pages[i].page_content;
          title = this.state.pages[i].title;
        }
      }
      return (
        <View style={[styles.background]}>
          <NavComponent backArrow={true} title={title} />
          <View style={{height: 10}} />
          <WebView
            originWhitelist={['*']}
            source={{html: description}}
            style={AppStyles.regularFontText}
            scalesPageToFit={false}
          />
        </View>
      );
    } else if (this.state.open_url) {
      return (
        <View style={[styles.background]}>
          <NavComponent backArrow={true} title={this.state.title} />
          <View style={{height: 10}} />
          <WebView
            source={{uri: this.state.open_url}}
            style={AppStyles.regularFontText}
            scalesPageToFit={true}
          />
        </View>
      );
    } else {
      const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;

      return (
        <View style={[styles.background]}>
          <NavComponent backArrow={true} title={this.state.title} />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
            }}>
            <Image
              style={{width: this.state.width, height: this.state.height}}
              source={{uri: this.state.url}}
            />
          </View>
        </View>
      );
    }
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Pages);
