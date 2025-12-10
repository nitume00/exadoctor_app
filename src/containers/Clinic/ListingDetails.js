import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import NavComponent from '@components/NavComponent.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Rating} from '@rneui/themed';
import Slots from '@containers/search/Slots.js';
import MapView, {Marker} from 'react-native-maps';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';
import Loading from '@components/general/Loading';
var moment = require('moment');
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';

// Components
import {Spacer, Text, Button, Card, FormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user_data: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  reviews: UserActions.reviews,
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
  };
  constructor(props) {
    super(props);
    this.site_url = '';
    this.state = {
      loading: false,
      button_value: 1,
      is_favorite: false,
      selected_timing: 1,
      review_data: '',
      slot_week: 1,
      daycount: 1,
      nodata: 0,
      dataList: [],
      users: props.users ? props.users : '',
      profile_data: props.profile_data ? props.profile_data : '',
      current_date: moment().format('MM-DD-YYYY'),
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
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  onRegionChange(region) {
    () => this.setState({region: region});
  }
  reviews = () => {
    var payload =
      '{"where":{"to_user_id":"' +
      this.state.profile_data.id +
      '","foreign_type":"Appointment"},"include":{"0":"user","1":"user.attachment","2":"user.user_profile","3":"to_user.user_profile"},"limit":1000,"skip":0}';
    this.setState({loading: true});
    this.props
      .reviews({filter: payload})
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
        this.setState({loading: false});
        console.log('error');
      });
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    return (
      <View style={{marginLeft: 20, marginRight: 20, paddingTop: 10}}>
        <Text style={{fontSize: 16, fontWeight: '400', lineHeight: 20}}>
          {moment(data.created_at).format('MMM DD,YYYY')} by verified user.
        </Text>
        <View style={{flexDirection: 'row', paddingTop: 10}}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{fontSize: 14}}>{Strings.overall}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.rating}
              readonly
              imageSize={20}
              style={{paddingVertical: 10}}
            />
          </View>
          <View style={{flexDirection: 'column', paddingLeft: 10}}>
            <Text style={{fontSize: 14}}>{Strings.bedsidemanner}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.bedside_rate}
              readonly
              imageSize={20}
              style={{paddingVertical: 10}}
            />
          </View>
          <View style={{flexDirection: 'column', paddingLeft: 10}}>
            <Text style={{fontSize: 14}}>{Strings.waittime}</Text>
            <Rating
              type="star"
              fractions={1}
              ratingCount={5}
              startingValue={data.waittime_rate}
              readonly
              imageSize={20}
              style={{paddingVertical: 10}}
            />
          </View>
        </View>
        <Text style={{fontSize: 14, paddingTop: 10}}>{data.message}</Text>
      </View>
    );
  };
  render = () => {
    console.log(
      'appointment_settings userdetea ' + JSON.stringify(this.state.users),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.searchresults} />
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
            onPress={() => this.setState({button_value: 1})}>
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
        {this.state.button_value == 1
          ? this.renderprofile()
          : this.renderreview()}
      </View>
    );
  };
  timingSelected = data => {
    console.log('appointment_settings = timing = ' + JSON.stringify(data));
    Actions.BookNow({booking_data: data});
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
      this.setState({current_date: nextday, daycount: this.state.daycount + 1});
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
    }
    var slots = [];
    if (this.state.profile_data && this.state.profile_data.branches_doctor) {
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
          slots.push(
            <View
              style={{flex: 1, padding: 25, paddingBottom: 0, paddingTop: 10}}
              key={j}>
              <Text style={{fontSize: 16, color: '#A9A9A9', lineHeight: 20}}>
                {this.state.profile_data.branches_doctor[j].branch.name}
              </Text>
              <View style={{height: 5}} />
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
                  {paddingLeft: 20},
                ]}></View>
            </View>,
          );
        }
      }
    }
    var days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    var display_day = moment(this.state.current_date, 'MM-DD-YYYY').day();
    display_day = days[display_day];
    var doctorspecialty = '';
    if (this.state.profile_data && this.state.profile_data.specialties_user) {
      for (
        var j = 0;
        j < this.state.profile_data.specialties_user.length;
        j++
      ) {
        if (doctorspecialty == '')
          doctorspecialty =
            Strings.lblspecialities[
              this.state.profile_data.specialties_user[j].specialty.id
            ];
        else
          doctorspecialty =
            doctorspecialty +
            ' / ' +
            Strings.lblspecialities[
              this.state.profile_data.specialties_user[j].specialty.id
            ];
      }
    }
    return (
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, alignItems: 'center', paddingTop: 10}}>
          <Image
            style={{
              width: 75,
              height: 75,
              borderRadius: Platform.OS == 'ios' ? 37.5 : 50,
              borderColor: AppColors.brand.black,
              borderWidth: 0.3,
            }}
            source={{uri: imageurl}}
          />
          <Text style={[AppStyles.boldedFontText, {padding: 5, fontSize: 16}]}>
            {this.state.profile_data.username}
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
          style={{paddingVertical: 5, alignItems: 'center', paddingTop: 10}}
        />
        <View style={{flex: 1, paddingTop: 10}}>
          <Button
            title="Book an Appointment"
            backgroundColor={'#33BB76'}
            fontSize={15}
            onPress={() => {
              console.log('ok');
            }}
          />
        </View>
        <View style={{flex: 1, padding: 20, paddingBottom: 0}}>
          <View
            style={{
              backgroundColor: 'yellow',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity onPress={this.previousDay}>
              <Image
                style={{height: 15, width: 15}}
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
            <TouchableOpacity onPress={this.nextDay}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../../images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
        {slots}
        {this.state.region.latitude != 0.0 ? (
          <View style={{flex: 1, paddingTop: 20}}>
            <MapView
              style={{flex: 1, height: 200}}
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
      </ScrollView>
    );
  };

  renderreview = () => {
    return (
      <View style={{flex: 1, paddingTop: 10}}>
        {this.state.nodata == 0 ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - 65,
            }}>
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
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
