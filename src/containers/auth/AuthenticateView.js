import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  Image,
  StatusBar,
  BackHandler,
  TextInput,
  Dimensions,
  NativeModules,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import Loading from '@components/general/Loading';
import NavComponent from '@components/NavComponent.js';
import {SocialIcon, Icon} from '@rneui/themed';
import {AppConfig, ErrorMessages} from '@constants/';
import Strings from '@lib/string.js';
import AppUtils from '@lib/util.js';
const {RNTwitterSignIn} = NativeModules;
const Constants = {
  //Dev Parse keys
  TWITTER_COMSUMER_KEY: 'diEqpEGxJddoZXaxfG5Rbjng9',
  TWITTER_CONSUMER_SECRET: 'kxUDnbUEBmyfErPkVjqkr8B4irBn2wM5Gus5zhS7MTnBYtC61v',
};

var {width, height} = Dimensions.get('window');
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
// Components
import {Spacer, Button, FormInput, LblFormInput, Text} from '@ui/';

const mapStateToProps = state => {
  console.log('specialities == ' + JSON.stringify(state.user.specialities));
  return {
    specialities: state.user.specialities,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  auth: UserActions.auth,
  userlogin: UserActions.userlogin,
  getSpecialities: UserActions.getSpecialities,
  getLanguages: UserActions.getLanguages,
  getCountries: UserActions.getCountries,
  getCities: UserActions.getCities,
  getStates: UserActions.getStates,
  getInsurances: UserActions.getInsurances,
  settings: UserActions.getInsurances,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    height: AppSizes.screen.height,
    width: AppSizes.screen.width,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  edit_text_style: {
    marginLeft: 20,
    marginRight: 20,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  text_style: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  text_style_1: {
    fontWeight: 'bold',
    color: AppColors.brand.txtplaceholder,
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 14,
    paddingLeft: 10,
  },
  btn_submit: {
    marginLeft: 20,
    marginRight: 20,
  },
  modal: {
    backgroundColor: '#fff',
    height: AppSizes.screen.height / 3,
    width: AppSizes.screen.width - 40,
    borderRadius: 3,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 20,
    paddingLeft: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  forgotpasswordText: {
    backgroundColor: 'transparent',
    fontSize: 13,
    padding: 10,
    color: AppColors.brand.gray,
  },
});

/* Component ==================================================================== */
class Authenticate extends Component {
  static componentName = 'Authenticate';
  static propTypes = {
    userlogin: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      fadeValue: new Animated.Value(0.5),
      email: '',
      password: '',
      isLoggedIn: false,
      loading: false,
      site_url: props.site_url ? props.site_url : '',
      specialities: props.specialities ? props.specialities : '',
      just_popit: props.just_popit ? props.just_popit : '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    if (this.props.logout) this.logOut();
  }

  _start = () => {
    Animated.timing(this.state.fadeValue, {
      toValue: 1,
      duration: 500,
    }).start();
  };

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    setTimeout(() => {
      this._start();
    }, 2000);
  }

  handleBackButtonClick() {
    RNExitApp.exitApp();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    if (this.props.reload) this.props.reload();
  }

  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    if (this.state.specialities == '') {
      this.props
        .getSpecialities({filter: '{"skip":0,"limit":1000,"order":"name+asc"}'})
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({specialities: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .getInsurances({
          filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
        })
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({insurances: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .getCities({
          filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
        })
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({cities: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .getCountries({filter: '{"skip":0,"limit":1000}'})
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({countries: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .getStates({filter: '{"skip":0,"limit":1000}'})
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({states: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .getLanguages({filter: '{"skip":0,"limit":1000}'})
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({languages: resp.data});
          }
        })
        .catch(error => {});

      this.props
        .settings({filter: '{"skip":0,"limit":500}'})
        .then(resp => {
          if (resp.data && resp.data.length) {
            this.setState({settings: resp.data});
          }
        })
        .catch(error => {});
    }
  }
  
  reload = () => {
    if (this.state.just_popit == 1) Actions.pop();
  };
  loginPressed = () => {
    if (!AppUtils.validateEmail(this.state.email)) {
      Alert.alert(AppConfig.appName, Strings.entervalidemail);
    } else if (this.state.password.trim() == '') {
      Alert.alert(AppConfig.appName, Strings.enteryourpassword);
    } else if (!AppUtils.validatePassword(this.state.password)) {
      Alert.alert(AppConfig.appName, Strings.minlenghtpwd);
    } else {
      this.setState({loading: true});
      var postData = {email: this.state.email, password: this.state.password};
      this.props
        .userlogin(postData)
        .then(resp => {
          this.setState({loading: false});
          if (resp.data && resp.data.error && resp.data.error.code == 0) {
            AsyncStorage.setItem('user_data', JSON.stringify(resp.data));
            AsyncStorage.setItem('user_id', JSON.stringify(resp.data.id));
            AsyncStorage.setItem('userToken', resp.data.token);
            console.log(
              'res booking data userToken ===' +
                JSON.stringify(resp.data.token),
            );
            console.log('getitemdata == ' + JSON.stringify(resp.data));
            if (resp.data.is_otp_verify == 0) {
              Actions.otp({
                user_data: resp.data,
                email: this.state.email,
                password: this.state.password,
                just_popit: this.state.just_popit,
                reload: this.reload,
              });
            } else {
              if (this.state.just_popit && this.state.just_popit == 1) {
                Actions.pop();
              } else {
                console.log('getitemdata == 111 === ' + resp.data.role_id);
                var payload = {user_id: resp.data.id, token: resp.data.token};
                Alert.alert(
                  AppConfig.appName,
                  Strings.youhavesuccessfullylogin,
                );
                this.props.auth(payload);
                if (resp.data.role_id == 3) {
                  console.log('getitemdata == 333 === ' + resp.data.role_id);
                  Actions.doctorapp({type: 'reset'});
                } else if (resp.data.role_id == 6) {
                  Actions.pharmacyapp({type: 'reset'});
                } else if (resp.data.role_id == 7) {
                  Actions.diagnosticapp({type: 'reset'});
                } else Actions.app({type: 'reset'});
              }
            }
          } else if (
            resp.data &&
            resp.data.error &&
            resp.data.error.code == 1
          ) {
            Alert.alert(
              AppConfig.appName,
              Strings.accdoentexist,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              AppConfig.appName,
              Strings.loginerror,
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

  updateText = t => {
    console.log('t', t);
    this.setState({email: t.replace(/\s/g, '')});
  };

  render = () => {
    var height = AppSizes.screen.height;
    var space = 40;
    if (height > 600) {
      space = 80;
    }
    const {isLoggedIn} = this.state;
    return (
      <Animated.View
        style={{
          opacity: this.state.fadeValue,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <StatusBar
          backgroundColor={AppColors.brand.navbar}
          barStyle="light-content"
        />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Spacer size={50} />
          <Image
            source={require('../../images/loginlogo.png')}
            style={{width: 150, height: 53, resizeMode: 'contain'}}
          />
          <Spacer size={20} />
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                fontWeight: '400',
                backgroundColor: 'transparent',
                fontSize: 15,
                color: AppColors.brand.black,
                padding: 5,
              }}>
              {Strings.welcometoexadoctor}
            </Text>
            <Text
              style={{
                fontWeight: '400',
                backgroundColor: 'transparent',
                fontSize: 15,
                color: AppColors.brand.black,
                padding: 5,
              }}>
              {this.state.site_url}
            </Text>
          </View>
          <Spacer size={20} />
          <View style={{flex: 1, width: AppSizes.screen.width}}>
            <LblFormInput
              reg_image={'regname'}
              lblText={false}
              value={this.state.email}
              height={60}
              placeholderTxt={Strings.email + '*'}
              lblTxt={Strings.email}
              onChangeText={this.updateText}
              onEndEditing={event => {
                var txt = event.nativeEvent.text;
                txt = txt.replace(/\s/g, '');
                this.setState({email: txt});
              }}
              onSubmitEditing={event => {
                var txt = event.nativeEvent.text;
                txt = txt.replace(/\s/g, '');
                this.setState({email: txt});
              }}
            />
            <LblFormInput
              reg_image={'regpassword'}
              lblText={false}
              value={this.state.password}
              height={60}
              placeholderTxt={Strings.password + '*'}
              lblTxt={Strings.password}
              secureTextEntry={true}
              onChangeText={text => {
                this.setState({password: text});
              }}
            />
            <TouchableOpacity
              onPress={Actions.passwordReset}
              style={{alignSelf: 'flex-end'}}>
              <Text
                style={[AppStyles.regularFontText, styles.forgotpasswordText]}>
                {Strings.forgotpassword}?
              </Text>
            </TouchableOpacity>
            <Spacer size={15} />
            <Button
              onPress={this.loginPressed}
              title={Strings.signin}
              backgroundColor={AppColors.brand.buttonclick}
              fontSize={15}
            />
            <Spacer size={15} />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <TouchableOpacity activeOpacity={1}>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      backgroundColor: 'transparent',
                      fontSize: 14,
                      color: AppColors.brand.gray,
                      padding: 10,
                    },
                  ]}>
                  {Platform.OS == 'ios' ? '' : Strings.donthaveaccText}{' '}
                  <Text
                    onPress={() => {
                      Actions.signUp({just_popit: this.state.just_popit});
                    }}
                    style={[
                      AppStyles.regularFontText,
                      {
                        backgroundColor: 'transparent',
                        fontSize: 15,
                        color: AppColors.brand.black,
                        textDecorationLine: 'none',
                        padding: 0,
                      },
                    ]}>
                    {Strings.signup}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer size={40} />
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity onPress={Actions.app}>
                <Text
                  style={{
                    fontWeight: '400',
                    backgroundColor: 'transparent',
                    fontSize: 15,
                    color: AppColors.brand.black,
                    textDecorationLine: 'none',
                    padding: 5,
                  }}>
                  {Strings.skipnow}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {this.state.loading ? (
            <View style={AppStyles.LoaderStyle}>
              <Loading color={AppColors.brand.primary} />
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  };
}
/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Authenticate);
