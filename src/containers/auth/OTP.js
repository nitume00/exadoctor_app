import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Image, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';

import Strings from '@lib/string.js';
import NavComponent from '@components/NavComponent.js';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
// Components
import {Spacer, Text, Button, Card, FormInput, LblFormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  userlogin: UserActions.userlogin,
  auth: UserActions.auth,
  otp_verify: UserActions.otp_verify,
  resend_otp: UserActions.resend_otp,
};

/* Styles ====================================================================  */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.white,
    flex: 1,
  },
  col: {
    width: AppSizes.screen.width / 2 - 10,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  headerGrey: {
    fontSize: 12,
    color: '#ada8a8',
  },
  normalText11: {
    fontWeight: 'normal',
    fontSize: 11,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  col: {
    width: AppSizes.screen.width / 2 - 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* Component ==================================================================== */
class ResetPassword extends Component {
  static componentName = 'ResetPassword';
  constructor(props) {
    super(props);
    this.clicked = 0;
    this.state = {
      otp: '',
      email: props.email,
      password: props.password,
      user_data: props.user_data,
      loading: false,
      just_popit: props.just_popit ? props.just_popit : '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  resendotp = () => {
    if (this.clicked == 0) {
      this.clicked = 1;
      var payload = {user_id: this.state.user_data.id};
      this.setState({loading: true});
      this.props
        .resend_otp(payload)
        .then(resp => {
          console.log('resend_otp ' + JSON.stringify(resp));
          this.setState({loading: false});
          this.clicked = 0;
          if (resp.error && resp.error.code == 0) {
            Alert.alert(
              AppConfig.appName,
              Strings.otpsent,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              AppConfig.appName,
              Strings.error,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          }
        })
        .catch(() => {
          console.log('error');
        });
    }
  };
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
  }
  verifyotp = () => {
    var otp = this.state.otp;
    otp = otp.trim();

    if (otp == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enterotp,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.clicked == 0) {
        this.clicked = 1;
        var payload = {user_id: this.state.user_data.id, otp: this.state.otp};
        this.setState({loading: true});
        this.props
          .otp_verify(payload)
          .then(resp => {
            this.clicked = 0;
            this.setState({loading: false});
            console.log(
              'forgot_password ' +
                JSON.stringify(resp) +
                this.state.email +
                '==' +
                this.state.password,
            );
            if (resp.error && resp.error.code == 0) {
              Alert.alert(
                AppConfig.appName,
                Strings.otpverified,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      var postData = {
                        email: this.state.email,
                        password: this.state.password,
                      };
                      console.log(
                        'forgot_password 11 ' + JSON.stringify(postData),
                      );

                      this.props
                        .userlogin(postData)
                        .then(resp => {
                          console.log(
                            'forgot_password 12 ' + JSON.stringify(resp),
                          );

                          if (
                            resp.data &&
                            resp.data.error &&
                            resp.data.error.code == 0
                          ) {
                            AsyncStorage.setItem(
                              'user_data',
                              JSON.stringify(resp.data),
                            );
                            AsyncStorage.setItem(
                              'user_id',
                              JSON.stringify(resp.data.id),
                            );
                            AsyncStorage.setItem('userToken', resp.data.token);
                            if (this.state.just_popit == 1) {
                              Actions.pop();
                            } else {
                              this.props.auth(payload);
                              Alert.alert(
                                AppConfig.appName,
                                Strings.youhavesuccessfullylogin,
                              );
                              if (resp.data.role_id == 3) {
                                Actions.doctorapp({type: 'reset'});
                              } else if (resp.data.role_id == 6) {
                                Actions.pharmacyapp({type: 'reset'});
                              } else if (resp.data.role_id == 7) {
                                Actions.diagnosticapp({type: 'reset'});
                              } else {
                                Actions.app({type: 'reset'});
                              }
                            }
                          } else if (
                            resp.data &&
                            resp.data.error &&
                            resp.data.error.code == 1
                          ) {
                            if (
                              resp.data.error.message ==
                              'Email Verification Failed'
                            ) {
                              Alert.alert(
                                AppConfig.appName,
                                Strings.emailverificationfailed,
                                [
                                  {
                                    text: 'OK',
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                                {cancelable: false},
                              );
                            } else {
                              Alert.alert(
                                AppConfig.appName,
                                resp.data.error.message,
                                [
                                  {
                                    text: 'OK',
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                                {cancelable: false},
                              );
                            }
                          } else {
                            Alert.alert(
                              AppConfig.appName,
                              Strings.loginerror,
                              [
                                {
                                  text: 'OK',
                                  onPress: () => console.log('OK Pressed'),
                                },
                              ],
                              {cancelable: false},
                            );
                          }
                        })
                        .catch(() => {
                          console.log('error');
                        });
                    },
                  },
                ],
                {cancelable: false},
              );
            } else if (resp.error && resp.error.code == 1) {
              if (resp.error.message == 'OTP is already verified') {
                Alert.alert(
                  AppConfig.appName,
                  Strings.otpalreadyverified,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('Sdfsdf');
                      },
                    },
                  ],
                  {cancelable: false},
                );
              } else {
                Alert.alert(
                  AppConfig.appName,
                  Strings.invalidotp,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('Sdfsdf');
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            } else {
              Alert.alert(
                AppConfig.appName,
                Strings.error,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
              );
            }
          })
          .catch(() => {
            console.log('error');
          });
      }
    }
  };
  render = () => (
    <View style={[styles.background]}>
      <NavComponent backArrow={true} title={Strings.vertifyotp} />
      <View>
        <Text style={{padding: 20}}>{Strings.verifyotplbl}</Text>
        <View style={{height: 180, margin: 10}}>
          <View style={{flex: 0.9, backgroundColor: 'transparent'}}>
            <LblFormInput
              placeholdercolor={'#fff'}
              value={this.state.otp}
              placeholdercolor={'#fff'}
              lblText={false}
              height={60}
              placeholderTxt={Strings.enterotp}
              lblTxt={Strings.enterotp}
              select_opt={false}
              onChangeText={text => {
                this.setState({otp: text});
              }}
            />
          </View>
          <Button
            title={Strings.verifyotp}
            backgroundColor={AppColors.brand.btnColor}
            onPress={this.verifyotp}
            textStyle={{color: '#FFFFFF'}}
            borderRadius={50}
            fontSize={15}
            buttonStyle={{padding: 12}}
            outlined
          />
          <View style={{height: 10}} />
          <Button
            title={Strings.resendotp}
            backgroundColor={AppColors.brand.btnColor}
            onPress={this.resendotp}
            textStyle={{color: '#FFFFFF'}}
            borderRadius={50}
            fontSize={15}
            buttonStyle={{padding: 12}}
            outlined
          />
        </View>
      </View>
    </View>
  );
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
