/**
 * Insurance
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
    insurances: state.user.insurances,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  getUserInsurances: UserActions.getUserInsurances,
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
class Insurance extends Component {
  static componentName = 'Insurance';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.uinsurances = [];
    this.state = {
      loading: false,
      nodata: 0,
      userLang: 'en',
      insurances: props.insurances ? props.insurances : '',
      user: props.user ? props.user : '',
      user_insurances: [],
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.getUserInsurances();
    this.updateInsurances.bind(this);
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }

  getUserInsurances() {
    this.callInvoked = 1;
    var payload = '{"where":{"user_id":' + this.state.user.id + '}}';
    this.setState({loading: true});
    this.props
      .getUserInsurances({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            console.log('sss  ==  22 == ' + resp.data[i].insurance_company_id);
            //this.state.user_insurances.push(resp.data[i].specialty_id);
            this.uinsurances.push(resp.data[i].insurance_company_id);
          }
        }
        this.setState({loading: false});
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  }
  updateInsurances = data => {
    var carrayinsurancesinfo = this.uinsurances;
    var that = this;
    this.setState({loading: true});
    if (carrayinsurancesinfo.length) {
      Object.keys(carrayinsurancesinfo).forEach(function (key) {
        if (data.status == true && data.id == carrayinsurancesinfo[key]) {
          //remove
          //that.state.user_insurances.splice(key, 1);
          that.uinsurances.splice(key, 1);
          that.setState({loading: false});
          //console.log("tttt 11"+JSON.stringify(that.uinsurances));
        } else {
          //add
          if (!that.uinsurances.includes(data.id)) {
            //that.state.user_insurances.push(data.id);
            that.uinsurances.push(data.id);
            that.setState({loading: false});
            //console.log("tttt 11"+JSON.stringify(that.uinsurances));
          }
        }
      });
    } else {
      that.uinsurances.push(data.id);
      that.setState({loading: false});
    }

    var carrayinsurancesinfo = this.uinsurances;
    var that = this;
    var frmdata = [];
    Object.keys(carrayinsurancesinfo).forEach(function (key) {
      frmdata.push({id: carrayinsurancesinfo[key]});
    });
    console.log('tttt 11' + JSON.stringify(frmdata));

    this.callInvoked = 1;
    var payload = {
      id: this.state.user.id,
      user_insurance: frmdata,
      post_type: 'PUT',
    };
    this.props
      .user_profile(payload)
      .then(resp => {
        this.setState({loading: false});
        console.log('ttt res == ' + JSON.stringify(resp));
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  };
  render = () => {
    var vminsurancesinfo = [];
    if (this.state.insurances) {
      var carrayinsurancesinfo = this.state.insurances;
      var i = 0;
      var u = this.uinsurances;
      var that = this;
      Object.keys(carrayinsurancesinfo).forEach(function (key) {
        var lbl = Strings.lblinsurances[carrayinsurancesinfo[key].id];
        console.log('sss  == ' + lbl + '==' + JSON.stringify(u));
        var status = u.length
          ? u.includes(carrayinsurancesinfo[key].id)
          : false;
        vminsurancesinfo.push(
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
              onPress={that.updateInsurances.bind(that, {
                id: carrayinsurancesinfo[key].id,
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
        <NavComponent backArrow={true} title={Strings.insurances} />
        <ScrollView style={{flex: 1}}>{vminsurancesinfo}</ScrollView>
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
