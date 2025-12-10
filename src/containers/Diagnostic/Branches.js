import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {Rating} from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as UserActions from '@reduxx/user/actions';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import NavComponent from '@components/NavComponent.js';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
var moment = require('moment');
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  branches: UserActions.branches,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
  },
  Listcontainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  tab: {
    padding: 15,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_tab: {
    padding: 15,
    minWidth: 70,
    borderBottomWidth: 4,
    borderColor: AppColors.brand.navbar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    fontSize: 12,
    lineHeight: 15,
    color: AppColors.brand.white,
  },
});

/* Component ==================================================================== */
class MyAppointments extends Component {
  static propTypes = {
    branches: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'today',
      userLang: 'en',
      cnt: 0,
      user: props.user ? props.user : '',
    };
  }
  componentDidMount() {
    this.get_appointments('today', 1);
  }

  get_appointments(q, p) {
    console.log('get_appointments == ' + JSON.stringify(this.state.user));
    if (this.callInvoked == 0) {
      var cf = q;
      var page = p ? p : this.state.page;
      var skip = 0;
      if (page == 1) {
        skip = 0;
      } else {
        skip = (page - 1) * 10;
      }
      //{"where":{"appointment_status_id":2,"user_id":2},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription"},"skip":0,"limit":20,"order":"id desc"}
      var payload =
        '{"where":{"clinic_user_id":' +
        this.state.user.id +
        '},"include":{"0":"city","1":"country"},"limit":1000,"skip":0}';
      this.callInvoked = 1;
      this.props
        .branches({filter: payload, type: q, token: this.state.user.userToken})
        .then(resp => {
          console.log('res booking data data=== == ' + JSON.stringify(resp));
          var datares = this.state.dataList.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
          console.log(
            'res booking data data=== == ' +
              JSON.stringify(resp.data.length) +
              JSON.stringify(datares),
          );
          if (page == 1 && resp.data.length == 0)
            this.setState({nodata: 1, page: cpage, dataList: datares});
          else this.setState({page: cpage, dataList: datares});
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  onEndReached = () => {
    this.get_appointments(this.state.cfilter, 0);
  };
  reload = () => {
    this.setState({cnt: this.state.cnt + 1, dataList: []});
    this.get_appointments(this.state.cfilter, 1);
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  FLabTestsList = data => {
    Actions.LabTestsListing({lab_data: data});
  };
  _renderRow = data => {
    console.log('data===' + JSON.stringify(data));
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          padding: 10,
          paddingBottom: 10,
          borderColor: AppColors.brand.black,
          borderBottomWidth: 0.3,
        }}>
        <View style={{flex: 0.6}}>
          <Text style={{fontSize: 15, color: AppColors.brand.navbar}}>
            {this.Capitalize(data.name)}{' '}
            <Text style={{fontSize: 11, color: AppColors.brand.black}}>
              {data.city ? data.city.name : null}
            </Text>
          </Text>
          <Text
            style={{
              textAlign: 'left',
              fontSize: 12,
              padding: 5,
              paddingleft: 0,
              lineHeight: 20,
            }}>
            <Icon
              name="clock-o"
              size={18}
              color={AppColors.brand.navbar}
              style={{marginRight: 8}}
            />{' '}
            {moment(data.open_time, 'HH:mm:ss').format('hh:mm A')} -{' '}
            {moment(data.close_time, 'HH:mm:ss').format('hh:mm A')}
          </Text>
          <Text
            style={{
              textAlign: 'left',
              fontSize: 12,
              padding: 5,
              paddingleft: 0,
              lineHeight: 20,
            }}>
            <Icon
              name="phone"
              size={18}
              color={AppColors.brand.navbar}
              style={{marginRight: 8}}
            />{' '}
            {data.country ? '+' + data.country.phone_code : ''}{' '}
            {data.phone_number}
          </Text>
        </View>
        <View style={{flex: 0.4}}>
          <TouchableOpacity
            onPress={this.FLabTestsList.bind(this, data)}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: AppColors.brand.btnColor,
              borderRadius: 30,
              padding: 10,
              paddingTop: 5,
              paddingBottom: 5,
            }}>
            <Text
              style={[
                AppStyles.regularFontText,
                {fontSize: 11, color: AppColors.brand.white, lineHeight: 15},
              ]}>
              {Strings.managelabtests}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  render = () => {
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.mybranches} />
        {this.state.nodata == 0 ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - 70,
            }}>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <FlatList
                data={this.state.dataList}
                renderItem={this._renderRow}
                onEndReached={this.onEndReached}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={[AppStyles.regularFontText]}>
                  {Strings.loading}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[AppStyles.regularFontText]}>{Strings.nodata}</Text>
          </View>
        )}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(MyAppointments);
