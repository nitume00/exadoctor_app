/**
 * Appontment Detail
 */
import React, {Component} from 'react';
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
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import {Icon, Rating, CheckBox} from 'react-native-elements';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
const mapStateToProps = state => {
  return {user: state.user.user_data};
};
const mapDispatchToProps = {
  users: UserActions.users,
  appointments: UserActions.appointments,
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
class AppontmentDetail extends Component {
  static componentName = 'AppontmentDetail';
  static propTypes = {
    users: PropTypes.func.isRequired,
    appointments: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      loading: false,
      userLang: 'en',
      user: props.user ? props.user : '',
      appointment_data: props.appointment_data ? props.appointment_data : '',
      cnt: 0,
    };
  }

  render() {
    console.log(
      'appointment_data == ' + JSON.stringify(this.state.appointment_data),
    );
    var uname = '';
    var pusername = this.state.appointment_data.provider_user.username;
    if (
      this.state.appointment_data &&
      this.state.appointment_data.user.user_profile &&
      this.state.appointment_data.user.user_profile.first_name
    )
      uname =
        this.state.appointment_data.user.user_profile.first_name +
        ' ' +
        this.state.appointment_data.user.user_profile.last_name;
    else if (
      this.state.appointment_data &&
      this.state.appointment_data.user.username
    )
      uname = this.state.appointment_data.user.username;
    if (
      this.state.appointment_data &&
      this.state.appointment_data.provider_user &&
      this.state.appointment_data.provider_user.user_profile &&
      this.state.appointment_data.provider_user.user_profile.first_name &&
      this.state.appointment_data.provider_user.user_profile.last_name
    )
      pusername =
        this.state.appointment_data.provider_user.user_profile.first_name +
        ' ' +
        this.state.appointment_data.provider_user.user_profile.last_name;

    if (
      this.state.appointment_data &&
      this.state.appointment_data.provider_user &&
      this.state.appointment_data.provider_user.is_individual &&
      this.state.appointment_data.provider_user.user_profile
    )
      pusername =
        this.state.appointment_data.provider_user.user_profile.address;

    if (!pusername) {
      pusername = this.state.appointment_data.provider_user.username;
    }

    var e = '';
    if (this.state.appointment_data) {
      e = this.state.appointment_data.user.email;
      if (e.length > 20 && e.includes(' ') == false) {
        e = e.replace('@', '@ ');
      }
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.bookingdetails} />
        <View
          style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            height: AppSizes.screen.height - 70,
          }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 1,
                marginTop: 10,
                paddingLeft: 15,
                paddingRight: 15,
              }}>
              <View style={{height: 10}} />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.where}</Text>
                {this.state.appointment_data ? (
                  <Text numberOfLines={3} style={{flexShrink: 1, width: 170}}>
                    : {pusername}
                  </Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.appointmentnumber}</Text>
                {this.state.appointment_data &&
                this.state.appointment_data.appointment_status ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>: </Text>
                    <Text style={{color: AppColors.brand.navbar}}>
                      {this.state.appointment_data.appointment_token}
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
                <Text style={{width: 130}}>{Strings.doctorname}</Text>
                {this.state.appointment_data ? (
                  <Text>
                    :{' '}
                    {this.state.appointment_data.provider_user &&
                    this.state.appointment_data.provider_user.user_profile &&
                    this.state.appointment_data.provider_user.user_profile
                      .first_name
                      ? this.state.appointment_data.provider_user.user_profile
                          .first_name +
                        ' ' +
                        this.state.appointment_data.provider_user.user_profile
                          .last_name
                      : this.state.appointment_data.provider_user.username}
                  </Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.patientname}</Text>
                {this.state.appointment_data ? (
                  <Text>
                    :{' '}
                    {this.state.appointment_data.family_friend &&
                    this.state.appointment_data.family_friend.name != ''
                      ? this.state.appointment_data.family_friend.name
                      : uname}
                  </Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.email}</Text>
                <View style={{width: 200, flexWrap: 'wrap'}}>
                  {this.state.appointment_data ? (
                    <Text style={{flex: 1, flexWrap: 'wrap'}} numberOfLines={2}>
                      : {e}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.phone}</Text>
                {this.state.appointment_data ? (
                  <Text>: {this.state.appointment_data.user.mobile}</Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.gender}</Text>
                {this.state.appointment_data ? (
                  <Text>
                    :{' '}
                    {this.state.appointment_data.user.user_profile.gender_id ==
                    1
                      ? Strings.male
                      : Strings.female}
                  </Text>
                ) : null}
              </View>

              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.resonforvisit}</Text>
                {this.state.appointment_data ? (
                  <Text>: {this.state.appointment_data.customer_note}</Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.appointmentvia}</Text>
                {this.state.appointment_data &&
                this.state.appointment_data.appointment_type ? (
                  <Text>
                    : {this.state.appointment_data.appointment_type.name}
                  </Text>
                ) : null}
              </View>

              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.patientstatus}</Text>
                {this.state.appointment_data ? (
                  <Text>
                    :{' '}
                    {this.state.appointment_data.is_seen_before == 0
                      ? Strings.newpatient
                      : Strings.existingpatient}
                  </Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.date}</Text>
                {this.state.appointment_data &&
                this.state.appointment_data.appointment_date ? (
                  <Text>: {this.state.appointment_data.appointment_date}</Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.time}</Text>
                {this.state.appointment_data &&
                this.state.appointment_data.appointment_time ? (
                  <Text>: {this.state.appointment_data.appointment_time}</Text>
                ) : null}
              </View>
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{width: 130}}>{Strings.appointmentstatus}</Text>
                {this.state.appointment_data &&
                this.state.appointment_data.appointment_status ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>: </Text>
                    <View
                      style={{
                        height: 30,
                        backgroundColor: AppColors.brand.navbar,
                        borderRadius: 5,
                      }}>
                      <Text style={{color: AppColors.brand.white, padding: 5}}>
                        {
                          Strings.lblappointmentstatus[
                            this.state.appointment_data.appointment_status.id
                          ]
                        }
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
              <View style={{height: 10}} />
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
export default connect(mapStateToProps, mapDispatchToProps)(AppontmentDetail);
