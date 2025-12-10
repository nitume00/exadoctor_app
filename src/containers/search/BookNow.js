/**
 * Book Now
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ListView,
  ScrollView,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import { connect } from 'react-redux';
import { AppConfig } from '@constants/';
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacer, Text, Button, LblFormInput } from '@ui/';
import { Icon, Rating, CheckBox } from '@rneui/themed';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
import Rave from 'react-native-rave-sdk';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    settings: state.user.settings,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  appointments: UserActions.appointments,
  getUserSpecialities: UserActions.getUserSpecialities,
  settings: UserActions.settings,
  payment_gateways: UserActions.payment_gateways,
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
  userName: {
    color: 'black',
    //fontWeight: "600",
    fontSize: 16,
    paddingBottom: 5,
  },
  textBlue: {
    color: '#24c9ff',
    fontSize: 13,
    marginTop: 5,
    paddingBottom: 5,
  },
});

/* Component ==================================================================== */
class BookNow extends Component {
  static componentName = 'BookNow';
  static propTypes = {
    users: PropTypes.func.isRequired,
    settings: PropTypes.func.isRequired,
    appointments: PropTypes.func.isRequired,
    getUserSpecialities: PropTypes.func.isRequired,
    payment_gateways: PropTypes.func.isRequired,
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
      booking_data: props.booking_data ? props.booking_data : '',
      is_branch_doctor: props.is_branch_doctor ? props.is_branch_doctor : 0,
      user: props.user ? props.user : '',
      notes: '',
      appointment_for: 0,
      doctorbeforenew: 0,
      appointmenttype: 1,
      patient_name: '',
      user_specialities: '',
      speciality_id: '',
      speciality_lbl: '',
      cnt: 0,
      settings: props.settings ? props.settings : '',
      consultation_fee: 0,
      pay_type: 2,
      is_test_mode: true,
      public_key: '',
      appointment_resp: '',
    };
    this.onSuccess = this.onSuccess.bind(this);
    this.onFailure = this.onFailure.bind(this);
    this.onClose = this.onClose.bind(this);
    this.site_url = '';
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    this.site_currency_code = await AsyncStorage.getItem('SITE_CURRENCY_CODE');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.props
      .settings({ filter: '{"skip":0,"limit":500}' })
      .then(resp => {
        if (resp.data && resp.data.length) {
          for (let i = 0; i < resp.data.length; i++) {
            if (resp.data[i].name === 'PRICE_PER_BOOKING') {
              console.log('dfsdfsdfsdf == ' + JSON.stringify(resp.data[i]));
              this.setState({ consultation_fee: resp.data[i].value });
            }
          }
        }
      })
      .catch(error => { });

