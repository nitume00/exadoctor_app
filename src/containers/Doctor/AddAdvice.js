/**
 * Add Advice
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
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  medicine_type: UserActions.medicine_type,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar,
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
class AddAdvice extends Component {
  static componentName = 'AddAdvice';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.uspecialities = [];
    this.state = {
      loading: false,
      userLang: 'en',
      reloadPreviousView: false,
      advice: '',
      advices_list: this.props.advices_list ? this.props.advices_list : [],
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }

  componentDidMount = () => {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  };

  validate = () => {
    if (this.state.advice == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteraadvice,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      this.setState({reloadPreviousView: true});
      Actions.pop();
    }
  };

  componentWillUnmount = () => {
    if (this.state.reloadPreviousView) {
      var data = this.state.advices_list;
      var advice_list = {};
      advice_list['advice'] = this.state.advice;
      data.push(advice_list);
      console.log('reloadViewdata==> ' + JSON.stringify(data));
      this.props.reloadView_advice(data);
    }
  };

  render = () => {
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.addmedicine} />
        <ScrollView style={{flex: 1, backgroundColor: AppColors.brand.primary}}>
          <View style={{flex: 1}}>
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.advice}
              lblTxt={Strings.advice}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.advice}
              onChangeText={advice => this.setState({advice})}
            />
          </View>
          <Spacer size={40} />
          <Button
            onPress={this.validate}
            title={Strings.add}
            backgroundColor={AppColors.brand.buttonclick}
            fontSize={15}
          />
        </ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(AddAdvice);
