/**
 * Prescription
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ListView,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import {Icon, Rating, CheckBox} from '@rneui/themed';
import NavComponent from '@components/NavComponent.js';
import ProvideMedicine from '@containers/Pharmacy/ProvideMedicine.js';
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
  users: UserActions.users,
  prescriptions: UserActions.prescriptions,
  medicine_delivery_logs: UserActions.medicine_delivery_logs,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar,
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

var quantity_det = [];

/* Component ==================================================================== */
class Prescription extends Component {
  static componentName = 'Prescription';
  static propTypes = {
    users: PropTypes.func.isRequired,
    prescriptions: PropTypes.func.isRequired,
    medicine_delivery_logs: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    console.log(
      'this.state.prescription_data======> ' + JSON.stringify(props.reloadView),
    );
    this.qd = [];
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      userLang: 'en',
      user: props.user ? props.user : '',
      prescription_data: props.prescription_data ? props.prescription_data : '',
      prescription_details: '',
      quantity: '',
      price: '',
      edit_quantity: [],
      edit_price: [],
    };
    this.deliver.bind(this);
    this.qty = [];
    this.prc = [];
  }
  componentWillReceiveProps(props) {
    console.log(
      'this.state.prescription_data====hh==> ' + JSON.stringify(props),
    );
    console.log(
      'this.state.prescription_data====ff==> ' +
        JSON.stringify(props.reloadView),
    );
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    console.log(
      'this.state.prescription_data=== 111 ===> ' +
        JSON.stringify(this.props.reloadView),
    );
    this.setState({loading: true});
    var id = '';
    if (this.state.prescription_data.prescription) {
      id = this.state.prescription_data.prescription.id;
    } else {
      id = this.state.prescription_data.id;
    }
    var payload =
      '{"include":{"0":"user.user_profile","1":"doctor_user.user_profile.city.state.country","2":"clinic_user.user_profile.city.state.country","3":"appointment.user.user_profile","4":"prescription_medicine.medicine_type","5":"prescription_test","6":"prescription_note"}}';
    this.props
      .prescriptions({
        filter: payload,
        id: id,
        token: this.state.user.userToken,
      })
      .then(res => {
        console.log(
          'componentDidMount_prescription_details=====> ' + JSON.stringify(res),
        );
        if (res.error && res.error.code == 0) {
          this.setState({prescription_details: res.data, loading: false});
        } else {
          this.setState({loading: false});
        }
      })
      .catch(err => {
        //const error = AppAPI.handleError(err);
        this.setState({loading: false});
      });
  }

  f_quantity = (id, txt) => {
    console.log('uuuu == ' + id + '==' + txt);
    this.qty[id] = txt;
  };
  f_price = (id, txt) => {
    console.log('uuuu == ' + id + '==' + txt);
    this.prc[id] = txt;
  };
  componentWillUnMount() {
    if (this.props.reloadView) this.props.reloadView();
  }
  deliver = () => {
    //http://eprescription.nginxpg.develag.com/api/v1/medicine_delivery_logs
    /*
      {"medicines":[{"medicine_name":"Paraacetamol","prescription_id":32,"quantity":435,"amount":435},{"medicine_name":"Coughy","prescription_id":32,"quantity":54,"amount":98}],"prescription_id":"32"}
    */
    var payload = '';
    var medicines = this.state.prescription_details.prescription_medicine;
    var arr = this.qty;
    arr = arr.filter(Boolean);
    if (
      medicines &&
      medicines.length &&
      medicines.length == arr.length &&
      this.qty.length &&
      this.qty.length == this.prc.length
    ) {
      var medicine_arr = [];
      for (var i = 0; i < medicines.length; i++) {
        medicine_arr.push({
          medicine_name: medicines[i]?.name,
          prescription_id: this.state.prescription_details.id,
          quantity: this.qty[medicines[i].id],
          amount: this.prc[medicines[i].id],
        });
      }
      payload = {
        medicines: medicine_arr,
        prescription_id: this.state.prescription_details.id,
      };

      this.props
        .medicine_delivery_logs({
          body: payload,
          token: this.state.user.userToken,
        })
        .then(resp => {
          if (resp.error && resp.error.code == 0) {
            Actions.pop({refresh: {is_refresh: 1}});
          }
        })
        .catch(err => {
          console.log('error' + JSON.stringify(err));
        });
    } else {
      Alert.alert(
        AppConfig.appName,
        Strings.enterallmedicinedetails,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  render() {
    var dte = '';
    var tme = '';
    var appointmentdate = '';
    var appointmenttime = '';
    if (this.state.prescription_details) {
      dte = moment(this.state.prescription_details.created_at).format(
        'MM-DD-YYYY',
      );
      tme = moment(this.state.prescription_details.created_at).format(
        'hh:mm A',
      );
      if (this.state.prescription_details.appointment) {
        appointmentdate =
          this.state.prescription_details.appointment.appointment_date;
        appointmenttime =
          this.state.prescription_details.appointment.appointment_time;
      }
    }

    var tests = [];
    if (
      this.state.prescription_details &&
      this.state.prescription_details.prescription_test
    ) {
      var slot_data = this.state.prescription_details.prescription_test;
      for (var i = 0; i < slot_data.length; i++) {
        tests.push(
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 0.5}}>
              <Text style={{padding: 5, fontSize: 12}}>
                {slot_data[i].name}
              </Text>
            </View>
            <View style={{flex: 0.5}}>
              <Text style={{padding: 5, fontSize: 12}}>
                {slot_data[i].description}
              </Text>
            </View>
          </View>,
        );
      }
    }

    var advicesar = [];
    if (
      this.state.prescription_details &&
      this.state.prescription_details.prescription_note
    ) {
      var advices = this.state.prescription_details.prescription_note;
      for (var i = 0; i < advices.length; i++) {
        advicesar.push(
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text style={{padding: 5, fontSize: 12}}>
              {advices[i].description}
            </Text>
          </View>,
        );
      }
    }

    var medicines = [];
    if (
      this.state.prescription_details &&
      this.state.prescription_details.prescription_medicine
    ) {
      var advices = this.state.prescription_details.prescription_medicine;
      var j = 0;
      var viewColor = AppColors.brand.white;
      var tttt = [];
      var j = 1;
      for (var i = 0; i < advices.length; i++) {
        if (j % 2 == 0) {
          viewColor = AppColors.brand.grey;
        } else {
          viewColor = '#ddeaff';
        }
        var id = advices[i] && advices[i].id ? advices[i].id : 0;
        console.log('idsss = ' + id);
        var temp = {};
        temp['id'] = id;
        var that = this;
        medicines.push(
          <ProvideMedicine
            key={i}
            f_quantity={that.f_quantity}
            f_price={that.f_price}
            i={i}
            show={this.props.show}
            prescription_details={that.state.prescription_details}
            viewColor={viewColor}
            id={id}
            txtVal={''}
          />,
        );
        j++;
      }
      quantity_det = tttt;
      console.log('quantity_det====> ' + JSON.stringify(quantity_det));
    }
    console.log(
      'logdata == ' + JSON.stringify(this.state.prescription_details),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.prescription} />
        <View style={{flex: 1, backgroundColor: AppColors.brand.white}}>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
            <View style={{flex: 1}}>
              <View style={{padding: 15}}>
                <Text
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    padding: 5,
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                  }}>
                  {this.state.prescription_details &&
                  this.state.prescription_details.doctor_user &&
                  this.state.prescription_details.doctor_user.username
                    ? this.Capitalize(
                        this.state.prescription_details.doctor_user.username,
                      )
                    : ''}
                  :
                </Text>
                <Text style={{padding: 5, fontSize: 12}}>
                  {this.state.prescription_details &&
                  this.state.prescription_details.doctor_user &&
                  this.state.prescription_details.doctor_user.user_profile &&
                  this.state.prescription_details.doctor_user.user_profile
                    .dr_title
                    ? this.state.prescription_details.doctor_user.user_profile
                        .dr_title
                    : ''}
                </Text>

                <Text style={{padding: 5, fontSize: 12}}>
                  {Strings.email}:{' '}
                  {this.state.prescription_details &&
                  this.state.prescription_details.doctor_user &&
                  this.state.prescription_details.doctor_user.email
                    ? this.state.prescription_details.doctor_user.email
                    : ''}
                </Text>
                <Text style={{padding: 5, fontSize: 12}}>
                  {Strings.phone}:{' '}
                  {this.state.prescription_details &&
                  this.state.prescription_details.doctor_user &&
                  this.state.prescription_details.doctor_user.mobile_code
                    ? this.state.prescription_details.doctor_user.mobile_code
                    : ''}{' '}
                  {this.state.prescription_details &&
                  this.state.prescription_details.doctor_user &&
                  this.state.prescription_details.doctor_user.mobile
                    ? this.state.prescription_details.doctor_user.mobile
                    : ''}
                </Text>
              </View>
              {this.state.prescription_details &&
              this.state.prescription_details.clinic_user ? (
                <View style={{padding: 15, paddingTop: 0}}>
                  <Text
                    style={{
                      borderBottomWidth: 1,
                      borderColor: AppColors.brand.navbar,
                      padding: 5,
                      fontSize: 16,
                      color: AppColors.brand.navbar,
                    }}>
                    {this.state.prescription_details &&
                    this.state.prescription_details.clinic_user &&
                    this.state.prescription_details.clinic_user.username
                      ? this.state.prescription_details.clinic_user.username
                      : ''}
                    :
                  </Text>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {this.state.prescription_details &&
                    this.state.prescription_details.clinic_user &&
                    this.state.prescription_details.clinic_user.user_profile &&
                    this.state.prescription_details.clinic_user.user_profile
                      .address
                      ? this.state.prescription_details.clinic_user.user_profile
                          .address
                      : ''}
                  </Text>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {Strings.phone}:{' '}
                    {this.state.prescription_details &&
                    this.state.prescription_details.clinic_user &&
                    this.state.prescription_details.clinic_user.mobile_code
                      ? this.state.prescription_details.clinic_user.mobile_code
                      : ''}{' '}
                    {this.state.prescription_details &&
                    this.state.prescription_details.clinic_user &&
                    this.state.prescription_details.clinic_user.mobile
                      ? this.state.prescription_details.clinic_user.mobile
                      : ''}
                  </Text>
                </View>
              ) : null}
              <View
                style={{
                  margin: 15,
                  marginTop: 0,
                  padding: 5,
                  paddingTop: 0,
                  borderWidth: 1,
                  borderColor: AppColors.brand.navbar,
                  borderRadius: 5,
                }}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.6}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.name}:{' '}
                      {this.state.prescription_details &&
                      this.state.prescription_details.user &&
                      this.state.prescription_details.user.username
                        ? this.Capitalize(
                            this.state.prescription_details.user.username,
                          )
                        : ''}
                    </Text>
                  </View>
                  {this.state.prescription_details &&
                  this.state.prescription_details.user &&
                  this.state.prescription_details.user.user_profile &&
                  this.state.prescription_details.user.user_profile.dob ? (
                    <View style={{flex: 0.4}}>
                      <Text style={{padding: 5, fontSize: 12}}>
                        {Strings.age}:{' '}
                        {moment().diff(
                          this.state.prescription_details.user.user_profile.dob,
                          'years',
                        )}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.6}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.appointmentnumber}:{' '}
                      {this.state.prescription_details &&
                      this.state.prescription_details.appointment
                        ? this.state.prescription_details.appointment
                            .appointment_token
                        : ''}
                    </Text>
                  </View>
                  {this.state.prescription_details &&
                  this.state.prescription_details.user &&
                  this.state.prescription_details.user.user_profile &&
                  this.state.prescription_details.user.user_profile
                    .gender_id ? (
                    <View style={{flex: 0.4}}>
                      <Text style={{padding: 5, fontSize: 12}}>
                        {Strings.sex}:{' '}
                        {this.state.prescription_details.user.user_profile
                          .gender_id == 1
                          ? Strings.male
                          : Strings.female}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.6}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.date}: {dte}
                    </Text>
                  </View>
                  <View style={{flex: 0.4}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.time}: {tme}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{padding: 15, paddingTop: 0, paddingBottom: 0}}>
                <Text
                  style={{
                    padding: 5,
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                  }}>
                  {Strings.patientcondition}:
                </Text>
              </View>
              <View
                style={{
                  margin: 15,
                  marginTop: 0,
                  padding: 5,
                  paddingTop: 0,
                  borderWidth: 1,
                  borderColor: AppColors.brand.navbar,
                  borderRadius: 5,
                }}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.condition}:{' '}
                      {this.state.prescription_details.patient_condition
                        ? this.state.prescription_details.patient_condition
                        : '-'}
                    </Text>
                  </View>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.weight}:{' '}
                      {this.state.prescription_details.weight
                        ? this.state.prescription_details.weight
                        : '-'}
                    </Text>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.bp}:{' '}
                      {this.state.prescription_details.blood_pressure
                        ? this.state.prescription_details.blood_pressure
                        : '-'}
                    </Text>
                  </View>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.pulse}:{' '}
                      {this.state.prescription_details.pulse
                        ? this.state.prescription_details.pulse
                        : '-'}
                    </Text>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.temperature}:{' '}
                      {this.state.prescription_details.temperature
                        ? this.state.prescription_details.temperature
                        : '-'}
                    </Text>
                  </View>
                  <View style={{flex: 0.5}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.diagnosis}:{' '}
                      {this.state.prescription_details.rx_number
                        ? this.state.prescription_details.rx_number
                        : '-'}
                    </Text>
                  </View>
                </View>
              </View>

               <View style={{padding: 15, paddingTop: 0}}>
                <Text
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    padding: 5,
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                  }}>
                  {Strings.medicines}:
                </Text>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.type}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.medicinename}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.mgml}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.dosage}
                    </Text>
                  </View>
                </View>
                {/* {medicines.length ? (
                  medicines
                ) : (
                  <View>
                    <Text> - </Text>
                  </View>
                )} */}
              </View> 

              <View style={{padding: 15, paddingTop: 0}}>
                <Text
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    padding: 5,
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                  }}>
                  Tests:
                </Text>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings?.name}
                    </Text>
                  </View>
                  <View
                    style={{flex: 0.5, backgroundColor: AppColors.brand.grey}}>
                    <Text style={{padding: 5, fontSize: 12}}>
                      {Strings.notes}
                    </Text>
                  </View>
                </View>
                {tests.length ? (
                  tests
                ) : (
                  <View>
                    <Text> - </Text>
                  </View>
                )}
              </View>

              <View style={{padding: 15, paddingTop: 0}}>
                <Text
                  style={{
                    borderBottomWidth: 1,
                    borderColor: AppColors.brand.navbar,
                    padding: 5,
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                  }}>
                  Advices:
                </Text>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {Strings.notes}:
                  </Text>
                </View>
                {advicesar.length ? (
                  advicesar
                ) : (
                  <View>
                    <Text> - </Text>
                  </View>
                )}
              </View>

              <View
                style={{
                  margin: 15,
                  marginTop: 0,
                  padding: 5,
                  paddingTop: 0,
                  borderWidth: 1,
                  borderColor: AppColors.brand.navbar,
                  borderRadius: 5,
                }}>
                <View style={{flex: 1}}>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {Strings.appointmentdate}: {appointmentdate}
                  </Text>
                  <Text style={{padding: 5, fontSize: 12}}>
                    {Strings.appointmenttime}: {appointmenttime}
                  </Text>
                </View>
              </View>
              {this.props.show ? (
                <View>
                  <Button
                    onPress={this.deliver}
                    title={Strings.dispatch}
                    backgroundColor={AppColors.brand.buttonclick}
                    fontSize={15}
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(Prescription);