    this.props
      .payment_gateways()
      .then(resp => {
        if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 1
        ) {
          this.setState({
            is_test_mode: true,
            public_key: resp.RaveByFlutterwave.public_key,
          });
        } else if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 0
        ) {
          this.setState({
            is_test_mode: false,
            public_key: resp.RaveByFlutterwave.public_key,
          });
        }
      })
      .catch(error => { });

    var payload =
      '{"where":{"user_id":' +
      this.state.booking_data.doctor_data.id +
      '},"include":{"0":"specialty"}}';
    this.props
      .getUserSpecialities({ filter: payload })
      .then(resp => {
        if (
          resp.error &&
          resp.error.code == 0 &&
          rep.data &&
          resp.data.length
        ) {
          this.setState({
            user_specialities: resp.data,
            speciality_lbl: resp.data[0].specialty.name,
            speciality_id: resp.data[0].specialty.id,
          });
        }
      })
      .catch(() => {
        console.log('error');
      });
  }
  componentWillReceiveProps(props) {
    if (props.user) {
      this.setState({ user: props.user });
    }
  }
  onSuccess(res) {
    //Actions.Search();
    this.callInvoked = 1;
    var payload = {
      is_put: 1,
      appointment_booking: 1,
      data: res.data,
      appointment_id: this.state.appointment_resp.id,
    };
    console.log('payload == ' + JSON.stringify(payload));
    this.props
      .appointments(payload)
      .then(res => {
        this.callInvoked = 0;
        if (res && res.error.code == 0) {
          Actions.Search();
        } else {
          Alert.alert(
            '',
            'Insufficient Credit or Please check your account has sufficient balance to make payment',
            [{ text: 'Ok', onPress: () => Actions.Search() }],
            { cancelable: false },
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
      [{ text: 'Ok', onPress: () => Actions.Search() }],
      { cancelable: false },
    );
    console.log('error', data);
  }

  onClose() {
    //navigate to the desired screen on rave close
    Alert.alert(
      '',
      Strings.paymenterror,
      [{ text: 'Ok', onPress: () => Actions.Search() }],
      { cancelable: false },
    );
  }
  booknow = pay_type => {
    if (this.state.user) {
      if (this.state.appointment_for == 1 && this.state.patient_name == '') {
        Alert.alert(
          '',
          Strings.enterpatientname,
          [{ text: 'Ok', onPress: () => console.log('ok') }],
          { cancelable: false },
        );
      } else {
        console.log('stateuserdetails ' + JSON.stringify(pay_type));
        if (this.callInvoked == 0) {
          this.setState({ loading: true });
          this.callInvoked = 1;
          var payload = {
            email: this.state.user.email,
            user_id: this.state.user.id,
            provider_user_id: this.state.booking_data.doctor_data.id,
            appointment_date: moment(
              this.state.booking_data.booking_date,
              'MM-DD-YYYY',
            ).format('YYYY-MM-DD'),
            appointment_time: this.state.booking_data.time,
            appointment_status_id: 1,
            is_offline_payment: 1,
            is_guest_appointment: 0,
            country_id: this.state.user.country_id,
            appointment_type_id: this.state.appointmenttype,
            is_post: 1,
            token: this.state.user.userToken,
          };

          if (pay_type == 1) {
            //paynow
            payload = {
              email: this.state.user.email,
              user_id: this.state.user.id,
              provider_user_id: this.state.booking_data.doctor_data.id,
              appointment_date: moment(
                this.state.booking_data.booking_date,
                'MM-DD-YYYY',
              ).format('YYYY-MM-DD'),
              appointment_time: this.state.booking_data.time,
              is_guest_appointment: 0,
              country_id: this.state.user.country_id,
              appointment_type_id: this.state.appointmenttype,
              is_post: 1,
              token: this.state.user.userToken,
            };
          }

          if (this.state.patient_name != '' && this.state.appointment_for == 1)
            payload['guest_name'] = this.state.patient_name;
          if (this.state.notes != '')
            payload['customer_note'] = this.state.notes;
          this.props
            .appointments(payload)
            .then(res => {
              this.callInvoked = 0;
              if (pay_type !== 1) {
                this.setState({ loading: false });
                if (res.error && res.error.code == 0) {
                  Alert.alert(
                    '',
                    res.error.message,
                    [{ text: 'Ok', onPress: () => Actions.Search() }],
                    { cancelable: false },
                  );
                } else if (res.error && res.error.code == 1) {
                  Alert.alert(
                    '',
                    res.error.message,
                    [{ text: 'Ok', onPress: () => console.log('ok') }],
                    { cancelable: false },
                  );
                }
              } else {
                this.setState({
                  loading: false,
                  appointment_resp: res.data,
                  pay_type: pay_type,
                });
                if (res.error && res.error.code == 1) {
                  Alert.alert(
                    '',
                    res.error.message,
                    [{ text: 'Ok', onPress: () => Actions.Search() }],
                    { cancelable: false },
                  );
                }
              }
            })
            .catch(err => {
              this.callInvoked = 0;
              this.setState({ loading: false });
            });
        }
      }
    } else {
      Actions.authenticate({ just_popit: 1, reload: this.reload });
    }
  };
  reload = () => {
    this.setState({ cnt: this.state.cnt + 1 });
    console.log('applogs here == ' + JSON.stringify(this.state.user));
    Actions.refresh();
  };
  render() {
    var imageurl = AppConfig.noimage;
    console.log(
      'data=== u = book = ' + JSON.stringify(this.state.booking_data),
    );
    if (
      this.state.booking_data &&
      this.state.booking_data.doctor_data.attachment &&
      this.state.booking_data.doctor_data.attachment.filename
    ) {
      var md5string =
        'UserAvatar' +
        this.state.booking_data.doctor_data.attachment.id +
        'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserAvatar/' +
        this.state.booking_data.doctor_data.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('data=== u = ' + imageurl);
    }
    var doctorspecialty = '';
    if (
      this.state.booking_data &&
      this.state.booking_data.doctor_data.specialties_user
    ) {
      for (
        var j = 0;
        j < this.state.booking_data.doctor_data.specialties_user.length;
        j++
      ) {
        if (doctorspecialty == '')
          doctorspecialty =
            Strings.lblspecialities[
            this.state.booking_data.doctor_data.specialties_user[j].specialty
              .id
            ];
        else
          doctorspecialty =
            doctorspecialty +
            ' / ' +
            Strings.lblspecialities[
            this.state.booking_data.doctor_data.specialties_user[j].specialty
              .id
            ];
      }
    }
    var vmspecialities = [
      { key: 0, section: true, label: Strings.choosespeciality },
    ];
    if (this.state.user_specialities) {
      var carrayspecialities = this.state.user_specialities;
      Object.keys(carrayspecialities).forEach(function (key) {
        vmspecialities.push({
          key: carrayspecialities[key].specialty.id,
          label: Strings.lblspecialities[carrayspecialities[key].specialty.id],
        });
      });
    }

    var username = '';
    if (
      this.state.booking_data &&
      this.state.booking_data.doctor_data &&
      this.state.booking_data.doctor_data.user_profile &&
      this.state.booking_data.doctor_data.user_profile.first_name
    )
      username =
        this.state.booking_data.doctor_data.user_profile.first_name +
        ' ' +
        this.state.booking_data.doctor_data.user_profile.last_name;
    else if (
      this.state.booking_data &&
      this.state.booking_data.doctor_data &&
      this.state.booking_data.doctor_data.username
    )
      username = this.state.booking_data.doctor_data.username;

    console.log('userr ' + JSON.stringify(this.state.is_test_mode));
    // console.log('currency ' + currency);

    if (
      this.state.user &&
      this.state.user.email &&
      this.state.pay_type === 1 &&
      this.state.appointment_resp
    ) {
      return (
        <>
          <NavComponent backArrow={true} title={Strings.bookanappointment} />
          <Rave
            amount={this.state.appointment_resp.consultation_fee.toString()}
            country="Cameroun"
            currency="XOF"
            email={this.state.user.email}
            firstname={
              this.state.user.user_profile &&
                this.state.user.user_profile.first_name != ''
                ? this.state.user.user_profile.first_name
                : this.state.user.username
            }
            lastname={
              this.state.user.user_profile &&
                this.state.user.user_profile.last_name != ''
                ? this.state.user.user_profile.last_name
                : this.state.user.username
            }
            FLW_PUBLIC_KEY='FLWPUBK_TEST-b20cb0eb62e3abf66acb1ce8638e01fd-X'
            FLW_SECRET_KEY='FLWSECK_TEST-864508a6c9d8c49e77ea01a1123b152a-X'
            // encryptionkey="FLWPUBK_TEST-b20cb0eb62e3abf66acb1ce8638e01fd-X"
            // public_key="FLWSECK_TEST-864508a6c9d8c49e77ea01a1123b152a-X"
            meta={[{ metaname: 'color', metavalue: AppColors.brand.navbar }]}
            production={this.state.is_test_mode}
            txref={'appointment_id-' + this.state.appointment_resp.id}
            onSuccess={res => this.onSuccess(res)}
            onFailure={e => this.onFailure(e)}
            onClose={e => this.onClose(e)}
          />
        </>
      );
    } else {
      return (
        <View style={[styles.background]}>
          <NavComponent backArrow={true} title={Strings.bookanappointment} />
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 10,
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 10,
              }}>
              <Image
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: Platform.OS == 'ios' ? 37.5 : 50,
                  borderColor: AppColors.brand.black,
                  borderWidth: 0.3,
                }}
                source={{ uri: imageurl }}
              />
              <Text
                style={[AppStyles.boldedFontText, { padding: 5, fontSize: 16 }]}>
                {username}
              </Text>
              {doctorspecialty ? (
                <Text
                  style={{
                    textAlign: 'center',
                    padding: 5,
                    fontSize: 13,
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}>
                  {doctorspecialty}
                </Text>
              ) : null}
            </View>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={
                this.state.booking_data && this.state.booking_data.doctor_data
                  ? this.state.booking_data.doctor_data
                    .total_rating_as_service_provider
                  : 0
              }
              readonly
              imageSize={20}
              style={{ paddingVertical: 5, alignItems: 'center' }}
            />
            <View style={{ flex: 1, marginTop: 10 }}>
              <View
                style={{
                  backgroundColor: 'yellow',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {this.state.booking_data &&
                  this.state.booking_data.branch_data ? (
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      { fontSize: 18, height: 40, paddingTop: 10 },
                    ]}>
                    {Strings.bookingdetails}
                  </Text>
                ) : null}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginTop: 10,
                paddingLeft: 15,
                paddingRight: 15,
              }}>
              {this.state.booking_data &&
                this.state.booking_data.branch_data &&
                this.state.booking_data.branch_data.branch &&
                this.state.booking_data.branch_data.full_address ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    paddingBottom: 10,
                  }}>
                  <Text style={{ width: 100 }}>{Strings.location}</Text>
                  <Text style={{ width: AppSizes.screen.width / 2 + 20 }}>
                    : {this.state.booking_data.branch_data.branch.full_address}
                  </Text>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{ width: 100 }}>{Strings.date}</Text>
                {/* format of date been changed based on client requirement*/}
                {this.state.booking_data &&
                  this.state.booking_data.booking_date ? (
                  <Text>
                    :{' '}
                    {moment(
                      this.state.booking_data.booking_date,
                      'MM-DD-YYYY',
                    ).format('DD/MM/YYYY')}
                  </Text>
                ) : null}
              </View>
              <View style={{ height: 10 }} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{ width: 100 }}>{Strings.time}</Text>
                {this.state.booking_data && this.state.booking_data.time ? (
                  <Text>: {this.state.booking_data.time}</Text>
                ) : null}
              </View>
              <View style={{ height: 10 }} />
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text>{Strings.whoisthisappointmentfor}</Text>
                <View style={{ height: 10 }} />
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
                      marginLeft: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.appointment_for == 0}
                    textStyle={[
                      AppStyles.lightFontText1,
                      { fontSize: 12, color: AppColors.brand.black },
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
                      { fontSize: 12, color: AppColors.brand.black },
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
                <View>
                  <View style={{ height: 15 }} />
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}>
                    <Text>{Strings.patientname}</Text>
                    <View style={{ height: 10 }} />
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
                      onChangeText={text => this.setState({ patient_name: text })}
                      placeholder={Strings.patientname}
                      maxLength={15}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>
              ) : null}
              <View style={{ height: 15 }} />
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text>{Strings.haveyouseenthedoctorbefore}</Text>
                <View style={{ height: 10 }} />
                <View
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'flex-start',
                  }}>
                  <CheckBox
                    center
                    title={Strings.iamanewpatient}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.doctorbeforenew == 0}
                    textStyle={[
                      AppStyles.lightFontText1,
                      {
                        fontSize: 12,
                        color: AppColors.brand.black,
                        flexWrap: 'wrap',
                      },
                    ]}
                    onPress={() => {
                      this.setState({
                        doctorbeforenew: 0,
                      });
                    }}
                  />
                  <CheckBox
                    center
                    title={Strings.iamexistingpatient}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      marginTop: 10,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.doctorbeforenew == 1}
                    textStyle={[
                      AppStyles.lightFontText1,
                      {
                        fontSize: 12,
                        color: AppColors.brand.black,
                        flexWrap: 'wrap',
                      },
                    ]}
                    onPress={() => {
                      this.setState({
                        doctorbeforenew: 1,
                      });
                    }}
                  />
                </View>
              </View>
              <View style={{ height: 15 }} />
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text>{Strings.appointmenttype}</Text>
                <View style={{ height: 10 }} />
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}>
                  <CheckBox
                    center
                    title={Strings.online}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      margin: 10,
                      marginLeft: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.appointmenttype == 1 ? true : false}
                    textStyle={[
                      AppStyles.lightFontText1,
                      { fontSize: 12, color: AppColors.brand.black },
                    ]}
                    onPress={() => {
                      this.setState({
                        appointmenttype: 1,
                      });
                    }}
                  />
                  <CheckBox
                    center
                    title={Strings.phone}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      margin: 10,
                      marginLeft: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.appointmenttype == 2 ? true : false}
                    textStyle={[
                      AppStyles.lightFontText1,
                      { fontSize: 12, color: AppColors.brand.black },
                    ]}
                    onPress={() => {
                      this.setState({
                        appointmenttype: 2,
                      });
                    }}
                  />
                  <CheckBox
                    center
                    title={Strings.walking}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      margin: 10,
                      marginLeft: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.appointmenttype == 3 ? true : false}
                    textStyle={[
                      AppStyles.lightFontText1,
                      { fontSize: 12, color: AppColors.brand.black },
                    ]}
                    onPress={() => {
                      this.setState({
                        appointmenttype: 3,
                      });
                    }}
                  />
                  <CheckBox
                    center
                    title={Strings.homecare}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    containerStyle={{
                      padding: 0,
                      margin: 10,
                      marginLeft: 0,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }}
                    checked={this.state.appointmenttype == 4 ? true : false}
                    textStyle={[
                      AppStyles.lightFontText1,
                      { fontSize: 12, color: AppColors.brand.black },
                    ]}
                    onPress={() => {
                      this.setState({
                        appointmenttype: 4,
                      });
                    }}
                  />
                </View>
              </View>
              {/*
                  <View style={{height:15}}/>
                  <View style={{borderBottomWidth: 0.3, borderColor: AppColors.brand.black}}>
                      <ModalPicker
                        data={vmspecialities}
                        initValue={Strings.speciality}
                        sectionTextStyle ={{textAlign: 'left',color: '#000',fontSize: 16,fontWeight:'bold'}}
                        optionTextStyle ={{textAlign: 'left',color: '#000',fontSize: 16,fontWeight:'normal'}}
                        cancelStyle = {{backgroundColor:'#F75174', justifyContent: 'center',alignItems:'center', borderRadius:50/2,}}
                        cancelTextStyle={{fontSize: 20,fontWeight:'normal'}}
                        overlayStyle = {{backgroundColor: 'rgba(0,0,0,0.9)'}}
                        onChange={(option)=>{
                              this.setState({speciality_lbl:option.label,speciality_id:`${option.key}`});
                          }}>
                              <LblFormInput lblText={false} height={60} placeholderTxt={Strings.speciality} lblTxt={Strings.speciality} select_opt={true} value={this.state.speciality_lbl}
                                  editable={false}
                              />
                      </ModalPicker>
                  </View>*/}
              <View style={{ height: 15 }} />
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text>{Strings.additionalnotesfordoctor}</Text>
                <View style={{ height: 10 }} />
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
                      height: 80,
                    },
                    AppStyles.regularFontText,
                  ]}
                  multiline={true}
                  onChangeText={text => this.setState({ notes: text })}
                  placeholder={Strings.additionalnotesfordoctor}
                  underlineColorAndroid="transparent"
                />
              </View>
              <View style={{ height: 10 }} />
            </View>
            {this.state.is_branch_doctor == 0 ? (
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0.65 }}>
                  <Button
                    containerStyle={{ flex: 1 }}
                    onPress={this.booknow.bind(this, 1)}
                    title={
                      Strings.confirmandpaynow +
                      ' (' +
                      (this.site_currency||"XOF ") +
                      this.state.consultation_fee +
                      ')'
                    }
                    backgroundColor={AppColors.brand.btnColor}
                    fontSize={15}
                  />
                </View>
                <View
                  style={{
                    flex: 0.35,
                    alignSelf: 'stretch',
                    backgroundColor: AppColors.brand.btnColor,
                    borderLeftWidth: 0.5,
                    borderColor: AppColors.brand.white,
                  }}>
                  <Button
                    containerStyle={{ flex: 1, alignSelf: 'stretch' }}
                    onPress={this.booknow.bind(this, 2)}
                    title={Strings.paylater}
                    backgroundColor={AppColors.brand.btnColor}
                    fontSize={15}
                    buttonHeight={1}
                  />
                </View>
              </View>
            ) : (
              <Button
                containerStyle={{ flex: 1 }}
                onPress={this.booknow.bind(this, 2)}
                title={Strings.confirm}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={15}
              />
            )}
            {Platform.OS == 'ios' && AppSizes.screen.height >= 812 ? (
              <View style={{ height: 20 }} />
            ) : null}
          </ScrollView>
          {this.state.loading ? (
            <View style={AppStyles.LoaderStyle}>
              <Loading color={AppColors.brand.primary} />
            </View>
          ) : null}
        </View>
      );
    }
  }
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(BookNow);
