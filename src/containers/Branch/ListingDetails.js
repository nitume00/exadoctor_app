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
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavComponent from '@components/NavComponent.js';
import {Rating, CheckBox} from '@rneui/themed';
import BranchDoctor from '@containers/Branch/BranchDoctors.js';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  diagnostic_center_tests: UserActions.diagnostic_center_tests,
  users: UserActions.users,
  user_favorites: UserActions.user_favorites,
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
    diagnostic_center_tests: PropTypes.func.isRequired,
    users: PropTypes.func.isRequired,
    user_favorites: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.labTests = [];
    this.total = 0;
    this.site_url = '';
    this.state = {
      loading: false,
      button_value: 1,
      is_favorite: 0,
      daycount: 1,
      nodata: 0,
      dataList: [],
      labTests: [],
      user: props.user ? props.user : '',
      profile_data: props.profile_data ? props.profile_data : '',
      region: {
        latitude:
          props.profile_data && props.profile_data.latitude
            ? parseFloat(props.profile_data.latitude)
            : 0.0,
        longitude:
          props.profile_data && props.profile_data.longitude
            ? parseFloat(props.profile_data.longitude)
            : 0.0,
        latitudeDelta: 0.0043,
        longitudeDelta: 0.0034,
      },
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    console.log('ggggggggggg 11' + JSON.stringify(props.profile_data));
    this.get_favorite();
  }
  async componentDidMount() {
    console.log("hello did mount -->> ","asdasd");
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  render = () => {
    console.log(
      'appointment_settings userdetea ' + JSON.stringify(this.state.user),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={this.state.profile_data.name} />
        {this.renderprofile()}
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
  favorite = data => {
    var payload = {
      foreign_id: this.state.profile_data.id,
      class: 'Branch',
      branch_id: this.state.profile_data.id,
      clinic_user_id: this.state.profile_data.clinic_user_id,
    };
    this.callInvoked = 1;
    this.setState({loading: true});
    this.props
      .user_favorites({
        filter: payload,
        post_type: 'POST',
        token: this.state.user.userToken,
      })
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          this.setState({is_favorite: 1, loading: false});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error ffff');
      });
  };
  get_favorite() {
    var payload = {
      where: {
        user_id: this.state.user.id,
        branch_id: this.state.profile_data.id,
      },
    };
    this.callInvoked = 1;
    console.log('user_favorites =p= ' + JSON.stringify(payload));
    this.props
      .user_favorites({filter: payload, token: this.state.user.userToken})
      .then(resp => {
        if (
          resp.error &&
          resp.error.code == 0 &&
          resp.data &&
          resp.data.length
        ) {
          this.setState({is_favorite: 1});
        }
      })
      .catch(() => {
        console.log('error');
      });
  }

  doctorSelected = data => {
    var payload =
      '{"include":{"0":"attachment","1":"user_profile","2":"user_profile.city","3":"user_profile.country","4":"branches_doctor.appointment_settings","5":"specialties_user.specialty","6":"languages_users.language","7":"branches_doctor.branch.city","8":"branches_doctor.branch.country","9":"user_education","user_favorites":{"where":{"user_id":' +
      data.user.id +
      '}}}}';
    console.log('appointment_settings profile_data ' + data.user.id);
    this.setState({loading: true});
    this.props
      .users({
        filter: payload,
        is_slot_need: 1,
        view_slot_week: 1,
        user_id: data.user.id,
      })
      .then(resp => {
        this.setState({loading: false});
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data[0]),
          );
          Actions.ListingDetails({
            profile_data: resp.data[0],
            is_branch_doctor: 1,
          });
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error uuui');
      });
  };
  renderprofile = () => {
    console.log('profile_data == ' + JSON.stringify(this.state.profile_data));
    var imageurl = AppConfig.noimage;
    var bspeaciality = '';
    var binsurance = '';
    var bdoctors = [];
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
    if (this.state.profile_data.branches_specialty) {
      for (
        var i = 0;
        i < this.state.profile_data.branches_specialty.length;
        i++
      ) {
        if (bspeaciality == '')
          bspeaciality =
            Strings.lblspecialities[
              this.state.profile_data.branches_specialty[i].specialty.id
            ];
        else
          bspeaciality =
            bspeaciality +
            ' / ' +
            Strings.lblspecialities[
              this.state.profile_data.branches_specialty[i].specialty.id
            ];
      }
    }
    if (this.state.profile_data.branches_insurance) {
      for (
        var i = 0;
        i < this.state.profile_data.branches_insurance.length;
        i++
      ) {
        if (binsurance == '')
          binsurance =
            Strings.lblinsurances[
              this.state.profile_data.branches_insurance[i].insurance.id
            ];
        else
          binsurance =
            binsurance +
            ' / ' +
            Strings.lblinsurances[
              this.state.profile_data.branches_insurance[i].insurance.id
            ];
      }
    }
    if (this.state.profile_data.branch_doctor) {
      for (var i = 0; i < this.state.profile_data.branch_doctor.length; i++) {
        bdoctors.push(
          <BranchDoctor
            key={i}
            doctor_data={this.state.profile_data.branch_doctor[i]}
            buttonPress={this.doctorSelected}
          />,
        );
      }
    }
    return (
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, alignItems: 'center', paddingTop: 10}}>
          <View style={{width: 75, height: 75}}>
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
            {this.state.user &&
            this.state.user.id &&
            this.state.is_favorite == 0 ? (
              <TouchableOpacity
                onPress={this.favorite.bind(this, this.state.profile_data)}
                style={{width: 20, height: 20, position: 'absolute', left: 50}}>
                <Image
                  style={{width: 20, height: 20}}
                  source={require('@images/favorite.png')}
                />
              </TouchableOpacity>
            ) : (
              <View
                style={{width: 20, height: 20, position: 'absolute', left: 50}}>
                <Image
                  style={{width: 20, height: 20}}
                  source={require('@images/favorited.png')}
                />
              </View>
            )}
          </View>
          <Text style={[AppStyles.boldedFontText, {padding: 5, fontSize: 16}]}>
            {this.state.profile_data.name}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              padding: 5,
              lineHeight: 22,
            }}>
            <Icon
              name="phone"
              size={18}
              color={AppColors.brand.navbar}
              style={{marginRight: 8}}
            />{' '}
            {this.state.profile_data.phone_number}
          </Text>
        </View>

        <Rating
          type="star"
          fractions={1}
          ratingCount={5}
          startingValue={this.state.profile_data.average_rating}
          readonly
          imageSize={20}
          style={{paddingVertical: 5, alignItems: 'center', paddingTop: 10}}
        />
        <View style={{flex: 1, margin: 10}}>
          <View>
            <Text
              style={{
                fontSize: 16,
                color: AppColors.brand.navbar,
                lineHeight: 20,
              }}>
              {Strings.specialities}
            </Text>
          </View>
          <View>
            <Text style={{fontSize: 12, color: AppColors.brand.black}}>
              {bspeaciality}
            </Text>
          </View>
        </View>
        <View style={{flex: 1, margin: 10}}>
          <View>
            <Text style={{fontSize: 16, color: AppColors.brand.navbar}}>
              {Strings.insurances}
            </Text>
          </View>
          <View>
            <Text style={{fontSize: 12, color: AppColors.brand.black}}>
              {binsurance}
            </Text>
          </View>
        </View>
        <View style={{flex: 1, margin: 10}}>
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: 16,
                color: AppColors.brand.navbar,
                lineHeight: 20,
              }}>
              {Strings.specialistdoctors}
            </Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
            {bdoctors}
          </View>
        </View>
        {this.state.region.latitude != 0.0 ? (
          <View style={{flex: 1, paddingTop: 10}}>
            <MapView
              style={{flex: 1, height: 200}}
              region={this.state.region}
              googleMapId='AIzaSyCBNUYJ0hm4lekBa8CKZT9lvSlbM_35-h8'
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
          style={{padding: 10, alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              padding: 10,
              lineHeight: 20,
            }}>
            <Icon
              name="place"
              size={20}
              color={AppColors.brand.navbar}
              style={{marginRight: 8, paddingTop: 5}}
            />{' '}
            {this.state.profile_data.full_address}
          </Text>
        </View>
        <View style={{height: 70}} />
      </ScrollView>
    );
  };
}
/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(ListingDetails);
