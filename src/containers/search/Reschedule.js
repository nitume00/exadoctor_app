/**
 * Reschedule
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
  ScrollView,
  Alert,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import {Icon, Rating, CheckBox} from '@rneui/themed';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Slots from '@containers/search/Slots.js';
import Loading from '@components/general/Loading';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  appointments: UserActions.appointments,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
});

/* Component ==================================================================== */
class Reschedule extends Component {
  static componentName = 'Reschedule';
  static propTypes = {
    users: PropTypes.func.isRequired,
    appointments: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      userLang: 'en',
      user: props.user ? props.user : '',
      reschedule_data: props.reschedule_data ? props.reschedule_data : '',
      slot_week: 1,
      daycount: 1,
      current_date: moment().format('MM-DD-YYYY'),
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    console.log(
      'reschedule_data ' + JSON.stringify(this.state.reschedule_data),
    );
  }
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
  }
  timingSelected = data => {
    this.callInvoked = 1;
    console.log('res booking data === cancel ' + JSON.stringify(data));
    Alert.alert(
      '',
      Strings.areyousureyouwanttoreschedule,
      [
        {
          text: Strings.ok,
          onPress: () => {
            var dte = moment(data.booking_date, 'MM-DD-YYYY').format(
              'YYYY-MM-DD',
            );
            var payload = {
              reschedule: 1,
              id: data.reschedule_id,
              appointment_date: dte,
              appointment_time: data.time,
              is_put: 1,
              token: this.state.user.userToken,
            };
            this.callInvoked = 1;
            console.log('res booking data === cancel');
            this.props
              .appointments(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  Actions.pop();
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
  previousDay = () => {
    console.log(
      'appointment_settings fff ' +
        this.state.current_date +
        '==' +
        moment().format('MM-DD-YYYY'),
    );
    if (this.state.current_date == moment().format('MM-DD-YYYY')) {
    } else {
      var previousday = moment(this.state.current_date, 'MM-DD-YYYY')
        .subtract(1, 'days')
        .format('MM-DD-YYYY');
      if (this.state.daycount % 8 == 0) {
        this.setState({
          current_date: previousday,
          slot_week: this.state.slot_week - 1,
          daycount: this.state.daycount - 1,
        });
      } else {
        this.setState({
          current_date: previousday,
          daycount: this.state.daycount - 1,
        });
      }
      console.log(
        'appointment_settings previous' +
          previousday +
          '==' +
          this.state.daycount +
          '==' +
          this.state.slot_week,
      );
    }
  };
  nextDay = () => {
    var nextday = moment(this.state.current_date, 'MM-DD-YYYY')
      .add(1, 'days')
      .format('MM-DD-YYYY');
    if (this.state.daycount % 7 == 0) {
      this.setState({
        current_date: nextday,
        slot_week: this.state.slot_week + 1,
        daycount: this.state.daycount + 1,
      });
    } else {
      this.setState({current_date: nextday, daycount: this.state.daycount + 1});
    }
    console.log(
      'appointment_settings nextday' +
        nextday +
        '==' +
        this.state.daycount +
        '==' +
        this.state.slot_week,
    );
  };
  render() {
    var slots = [];

    if (this.state.reschedule_data && this.state.reschedule_data.branch) {
      var data = this.state.reschedule_data.branch;
      var rid = this.state.reschedule_data.id;
      var current_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
      console.log(
        'appointment_settings current_day == ' +
          current_day +
          '==' +
          this.state.slot_week,
      );
      slots.push(
        <View
          style={{flex: 1, padding: 15, paddingBottom: 0, paddingTop: 10}}
          key={0}>
          <Text style={{fontSize: 16, color: '#A9A9A9', lineHeight: 20}}>
            {this.state.reschedule_data.branch.name}
          </Text>
          <View style={{height: 5}} />
          <Slots
            reschedule_id={rid}
            branch_data={data}
            doctor_data={this.state.reschedule_data.provider_user}
            current_date={this.state.current_date}
            current_day={current_day}
            appointment_id={this.state.reschedule_data.appointment_setting_id}
            view_slot_week={this.state.slot_week}
            buttonPress={this.timingSelected}
          />
          <View
            style={[styles.view_divider_horizontal, {paddingLeft: 20}]}></View>
        </View>,
      );
    } else if (
      this.state.reschedule_data &&
      this.state.reschedule_data.provider_user
    ) {
      var data = this.state.reschedule_data.provider_user;
      var rid = this.state.reschedule_data.id;
      var current_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
      console.log(
        'appointment_settings current_day = = ' +
          current_day +
          '==' +
          this.state.slot_week,
      );
      slots.push(
        <View
          style={{flex: 1, padding: 15, paddingBottom: 0, paddingTop: 10}}
          key={0}>
          <Text style={{fontSize: 16, color: '#A9A9A9', lineHeight: 20}}>
            {this.state.reschedule_data.provider_user &&
            this.state.reschedule_data.provider_user.user_profile &&
            this.state.reschedule_data.provider_user.user_profile.first_name &&
            this.state.reschedule_data.provider_user.user_profile.last_name
              ? this.state.reschedule_data.provider_user.user_profile
                  .first_name +
                ' ' +
                this.state.reschedule_data.provider_user.user_profile.last_name
              : this.state.reschedule_data.provider_user.username}
          </Text>
          <View style={{height: 5}} />
          <Slots
            reschedule_id={rid}
            branch_data={data}
            doctor_data={this.state.reschedule_data.provider_user}
            current_date={this.state.current_date}
            current_day={current_day}
            appointment_id={this.state.reschedule_data.appointment_setting_id}
            view_slot_week={this.state.slot_week}
            buttonPress={this.timingSelected}
          />
          <View
            style={[styles.view_divider_horizontal, {paddingLeft: 20}]}></View>
        </View>,
      );
    }
    var days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    var display_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
    display_day = Strings.weekdays[display_day];
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.reschedule} />
        <View style={{height: AppSizes.screen.height - 70}}>
          <View
            style={{
              backgroundColor: 'yellow',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              onPress={this.previousDay}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 35,
                width: 35,
              }}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../../images/arrow-left.png')}
              />
            </TouchableOpacity>
            <Text
              style={{
                textAlign: 'center',
                color: 'black',
                fontSize: 18,
                padding: 10,
              }}>
              {display_day}, {this.state.current_date}
            </Text>
            <TouchableOpacity
              onPress={this.nextDay}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 35,
                width: 35,
              }}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../../images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>
          {slots}
        </View>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  }
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Reschedule);
