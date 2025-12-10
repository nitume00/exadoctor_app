/**
 * Medicines List Screen
 *  - Entry screen for all authentication
 *  - User can tap to login, forget password, signup...
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, {Component} from 'react';
import {
  View,
  Image,
  Alert,
  Keyboard,
  Platform,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {Actions} from 'react-native-router-flux';

// Consts and Libs
import {AppConfig} from '@constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppStyles, AppSizes, AppColors} from '@theme/';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import {Icon} from '@rneui/themed';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';

import Loading from '@components/general/Loading';
import InternetConnection from '@components/InternetConnection.js';

import SideMenu from 'react-native-side-menu-updated';
import Menu from '@containers/ui/Menu/MenuContainer';
import MIcon from 'react-native-vector-icons/Ionicons';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  getprescriptionslist: UserActions.prescriptions,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  newlogo: {
    height: 50,
    width: 50,
  },
  newUserName: {
    textAlign: 'left',
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
    fontWeight: '600',
    fontSize: 16,
  },
  textBlue: {
    color: '#24c9ff',
    fontWeight: '600',
    fontSize: 16,
  },
});

/* Component ==================================================================== */
class PrescriptionRequested extends Component {
  static componentName = 'PrescriptionRequested';
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      nodata: 0,
      dataList: [],
      user: props.user ? props.user : '',
      attachment: '',
      enterkeywordtosearch: '',
      isOpen: false,
      selectedItem: 'About',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.toggle = this.toggle.bind(this);
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
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

