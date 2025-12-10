/**
 * Prescription
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
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
import Permissions from 'react-native-permissions';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import {Icon, Rating, CheckBox} from '@rneui/themed';
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
  users: UserActions.users,
  patient_diagnostic_tests: UserActions.patient_diagnostic_tests,
  diagnostic_center_tests_patient_diagnostic_tests:
    UserActions.diagnostic_center_tests_patient_diagnostic_tests,
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
    patient_diagnostic_tests: PropTypes.func.isRequired,
    diagnostic_center_tests_patient_diagnostic_tests: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.site_url = '';
    this.state = {
      loading: false,
      userLang: 'en',
      user: props.user ? props.user : '',
      report_data: props.report_data ? props.report_data : '',
      report_details: '',
      photopermission: '',
      camerapermission: '',
      storagepermission: Platform.OS == 'ios' ? '1' : '',
      cvrprofileImage: '',
      cvrUploadStatus: false,
      show_upload: 0,
      btnname: Strings.addreport,
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.report_fetch();
  }
  report_fetch = () => {
    console.log(
      'this.state.report_data======> ' + JSON.stringify(this.state.report_data),
    );
    var payload =
      '{"include":{"0":"patient.user_profile","1":"diagnostic_center_tests_patient_diagnostic_test.diagnostic_center_test.lab_test","2":"book_by_user.user_profile","3":"branch.city","4":"appointment_type","5":"appointment_status","6":"diagnostic_center_user.user_profile","7":"diagnostic_center_tests_patient_diagnostic_test.attachment"}, "limit":1000,"skip":0}';
    this.props
      .patient_diagnostic_tests({
        filter: payload,
        id: this.state.report_data.id,
        token: this.state.user.userToken,
      })
      .then(res => {
        console.log('prescription_details =====> ' + JSON.stringify(res));
        if (res.error && res.error.code == 0) {
          this.setState({
            btnname: Strings.addreport,
            report_details: res.data,
            loading: false,
          });
        } else {
          this.setState({loading: false});
        }
      })
      .catch(err => {
        //const error = AppAPI.handleError(err);
        this.setState({loading: false});
      });
  };
  pickerImagePressed = imgtype => {
    if (this.state.camerapermission === '') {
      Permissions.request('camera').then(response => {
        if (response == 'authorized') {
          this.setState(
            {camerapermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else if (this.state.photopermission === '') {
      Permissions.request('photo').then(response => {
        if (response == 'authorized') {
          this.setState(
            {photopermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else if (this.state.storagepermission === '') {
      Permissions.request('storage').then(response => {
        if (response == 'authorized') {
          this.setState(
            {storagepermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else {
      Actions.Camera({
        imgtype: imgtype,
        reloadView: this.getCatpturedImage.bind(this, imgtype),
      });
    }
  };
  getCatpturedImage = (imgtype, image) => {
    if (image.image) {
      this.setState({
        show_upload: 1,
        cvrUploadStatus: true,
        cvrprofileImage: 'data:image/png;base64,' + image.image,
        video_post_url: '',
      });
    }
  };
  uploadReport = () => {
    this.setState({show_upload: 0, btnname: Strings.uploading});
    if (this.callInvoked == 0) {
      this.callInvoked = 1;
      var payload = {
        id: this.state.report_details
          .diagnostic_center_tests_patient_diagnostic_test[0].id,
        is_report_uploaded: 1,
        attachment: [{image_data: '"' + this.state.cvrprofileImage + '"'}],
      };
      this.props
        .diagnostic_center_tests_patient_diagnostic_tests({
          filter: payload,
          post_type: 'PUT',
        })
        .then(res => {
          this.callInvoked = 0;
          if (res.error && res.error.code == 0) {
            this.setState({
              show_upload: 0,
              btnname: Strings.loading,
              cvrUploadStatus: false,
              cvrprofileImage: '',
              video_post_url: '',
            });
            this.report_fetch();
          }
        })
        .catch(err => {
          this.callInvoked = 0;
          this.setState({loading: false});
        });
    }
  };

  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  handleClick = url => {
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };
  render() {
    console.log(
      'reportdetails === ' + JSON.stringify(this.state.report_details),
    );
    var display_reports = [];
    var lbtests = [];
    if (
      this.state.report_details &&
      this.state.report_details
        .diagnostic_center_tests_patient_diagnostic_test &&
      this.state.report_details.diagnostic_center_tests_patient_diagnostic_test
        .length
    ) {
      var ts =
        this.state.report_details
          .diagnostic_center_tests_patient_diagnostic_test;

      lbtests.push(
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: AppColors.brand.grey,
          }}>
          <View style={{flex: 0.25, padding: 5}}>
            <Text>{Strings.name}</Text>
          </View>
          <View style={{flex: 0.15, padding: 5}}>
            <Text>{Strings.price}</Text>
          </View>
          <View style={{flex: 0.6, padding: 5}}>
            <Text>{Strings.reasonforvisit}</Text>
          </View>
        </View>,
      );
      for (var j = 0; j < ts.length; j++) {
        if (
          this.state.report_details
            .diagnostic_center_tests_patient_diagnostic_test[j] &&
          this.state.report_details
            .diagnostic_center_tests_patient_diagnostic_test[j]
            .diagnostic_center_test
        ) {
          var lt =
            this.state.report_details
              .diagnostic_center_tests_patient_diagnostic_test[j]
              .diagnostic_center_test.lab_test;
          var ltp =
            this.state.report_details
              .diagnostic_center_tests_patient_diagnostic_test[j]
              .diagnostic_center_test;

          lbtests.push(
            <View style={{flexDirection: 'row', flex: 1, marginTop: 5}}>
              <View style={{flex: 0.25}}>
                <Text style={{fontSize: 10}}>{lt.name}</Text>
              </View>
              <View style={{flex: 0.15}}>
                <Text style={{fontSize: 10, textAlign: 'center'}}>
                  {ltp.price}
                </Text>
              </View>
              <View style={{flex: 0.6}}>
                <Text style={{fontSize: 10, paddingLeft: 5}}>
                  {lt.description}
                </Text>
              </View>
            </View>,
          );

          var imgs =
            this.state.report_details
              .diagnostic_center_tests_patient_diagnostic_test[j].attachment;
          for (var i = 0; i < imgs.length; i++) {
            var imageurl = '';
            var md5string =
              'DiagnosticCenterTestPatientDiagnosticTest' +
              imgs[i].id +
              'pngoriginal';
            var imagetemp = AppUtil.MD5(md5string);
            imageurl =
              this.site_url +
              '/images/original/DiagnosticCenterTestPatientDiagnosticTest/' +
              imgs[i].id +
              '.' +
              imagetemp +
              '.png';
            console.log('reportimage == ' + imageurl);
            display_reports.push(
              <TouchableOpacity
                onPress={this.handleClick.bind(this, imageurl)}
                style={{marginRight: 5, marginBottom: 5}}>
                <Image
                  source={{uri: imageurl}}
                  style={{width: 100, height: 100}}
                />
              </TouchableOpacity>,
            );
          }
        }
      }
    }
    var ysno = Strings.no;
    if (this.state.report_details.is_paid_via_online === 1) {
      ysno = Strings.yes;
    }
    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={
            this.state.user && this.state.user.role_id == 2
              ? Strings.viewreport
              : Strings.uploadreport
          }
        />
        <View style={{flex: 1, backgroundColor: AppColors.brand.white}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{flex: 1, padding: 10}}>
            <View style={{height: 15}} />
            <View>
              <Text
                style={{
                  borderBottomWidth: 1,
                  borderColor: AppColors.brand.navbar,
                  padding: 5,
                  fontSize: 16,
                  color: AppColors.brand.navbar,
                }}>
                {Strings.labtestdetail}
              </Text>
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.appointmentdate}</Text>
              {this.state.report_details ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>: </Text>
                  <Text>{this.state.report_details.appointment_date}</Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.appointmenttime}</Text>
              {this.state.report_details ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>: </Text>
                  <Text>{this.state.report_details.appointment_time}</Text>
                </View>
              ) : null}
            </View>
            {this.state.report_details &&
            this.state.report_details.appointment_type &&
            this.state.report_details.appointment_type.name ? (
              <View>
                <View style={{height: 15}} />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                  <Text style={{width: 135}}>{Strings.appointmenttype}</Text>
                  {this.state.report_details ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text>: </Text>
                      <Text>
                        {this.state.report_details.appointment_type.name}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.where}</Text>
              {this.state.report_details &&
              this.state.report_details.diagnostic_center_user &&
              this.state.report_details.diagnostic_center_user.username ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}>
                  <Text>: </Text>
                  <Text
                    style={{
                      flexWrap: 'wrap',
                      width: AppSizes.screen.width / 2,
                      color: AppColors.brand.navbar,
                    }}>
                    {this.Capitalize(
                      this.state.report_details.diagnostic_center_user.username,
                    )}
                    , {this.Capitalize(this.state.report_details.branch.name)},{' '}
                    {this.Capitalize(
                      this.state.report_details.branch.city.name,
                    )}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.patientname}</Text>
              {this.state.report_details &&
              this.state.report_details.patient &&
              this.state.report_details.patient.username ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>: </Text>
                  <Text>
                    {this.Capitalize(
                      this.state.report_details.patient.username,
                    )}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.email}</Text>
              {this.state.report_details &&
              this.state.report_details.patient &&
              this.state.report_details.patient.email ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}>
                  <Text>: </Text>
                  <Text
                    style={{
                      flexWrap: 'wrap',
                      width: AppSizes.screen.width / 2,
                    }}>
                    {this.state.report_details.patient.email}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.phone}</Text>
              {this.state.report_details &&
              this.state.report_details.patient ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>: </Text>
                  <Text>
                    {this.state.report_details.patient.mobile_code}{' '}
                    {this.state.report_details.patient.mobile}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.status}</Text>
              {this.state.report_details &&
              this.state.report_details.appointment_status ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>: </Text>
                  <Text>
                    {this.state.report_details.appointment_status.name}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text style={{width: 135}}>{Strings.paidviaonline}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>: </Text>
                <Text style={{color: '#000'}}>
                  {this.state.report_details &&
                  this.state.report_details.is_paid_via_online === 1
                    ? Strings.yes
                    : Strings.no}
                </Text>
              </View>
            </View>
            <View style={{height: 15}} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginBottom: 5,
                borderBottomWidth: 0.5,
                borderColor: AppColors.brand.navbar,
              }}>
              <Text style={{width: 135}}>{Strings.labtests}</Text>
            </View>
            {lbtests}
            {this.state.cvrprofileImage != '' ? (
              <View
                style={{flexDirection: 'row', marginRight: 5, marginBottom: 5}}>
                <Image
                  source={{uri: this.state.cvrprofileImage}}
                  style={{width: 100, height: 100}}
                />
              </View>
            ) : null}
            {this.state.show_upload == 1 ? (
              <View>
                <TouchableOpacity
                  onPress={this.uploadReport}
                  style={{
                    marginleft: 5,
                    marginTop: 5,
                    height: 30,
                    backgroundColor: AppColors.brand.btnColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    lineHeight: 20,
                  }}>
                  <Text
                    style={{
                      color: AppColors.brand.white,
                      padding: 10,
                      backgroundColor: 'transparent',
                    }}>
                    {Strings.uploadreport}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      show_upload: 0,
                      cvrUploadStatus: false,
                      cvrprofileImage: '',
                      video_post_url: '',
                    });
                  }}
                  style={{
                    marginleft: 5,
                    marginTop: 5,
                    height: 30,
                    backgroundColor: AppColors.brand.btnColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    lineHeight: 20,
                  }}>
                  <Text
                    style={{
                      color: AppColors.brand.white,
                      padding: 10,
                      backgroundColor: 'transparent',
                    }}>
                    {Strings.cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {this.state.show_upload == 0 &&
            this.state.user &&
            this.state.user.role_id != 2 ? (
              <TouchableOpacity
                onPress={this.pickerImagePressed.bind(this, 'home')}
                style={{
                  marginTop: 5,
                  height: 30,
                  backgroundColor: AppColors.brand.btnColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  lineHeight: 20,
                }}>
                <Text
                  style={{
                    color: AppColors.brand.white,
                    padding: 10,
                    backgroundColor: 'transparent',
                  }}>
                  {this.state.btnname}
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={{height: 15}} />
            <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
              {display_reports}
            </View>
            <View style={{height: 20}} />
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
