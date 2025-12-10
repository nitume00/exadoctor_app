import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  user_profiles: UserActions.user_profiles,
  auth: UserActions.auth,
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
    user_profiles: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'today',
      userLang: 'en',
      cnt: 0,
      timer: null,
      user: props.user ? props.user : '',
      is_prescription_delivered_via:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.is_prescription_delivered_via == 1
          ? true
          : false,
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_appointments('today', 1);
    let timer = setInterval(this.reload, 60000);
    this.setState({timer});
    var that = this;
    setTimeout(function () {
      that.scroll.scrollToEnd({animated: true});
    }, 2000);
  }
  componentWillUnmount() {
    try {
      this.clearInterval(this.state.timer);
    } catch (err) {}
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
        ',"user_id":' +
        this.state.user.id +
        '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription", "9":"family_friend"},"skip":' +
        skip +
        ',"limit":20,"order":"id desc"}';
      if (q == 'today' || q == 'week' || q == 'month' || q == 'all')
        payload =
          '{"where":{"appointment_status_id":{"nin":[10]},"user_id":' +
          this.state.user.id +
          '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription", "9":"family_friend"},"skip":' +
          skip +
          ',"limit":20,"order":"id desc"}';

      if (this.state.user && this.state.user.role_id != 2) {
        payload =
          '{"where":{"appointment_status_id":' +
          apsts +
          ',"clinic_user_id":' +
          this.state.user.id +
          '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription", "9":"family_friend"},"skip":' +
          skip +
          ',"limit":20,"order":"id desc"}';
        if (q == 'today' || q == 'week' || q == 'month' || q == 'all')
          payload =
            '{"where":{"clinic_user_id":' +
            this.state.user.id +
            '},"include":{"0":"user.user_profile","1":"provider_user.user_profile","2":"clinic_user.user_profile","4":"branch.city","5":"appointment_type","6":"appointment_status","7":"specialty_disease","8":"prescription", "9":"family_friend"},"skip":' +
            skip +
            ',"limit":20,"order":"id desc"}';
      }
      console.log();
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
    Actions.AppointmentDetail({appointment_data: data});
  };
  viewPrescription = data => {
    Actions.Prescription({prescription_data: data});
  };
  reschedule = data => {
    Actions.Reschedule({reschedule_data: data, reload: this.reload});
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

  prescription_delivered = data => {
    Alert.alert(
      '',
      Strings.areyousurewanttochangedeliveryoption,
      [
        {
          text: Strings.ok,
          onPress: () => {
            this.setState({is_prescription_delivered_via: data});
            var payload = {
              id: this.state.user.id,
              is_prescription_delivered_via: data == true ? 1 : 0,
            };
            this.props
              .user_profiles(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  var payload = {
                    user_id: this.state.user.id,
                    token: this.state.user.userToken,
                  };
                  this.props.auth(payload);
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
    console.log('data===' + JSON.stringify(data));
    var statusColor = AppColors.brand.btnColor;
    if (data.appointment_status.id == 4) {
      statusColor = AppColors.brand.cancelled;
    }
    if (data.appointment_status.id == 1) {
      statusColor = AppColors.brand.pendingapproval;
    }
    if (data.appointment_status.id == 3) {
      statusColor = AppColors.brand.closed;
    }

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
          <Text style={{fontSize: 14}}>
            {data.provider_user &&
            data.provider_user.user_profile &&
            data.provider_user.user_profile.first_name
              ? data.provider_user.user_profile.first_name +
                ' ' +
                data.provider_user.user_profile.last_name
              : data.provider_user.username}
          </Text>
          <View style={{height: 3}} />
          {data && data.clinic_user ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 3,
              }}>
              <Icon name="user-md" color={AppColors.brand.black} size={18} />
              <Text style={{marginLeft: 10, fontSize: 12}}>
                {data && data.clinic_user ? data.clinic_user.username : ''}
              </Text>
            </View>
          ) : null}
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
          {this.state.cfilter == 'all' ||
          this.state.cfilter == 'today' ||
          this.state.cfilter == 'week' ||
          this.state.cfilter == 'month' ? (
            <View>
              <View style={{height: 3}} />
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 12}}>{Strings.status}: </Text>
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 12,
                    backgroundColor: statusColor,
                    borderRadius: 5,
                    color: AppColors.brand.white,
                    paddingbottom: 3,
                    paddingLeft: 5,
                    paddingRight: 5,
                  }}>
                  {Strings.lblappointmentstatus[data.appointment_status.id]}
                </Text>
              </View>
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
          {data.appointment_status.id == 2 &&
          data.is_prescription_added == 0 ? (
            <View>
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
                    lineHeight: 15,
                    paddingTop: 5,
                    paddingBottom: 5,
                    color: AppColors.brand.white,
                    fontSize: 12,
                  }}>
                  {Strings.reschedule}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {data.appointment_status.id == 2 &&
          data.is_prescription_added == 0 &&
          this.state.user.role_id == 3 ? (
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
          {this.state.user.role_id == 3 && data.appointment_status.id == 7 ? (
            <TouchableOpacity
              onPress={this.mark_asclosed.bind(this, data)}
              style={{
                marginTop: 10,
                backgroundColor: AppColors.brand.btnColor,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
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
          {data.appointment_status.id == 2 &&
          data.appointment_status.id == 1 &&
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
          {this.state.user.role_id == 3 && data.appointment_status.id == 3 ? (
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
          {(data.prescription &&
            data.prescription.is_active == 1 &&
            data.user &&
            data.user.user_profile &&
            data.appointment_status.id == 3) ||
          data.appointment_status.id == 7 ? (
            <View>
              {this.state.user.role_id == 3 &&
              data.is_prescription_added == 0 ? (
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
                <View>
                  {data.is_prescription_added == 1 ? (
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
                          lineHeight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          color: AppColors.brand.white,
                          fontSize: 12,
                        }}>
                        {Strings.prescription}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
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

    var that = this;
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.appointments} />
        {this.state.user && this.state.user.role_id == 2 ? (
          <View
            style={{
              margin: 10,
              padding: 10,
              flexDirection: 'row',
              borderColor: AppColors.brand.navbar,
              borderRadius: 10,
              borderWidth: 1,
            }}>
            <Text style={{flex: 0.96, fontSize: 12}}>
              {Strings.prescriptionsupplylbl}
            </Text>
            <Switch
              style={{paddingLeft: 10}}
              onValueChange={that.prescription_delivered.bind(
                that,
                !that.state.is_prescription_delivered_via,
              )}
              value={this.state.is_prescription_delivered_via}
            />
          </View>
        ) : null}
        <View
          style={{
            backgroundColor: '#303030',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            style={{width: AppSizes.screen.width}}
            ref={node => (this.scroll = node)}>
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
          <View style={{padding: 0, margin: 0, flex: 1}}>
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