  componentDidMount = () => {
    this.setState({loading: true});
    this.getprescriptionslist();
  };
  componentWillReceiveProps(nprops) {
    if (nprops.is_refresh) {
      this.setState({dataList: [], nodata: 0});
      this.getprescriptionslist();
    }
  }
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
  getprescriptionslist = () => {
    var keyword = '';
    if (this.state.enterkeywordtosearch) {
      keyword = encodeURI(this.state.enterkeywordtosearch.trim());
    }
    this.setState({loading: true});
    this.props
      .getprescriptionslist({
        token: this.state.user.userToken,
        q: keyword,
        filter:
          '{"include":{"0":"user.user_profile","1":"doctor_user.user_profile","2":"clinic_user.user_profile","3":"pharmacy_user.user_profile","4":"appointment","5":"prescription_medicine.medicine_type","6":"prescription_test","7":"prescription_note"},"skip":0,"limit":"1000","order":"id DESC"}',
      })
      .then(resp => {
        this.setState({loading: false});
        console.log('getprescriptionslist_resp=====> ' + JSON.stringify(resp));
        if (resp.error.code == 0 && resp.data) {
          this.setState({dataList: resp.data, nodata: 1});
        } else {
          Alert.alert(
            AppConfig.appName,
            resp.error.message,
            [
              {
                text: 'OK',
                onPress: () => {
                  //console.log('OK Pressed')
                },
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log(
          'getprescriptionslist_error=====> ' + JSON.stringify(error),
        );
      });
  };
  search = () => {
    Keyboard.dismiss();
    this.setState({dataList: []});
    this.getprescriptionslist();
  };
  viewpresction = data => {
    console.log('data=== ' + JSON.stringify(data));
    if (data.is_delivered == 1) {
      Actions.viewPrescrition({
        reloadView: this.reloadView,
        prescription_data: data,
      });
    } else {
      Actions.viewPrescrition({
        reloadView: this.reloadView,
        prescription_data: data,
        show: 1,
      });
    }
  };

  reloadView = () => {
    this.setState({dataList: [], nodata: 0});
    this.getprescriptionslist();
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var patientname = '';
    var doctorname = '';
    var clinicname = '';
    var rxvalue = '';
    var appointmentno = '';
    if (data.user && data.user.username) {
      patientname = data.user.username;
    }
    if (data.doctor_user && data.doctor_user.username) {
      doctorname = data.doctor_user.username;
    }
    if (data.clinic_user && data.clinic_user.username) {
      clinicname = data.clinic_user.username;
    }
    if (data.rx_number) {
      rxvalue = data.rx_number;
    }
    if (data.appointment && data.appointment.appointment_token) {
      appointmentno = data.appointment.appointment_token;
    }
    return (
      <View
        style={{
          flex: 1,
          margin: 10,
          borderWidth: 1,
          borderColor: AppColors.brand.navbar,
          borderRadius: 5,
        }}>
        <View style={{flex: 1, paddingTop: 20, paddingBottom: 20}}>
          <View style={{padding: 10}}>
            <Text style={[styles.newUserName]}>
              {' '}
              {Strings.patientname + ': ' + this.Capitalize(patientname)}{' '}
            </Text>
          </View>
          <View style={{padding: 10}}>
            <Text style={[styles.newUserName]}>
              {' '}
              {Strings.doctorname + ': ' + this.Capitalize(doctorname)}{' '}
            </Text>
          </View>
          <View style={{padding: 10}}>
            <Text style={[styles.newUserName]}>
              {' '}
              {Strings.clinicname + ': ' + this.Capitalize(clinicname)}{' '}
            </Text>
          </View>
          <View style={{padding: 10}}>
            <Text style={[styles.newUserName]}>
              {' '}
              {Strings.rx + ': ' + rxvalue}{' '}
            </Text>
          </View>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.viewpresction(data);
            }}>
            <Text style={[styles.newUserName]}>
              {' '}
              {Strings.prescription + ': '}
              <Text
                style={{
                  textDecorationLine: 'underline',
                  color: AppColors.brand.navbar,
                }}>
                {appointmentno}
              </Text>{' '}
            </Text>
          </TouchableOpacity>
          {data.is_delivered == 0 ? (
            <View
              style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
              <Text style={[styles.newUserName]}>
                {' '}
                {Strings.delivered + ': '}{' '}
              </Text>
              <Image
                style={{height: 10, width: 10}}
                source={require('../../images/close_red.png')}
              />
            </View>
          ) : (
            <View
              style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
              <Text style={[styles.newUserName]}>
                {' '}
                {Strings.delivered + ': '}{' '}
              </Text>
              <Image
                style={{height: 10, width: 10}}
                source={require('../../images/tick.png')}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    console.log('sfsdfsdf == ' + this.state.dataList.length);
    const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
    return (
      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={isOpen => this.updateMenuState(isOpen)}>
        <View style={{flex: 1, backgroundColor: AppColors.brand.primary}}>
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
                Prescription Requested
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
          <InternetConnection />
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 0.3,
              borderColor: AppColors.brand.black,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{flex: 0.7}}>
              <LblFormInput
                underline={false}
                lblText={false}
                height={40}
                placeholderTxt={Strings.enterkeywordtosearch}
                lblTxt={Strings.enterkeywordtosearch}
                select_opt={false}
                value={this.state.enterkeywordtosearch}
                onChangeText={text => {
                  this.setState({enterkeywordtosearch: text});
                }}
              />
            </View>
            <TouchableOpacity
              onPress={this.search}
              style={{
                padding: 10,
                margin: 10,
                width: 90,
                justifyContent: 'center',
                alignItems: 'center',
                height: 30,
                backgroundColor: AppColors.brand.navbar,
                borderRadius: 5,
              }}>
              <Text style={{color: AppColors.brand.white, fontSize: 12}}>
                {Strings.search}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            {this.state.nodata == 1 ? (
              <View>
                {this.state.dataList && this.state.dataList.length > 0 ? (
                  <View>
                    <FlatList
                      data={this.state.dataList}
                      renderItem={this._renderRow}
                      onEndReached={this.onEndReached}
                    />
                    <TouchableOpacity
                      onPress={this.reloadView}
                      style={{
                        position: 'absolute',
                        justifyContent: 'center',
                        backgroundColor: AppColors.brand.btnColor,
                        alignItems: 'center',
                        bottom: 40,
                        right: 40,
                        height: 60,
                        width: 60,
                        borderRadius: Platform.OS == 'ios' ? 30 : 50,
                      }}>
                      <Icon
                        name="refresh"
                        size={30}
                        color={AppColors.brand.white}
                        type="font-awesome"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      height: 400,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={
                        ([AppStyles.regularFontText],
                        {color: AppColors.brand.black})
                      }>
                      {Strings.nodata}
                    </Text>
                  </View>
                )}
              </View>
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
          {this.state.loading ? (
            <View style={AppStyles.LoaderStyle}>
              <Loading color={AppColors.brand.primary} />
            </View>
          ) : null}
        </View>
      </SideMenu>
    );
  }
}

/* Export Component ==================================================================== */
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PrescriptionRequested);
