import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import NavComponent from '@components/NavComponent.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Rating, CheckBox} from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import AppUtil from '@lib/util';
import Slots from '@containers/search/Slots.js';
import Strings from '@lib/string.js';
import Loading from '@components/general/Loading';
import Rave from 'react-native-rave-sdk';
var moment = require('moment');
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';

// Components
import {Spacer, Text, Button, Card, FormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    users: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  diagnostic_center_tests: UserActions.diagnostic_center_tests,
  branches: UserActions.branches,
  payment_gateways: UserActions.payment_gateways,
  patient_diagnostic_tests: UserActions.patient_diagnostic_tests,
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
    marginTop: 10,
  },
  tabstyle: {
    fontSize: 14,
    color: '#000',
    padding: 0,
    lineHeight: 20,
  },
  tabstylett: {
    flex: 1,
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
});

/* Component ==================================================================== */
class ListingDetails extends Component {
  static propTypes = {
    diagnostic_center_tests: PropTypes.func.isRequired,
    branches: PropTypes.func.isRequired,
    patient_diagnostic_tests: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.site_url = '';
    this.state = {
      loading: false,
      button_value: 1,
      daycount: 1,
      nodata: 0,
      dataList: [],
      selected_timing: 1,
      slot_week: 1,
      daycount: 1,
      selected_slot: '',
      total_amount: props.total ? props.total : 0,
      labtests: props.labtests ? props.labtests : [],
      appointment_for: 0,
      patient_name: '',
      current_date: moment().format('MM-DD-YYYY'),
      users: props.users ? props.users : '',
      profile_data: props.profile_data ? props.profile_data : '',
      slot_data: '',
      pay_type: 2,
      is_test_mode: true,
      appointment_resp: '',
      region: {
        latitude:
          props.profile_data && props.profile_data.latitude
            ? parseFloat(props.profile_data.latitude)
            : 0.0,
        longitude:
          props.profile_data && props.profile_data.longitude
            ? parseFloat(props.profile_data.longitude)
            : 0.0,
        latitudeDelta: 0.0043,
        longitudeDelta: 0.0034,
      },
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.onSuccess = this.onSuccess.bind(this);
    this.onFailure = this.onFailure.bind(this);
    this.onClose = this.onClose.bind(this);
  }
  onSuccess(res) {
    //Actions.Search();
    this.callInvoked = 1;
    var payload = {
      post_type: 'PUT',
      appointment_booking: 1,
      data: res.data,
      appointment_id: this.state.appointment_resp.id,
    };
    this.props
      .patient_diagnostic_tests(payload)
      .then(res => {
        this.callInvoked = 0;
        if (res && res.error.code == 0) {
          Actions.Search();
        } else {
          Alert.alert(
            '',
            'Insufficient Credit or Please check your account has sufficient balance to make payment',
            [{text: 'Ok', onPress: () => Actions.Search()}],
            {cancelable: false},
          );
        }
      })
      .catch(err => {
        this.callInvoked = 0;
      });

    //console.log("success", data);
    // You can get the transaction reference from successful transaction charge response returned and handle your transaction verification here
  }

  onFailure(data) {
    Alert.alert(
      '',
      Strings.paymenterror,
      [{text: 'Ok', onPress: () => Actions.Search()}],
      {cancelable: false},
    );
    console.log('error', data);
  }

  onClose() {
    //navigate to the desired screen on rave close
    Alert.alert(
      '',
      Strings.paymenterror,
      [{text: 'Ok', onPress: () => Actions.Search()}],
      {cancelable: false},
    );
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    this.site_currency_code = await AsyncStorage.getItem('SITE_CURRENCY_CODE');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    var payload =
      '{"where":{"diagnostic_center_user_id":' +
      this.props.profile_data.clinic_user_id +
      ', "branch_id":' +
      this.props.profile_data.id +
      '},"include":{"0":"diagonostic_test_image","1":"lab_test"}}';
    console.log(
      'diagnostic_center_tests profile_data ' + JSON.stringify(payload),
    );
    this.setState({loading: true});
    this.props
      .diagnostic_center_tests({filter: payload})
      .then(resp => {
        if (
          resp.error &&
          resp.error.code == 0 &&
          resp.data &&
          resp.data.length
        ) {
          this.setState({nodata: 0, dataList: resp.data, loading: false});
        } else {
          this.setState({nodata: 1, loading: false});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });

    this.props
      .payment_gateways()
      .then(resp => {
        if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 1
        ) {
          this.setState({is_test_mode: true});
        } else if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 0
        ) {
          this.setState({is_test_mode: false});
        }
      })
      .catch(error => {});

    var payload = '{"include":{"0":"attachment","1":"city","2":"country"}}';
    console.log(' branches slotdata == ' + JSON.stringify(payload));
    this.props
      .branches({
        filter: payload,
        timeslot: 1,
        branch_id: this.props.profile_data.id,
      })
      .then(resp => {
        console.log('branches  slotdata 11 == ' + JSON.stringify(resp));
        if (resp.data) {
          console.log(
            'dlots_data  slotdata 11 == ' + JSON.stringify(resp.data),
          );
          this.setState({slot_data: resp.data});
        }
      })
      .catch(() => {
        console.log('error');
      });
  }
  render = () => {
    console.log(
      'appointment_settings userdetea ' + JSON.stringify(this.state.users),
    );
    if (
      this.state.users &&
      this.state.users.email &&
      this.state.pay_type === 1 &&
      this.state.appointment_resp
    ) {
      return (
        <Rave
          amount={this.state.total_amount.toString()}
          currency={this.site_currency_code}
          email={this.state.users.email}
          firstname={
            this.state.users.user_profile &&
            this.state.users.user_profile.first_name != ''
              ? this.state.users.user_profile.first_name
              : this.state.users.username
          }
          lastname={
            this.state.users.user_profile &&
            this.state.users.user_profile.last_name != ''
              ? this.state.users.user_profile.last_name
              : this.state.users.username
          }
          publickey="12345678"
          encryptionkey="12345678"
          meta={[{metaname: 'color', metavalue: AppColors.brand.navbar}]}
          production={this.state.is_test_mode}
          txref={'diagnostic_test-' + this.state.appointment_resp.id}
          onSuccess={res => this.onSuccess(res)}
          onFailure={e => this.onFailure(e)}
          onClose={e => this.onClose(e)}
        />
      );
    } else {
      return (
        <View style={[styles.background]}>
          <NavComponent backArrow={true} title={this.state.profile_data.name} />
          {this.renderprofile()}
          {this.state.loading ? (
            <View style={AppStyles.LoaderStyle}>
              <Loading color={AppColors.brand.primary} />
            </View>
          ) : null}
        </View>
      );
    }
  };
  timingSelected = data => {
    console.log('appointment_settings = timing = ' + JSON.stringify(data));
    Actions.BookNow({booking_data: data});
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
  bookcenter = pay_type => {
    if (this.state.selected_slot == '') {
      Alert.alert(
        '',
        Strings.pleaseselectaslot,
        [{text: 'Ok', onPress: () => console.log('ok')}],
        {cancelable: false},
      );
    } else {
      var bltes = this.state.labtests;
      var bltest_arr = '';
      for (var i = 0; i < bltes.length; i++) {
        if (i == 0)
          bltest_arr = '{"diagnostic_center_test_id":' + bltes[i] + '}';
        else
          bltest_arr =
            bltest_arr + ',{"diagnostic_center_test_id":' + bltes[i] + '}';
      }
      var dte = moment(this.state.current_date, 'MM-DD-YYYY').format(
        'YYYY-MM-DD',
      );
      var payload =
        '{"patient_id":' +
        this.state.users.id +
        ',"diagnostic_center_user_id":' +
        this.state.profile_data.clinic_user_id +
        ',"branch_id":' +
        this.state.profile_data.id +
        ',"appointment_date":"' +
        dte +
        '","appointment_time":"' +
        this.state.selected_slot +
        '","appointment_type_id":1,"appointment_status_id":2,"user_id":"' +
        this.state.users.id +
        '","guest_name":"' +
        this.state.patient_name +
        '","price":' +
        this.state.total_amount +
        ',"diagnostic_center_tests":[' +
        bltest_arr +
        ']}';
      if (pay_type == 1) {
        payload =
          '{"patient_id":' +
          this.state.users.id +
          ',"diagnostic_center_user_id":' +
          this.state.profile_data.clinic_user_id +
          ',"branch_id":' +
          this.state.profile_data.id +
          ',"appointment_date":"' +
          dte +
          '","appointment_time":"' +
          this.state.selected_slot +
          '","appointment_type_id":1,"user_id":"' +
          this.state.users.id +
          '","guest_name":"' +
          this.state.patient_name +
          '","price":' +
          this.state.total_amount +
          ',"diagnostic_center_tests":[' +
          bltest_arr +
          ']}';
      }
      this.setState({loading: true});
      this.props
        .patient_diagnostic_tests({filter: payload, post_type: 'POST'})
        .then(resp => {
          if (resp.error && resp.error.code == 0 && pay_type === 2) {
            Alert.alert(
              '',
              Strings.bookingplacessuccessfully,
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    this.setState({loading: false});
                    Actions.Search();
                  },
                },
              ],
              {cancelable: false},
            );
          } else if (resp.error && resp.error.code == 0 && pay_type === 1) {
            this.setState({
              loading: false,
              appointment_resp: resp.data,
              pay_type: pay_type,
            });
          } else if (resp.error && resp.error.code == 1) {
            Alert.alert(
              '',
              resp.error.message,
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    this.setState({loading: false});
                    Actions.Search();
                  },
                },
              ],
              {cancelable: false},
            );
          }
          this.setState({loading: false});
        })
        .catch(() => {
          this.setState({loading: false});
          console.log('error');
        });
    }
  };
  selectSlot = data => {
    this.setState({selected_slot: data});
  };
  renderprofile = () => {
    var imageurl = AppConfig.noimage;
    if (
      this.state.profile_data.attachment &&
      this.state.profile_data.attachment.filename
    ) {
      var md5string =
        'UserAvatar' + this.state.profile_data.attachment.id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserAvatar/' +
        this.state.profile_data.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('data=== u = ' + imageurl);
    }
    var slots = [];
    if (this.state.slot_data && this.state.slot_data.slot) {
      var lunch = 0;
      var slts = this.state.slot_data.slot;
      console.log('dlots_data 111' + JSON.stringify(slts));
      var that = this;
      for (var j = 0; j < slts.length; j++) {
        console.log('dlots_data 222');
        var data = slts[j];
        var current_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
        var current_time = moment(this.state.current_date, 'hh:mm A');

        var ctime = data;
        var ltime = moment(this.state.slot_data.lunch_at, 'hh:mm:ss').format(
          'hh:mm A',
        );
        var rtime = moment(this.state.slot_data.resume_at, 'hh:mm:ss').format(
          'hh:mm A',
        );
        console.log('dlots_data 333 = ' + ctime + '==' + ltime + '==' + rtime);
        if (lunch == 2) lunch = 0;
        if (ctime == ltime) lunch = 1;
        if (ctime == rtime) lunch = 2;
        if (lunch == 0) {
          console.log('dlots_data ' + JSON.stringify(data));
          if (this.state.selected_slot == data) {
            slots.push(
              <TouchableOpacity
                onPress={that.selectSlot.bind(this, data)}
                style={{
                  margin: 5,
                  padding: 10,
                  backgroundColor: AppColors.brand.success,
                }}
                key={j}>
                <Text style={{color: AppColors.brand.black, fontSize: 13}}>
                  {data}
                </Text>
              </TouchableOpacity>,
            );
          } else {
            slots.push(
              <TouchableOpacity
                onPress={that.selectSlot.bind(this, data)}
                style={{
                  margin: 5,
                  padding: 10,
                  backgroundColor: AppColors.brand.grey,
                }}
                key={j}>
                <Text style={{color: AppColors.brand.black, fontSize: 13}}>
                  {data}
                </Text>
              </TouchableOpacity>,
            );
          }
        }
      }
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
    display_day = days[display_day];
    return (
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
          }}>
          <Image
            style={{
              width: 75,
              height: 75,
              borderRadius: Platform.OS == 'ios' ? 37.5 : 50,
              borderColor: AppColors.brand.black,
              borderWidth: 0.3,
            }}
            source={{uri: imageurl}}
          />
          <View
            style={{
              paddingLeft: 10,
              flex: 0.7,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <Text
              style={[AppStyles.boldedFontText, {padding: 5, fontSize: 16}]}>
              {this.state.profile_data.name}
            </Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={this.state.profile_data.average_rating}
              readonly
              imageSize={20}
              style={{paddingVertical: 5, alignItems: 'center', paddingTop: 10}}
            />
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 5,
                lineHeight: 22,
              }}>
              <Icon
                name="phone"
                size={18}
                color={AppColors.brand.navbar}
                style={{marginRight: 8}}
              />{' '}
              {this.state.profile_data.phone_number}
            </Text>
          </View>
        </View>

        <View
          style={{padding: 10, alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              padding: 10,
              lineHeight: 22,
            }}>
            <Icon
              name="map-marker"
              size={16}
              color={AppColors.brand.navbar}
              style={{marginRight: 8}}
            />{' '}
            {this.state.profile_data.full_address}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 10,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}>
          <Text>{Strings.whoisthisappointmentfor}</Text>
          <View style={{height: 10}} />
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <CheckBox
              center
              title={Strings.me}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              containerStyle={{
                padding: 0,
                margin: 10,
                backgroundColor: 'transparent',
                borderWidth: 0,
              }}
              checked={this.state.appointment_for == 0}
              textStyle={[
                AppStyles.lightFontText1,
                {fontSize: 12, color: AppColors.brand.black},
              ]}
              onPress={() => {
                this.setState({
                  appointment_for: 0,
                });
              }}
            />
            <CheckBox
              center
              title={Strings.someoneelse}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              containerStyle={{
                padding: 0,
                margin: 10,
                backgroundColor: 'transparent',
                borderWidth: 0,
              }}
              checked={this.state.appointment_for == 1}
              textStyle={[
                AppStyles.lightFontText1,
                {fontSize: 12, color: AppColors.brand.black},
              ]}
              onPress={() => {
                this.setState({
                  appointment_for: 1,
                });
              }}
            />
          </View>
        </View>
        {this.state.appointment_for == 1 ? (
          <View
            style={{
              marginTop: 15,
              marginLeft: 10,
              flex: 1,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}>
            <Text>{Strings.patientname}</Text>
            <View style={{height: 10}} />
            <TextInput
              placeholderTextColor={'#ccc'}
              autoCapitalize="sentences"
              style={[
                styles.textInputFont,
                {
                  borderBottomWidth: 0.5,
                  borderColor: AppColors.brand.black,
                  flex: 1,
                  width: AppSizes.screen.width - 30,
                  textAlignVertical: 'top',
                  height: 40,
                },
                AppStyles.regularFontText,
              ]}
              returnKeyType={'next'}
              onChangeText={text => this.setState({patient_name: text})}
              placeholder={Strings.patientname}
              maxLength={15}
              underlineColorAndroid="transparent"
            />
          </View>
        ) : null}
        <View style={{flex: 1, padding: 10, paddingBottom: 0}}>
          <View
            style={{
              backgroundColor: 'yellow',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity onPress={this.previousDay}>
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
            <TouchableOpacity onPress={this.nextDay}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../../images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {slots}
        </View>
        <View style={{height: 10}} />
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 0.65}}>
            <Button
              containerStyle={{flex: 1}}
              onPress={this.bookcenter.bind(this, 1)}
              title={
                Strings.confirmandpaynow +
                ' (' +
                this.site_currency +
                this.state.total_amount +
                ')'
              }
              backgroundColor={AppColors.brand.btnColor}
              fontSize={15}
            />
          </View>
          <View
            style={{
              flex: 0.35,
              borderLeftWidth: 0.5,
              borderColor: AppColors.brand.white,
            }}>
            <Button
              containerStyle={{flex: 1}}
              onPress={this.bookcenter.bind(this, 2)}
              title={Strings.paylater}
              backgroundColor={AppColors.brand.btnColor}
              fontSize={15}
            />
          </View>
        </View>
        <View style={{height: 10}} />
      </ScrollView>
    );
  };
}
/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(ListingDetails);
