/**
 * Education List
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import { connect } from 'react-redux';
import { AppConfig } from '@constants/';
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import DatePicker from '@react-native-community/datetimepicker';
// Components
import { Spacer, Text, Button, LblFormInput } from '@ui/';
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
  user_educations: UserActions.user_educations,
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
  input: {
    margin: 15,
    height: 20,
  },
  label: {
    color: '#a8a8aa',
    fontSize: 16,
  },
  inputBlock: {
    borderBottomWidth: 2,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class Education extends Component {
  static componentName = 'Education';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      loading: false,
      certificate_date: props.education_data
        ? moment(props.education_data.certification_date).format('MM-DD-YYYY')
        : moment().format('MM-DD-YYYY'),
      education_name: props.education_data
        ? props.education_data.education
        : '',
      location: props.education_data ? props.education_data.location : '',
      organization: props.education_data
        ? props.education_data.organization
        : '',
      nodata: 0,
      userLang: 'en',
      education_id: props.education_data ? props.education_data.id : '',
      user: props.user ? props.user : '',
      showDatePicker: false
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
  }
  submit = () => {
    if (
      this.state.certificate_date == '' ||
      this.state.education_name.trim() == '' ||
      this.state.location.trim() == '' ||
      this.state.organization.trim() == ''
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.allfieldsarerequired,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    } else {
      this.setState({ loading: true });
      var certificate_date = moment(
        this.state.certificate_date,
        'MM-DD-YYYY',
      ).format('YYYY-MM-DD');
      var payload = {
        post_type: 'POST',
        user_id: this.state.user.id,
        education: this.state.education_name,
        location: this.state.location,
        organization: this.state.organization,
        certification_date: certificate_date,
        is_active: 1,
      };
      if (this.state.education_id)
        payload = {
          post_type: 'PUT',
          user_id: this.state.user.id,
          education: this.state.education_name,
          location: this.state.location,
          organization: this.state.organization,
          certification_date: certificate_date,
          is_active: 1,
          id: this.state.education_id,
          educationId: this.state.education_id,
        };
      this.props
        .user_educations({ filter: payload })
        .then(resp => {
          this.setState({ loading: false });
          console.log('resp ' + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) Actions.pop();
        })
        .catch(() => {
          this.setState({ loading: false });
          console.log('error');
        });
    }
  };
  dateObj = new Date()
  render = () => (
    <View style={[styles.background]}>
      <NavComponent
        backArrow={true}
        title={
          this.state.education_id ? Strings.editeducation : Strings.addeducation
        }
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 40 }}>
          <Text style={styles.label}>{Strings.education + '*'}</Text>
          <View style={styles.inputBlock}>
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.education}
              lblTxt={Strings.education}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.education_name}
              onChangeText={education_name => this.setState({ education_name })}
            />
          </View>

          <Text style={styles.label}>{Strings.location + '*'}</Text>
          <View style={styles.inputBlock}>
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.location}
              lblTxt={Strings.location}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.location}
              onChangeText={location => this.setState({ location })}
            />
          </View>

          <Text style={styles.label}>{Strings.organization + '*'}</Text>
          <View style={styles.inputBlock}>
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.organization}
              lblTxt={Strings.organization}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.organization}
              onChangeText={organization => this.setState({ organization })}
            />
          </View>
          <Pressable onPress={() => this.setState({ showDatePicker: true })} >
            <Text style={styles.label}>{Strings.certificationdate + '*'}</Text>
            <Text style={styles.label}>{moment(this.state.certificate_date).format('MM-DD-YYYY')}</Text>
          </Pressable>

          {this.state.showDatePicker && <View style={styles.inputBlock}>
            <DatePicker
              value={this.dateObj}
              mode="date"
              placeholder={Strings.certificatedate}
              format="MM-DD-YYYY"
              maxDate={moment().format('MM-DD-YYYY')}
              // confirmBtnText="Confirm"
              // cancelBtnText="Cancel"
              // showIcon={false}
              display="default"
              customStyles={{
                dateInput: {
                  borderWidth: 0,
                  paddingLeft: 5,
                  alignItems: 'flex-start',
                },
                placeholderText: {
                  fontSize: 15,
                  fontFamily: AppFonts.base.family,
                  color: AppColors.brand.txtplaceholder,
                  paddingLeft: 5,
                },
                dateText: {
                  fontSize: 15,
                  fontFamily: AppFonts.base.family,
                  color: AppColors.brand.txtplaceholder,
                  paddingLeft: 5,
                },
              }}
              onChange={date => {
                console.log('on change date ' + moment(date).format('MM-DD-YYYY'));
                this.setState({ certificate_date: date, showDatePicker: false });
              }}
            />
          </View>}
        </View>
        <Button
          style={{ padding: 5, backgroundColor: '#34d777' }}
          title={'Save'}
          onPress={this.submit}
          backgroundColor={'#34d777'}
          fontSize={18}
        />
      </ScrollView>
      {this.state.loading ? (
        <View style={AppStyles.LoaderStyle}>
          <Loading color={AppColors.brand.primary} />
        </View>
      ) : null}
    </View>
  );
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Education);
