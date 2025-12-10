import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import { connect } from 'react-redux';
import { AppConfig } from '@constants/';
import NavComponent from '@components/NavComponent.js';
import { Rating } from '@rneui/themed';
import Slots from '@containers/search/Slots.js';
import MapView, { Marker } from 'react-native-maps';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';
import Loading from '@components/general/Loading';
import moment from 'moment';
// Consts and Libs
import { AppStyles, AppSizes, AppColors } from '@theme/';

// Components
import { Spacer, Text, Button, Card, FormInput } from '@ui/';

const mapStateToProps = state => {
  return { user: state.user.user_data };
};
const mapDispatchToProps = {
  users: UserActions.users,
  reviews: UserActions.reviews,
  settings: UserActions.settings,
  user_favorites: UserActions.user_favorites,
  get_appointment_settings: UserActions.get_appointment_settings,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    marginTop: 10,
  },
  tabstyle: {
    fontSize: 14,
    color: '#000',
    padding: 0,
    lineHeight: 20,
  },
  tabstylett: {
    flex: 1,
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
});

/* Component ==================================================================== */
class ListingDetails extends Component {
  static propTypes = {
    users: PropTypes.func.isRequired,
    reviews: PropTypes.func.isRequired,
    settings: PropTypes.func.isRequired,
    user_favorites: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.lang = 'EN';
    this.site_url = '';
    this.state = {
      loading: false,
      button_value: 1,
      selected_timing: 1,
      review_data: '',
      slot_week: 1,
      daycount: 1,
      is_booking: props.is_booking ? props.is_booking : 0,
      is_branch_doctor: props.is_branch_doctor ? props.is_branch_doctor : 0,
      nodata: 0,
      dataList: [],
      user: props.user ? props.user : '',
      profile_data: props.profile_data ? props.profile_data : '',
      current_date: moment().format('MM-DD-YYYY'),
      is_favorite: 0,
      consultation_fee: 0,
      individual_appointment_setting_id: props.individual_appointment_setting_id
        ? props.individual_appointment_setting_id
        : 1,
      region: {
        latitude:
          props.profile_data &&
            props.profile_data.user_profile &&
            props.profile_data.user_profile.latitude
            ? props.profile_data.user_profile.latitude
            : 0.0,
        longitude:
          props.profile_data &&
            props.profile_data.user_profile &&
            props.profile_data.user_profile.longitude
            ? props.profile_data.user_profile.longitude
            : 0.0,
        latitudeDelta: 0.0043,
        longitudeDelta: 0.0034,
      },
    };
    console.log(
      'appointment_settings rrrrrr ' + JSON.stringify(this.state.profile_data),
    );
    if (props.user) this.get_favorite();
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    this.lang = await AsyncStorage.getItem('language');
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
  }
  favorite = data => {
    var payload = { class: 'User', foreign_id: this.state.profile_data.id };
    this.callInvoked = 1;
    this.setState({ loading: true });
    this.props
      .user_favorites({
        filter: payload,
        post_type: 'POST',
        token: this.state.user.userToken,
      })
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          this.setState({ is_favorite: 1, loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        console.log('error 3344');
      });
  };
  get_favorite() {
    var payload = {
      where: {
        user_id: this.state.user.id,
        foreign_id: this.state.profile_data.id,
      },
    };
    this.callInvoked = 1;
    console.log('cfav == ' + JSON.stringify(payload));
    this.props
      .user_favorites({ filter: payload, token: this.state.user.userToken })
      .then(resp => {
        console.log('cfav == ' + JSON.stringify(resp));
        if (
          resp.error &&
          resp.error.code == 0 &&
          resp.data &&
          resp.data.length
        ) {
          this.setState({ is_favorite: 1 });
        }
      })
      .catch(() => {
        console.log('error 333');
      });
  }
  onRegionChange(region) {
    () => this.setState({ region: region });
  }
  reviews = () => {
    var payload =
      '{"where":{"to_user_id":"' +
      this.state.profile_data.id +
      '","foreign_type":"Appointment"},"include":{"0":"user","1":"user.attachment","2":"user.user_profile","3":"to_user.user_profile"},"limit":1000,"skip":0}';
    this.setState({ loading: true });
    this.props
      .reviews({ filter: payload })
      .then(resp => {
        console.log('appointment_settings review ' + JSON.stringify(resp));
        if (
          resp.error &&
          resp.error.code == 0 &&
          resp.data &&
          resp.data.length
        ) {
          this.setState({
            review_data: resp.data,
            button_value: 2,
            nodata: 0,
            dataList: resp.data,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
            review_data: [],
            button_value: 2,
            nodata: 1,
            dataList: [],
          });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        console.log('error ttt');
      });
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    return (
      <View
        style={{
          marginLeft: 20,
          marginRight: 20,
          paddingTop: 10,
          paddingBottom: 3,
        }}>
        <Text style={{ fontSize: 16, fontWeight: '400', lineHeight: 20 }}>
          {moment(data.created_at).format('MM DD,YYYY')} by verified user.
        </Text>
        <View style={{ flexDirection: 'row', paddingTop: 10 }}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ fontSize: 14 }}>{Strings.overall}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.rating}
              readonly
              imageSize={15}
              style={{ paddingVertical: 10 }}
            />
          </View>
          <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
            <Text style={{ fontSize: 14 }}>{Strings.bedsidemanner}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.bedside_rate}
              readonly
              imageSize={15}
              style={{ paddingVertical: 10 }}
            />
          </View>
          <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
            <Text style={{ fontSize: 14 }}>{Strings.waittime}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.waittime_rate}
              readonly
              imageSize={15}
              style={{ paddingVertical: 10 }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 14, paddingTop: 10 }}>{data.message}</Text>
      </View>
    );
  };
  render = () => {
    console.log(
      'appointment_settings userdetea ' + JSON.stringify(this.state.users),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={
            this.state.is_booking ? Strings.makebooking : Strings.searchresults
          }
        />
        {this.state.is_booking == 0 ? (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: AppColors.brand.navbar,
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: 10,
              paddingLeft: 20,
              paddingRight: 20,
            }}>
            <TouchableOpacity
              style={[
                styles.tabstylett,
                {
                  backgroundColor:
                    this.state.button_value == 1 ? 'white' : 'transparent',
                },
              ]}
              onPress={() => this.setState({ button_value: 1 })}>
              <Text style={styles.tabstyle}>{Strings.profile}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabstylett,
                {
                  marginLeft: 10,
                  backgroundColor:
                    this.state.button_value == 2 ? 'white' : 'transparent',
                },
              ]}
              onPress={this.reviews}>
              <Text style={styles.tabstyle}>{Strings.review}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {this.state.button_value == 1
          ? this.renderprofile()
          : this.renderreview()}
      </View>
    );
  };
  timingSelected = data => {
    console.log('appointment_settings = timing = ' + JSON.stringify(data));
    Actions.BookNow({
      booking_data: data,
      is_branch_doctor: this.state.is_branch_doctor,
    });
  };
  previousDay = () => {
    console.log(
      'appointment_settings fff ' +
      this.state.current_date +
      '==' +
      moment().format('MM-DD-YYYY'),
    );
    if (this.state.current_date == moment().format('MM-DD-YYYY')) {
    } else {
      var previousday = moment(this.state.current_date, 'MM-DD-YYYY')
        .subtract(1, 'days')
        .format('MM-DD-YYYY');
      if (this.state.daycount % 8 == 0) {
        this.setState({
          current_date: previousday,
          slot_week: this.state.slot_week - 1,
          daycount: this.state.daycount - 1,
        });
      } else {
        this.setState({
          current_date: previousday,
          daycount: this.state.daycount - 1,
        });
      }
      console.log(
        'appointment_settings previous' +
        previousday +
        '==' +
        this.state.daycount +
        '==' +
        this.state.slot_week,
      );
    }
  };
  nextDay = () => {
    var nextday = moment(this.state.current_date, 'MM-DD-YYYY')
      .add(1, 'days')
      .format('MM-DD-YYYY');
    if (this.state.daycount % 7 == 0) {
      this.setState({
        current_date: nextday,
        slot_week: this.state.slot_week + 1,
        daycount: this.state.daycount + 1,
      });
    } else {
      this.setState({ current_date: nextday, daycount: this.state.daycount + 1 });
    }
    console.log(
      'appointment_settings nextday' +
      nextday +
      '==' +
      this.state.daycount +
      '==' +
      this.state.slot_week,
    );
  };
  renderprofile = () => {
    var imageurl = AppConfig.noimage;
    var slots = [];
    var doctorspecialty = '';
    var doctoreducation = [];
    var doctorlanguage = [];
    var board_certifications = '-';
    var display_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
    display_day = Strings.weekdays[display_day];

    if (
      this.state.profile_data &&
      this.state.profile_data.user_profile &&
      this.state.profile_data.user_profile.gender_id === 2
    )
      imageurl = AppConfig.noimagefemale;

    if (
      this.state.profile_data.attachment &&
      this.state.profile_data.attachment.filename
    ) {
      var md5string =
        'UserAvatar' + this.state.profile_data.attachment.id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserAvatar/' +
        this.state.profile_data.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('data=== u = ' + imageurl);
    } else if (
      this.state.profile_data.attachment &&
      this.state.profile_data.attachment[0] &&
      this.state.profile_data.attachment[0].filename
    ) {
      var md5string =
        'Branch' + this.state.profile_data.attachment[0].id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/Branch/' +
        this.state.profile_data.attachment[0].id +
        '.' +
        imagetemp +
        '.png';
      console.log('data=== u = ' + imageurl);
    }

    if (
      this.state.profile_data &&
      this.state.profile_data.branches_doctor.length
    ) {
      for (var j = 0; j < this.state.profile_data.branches_doctor.length; j++) {
        if (
          this.state.profile_data &&
          this.state.profile_data.branches_doctor &&
          this.state.profile_data.branches_doctor[j] &&
          this.state.profile_data.branches_doctor[j].appointment_settings &&
          this.state.profile_data.branches_doctor[j].appointment_settings.id
        ) {
          var data = this.state.profile_data.branches_doctor[j];
          var current_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
          console.log('appointment_settings pppp 222');
          slots.push(
            <View
              style={{ flex: 1, padding: 15, paddingBottom: 0, paddingTop: 10 }}
              key={j}>
              <Text style={{ fontSize: 16, color: '#A9A9A9', lineHeight: 20 }}>
                {this.state.profile_data.branches_doctor[j].branch.name}
              </Text>
              <View style={{ height: 5 }} />
              <Slots
                branch_data={data}
                doctor_data={this.state.profile_data}
                current_date={this.state.current_date}
                current_day={current_day}
                appointment_id={
                  this.state.profile_data.branches_doctor[j]
                    .appointment_settings.id
                }
                view_slot_week={this.state.slot_week}
                buttonPress={this.timingSelected}
              />
              <View
                style={[
                  styles.view_divider_horizontal,
                  { paddingLeft: 20 },
                ]}></View>
            </View>,
          );
        }
      }
    } else if (this.state.profile_data) {
      var data = this.state.profile_data;
      var current_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
      if (
        this.state.profile_data &&
        this.state.profile_data.is_individual == 1 &&
        this.state.individual_appointment_setting_id
      ) {
        console.log("here we go -> ",this.state.profile_data);
        slots.push(
          <View
            style={{ flex: 1, padding: 15, paddingBottom: 0, paddingTop: 10 }}
            key={j}>
            <View style={{ height: 5 }} />
            <Slots
              doctor_data={this.state.profile_data}
              current_date={this.state.current_date}
              current_day={current_day}
              appointment_id={this.state.individual_appointment_setting_id}
              view_slot_week={this.state.slot_week}
              buttonPress={this.timingSelected}
            />
            <View
              style={[
                styles.view_divider_horizontal,
                { paddingLeft: 20 },
              ]}></View>
          </View>,
        );
      } else {
        console.log('appointment_settings pppp 111');
        slots.push(
          <View
            style={{ flex: 1, padding: 15, paddingBottom: 0, paddingTop: 10 }}
            key={j}>
            <View style={{ height: 5 }} />
            <Slots
              branch_data={data}
              doctor_data={this.state.profile_data}
              current_date={this.state.current_date}
              current_day={current_day}
              appointment_id={apid}
              view_slot_week={this.state.slot_week}
              buttonPress={this.timingSelected}
            />
            <View
              style={[
                styles.view_divider_horizontal,
                { paddingLeft: 20 },
              ]}></View>
          </View>,
        );
      }
    }

    if (this.state.profile_data && this.state.profile_data.specialties_user) {
      for (
        var j = 0;
        j < this.state.profile_data.specialties_user.length;
        j++
      ) {
        if (
          doctorspecialty == '' &&
          this.state.profile_data.specialties_user[j].specialty
        )
          doctorspecialty =
            Strings.lblspecialities[
            this.state.profile_data.specialties_user[j].specialty.id
            ];
        else if (
          doctorspecialty != '' &&
          this.state.profile_data.specialties_user[j].specialty
        )
          doctorspecialty =
            doctorspecialty +
            ' / ' +
            Strings.lblspecialities[
            this.state.profile_data.specialties_user[j].specialty.id
            ];
      }
    }

    if (this.state.profile_data && this.state.profile_data.user_education) {
      for (var j = 0; j < this.state.profile_data.user_education.length; j++) {
        doctoreducation.push(
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 5,
              marginLeft: 10,
            }}>
            <View
              style={{
                backgroundColor: AppColors.brand.black,
                height: 5,
                width: 5,
                borderRadius: 50,
              }}
            />
            <Text style={{ fontSize: 12, marginLeft: 5 }}>
              {this.state.profile_data.user_education[j].education},{' '}
              {this.state.profile_data.user_education[j].organization} -{' '}
              {moment(
                this.state.profile_data.user_education[j].certification_date,
              ).format('YYYY')}
            </Text>
          </View>,
        );
      }
    }

    if (this.state.profile_data && this.state.profile_data.languages_users) {
      for (var j = 0; j < this.state.profile_data.languages_users.length; j++) {
        doctorlanguage.push(
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 5,
              marginLeft: 10,
            }}>
            <View
              style={{
                backgroundColor: AppColors.brand.black,
                height: 5,
                width: 5,
                borderRadius: 50,
              }}
            />
            <Text style={{ fontSize: 12, marginLeft: 5 }}>
              {this.state.profile_data.languages_users[j].language.name}
            </Text>
          </View>,
        );
      }
    }

    if (this.state.profile_data && this.state.profile_data.user_profile)
      board_certifications =
        this.state.profile_data.user_profile.board_certifications;

    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {this.state.is_booking == 0 ? (
          <View>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 75, height: 75 }}>
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
                {this.state.user &&
                  this.state.user.id &&
                  this.state.is_favorite == 0 ? (
                  <TouchableOpacity
                    onPress={this.favorite.bind(this, data)}
                    style={{
                      width: 20,
                      height: 20,
                      position: 'absolute',
                      left: 50,
                    }}>
                    <Image
                      style={{ width: 20, height: 20 }}
                      source={require('@images/favorite.png')}
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      position: 'absolute',
                      left: 50,
                    }}>
                    <Image
                      style={{ width: 20, height: 20 }}
                      source={require('@images/favorited.png')}
                    />
                  </View>
                )}
              </View>
              <Text
                style={[AppStyles.boldedFontText, { padding: 5, fontSize: 16 }]}>
                {this.state.profile_data.user_profile &&
                  this.state.profile_data.user_profile.first_name &&
                  this.state.profile_data.user_profile.last_name
                  ? this.state.profile_data.user_profile.first_name +
                  ' ' +
                  this.state.profile_data.user_profile.last_name
                  : this.state.profile_data.username}
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
                this.state.profile_data.total_rating_as_service_provider
              }
              readonly
              imageSize={20}
              style={{ paddingVertical: 5, alignItems: 'center', paddingTop: 10 }}
            />
            {this.state.profile_data &&
              this.state.profile_data.is_individual == 1 ? (
              <Text style={{ textAlign: 'center', margin: 10 }}>
                {Strings.consultationfee}: {this.site_currency}
                {this.state.consultation_fee}
              </Text>
            ) : null}
            {this.state.user && this.state.user.role_id == 2 ? (
              <View style={{ flex: 1, paddingTop: 10 }}>
                <Button
                  title={Strings.bookanappointment}
                  backgroundColor={'#33BB76'}
                  fontSize={15}
                  onPress={() => {
                    console.log('ok');
                  }}
                />
              </View>
            ) : null}
          </View>
        ) : null}
        {(this.state.user && this.state.user.role_id == 2) ||
          this.state.user == '' ? (
          <View style={{ flex: 1, padding: 10, paddingBottom: 0 }}>
            <View
              style={{
                backgroundColor: 'yellow',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                onPress={this.previousDay}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 35,
                  width: 35,
                }}>
                <Image
                  style={{ height: 15, width: 15 }}
                  source={require('../../images/arrow-left.png')}
                />
              </TouchableOpacity>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'black',
                  fontSize: 18,
                  padding: 10,
                }}>
                {display_day}, {this.state.current_date}
              </Text>
              <TouchableOpacity
                onPress={this.nextDay}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 35,
                  width: 35,
                }}>
                <Image
                  style={{ height: 15, width: 15 }}
                  source={require('../../images/arrow-right.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {(this.state.user && this.state.user.role_id == 2) ||
          this.state.user == ''
          ? slots
          : null}
        {this.state.is_booking == 0 ? (
          <View>
            {this.state.profile_data &&
              this.state.profile_data.user_profile &&
              this.state.profile_data.user_profile.physician_license_number ? (
              <View style={{ margin: 10, marginBottom: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Image
                    source={require('@images/thumbup.png')}
                    style={{ width: 30, height: 30 }}
                  />
                  <Text
                    style={{
                      color: AppColors.brand.navbar,
                      fontSize: 14,
                      marginLeft: 5,
                    }}>
                    {Strings.physicianlicensenumber}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 5,
                    marginLeft: 10,
                  }}>
                  <View
                    style={{
                      backgroundColor: AppColors.brand.black,
                      height: 5,
                      width: 5,
                      borderRadius: 50,
                    }}
                  />
                  <Text style={{ fontSize: 12, marginLeft: 5 }}>
                    {
                      this.state.profile_data.user_profile
                        .physician_license_number
                    }
                  </Text>
                </View>
              </View>
            ) : null}
            {doctoreducation.length ? (
              <View style={{ margin: 10, marginBottom: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Image
                    source={require('@images/educations.png')}
                    style={{ width: 30, height: 30 }}
                  />
                  <Text
                    style={{
                      color: AppColors.brand.navbar,
                      fontSize: 14,
                      marginLeft: 5,
                    }}>
                    {Strings.educations}
                  </Text>
                </View>
                {doctoreducation}
              </View>
            ) : null}
            {doctorlanguage.length ? (
              <View style={{ margin: 10, marginBottom: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Image
                    source={require('@images/languages.png')}
                    style={{ width: 20, height: 20 }}
                  />
                  <Text
                    style={{
                      color: AppColors.brand.navbar,
                      fontSize: 14,
                      marginLeft: 5,
                    }}>
                    {Strings.languages}
                  </Text>
                </View>
                {doctorlanguage}
              </View>
            ) : null}
            {board_certifications ? (
              <View style={{ margin: 10, marginBottom: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Image
                    source={require('@images/certification.png')}
                    style={{ width: 25, height: 25 }}
                  />
                  <Text
                    style={{
                      color: AppColors.brand.navbar,
                      fontSize: 14,
                      marginLeft: 5,
                    }}>
                    {Strings.certifications}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, marginLeft: 10 }}>
                  {AppUtil.stripTags(board_certifications)}
                </Text>
              </View>
            ) : null}
            <View style={{ margin: 10, marginBottom: 0 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  source={require('@images/award.png')}
                  style={{ width: 25, height: 25 }}
                />
                <Text
                  style={{
                    color: AppColors.brand.navbar,
                    fontSize: 14,
                    marginLeft: 5,
                  }}>
                  {Strings.awardsandrecognition}
                </Text>
              </View>
              <Text style={{ fontSize: 12, marginLeft: 10 }}>
                {this.state.profile_data && this.state.profile_data.user_profile
                  ? AppUtil.stripTags(
                    this.state.profile_data.user_profile.awards,
                  )
                  : '-'}
              </Text>
            </View>
            <View style={{ margin: 10, marginBottom: 0 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  source={require('@images/experience.png')}
                  style={{ width: 20, height: 20 }}
                />
                <Text
                  style={{
                    color: AppColors.brand.navbar,
                    fontSize: 14,
                    marginLeft: 5,
                  }}>
                  {Strings.experience}
                </Text>
              </View>
              <Text style={{ fontSize: 12, marginLeft: 10 }}>
                {this.state.profile_data && this.state.profile_data.user_profile
                  ? AppUtil.stripTags(
                    this.state.profile_data.user_profile.experience,
                  )
                  : '-'}
              </Text>
            </View>
            {this.state.region.latitude != 0.0 ? (
              <View style={{ flex: 1, paddingTop: 20 }}>
                <MapView
                  style={{ flex: 1, height: 200 }}
                  region={this.state.region}
                  onRegionChange={this.onRegionChange}>
                  {this.state.region && this.state.region.latitude ? (
                    <Marker
                      coordinate={{
                        latitude: this.state.region.latitude,
                        longitude: this.state.region.longitude,
                      }}
                    />
                  ) : null}
                </MapView>
              </View>
            ) : null}
            <View
              style={{
                padding: 20,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  padding: 10,
                  lineHeight: 22,
                }}>
                {this.state.profile_data.user_profile.full_address}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    );
  };

  renderreview = () => {
    return (
      <View style={{ flex: 1, paddingTop: 10 }}>
        {this.state.nodata == 0 ? (
          <View style={{ padding: 0, margin: 0 }}>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <FlatList
                data={this.state.review_data}
                renderItem={this._renderRow}
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
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[AppStyles.regularFontText]}>{Strings.noreview}</Text>
          </View>
        )}
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
export default connect(mapStateToProps, mapDispatchToProps)(ListingDetails);
