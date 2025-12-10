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
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import NavComponent from '@components/NavComponent.js';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';

import SideMenu from 'react-native-side-menu-updated';
import Menu from '@containers/ui/Menu/MenuContainer';
import MIcon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  appointments: UserActions.appointments,
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
    appointments: PropTypes.func.isRequired,
    reviews: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    console.log('docor_Details == ' + JSON.stringify(props.user));
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'approved',
      userLang: 'en',
      cnt: 0,
      timer: null,
      user: props.user ? props.user : '',
      isOpen: false,
      selectedItem: 'About',
    };
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

  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    if (this.state.user && this.state.user.is_submitted_proof_document == 0) {
      Actions.getverified();
    }
    this.get_appointments('approved', 1);
    let timer = setInterval(this.reload, 60000);
    this.setState({timer});
  }
  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    try {
      this.clearInterval(this.state.timer);
    } catch (err) {}
  }

  handleBackButtonClick() {
    RNExitApp.exitApp();
  }

  get_appointments(q, p) {
    if (this.callInvoked == 0) {
      var cf = q;
      var page = p ? p : this.state.page;
      var skip = 0;
      if (page == 1) {
        skip = 0;
      } else {
        skip = (page - 1) * 10;
      }
      var apsts = 2;
      if (q == 'approved') apsts = 2;
      else if (q == 'present') apsts = 7;
      else if (q == 'closed') apsts = 3;
      else if (q == 'cancelled') apsts = 4;
      else if (q == 'cancelled') apsts = 4;
      //{"where":{"appointment_status_id":2,"user_id":2},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription"},"skip":0,"limit":20,"order":"id desc"}
      var payload =
        '{"where":{"appointment_status_id":' +
        apsts +
        ',"provider_user_id":' +
        this.state.user.id +
        '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription" ,"9":"family_friend"},"skip":' +
        skip +
        ',"order":"id desc"}';
      if (q == 'today' || q == 'week' || q == 'month' || q == 'all')
        payload =
          '{"where":{"appointment_status_id":{"nin":[10]},"provider_user_id":' +
          this.state.user.id +
          '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription" ,"9":"family_friend"},"skip":' +
          skip +
          ',"limit":20,"order":"id desc"}';

      this.callInvoked = 1;
      this.props
        .appointments({
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
    } else if (id == 'approved') {
      cf = 'approved';
    } else if (id == 'present') {
      cf = 'present';
    } else if (id == 'closed') {
      cf = 'closed';
    } else if (id == 'cancelled') {
      cf = 'cancelled';
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
  reloadView = data => {
    this.setState({cnt: data.cnt, dataList: []});
    this.get_appointments(data.tab_name, 1);
  };
  reload = () => {
    this.setState({cnt: this.state.cnt + 1, dataList: []});
    this.get_appointments(this.state.cfilter, 1);
  };
  cancelAppointment = data => {
    Alert.alert(
      '',
      Strings.areyousureyouwanttocancelthisappointment,
      [
        {
          text: Strings.ok,
          onPress: () => {
            var payload = {
              id: data.id,
              appointment_status_id: 4,
              is_put: 1,
              token: this.state.user.userToken,
            };
            this.callInvoked = 1;
            console.log('res booking data === cancel');
            this.props
              .appointments(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  console.log(
                    'res booking data === cancel resp ' + JSON.stringify(resp),
                  );
                  this.callInvoked = 0;
                  this.get_appointments(this.state.cfilter, 1);
                  this.setState({cnt: this.state.cnt + 1, dataList: []});
                }
              })
              .catch(() => {
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => console.log('ok')},
      ],
      {cancelable: false},
    );
  };
  appointmentDetails = data => {
    Actions.DAppointmentDetail({appointment_data: data});
  };
  createprescription = data => {
    Actions.createprescription({
      reloadView: this.reloadView,
      tab_name: this.state.cfilter,
      cnt: this.state.cnt,
      prescription_data: data,
    });
  };
  viewPrescription = data => {
    Actions.PrescriptionDoctor({prescription_data: data});
  };
  reschedule = data => {
    Actions.DReschedule({reschedule_data: data, reload: this.reload});
  };
  review = data => {
    Actions.Review({review_data: data, reload: this.reload});
  };
  mark_asarrived = data => {
    Alert.alert(
      '',
      Strings.areyousureyouwanttochangestatus,
      [
        {
          text: Strings.ok,
          onPress: () => {
            var payload = {
              id: data.id,
              appointment_status_id: 2,
              is_put: 1,
              token: this.state.user.userToken,
            };
            this.callInvoked = 1;
            console.log('res booking data === cancel');
            this.props
              .appointments(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  console.log(
                    'res booking data === cancel resp ' + JSON.stringify(resp),
                  );
                  this.callInvoked = 0;
                  this.get_appointments(this.state.cfilter, 1);
                  this.setState({cnt: this.state.cnt + 1, dataList: []});
                }
              })
              .catch(() => {
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => console.log('ok')},
      ],
      {cancelable: false},
    );
  };
  start_appointment = data => {
    Alert.alert(
      '',
      Strings.areyousureyouwanttochangestatus,
      [
        {
          text: Strings.ok,
          onPress: () => {
            var payload = {
              id: data.id,
              appointment_status_id: 7,
              is_put: 1,
              token: this.state.user.userToken,
            };
            this.callInvoked = 1;
            console.log('res booking data === cancel');
            this.props
              .appointments(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  console.log(
                    'res booking data === cancel resp ' + JSON.stringify(resp),
                  );
                  this.callInvoked = 0;
                  this.get_appointments(this.state.cfilter, 1);
                  this.setState({cnt: this.state.cnt + 1, dataList: []});
                }
              })
              .catch(() => {
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => console.log('ok')},
      ],
      {cancelable: false},
    );
  };
  mark_asclosed = data => {
    Alert.alert(
      '',
      Strings.areyousureyouwanttochangestatus,
      [
        {
          text: Strings.ok,
          onPress: () => {
            var payload = {
              id: data.id,
              appointment_status_id: 3,
              is_put: 1,
              token: this.state.user.userToken,
            };
            this.callInvoked = 1;
            console.log('res booking data === cancel');
            this.props
              .appointments(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  console.log(
                    'res booking data === cancel resp ' + JSON.stringify(resp),
                  );
                  this.callInvoked = 0;
                  this.get_appointments(this.state.cfilter, 1);
                  this.setState({cnt: this.state.cnt + 1, dataList: []});
                }
              })
              .catch(() => {
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => console.log('ok')},
      ],
      {cancelable: false},
    );
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var uname = data.user && data.user.username ? data.user.username : 0;
    if (uname) {
      var address = '';
      var pusername = data.provider_user.username;
      if (
        data.user.user_profile &&
        data.user.user_profile.first_name &&
        data.user.user_profile.last_name
      )
        uname =
          data.user.user_profile.first_name +
          ' ' +
          data.user.user_profile.last_name;
      if (data.user.user_profile && data.user.user_profile.address)
        address = data.user.user_profile.address;
      if (
        data.provider_user.user_profile &&
        data.provider_user.first_name &&
        data.provider_user.user_profile.last_name
      )
        pusername =
          data.provider_user.user_profile.first_name +
          ' ' +
          data.provider_user.user_profile.last_name;

      var btncolor = AppColors.brand.btnColor;
      if (data.appointment_status.id == 4) {
        btncolor = AppColors.brand.cancelled;
      }
      if (data.appointment_status.id == 1) {
        btncolor = AppColors.brand.pendingapproval;
      }
    }
    if (uname) {
      return (
        <TouchableOpacity
          onPress={this.appointmentDetails.bind(this, data)}
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
            <Text style={{fontSize: 14, color: AppColors.brand.navbar}}>
              {data.appointment_token}
            </Text>
            <Text style={{fontSize: 14}}>{uname}</Text>
            <View style={{height: 3}} />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="user-md" color={AppColors.brand.black} size={18} />
              <Text style={{marginLeft: 10, fontSize: 12}}>{pusername}</Text>
            </View>
            <View style={{height: 3}} />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon
                name="calendar-check-o"
                color={AppColors.brand.black}
                size={16}
              />
              <Text style={{marginLeft: 10, fontSize: 12}}>
                {data.appointment_date} {data.appointment_time}
              </Text>
            </View>
            <View style={{height: 3}} />
            {address ? (
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <Icon
                  name="map-marker"
                  color={AppColors.brand.black}
                  size={18}
                />
                <Text style={{marginLeft: 10, marginRight: 10, fontSize: 12}}>
                  {address}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{flex: 0.4}}>
            {this.state.user.role_id == 2 ? (
              <TouchableOpacity
                onPress={this.review.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.review}
                </Text>
              </TouchableOpacity>
            ) : null}
            {(data.appointment_status.id == 2 ||
              data.appointment_status.id == 1) &&
            data.is_prescription_added == 0 ? (
              <TouchableOpacity
                onPress={this.reschedule.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.reschedule}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 1 &&
            data.is_prescription_added == 0 ? (
              <TouchableOpacity
                onPress={this.mark_asarrived.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.markasarrived}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 2 &&
            data.is_prescription_added == 0 ? (
              <TouchableOpacity
                onPress={this.start_appointment.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.startanappointment}
                </Text>
              </TouchableOpacity>
            ) : null}
            {this.state.user.role_id == 3 && data.appointment_status.id == 7 ? (
              <TouchableOpacity
                onPress={this.mark_asclosed.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: '#f0ad4e',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.markasclosed}
                </Text>
              </TouchableOpacity>
            ) : null}
            {(data.appointment_status.id == 2 ||
              data.appointment_status.id == 1) &&
            data.is_prescription_added == 0 ? (
              <TouchableOpacity
                onPress={this.cancelAppointment.bind(this, data)}
                style={{
                  marginTop: 10,
                  backgroundColor: '#f0ad4e',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.cancel}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 3 ? (
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.closed,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.closed}
                </Text>
              </TouchableOpacity>
            ) : null}
            {data.appointment_status.id == 3 ||
            data.appointment_status.id == 7 ? (
              <View>
                {this.state.user.role_id == 3 &&
                data.is_prescription_added == 0 ? (
                  <TouchableOpacity
                    onPress={this.createprescription.bind(this, data)}
                    style={{
                      marginTop: 10,
                      backgroundColor: AppColors.brand.success,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        backgroundColor: 'transparent',
                        lineHeight: 15,
                        paddingTop: 5,
                        paddingBottom: 5,
                        color: AppColors.brand.white,
                        fontSize: 12,
                      }}>
                      {Strings.addprescription}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={this.viewPrescription.bind(this, data)}
                    style={{
                      marginTop: 10,
                      backgroundColor: AppColors.brand.btnColor,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        backgroundColor: 'transparent',
                        lineHeight: 15,
                        paddingTop: 5,
                        paddingBottom: 5,
                        color: AppColors.brand.white,
                        fontSize: 12,
                      }}>
                      {Strings.prescription}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {(this.state.cfilter == 'all' ||
              this.state.cfilter == 'week' ||
              this.state.cfilter == 'today' ||
              this.state.cfilter == 'month') &&
            data.appointment_status.id != 3 &&
            data.appointment_status.id != 7 ? (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: btncolor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </View>
            ) : null}
            {data.appointment_status.id == 2 ||
            data.appointment_status.id == 7 ? (
              <TouchableOpacity
                onPress={() =>
                  Actions.Pages({
                    open_url: 'https://exadoctor.vsee.me/',
                    title: Strings.videochat,
                  })
                }
                style={{
                  marginTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    backgroundColor: 'transparent',
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.videochat}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };
  render = () => {
    var fall = this.state.cfilter == 'all' ? styles.selected_tab : styles.tab;
    var fapproved =
      this.state.cfilter == 'approved' ? styles.selected_tab : styles.tab;
    var fpresent =
      this.state.cfilter == 'present' ? styles.selected_tab : styles.tab;
    var fclosed =
      this.state.cfilter == 'closed' ? styles.selected_tab : styles.tab;
    var fcancelled =
      this.state.cfilter == 'cancelled' ? styles.selected_tab : styles.tab;
    var ftoday =
      this.state.cfilter == 'today' ? styles.selected_tab : styles.tab;
    var fweek = this.state.cfilter == 'week' ? styles.selected_tab : styles.tab;
    var fmonth =
      this.state.cfilter == 'month' ? styles.selected_tab : styles.tab;

    var fallt =
      this.state.cfilter == 'all'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fapprovedt =
      this.state.cfilter == 'approved'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fpresentt =
      this.state.cfilter == 'present'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fclosedt =
      this.state.cfilter == 'closed'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fcancelledt =
      this.state.cfilter == 'cancelled'
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
    return (
      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={isOpen => this.updateMenuState(isOpen)}>
        <View style={[styles.background]}>
          <View
            style={{
              height: 55,
              paddingTop: Platform.OS == 'ios' ? 20 : 0,
              flexDirection: 'row',
              backgroundColor: AppColors.brand.navbar,
            }}>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 16, color: '#fff'}}>
                {Strings.appointments}
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
              <MIcon name={'menu'} size={30} color={'#FFF'} />
            </TouchableOpacity>
          </View>
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
              horizontal={true}
              style={{width: AppSizes.screen.width}}>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'approved')}
                style={fapproved}>
                <Text style={fapprovedt}>{Strings.approved}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'present')}
                style={fpresent}>
                <Text style={fpresentt}>{Strings.consulting}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'closed')}
                style={fclosed}>
                <Text style={fclosedt}>{Strings.closed}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'cancelled')}
                style={fcancelled}>
                <Text style={fcancelledt}>{Strings.cancelled}</Text>
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
              <TouchableOpacity
                disabled={disabled}
                onPress={this.filter.bind(this, 'all')}
                style={fall}>
                <Text style={fallt}>{Strings.all}</Text>
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
