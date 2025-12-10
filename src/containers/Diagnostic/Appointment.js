import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {Rating} from '@rneui/themed';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import NavComponent from '@components/NavComponent.js';

import SideMenu from 'react-native-side-menu-updated';
import Menu from '@containers/ui/Menu/MenuContainer';
import MIcon from 'react-native-vector-icons/Ionicons';

// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  patient_diagnostic_tests: UserActions.patient_diagnostic_tests,
  reviews: UserActions.reviews,
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
    patient_diagnostic_tests: PropTypes.func.isRequired,
    reviews: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'all',
      userLang: 'en',
      cnt: 0,
      user: props.user ? props.user : '',
      isOpen: false,
      selectedItem: 'About',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.toggle = this.toggle.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  updateMenuState(isOpen) {
    this.setState({isOpen});
  }

  onMenuItemSelected = item => {
    this.setState({
      isOpen: false,
      selectedItem: item,
    });
  };

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }
  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }
  handleBackButtonClick() {
    RNExitApp.exitApp();
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_appointments('all', 1);
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
        '{"where":{"diagnostic_center_user_id":' +
        this.state.user.id +
        '},"include":{"0":"patient.user_profile","1":"branch.city","2":"appointment_type","3":"appointment_status"},"skip":' +
        skip +
        ',"limit":20}';
      if (this.state.user && this.state.user.role_id == 2) {
        var payload =
          '{"where":{"patient_id":' +
          this.state.user.id +
          '},"include":{"0":"diagnostic_center_user.user_profile","1":"branch.city","2":"appointment_type","3":"appointment_status"},"skip":' +
          skip +
          ',"limit":20}';
      }
      this.callInvoked = 1;
      this.props
        .patient_diagnostic_tests({
          filter: payload,
          type: q,
          token: this.state.user.userToken,
        })
        .then(resp => {
          console.log('res booking data data=== == ' + JSON.stringify(resp));
          var datares = this.state.dataList.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
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
  filter = id => {
    var cf = '';
    if (id == 'all') {
      cf = 'all';
    } else if (id == 'today') {
      cf = 'today';
    } else if (id == 'week') {
      cf = 'week';
    } else if (id == 'month') {
      cf = 'month';
    }

    this.setState(
      {cfilter: id, page: 1, dataList: [], nodata: 0},
      this.get_appointments(cf, 1),
    );
  };
  reload = () => {
    this.setState({cnt: this.state.cnt + 1, dataList: []});
    this.get_appointments(this.state.cfilter, 1);
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    if (this.state.user && this.state.user.role_id == 2) {
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
          <View style={{flex: 0.65}}>
            <Text style={{fontSize: 14, color: AppColors.brand.navbar}}>
              {data.diagnostic_center_user &&
              data.diagnostic_center_user.username
                ? this.Capitalize(data.diagnostic_center_user.username)
                : null}{' '}
              #{data.appointment_token}
            </Text>
            {data.branch && data.branch.name ? (
              <Text style={{fontSize: 12}}>
                {this.Capitalize(data.branch.name)}
              </Text>
            ) : null}
            <Text style={{fontSize: 12}}>
              {Strings.date}: {data.appointment_date}
            </Text>
            <Text style={{fontSize: 12}}>
              {Strings.time}: {data.appointment_time}
            </Text>
            {data.appointment_type && data.appointment_type.name ? (
              <Text style={{fontSize: 12}}>
                {Strings.appointmenttype}:{' '}
                {this.Capitalize(data.appointment_type.name)}
              </Text>
            ) : null}
            <Text style={{fontSize: 12}}>
              {Strings.paidviaonline}:{' '}
              {data.is_paid_via_online === 1 ? Strings.yes : Strings.no}
            </Text>
          </View>
          <View style={{flex: 0.35}}>
            {data.appointment_status.id == 1 ||
            data.appointment_status.id == 8 ? (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0ad4e',
                  borderRadius: 30,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 11,
                      color: AppColors.brand.white,
                      lineHeight: 15,
                    },
                  ]}>
                  {data.appointment_status.id == 1
                    ? Strings.pending
                    : Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 2 ? (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: AppColors.brand.success,
                  borderRadius: 30,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 11,
                      color: AppColors.brand.white,
                      lineHeight: 15,
                    },
                  ]}>
                  {Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={{height: 5}} />
            <TouchableOpacity
              onPress={() => {
                Actions.UserUploadReport({report_data: data});
              }}
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
                {Strings.viewreport}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
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
          <View style={{flex: 0.65}}>
            <Text style={{fontSize: 14, color: AppColors.brand.navbar}}>
              {this.Capitalize(data.patient.username)}
            </Text>
            <Text style={{fontSize: 12}}>
              {this.Capitalize(data.branch.name)}
            </Text>
            <Text style={{fontSize: 12}}>
              {Strings.date}: {data.appointment_date}
            </Text>
            <Text style={{fontSize: 12}}>
              {Strings.time}: {data.appointment_time}
            </Text>
            <Text style={{fontSize: 12}}>
              {Strings.appointmenttype}:{' '}
              {this.Capitalize(data.appointment_type.name)}
            </Text>
          </View>
          <View style={{flex: 0.35}}>
            {data.appointment_status.id == 1 ||
            data.appointment_status.id == 8 ? (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0ad4e',
                  borderRadius: 30,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 11,
                      color: AppColors.brand.white,
                      lineHeight: 15,
                    },
                  ]}>
                  {data.appointment_status.id == 1
                    ? Strings.pending
                    : Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 2 ? (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: AppColors.brand.success,
                  borderRadius: 30,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 11,
                      color: AppColors.brand.white,
                      lineHeight: 15,
                    },
                  ]}>
                  {Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={{height: 5}} />
            <TouchableOpacity
              onPress={() => {
                Actions.UploadReport({report_data: data});
              }}
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
                {Strings.uploadreport}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  render = () => {
    var fall = this.state.cfilter == 'all' ? styles.selected_tab : styles.tab;
    var ftoday =
      this.state.cfilter == 'today' ? styles.selected_tab : styles.tab;
    var fweek = this.state.cfilter == 'week' ? styles.selected_tab : styles.tab;
    var fmonth =
      this.state.cfilter == 'month' ? styles.selected_tab : styles.tab;

    var fallt =
      this.state.cfilter == 'all'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var ftodayt =
      this.state.cfilter == 'today'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fweekt =
      this.state.cfilter == 'week'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fmontht =
      this.state.cfilter == 'month'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];

    var disabled = false;
    if (this.callInvoked) disabled = true;

    const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
    console.log(
      'res booking data data=== tt==   ' +
        this.state.nodata +
        '==' +
        JSON.stringify(this.state.dataList.length) +
        JSON.stringify(this.state.dataList),
    );
    return (
      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={isOpen => this.updateMenuState(isOpen)}>
        <View style={[styles.background]}>
          {this.state.user && this.state.user.role_id == 2 ? (
            <NavComponent backArrow={true} title={Strings.labtests} />
          ) : (
            <View
              style={{
                height: 55,
                paddingTop: Platform.OS == 'ios' ? 20 : 0,
                flexDirection: 'row',
                backgroundColor: AppColors.brand.navbar,
              }}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, color: '#fff'}}>
                  Diagnostic Dashboard
                </Text>
              </View>
              <TouchableOpacity
                onPress={this.toggle}
                style={{
                  width: 35,
                  paddingTop: Platform.OS == 'ios' ? 20 : 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                }}>
                <MIcon name={'ios-menu'} size={30} color={'#FFF'} />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              backgroundColor: '#303030',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: AppSizes.screen.width,
            }}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal={true}>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'all')}
                style={fall}>
                <Text style={fallt}>{Strings.all}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'today')}
                style={ftoday}>
                <Text style={ftodayt}>{Strings.today}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'week')}
                style={fweek}>
                <Text style={fweekt}>{Strings.week}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'month')}
                style={fmonth}>
                <Text style={fmontht}>{Strings.month}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {this.state.nodata == 0 ? (
            <View
              style={{
                padding: 0,
                margin: 0,
                height: AppSizes.screen.height - 130,
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
      </SideMenu>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(MyAppointments);
