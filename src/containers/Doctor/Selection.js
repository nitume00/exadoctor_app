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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
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
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {};
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
class Insurance extends Component {
  static componentName = 'Insurance';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      loading: false,
      nodata: 0,
      userLang: 'en',
      optiontypes: props.types ? props.types : '',
      user: props.user ? props.user : '',
      user_insurances: [],
      id: '',
      label: '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }

  updateSelection = (id, label) => {
    this.setState({id, label});
    if (this.props.reload) {
      var s = {ptype: this.props.ptype, id: id, label: label};
      this.props.reload(this.props.ptype, id, label);
    }
    Actions.pop();
  };

  render = () => {
    var vminfo = [];
    console.log('ttt' + JSON.stringify(this.state.optiontypes));
    if (this.state.optiontypes) {
      var carrayoptiontypes = this.state.optiontypes;
      var i = 0;
      var that = this;
      Object.keys(carrayoptiontypes).forEach(function (key) {
        var lbl = carrayoptiontypes[key].name;
        var id = carrayoptiontypes[key].id;
        var checked = false;
        if (that.state.id === id) checked = true;
        vminfo.push(
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
            <View style={{flex: 0.8, paddingLeft: 10}}>
              <Text>{lbl}</Text>
            </View>
            <CheckBox
              checked={checked}
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
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              onPress={that.updateSelection.bind(that, id, lbl)}
            />
          </View>,
        );
        i++;
      });
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={this.props.title} />
        <ScrollView style={{flex: 1}}>{vminfo}</ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(Insurance);
