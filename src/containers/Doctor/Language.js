/**
 * Speciality
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import {CheckBox} from '@rneui/themed';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    languages: state.user.languages,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  getUserLanguages: UserActions.getUserLanguages,
  user_profile: UserActions.user_profile,
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
class Language extends Component {
  static componentName = 'Language';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.ulanguages = [];
    this.state = {
      loading: false,
      nodata: 0,
      userLang: 'en',
      languages: props.languages ? props.languages : '',
      user: props.user ? props.user : '',
      user_languages: [],
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.getUserLanguages();
    this.updateLanguages.bind(this);
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }

  getUserLanguages() {
    this.callInvoked = 1;
    var payload = '{"where":{"user_id":' + this.state.user.id + '}}';
    this.setState({loading: true});
    this.props
      .getUserLanguages({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            console.log('sss  ==  22 == ' + resp.data[i].language_id);
            this.ulanguages.push(resp.data[i].language_id);
          }
        }
        this.setState({loading: false});
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  }
  updateLanguages = data => {
    var carraylanguagesinfo = this.ulanguages;
    var that = this;
    this.setState({loading: true});
    if (carraylanguagesinfo.length) {
      Object.keys(carraylanguagesinfo).forEach(function (key) {
        if (data.status == true && data.id == carraylanguagesinfo[key]) {
          console.log('tttt 2222 ' + JSON.stringify(data));
          //remove
          that.ulanguages.splice(key, 1);
          that.setState({loading: false});
        } else {
          //add
          if (!that.ulanguages.includes(data.id)) {
            console.log('tttt 3333 ' + JSON.stringify(data));
            that.ulanguages.push(data.id);
            that.setState({loading: false});
          }
        }
      });
    } else {
      console.log('tttt yyyy ' + JSON.stringify(data));
      that.ulanguages.push(data.id);
      that.setState({loading: false});
    }

    var carraylanguagesinfo = this.ulanguages;
    var that = this;
    var frmdata = [];
    Object.keys(carraylanguagesinfo).forEach(function (key) {
      frmdata.push({language_id: carraylanguagesinfo[key]});
    });
    console.log('tttt 11' + JSON.stringify(frmdata));

    this.callInvoked = 1;
    var payload = {
      id: this.state.user.id,
      languages_users: frmdata,
      post_type: 'PUT',
    };
    this.props
      .user_profile(payload)
      .then(resp => {
        this.setState({loading: false});
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  };
  render = () => {
    var vmlanguagesinfo = [];
    if (this.state.languages) {
      var carraylanguagesinfo = this.state.languages;
      var i = 0;
      var u = this.ulanguages;
      var that = this;
      Object.keys(carraylanguagesinfo).forEach(function (key) {
        var lbl = carraylanguagesinfo[key].name;
        var status = u.length ? u.includes(carraylanguagesinfo[key].id) : false;
        console.log('sss  == ' + carraylanguagesinfo[key].id);
        vmlanguagesinfo.push(
          <View
            key={i}
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: 40,
              borderBottomWidth: 0.5,
              borderColor: AppColors.brand.black,
            }}>
            <View style={{flex: 0.95, paddingLeft: 10}}>
              <Text>{lbl}</Text>
            </View>
            <CheckBox
              checked={status}
              containerStyle={{
                padding: 0,
                margin: 0,
                height: 30,
                width: 30,
                backgroundColor: 'transparent',
                borderWidth: 0,
                paddingTop: 5,
              }}
              textStyle={{color: AppColors.brand.black}}
              onPress={that.updateLanguages.bind(that, {
                id: carraylanguagesinfo[key].id,
                status: status,
              })}
            />
          </View>,
        );
        i++;
      });
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.languages} />
        <ScrollView style={{flex: 1}}>{vmlanguagesinfo}</ScrollView>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Language);
