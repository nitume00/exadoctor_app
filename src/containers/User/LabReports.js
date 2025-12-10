/**
 * Lab Reports
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button} from '@ui/';
import {Icon} from '@rneui/themed';
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
    fontSize: 11,
    marginTop: 5,
    paddingBottom: 5,
  },
});

/* Component ==================================================================== */
class LabReport extends Component {
  static componentName = 'LabReport';
  static propTypes = {
    users: PropTypes.func.isRequired,
    patient_diagnostic_tests: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      page: 1,
      dataList: [],
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
    };
    this.site_url = '';
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_history(1);
  }
  get_history(p) {
    if (this.callInvoked == 0) {
      var payload =
        '{"where":{"patient_id":' +
        this.state.user.id +
        '},"include":{"0":"diagnostic_center_tests_patient_diagnostic_test.diagnostic_center_test.lab_test","1":"diagnostic_center_tests_patient_diagnostic_test.attachment"},"limit":"all","skip":"0"}&patient_id=' +
        this.state.user.id;
      this.callInvoked = 1;
      this.setState({loading: true});
      this.props
        .patient_diagnostic_tests(payload)
        .then(resp => {
          if (resp._metadata && resp._metadata.total == 0) {
            this.setState({nodata: 0, loading: false});
          } else if (resp.data) {
            var datares = resp.data;
            this.callInvoked = 0;
            if (resp.data.length == 0)
              this.setState({nodata: 1, loading: false, dataList: datares});
            else this.setState({nodata: 0, dataList: datares, loading: false});
          } else {
            this.setState({loading: false});
          }
        })
        .catch(() => {
          this.setState({loading: false});
        });
    }
  }
  viewImage = imageurl => {
    console.log('ggggg ' + imageurl);
    Actions.Pages({url: imageurl, title: Strings.labreport});
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var imgs = [];
    console.log(
      'ppppppp ' +
        data.diagnostic_center_tests_patient_diagnostic_test[0].attachment
          .length,
    );
    if (
      data.diagnostic_center_tests_patient_diagnostic_test &&
      data.diagnostic_center_tests_patient_diagnostic_test[0] &&
      data.diagnostic_center_tests_patient_diagnostic_test[0]
        .is_report_uploaded == 1 &&
      data.diagnostic_center_tests_patient_diagnostic_test[0].attachment &&
      data.diagnostic_center_tests_patient_diagnostic_test[0].attachment.length
    ) {
      for (
        var i = 0;
        i <
        data.diagnostic_center_tests_patient_diagnostic_test[0].attachment
          .length;
        i++
      ) {
        var md5string =
          'DiagnosticCenterTestPatientDiagnosticTest' +
          data.diagnostic_center_tests_patient_diagnostic_test[0].attachment[i]
            .id +
          'pngoriginal';
        var imagetemp = AppUtil.MD5(md5string);
        imageurl =
          this.site_url +
          '/images/original/DiagnosticCenterTestPatientDiagnosticTest/' +
          data.diagnostic_center_tests_patient_diagnostic_test[0].attachment[i]
            .id +
          '.' +
          imagetemp +
          '.png';
        imgs.push(
          <TouchableOpacity
            key={i}
            onPress={this.viewImage.bind(this, imageurl)}>
            <Image
              style={{height: 100, width: 100, margin: 3}}
              source={{uri: imageurl}}
            />
          </TouchableOpacity>,
        );
      }
    }

    if (
      data.diagnostic_center_tests_patient_diagnostic_test &&
      data.diagnostic_center_tests_patient_diagnostic_test[0] &&
      data.diagnostic_center_tests_patient_diagnostic_test[0]
        .is_report_uploaded == 1 &&
      data.diagnostic_center_tests_patient_diagnostic_test[0].attachment &&
      data.diagnostic_center_tests_patient_diagnostic_test[0].attachment.length
    ) {
      return (
        <View
          style={{
            flexDirection: 'row',
            padding: 15,
            borderBottomColor: '#dfdfdf',
            borderBottomWidth: 0.5,
          }}>
          <View style={{flexDirection: 'column'}}>
            <Text style={[AppStyles.regularFontText, {fontSize: 14}]}>
              {
                data.diagnostic_center_tests_patient_diagnostic_test[0]
                  .diagnostic_center_test.lab_test.name
              }{' '}
              (
              <Text style={styles.textBlue}>
                {moment(data.appointment_date).format('MMM DD, YYYY')}{' '}
                {data.appointment_time}
              </Text>
              )
            </Text>
            <ScrollView horizontal={true}>{imgs}</ScrollView>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  render() {
    console.log(JSON.stringify(this.state.dataList.length));
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.labreport} />
        {this.state.dataList && this.state.dataList.length ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - 65,
            }}>
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
export default connect(mapStateToProps, mapDispatchToProps)(LabReport);
