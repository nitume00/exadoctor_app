/**
 * Create Prescription
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import {CheckBox} from '@rneui/themed';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  appointments: UserActions.appointments,
  create_prescriptions: UserActions.create_prescriptions,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar,
    flex: 1,
  },
  label: {
    color: '#a8a8aa',
    fontSize: 16,
  },
});

/* Component ==================================================================== */
class CreatePrescription extends Component {
  static componentName = 'CreatePrescription';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.uspecialities = [];
    this.state = {
      loading: false,
      userLang: 'en',
      condition: '',
      weight: '',
      bp: '',
      rx: 'default',
      pulse: '',
      temperature: '',
      medicines: [],
      tests: [],
      tests_count: '',
      advices: [],
      tab_name: this.props.tab_name ? this.props.tab_name : '',
      cnt: this.props.cnt ? this.props.cnt : '',
      appointmentdata: {},
      user: props.user ? props.user : '',
      prescription_data: props.prescription_data ? props.prescription_data : '',
      reloadPreviousView: false,
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }

  componentDidMount = () => {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.setState({loading: true});
    console.log(
      'props_appointment_data=======> ' +
        JSON.stringify(this.state.prescription_data),
    );
    var payload =
      '{"include":{"0":"user.user_profile","1":"provider_user","2":"clinic_user"}}';
    this.props
      .appointments({
        filter: payload,
        appointment_id: this.state.prescription_data.id,
        token: this.state.user.userToken,
      })
      .then(resp => {
        console.log('createprescription_resp=======> ' + JSON.stringify(resp));
        this.setState({loading: false});
        if (resp.error.code == 0) {
          this.setState({appointmentdata: resp.data});
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log('createprescription_error=======>' + JSON.stringify(error));
      });
  };

  componentWillUnmount = () => {
    if (this.state.reloadPreviousView) {
      var data = {};
      data['tab_name'] = this.state.tab_name;
      data['cnt'] = this.state.cnt + 1;
      console.log('reloadViewdata==> ' + JSON.stringify(data));
      this.props.reloadView(data);
    }
  };

  reloadView_medicine = data => {
    console.log('reloadView_medicine_data=====> ' + JSON.stringify(data));
    this.setState({
      medicines: data,
    });
  };

  reloadView = data => {
    console.log('reloadView_data=====> ' + JSON.stringify(data));
    this.setState({
      tests: data,
    });
  };

  reloadView_advice = data => {
    console.log('reloadView_advice_data=====> ' + JSON.stringify(data));
    this.setState({
      advices: data,
    });
  };

  remedicine = () => {
    Actions.addmedicine({
      reloadView_medicine: this.reloadView_medicine,
      medicines_list: this.state.medicines,
    });
  };

  retest = () => {
    Actions.addtest({
      reloadView: this.reloadView,
      tests_list: this.state.tests,
    });
  };

  readvice = () => {
    Actions.addadvice({
      reloadView_advice: this.reloadView_advice,
      advices_list: this.state.advices,
    });
  };

  validate = () => {
    let numreg = /^[0-9]+$/;
    if (this.state.condition == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterpatientcondition,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.weight != '' && !numreg.test(this.state.weight)) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravalidweight,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.bp == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterbp,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.bp != '' && !this.state.bp) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravalidbp,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.pulse == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterpulse,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.temperature == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentertemperature,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } 
    else if (this.state.rx != '' && !this.state.rx && this.state.rx != 0) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravalidrx,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } 
    else if (AppUtil.validateInt(this.state.rx) == false) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravalidintrx,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.medicines.length == 0) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseaddamedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      this.setState({loading: true});
      var payload = {};
      var medicine = [];
      var test = [];
      var advice = [];

      for (var i = 0; i < this.state.medicines.length; i++) {
        var temp = {};
        temp['name'] = this.state.medicines[i].name;
        temp['medicine_type_id'] = this.state.medicines[i].type;
        temp['dosage_unit'] = this.state.medicines[i].mgml;
        temp['dosage'] = this.state.medicines[i].dose;
        temp['usage_days'] = this.state.medicines[i].days;
        temp['description'] = this.state.medicines[i].comments;
        temp['is_before_food'] = this.state.medicines[i].is_before_food;
        temp['is_after_food'] = this.state.medicines[i].is_after_food;
        temp['is_morning'] = this.state.medicines[i].is_morning;
        temp['is_noon'] = this.state.medicines[i].is_noon;
        temp['is_night'] = this.state.medicines[i].is_night;
        medicine.push(temp);
      }

      for (var i = 0; i < this.state.tests.length; i++) {
        var temp = {};
        temp['name'] = this.state.tests[i].name;
        temp['description'] = this.state.tests[i].description;
        test.push(temp);
      }

      for (var i = 0; i < this.state.advices.length; i++) {
        var temp = {};
        temp['description'] = this.state.advices[i].advice;
        advice.push(temp);
      }

      payload['medicines'] = medicine;
      payload['tests'] = test;
      payload['advices'] = advice;
      payload['user_id'] = this.state.appointmentdata.user_id;
      payload['doctor_user_id'] = this.state.appointmentdata.provider_user_id;
      payload['clinic_user_id'] = this.state.appointmentdata.clinic_user_id;
      payload['appointment_id'] = this.state.appointmentdata.id;
      payload['patient_condition'] = this.state.condition;
      payload['blood_pressure'] = this.state.bp;
      payload['rx_number'] = this.state.rx;
      console.log(
        'createprescription_submit_payload==========> ' +
          JSON.stringify(payload),
      );
      this.props
        .create_prescriptions({body: payload, token: this.state.user.userToken})
        .then(resp => {
          console.log(
            'create_prescriptions_resp=======> ' + JSON.stringify(resp),
          );
          if (resp.error.code == 0) {
            this.setState({reloadPreviousView: true});
            Actions.pop();
          } else {
            Alert.alert(
              AppConfig.appName,
              resp.error.message,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          }
        })
        .catch(error => {
          console.log(
            'create_prescriptions_error=======> ' + JSON.stringify(error),
          );
        });
    }
  };

  delete_test = val => {
    console.log('delete_test_val=======> ' + val);
    var array = [...this.state.tests]; // make a separate copy of the array
    console.log('delete_test_array=======> ' + JSON.stringify(array));
    if (val > -1) {
      array.splice(val, 1);
      this.setState({tests: array}, () => {
        console.log(
          'delete_test_tests=======> ' + JSON.stringify(this.state.tests),
        );
      });
    }
  };

  delete_medicine = val => {
    console.log('delete medicine_val=======> ' + val);
    var array = [...this.state.medicines]; // make a separate copy of the array
    console.log('delete medicine_array=======> ' + JSON.stringify(array));
    if (val > -1) {
      array.splice(val, 1);
      this.setState({medicines: array}, () => {
        console.log(
          'delete medicine_medicines=======> ' +
            JSON.stringify(this.state.medicines),
        );
      });
    }
  };

  delete_advice = val => {
    console.log('delete_advice_val=======> ' + val);
    var array = [...this.state.advices]; // make a separate copy of the array
    console.log('delete_advice_array=======> ' + JSON.stringify(array));
    if (val > -1) {
      array.splice(val, 1);
      this.setState({advices: array}, () => {
        console.log(
          'delete_advice_advices=======> ' + JSON.stringify(this.state.advices),
        );
      });
    }
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  render = () => {
    var medicine_list = [];
    var test_list = [];
    var advice_list = [];
    if (this.state.medicines && this.state.medicines.length > 0) {
      var temp = this.state.medicines;
      for (var i = 0; i < temp.length; i++) {
        medicine_list.push(
          <View
            style={{
              borderColor: AppColors.brand.black,
              borderBottomWidth: 0.5,
            }}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.45}}>
                <Text style={{padding: 5, fontSize: 12}}>
                  {temp[i].medicine_type}
                </Text>
              </View>
              <View style={{flex: 0.45}}>
                <Text style={{padding: 5, fontSize: 12}}>{temp[i].name}</Text>
              </View>
              <View style={{flex: 0.45}}>
                <Text style={{padding: 5, fontSize: 12}}>{temp[i].mgml}</Text>
              </View>
              <View style={{flex: 0.45}}>
                <Text style={{padding: 5, fontSize: 12}}>{temp[i].dose}</Text>
              </View>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={this.delete_medicine.bind(this, i)}>
                <Image
                  style={{height: 10, width: 10}}
                  source={require('../../images/delete.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.5}}>
                <Text
                  style={{
                    padding: 5,
                    fontSize: 12,
                    color: AppColors.brand.secondary,
                  }}>
                  {Strings.usage +
                    temp[i].is_morning +
                    '- ' +
                    temp[i].is_noon +
                    '- ' +
                    temp[i].is_night}
                </Text>
              </View>
              <View style={{flex: 0.5}}>
                <Text
                  style={{
                    padding: 5,
                    fontSize: 12,
                    color: AppColors.brand.secondary,
                  }}>
                  {temp[i].is_before_food == 1
                    ? 'Take before food'
                    : 'Take after food'}
                </Text>
              </View>
            </View>
          </View>,
        );
      }
    }

    if (this.state.tests && this.state.tests.length != 0) {
      var temp = this.state.tests;
      for (var i = 0; i < temp.length; i++) {
        //<View key={i} style = {{ marginTop: 10, borderWidth: 0.5, borderBottomColor: 'black', margin: 5 }}>
        test_list.push(
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 0.45}}>
              <Text style={{padding: 5, fontSize: 12}}>{temp[i].name}</Text>
            </View>
            <View style={{flex: 0.45, paddingLeft: 5}}>
              <Text style={{padding: 5, fontSize: 12}}>
                {temp[i].description != '' ? temp[i].description : '-'}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={this.delete_test.bind(this, i)}>
              <Image
                style={{height: 10, width: 10}}
                source={require('../../images/delete.png')}
              />
            </TouchableOpacity>
          </View>,
        );
      }
    }

    if (this.state.advices && this.state.advices.length != 0) {
      var temp = this.state.advices;
      for (var i = 0; i < temp.length; i++) {
        advice_list.push(
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 0.9}}>
              <Text style={{padding: 5, fontSize: 12}}>{temp[i].advice}</Text>
            </View>
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={this.delete_advice.bind(this, i)}>
              <Image
                style={{height: 10, width: 10}}
                source={require('../../images/delete.png')}
              />
            </TouchableOpacity>
          </View>,
        );
      }
    }

    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.createprescription} />
        <View style={{flex: 0.9, backgroundColor: AppColors.brand.primary}}>
          <ScrollView style={{flex: 1}}>
            <View
              style={{
                margin: 15,
                padding: 5,
                borderWidth: 1,
                borderColor: AppColors.brand.navbar,
                borderRadius: 5,
              }}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 0.5}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    Name:{' '}
                    {this.state.prescription_data &&
                    this.state.prescription_data.user &&
                    this.state.prescription_data.user.username
                      ? this.Capitalize(
                          this.state.prescription_data.user.username,
                        )
                      : ''}
                  </Text>
                </View>
                <View style={{flex: 0.5}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    Age:{' '}
                    {this.state.prescription_data &&
                    this.state.prescription_data.user &&
                    this.state.prescription_data.user.user_profile.dob
                      ? moment().diff(
                          this.state.prescription_data.user.user_profile.dob,
                          'years',
                        )
                      : Strings.notmentioned}
                  </Text>
                </View>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 0.5}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    Patient ID:{' '}
                    {this.state.prescription_data &&
                    this.state.prescription_data.user &&
                    this.state.prescription_data.user.patient_id
                      ? this.state.prescription_data.user.patient_id
                      : ''}
                  </Text>
                </View>
                <View style={{flex: 0.5}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    Sex:{' '}
                    {this.state.prescription_data &&
                    this.state.prescription_data.user &&
                    this.state.prescription_data.user.user_profile &&
                    this.state.prescription_data.user.user_profile.gender_id &&
                    this.state.prescription_data.user.user_profile.gender_id ==
                      1
                      ? Strings.male
                      : Strings.female}
                  </Text>
                </View>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{padding: 5, fontSize: 12}}>
                  Appointment Token:{' '}
                  {this.state.prescription_data &&
                  this.state.prescription_data.appointment_token
                    ? this.state.prescription_data.appointment_token
                    : ''}
                </Text>
              </View>
            </View>
            <View style={{flex: 1}}>
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.patientcondition + ' *'}
                lblTxt={Strings.education}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.condition}
                onChangeText={condition => this.setState({condition})}
              />
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.weight}
                lblTxt={Strings.weight}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.weight}
                onChangeText={weight => this.setState({weight})}
              />
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.bp + ' *'}
                lblTxt={Strings.bp}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.bp}
                onChangeText={bp => this.setState({bp})}
              />
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.pulse + ' *'}
                lblTxt={Strings.pulse}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.pulse}
                onChangeText={pulse => this.setState({pulse})}
              />
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.temperature + ' *'}
                lblTxt={Strings.temperature}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.temperature}
                onChangeText={temperature => this.setState({temperature})}
              />
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.diagnosis + ' *'}
                lblTxt={Strings.diagnosis}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.rx}
                onChangeText={rx => this.setState({rx})}
              />
            </View>
            <Spacer size={40} />
            <View style={{marginLeft: 5, marginRight: 5}}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                  }}>
                  <View style={{flex: 0.9}}>
                    <Text
                      style={{
                        padding: 5,
                        fontSize: 16,
                        color: AppColors.brand.navbar,
                      }}>
                      {Strings.medicine}
                    </Text>
                  </View>
                  <View style={{flex: 0.1, padding: 5}}>
                    <TouchableOpacity onPress={this.remedicine}>
                      <Image
                        style={{height: 15, width: 15}}
                        source={require('../../images/add_black.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.type}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.medicinename}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.mgml}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.dose}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.1,
                      backgroundColor: AppColors.brand.grey,
                    }}></View>
                </View>
              </View>
              {medicine_list && medicine_list.length > 0 ? (
                <View>{medicine_list}</View>
              ) : (
                <Text
                  style={[styles.label, {textAlign: 'center', marginTop: 20}]}>
                  {Strings.nomedicinesadded}
                </Text>
              )}
            </View>
            <Spacer size={40} />
            <View style={{marginLeft: 5, marginRight: 5}}>
              <View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <View style={{flex: 0.9}}>
                    <Text
                      style={{
                        padding: 5,
                        fontSize: 16,
                        color: AppColors.brand.navbar,
                      }}>
                      {Strings.test}
                    </Text>
                  </View>
                  <View style={{flex: 0.1, padding: 5}}>
                    <TouchableOpacity onPress={this.retest}>
                      <Image
                        style={{height: 15, width: 15}}
                        source={require('../../images/add_black.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.testname}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.45, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.testdescription}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.1,
                      backgroundColor: AppColors.brand.grey,
                    }}></View>
                </View>
              </View>
              {test_list && test_list.length > 0 ? (
                <View>{test_list}</View>
              ) : (
                <Text
                  style={[styles.label, {textAlign: 'center', marginTop: 20}]}>
                  {Strings.notestsadded}
                </Text>
              )}
            </View>
            <Spacer size={40} />
            <View style={{marginLeft: 5, marginRight: 5}}>
              <View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <View style={{flex: 0.9}}>
                    <Text
                      style={{
                        padding: 5,
                        fontSize: 16,
                        color: AppColors.brand.navbar,
                      }}>
                      {Strings.advice}
                    </Text>
                  </View>
                  <View style={{flex: 0.1, padding: 5}}>
                    <TouchableOpacity onPress={this.readvice}>
                      <Image
                        style={{height: 15, width: 15}}
                        source={require('../../images/add_black.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {Strings.advice}:
                  </Text>
                </View>
              </View>
              {advice_list && advice_list.length > 0 ? (
                <View>{advice_list}</View>
              ) : (
                <Text
                  style={[styles.label, {textAlign: 'center', marginTop: 20}]}>
                  {Strings.noadvicesadded}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            flex: 0.1,
            justifyContent: 'flex-end',
            backgroundColor: AppColors.brand.primary,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={Actions.pop}
              style={{
                backgroundColor: '#C9302B',
                flex: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  backgroundColor: 'transparent',
                  fontSize: 16,
                  color: 'white',
                  textDecorationLine: 'none',
                  paddingTop: 10,
                  paddingBottom: 10,
                  textAlign: 'center',
                }}>
                {Strings.cancel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.validate}
              style={{
                backgroundColor: AppColors.brand.btnColor,
                flex: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  backgroundColor: 'transparent',
                  fontSize: 16,
                  color: 'white',
                  textDecorationLine: 'none',
                  paddingTop: 10,
                  paddingBottom: 10,
                  textAlign: 'center',
                }}>
                {Strings.submit}
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
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(CreatePrescription);
