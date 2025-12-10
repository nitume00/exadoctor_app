/**
 * Listing Screen
 *
 * Lists the search matches cars
 */
import React, { Component } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import { connect } from 'react-redux';
import { AppConfig } from '@constants/';
import { Rating } from '@rneui/themed';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import NavComponent from '@components/NavComponent.js';
// Consts and Libs
import { AppStyles, AppSizes, AppColors } from '@theme/';
// Components
import { Spacer, Text, Button, Card, FormInput } from '@ui/';
var moment = require('moment');
import Loading from '@components/general/Loading';
import ViewMoreText from 'react-native-view-more-text';
/* Styles ====================================================================  */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  col: {
    width: AppSizes.screen.width / 2 - 10,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  headerGrey: {
    fontSize: 12,
    color: '#ada8a8',
  },
  normalText11: {
    fontWeight: 'normal',
    fontSize: 11,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  col: {
    width: AppSizes.screen.width / 2 - 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabstyle: {
    fontSize: 14,
    color: '#000',
    padding: 0,
    lineHeight: 22,
  },
  tabstylett: {
    flex: 1,
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});
// Any actions to map to the component?
const mapStateToProps = state => {
  return { user: state.user.user_data };
};
const mapDispatchToProps = {
  users: UserActions.users,
  branches: UserActions.branches,
  user_favorites: UserActions.user_favorites,
  get_appointment_settings: UserActions.get_appointment_settings,
};
/* Component ==================================================================== */
class Listing extends Component {
  static componentName = 'Listing';
  static propTypes = {
    users: PropTypes.func.isRequired,
    branches: PropTypes.func.isRequired,
    user_favorites: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.site_url = '';
    this.state = {
      loading: false,
      page: 1,
      dataList: [],
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
      state_id: props.state_id ? props.state_id : '',
      city_id: props.city_id ? props.city_id : '',
      speciality_id: props.speciality_id ? props.speciality_id : '',
      insurance_id: props.insurance_id ? props.insurance_id : '',
      doctorkeyword: props.doctorkeyword ? props.doctorkeyword : '',
      clinickeyword: props.clinickeyword ? props.clinickeyword : '',
      language_id: props.language_id ? props.language_id : '',
      gender_id: props.gender_id ? props.gender_id : '',
      labkeyword: props.labkeyword ? props.labkeyword : '',
      is_search: props.is_search ? props.is_search : '',
    };
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.get_users(1);
  }
  get_users(p) {
    if (this.callInvoked == 0) {
      var page = p ? p : this.state.page;
      var skip = 0;
      if (page == 1) {
        skip = 0;
      } else {
        skip = (page - 1) * 10;
      }
      var payload =
        '{"where":{"role_id":3},"include":{"0":"user_profile","1":"attachment","2":"branches_doctor.appointment_settings","3":"primary_speciality","specialties_user.specialty","branches_doctor.branch":{"whereHas":{}}},"limit":' +
        10 +
        ',"skip":' +
        skip +
        '}';

      if (this.state.is_search == 1) {
        var whereConditions = '{';
        whereConditions =
          whereConditions +
          '"OR":{"role_id":3,"is_individual":1},"AND":{"is_active":1,"is_email_confirmed":1}';
        if (this.state.doctorkeyword != '' && this.state.speciality_id == '')
          whereConditions =
            whereConditions +
            ',"username"' +
            ':' +
            '{"like":"%' +
            this.state.doctorkeyword +
            '%"}';
        else if (
          this.state.doctorkeyword == '' &&
          this.state.speciality_id != ''
        ) {
          //in website not adding
        } else if (
          this.state.doctorkeyword != '' &&
          this.state.speciality_id != ''
        ) {
          //whereConditions = whereConditions + ',"AND"' +':{"primary_speciality_id":'+this.state.speciality_id+'},{"username":'+'{"like":"%'+this.state.doctorkeyword+'%"}'+'}';
          whereConditions =
            whereConditions +
            ',"username":' +
            '{"like":"%' +
            this.state.doctorkeyword +
            '%"}';
        }
        whereConditions = whereConditions + '}';

        console.log('whereConditions ==' + JSON.stringify(whereConditions));

        var includeConditions = '{';
        includeConditions =
          includeConditions + '"0"' + ':' + '"user_profile.city"';
        includeConditions =
          includeConditions + ',"1"' + ':' + '"user_profile.state"';
        includeConditions = includeConditions + ',"2"' + ':' + '"attachment"';
        includeConditions =
          includeConditions +
          ',"3"' +
          ':' +
          '"branches_doctor.appointment_settings"';
        includeConditions =
          includeConditions + ',"4"' + ':' + '"primary_speciality"';
        //city search
        //if(this.state.speciality_id != '')
        //includeConditions = includeConditions + ',"branches_doctor.branch.branches_specialty":{"whereHas":{"specialty_id":{"inq":{"0":'+this.state.speciality_id+'}}}}';
        //if(this.state.insurance_id != '')
        //includeConditions = includeConditions + ',"branches_doctor.branch.branches_insurance":{"whereHas":{"insurance_id":{"inq":{"0":"'+this.state.insurance_id+'"}}}}';
        if (this.state.language_id != '') {
          console.log('queryformation == 111 ');
          includeConditions =
            includeConditions +
            ',"languages_users":{"whereHas":{"language_id":' +
            this.state.language_id +
            '}}';
          console.log(
            'queryformation == 111 ' + JSON.stringify(includeConditions),
          );
        }
        if (this.state.gender_id != '' && this.state.gender_id != 0)
          includeConditions =
            includeConditions +
            ',"user_profile":{"whereHas":{"gender_id":"' +
            this.state.gender_id +
            '"}}';
        includeConditions = includeConditions + '}';

        var d =
          '{"where":' +
          whereConditions +
          ',"include":' +
          includeConditions +
          ',' +
          '"limit":10,"skip":' +
          skip +
          '}';
        if (this.state.state_id && this.state.state_id != '')
          d = d + '&state_id=' + this.state.state_id;
        if (this.state.city_id && this.state.city_id != '')
          d = d + '&city_id=' + this.state.city_id;
        if (this.state.speciality_id && this.state.speciality_id != '')
          d = d + '&specialty_id=' + this.state.speciality_id;
        if (this.state.insurance_id && this.state.insurance_id != '')
          d = d + '&insurance_id=' + this.state.insurance_id;
        //if(this.state.language_id && this.state.language_id != '')
        //d = d + '&language_id=' + this.state.language_id
        payload = d + '&is_individual=1&type=doctors';
        console.log('queryformation == ' + payload);
      } else if (this.state.is_search == 2) {
        var whereConditions = {};

        if (this.state.city_id != '') {
          whereConditions['city_id'] = { eq: this.state.city_id };
        }
        if (this.state.state_id != '') {
          whereConditions['state_id'] = { eq: this.state.state_id };
        }
        if (this.state.clinickeyword != '') {
          whereConditions['name'] = {
            like: '%' + this.state.clinickeyword + '%',
          };
        }

        var includeConditions = '{';
        includeConditions = includeConditions + '"0"' + ':' + '"attachment"';
        includeConditions = includeConditions + ',"1"' + ':' + '"city"';
        includeConditions = includeConditions + ',"2"' + ':' + '"country"';

        includeConditions =
          includeConditions +
          ',"clinic_user":{"whereHas":{"role_id":5,"is_plan_subscribed":1}}';
        if (this.state.speciality_id != '')
          includeConditions =
            includeConditions +
            ',"branches_specialty":{"whereHas":{"specialty_id":{"inq":{"0":' +
            this.state.speciality_id +
            '}}}}';
        if (this.state.insurance_id != '')
          includeConditions =
            includeConditions +
            ',"branches_insurance":{"whereHas":{"insurance_id":{"inq":{"0":"' +
            this.state.insurance_id +
            '"}}}}';
        if (this.state.language_id != '')
          includeConditions =
            includeConditions +
            ',"languages_users":{"whereHas":{"language_id":' +
            this.state.language_id +
            '}}';
        if (this.state.gender_id != '' && this.state.gender_id != 0)
          includeConditions =
            includeConditions +
            ',"user_profile":{"whereHas":{"gender_id":"' +
            this.state.gender_id +
            '"}}';

        includeConditions = includeConditions + '}';

        var d =
          '{"where":' +
          JSON.stringify(whereConditions) +
          ',"include":' +
          includeConditions +
          ',' +
          '"skip":' +
          skip +
          ',"limit":10}';
        payload = d;
        console.log('queryformation == ' + d);
      } else if (this.state.is_search == 3) {
        var whereConditions = {};

        if (this.state.city_id != '') {
          whereConditions['city_id'] = { eq: this.state.city_id };
        }
        if (this.state.state_id != '') {
          whereConditions['state_id'] = { eq: this.state.state_id };
        }
        if (this.state.labkeyword != '') {
          whereConditions['name'] = { like: '%' + this.state.labkeyword + '%' };
        }

        console.log('whereConditions dd ==' + JSON.stringify(whereConditions));

        var includeConditions = '{';
        includeConditions = includeConditions + '"0"' + ':' + '"attachment"';
        includeConditions = includeConditions + ',"1"' + ':' + '"city"';
        includeConditions = includeConditions + ',"2"' + ':' + '"country"';

        includeConditions =
          includeConditions +
          ',"clinic_user":{"whereHas":{"role_id":7,"is_plan_subscribed":1}}}';

        var d =
          '{"where":' +
          JSON.stringify(whereConditions) +
          ',"include":' +
          includeConditions +
          ',' +
          '"skip":' +
          skip +
          ',"limit":10}';
        payload = d;
        console.log('queryformation == ' + d);
      }
      this.callInvoked = 1;
      this.setState({ loading: true });
      if (this.state.is_search == 3 || this.state.is_search == 2) {
        this.props
          .branches({ filter: payload })
          .then(resp => {
            console.log('data=== == ' + JSON.stringify(resp._metadata.total));
            if (resp._metadata && resp._metadata.total == 0) {
              this.setState({ nodata: 1, loading: false });
            } else if (resp.data) {
              var datares = this.state.dataList.concat(resp.data);
              var cpage = page + 1;
              this.callInvoked = 0;

              console.log('data=== == ' + JSON.stringify(resp.data));
              if (this.state.page == 1 && resp.data.length == 0)
                this.setState({
                  nodata: 1,
                  page: cpage,
                  loading: false,
                  dataList: datares,
                });
              else
                this.setState({ page: cpage, dataList: datares, loading: false });
            } else {
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
            console.log('error');
          });
      } else {
        this.props
          .users({ filter: payload, is_slot_need: 1, view_slot_week: 1 })
          .then(resp => {
            console.log('data=== == ' + JSON.stringify(resp._metadata.total));
            if (resp._metadata && resp._metadata.total == 0) {
              this.setState({ nodata: 1, loading: false });
            } else if (resp.data) {
              var datares = this.state.dataList.concat(resp.data);
              var cpage = page + 1;
              this.callInvoked = 0;

              console.log('data=== == ' + JSON.stringify(resp.data));
              if (this.state.page == 1 && resp.data.length == 0)
                this.setState({
                  nodata: 1,
                  page: cpage,
                  loading: false,
                  dataList: datares,
                });
              else
                this.setState({ page: cpage, dataList: datares, loading: false });
            } else {
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
            console.log('error');
          });
      }
    }
  }
  onEndReached = () => {
    this.get_users(this.state.page);
  };

  FListingDetails = id => {
    var payload =
      '{"include":{"0":"attachment","1":"user_profile","2":"user_profile.city","3":"user_profile.country","4":"branches_doctor.appointment_settings","5":"specialties_user.specialty","6":"languages_users.language","7":"branches_doctor.branch.city","8":"branches_doctor.branch.country","9":"user_education","user_favorites":{"where":{"user_id":' +
      id +
      '}}}}';
    console.log('appointment_settings profile_data ' + id);
    this.setState({ loading: true });
    this.props
      .users({ filter: payload, is_slot_need: 1, view_slot_week: 1, user_id: id })
      .then(resp => {
        this.setState({ loading: false });
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data[0]),
          );
          if (resp.data[0].is_individual == 1) {
            var payload = '{"where":{"user_id":' + resp.data[0].id + '}}';
            this.props
              .get_appointment_settings({
                filter: payload,
                post_type: 'GET',
                token: this.state.user.userToken,
              })
              .then(respp => {
                if (respp.error && respp.error.code == 0) {
                  Actions.ListingDetails({
                    is_booking: 0,
                    individual_appointment_setting_id: respp.data[0].id,
                    profile_data: resp.data[0],
                  });
                }
              })
              .catch(() => {
                this.setState({ loading: false });
                console.log('error 3344');
              });
          } else {
            Actions.ListingDetails({ is_booking: 0, profile_data: resp.data[0] });
          }
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        console.log('error');
      });
  };
  bookingDetails = id => {
    var payload =
      '{"include":{"0":"attachment","1":"user_profile","2":"user_profile.city","3":"user_profile.country","4":"branches_doctor.appointment_settings","5":"specialties_user.specialty","6":"languages_users.language","7":"branches_doctor.branch.city","8":"branches_doctor.branch.country","9":"user_education","user_favorites":{"where":{"user_id":' +
      id +
      '}}}}';
    console.log('appointment_settings profile_data ' + id);
    this.setState({ loading: true });
    this.props
      .users({ filter: payload, is_slot_need: 1, view_slot_week: 1, user_id: id })
      .then(resp => {
        this.setState({ loading: false });
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data[0]),
          );
          if (resp.data[0].is_individual == 1) {
            var payload = '{"where":{"user_id":' + resp.data[0].id + '}}';
            this.props
              .get_appointment_settings({
                filter: payload,
                post_type: 'GET',
                token: this.state.user.userToken,
              })
              .then(respp => {
                if (respp.error && respp.error.code == 0) {
                  Actions.ListingDetails({
                    is_booking: 0,
                    individual_appointment_setting_id: respp.data[0].id,
                    profile_data: resp.data[0],
                  });
                }
              })
              .catch(() => {
                this.setState({ loading: false });
                console.log('error 3344');
              });
          } else {
            Actions.ListingDetails({ is_booking: 1, profile_data: resp.data[0] });
          }
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        console.log('error');
      });
  };
  DiagnosticListingDetail = id => {
    var payload =
      '{"include":{"0":"clinic_user","1":"branch_doctor","2":"branches_specialty.specialty","3":"branches_insurance.insurance","4":"attachment","5":"branch_doctor.user.user_profile","6":"branch_doctor.user.attachment"}}';
    console.log('appointment_settings profile_data ' + id);
    this.setState({ loading: true });
    this.props
      .branches({ filter: payload, branch_id: id })
      .then(resp => {
        this.setState({ loading: false });
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data),
          );

          if (this.state.is_search == 2) {
            Actions.BranchListingDetail({ profile_data: resp.data });
          }
          else {
            Actions.DiagnosticListingDetail({ profile_data: resp.data });
          }
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        console.log('error');
      });
  };
  renderViewMore(onPress) {
    return (
      <Text onPress={onPress} style={{ color: AppColors.brand.navbar }}>
        {Strings.viewmore}
      </Text>
    );
  }
  renderViewLess(onPress) {
    return (
      <Text onPress={onPress} style={{ color: AppColors.brand.navbar }}>
        {Strings.viewless}
      </Text>
    );
  }
  _renderRow = dta => {
    if (dta) {
      var data = dta.item ? dta.item : '';
      var imageurl = AppConfig.noimage;
      if (
        this.state.is_search === 1 &&
        data &&
        data.user_profile &&
        data.user_profile.gender_id === 2
      )
        imageurl = AppConfig.noimagefemale;
      if (data && data.attachment && data.attachment.filename) {
        var md5string = 'UserAvatar' + data.attachment.id + 'pngbig_thumb';
        var imagetemp = AppUtil.MD5(md5string);
        imageurl =
          this.site_url +
          '/images/big_thumb/UserAvatar/' +
          data.attachment.id +
          '.' +
          imagetemp +
          '.png';
      } else if (
        data &&
        data.attachment &&
        data.attachment[0] &&
        data.attachment[0].filename
      ) {
        var md5string = 'Branch' + data.attachment[0].id + 'pngbig_thumb';
        var imagetemp = AppUtil.MD5(md5string);
        imageurl =
          this.site_url +
          '/images/big_thumb/Branch/' +
          data.attachment[0].id +
          '.' +
          imagetemp +
          '.png';
      }
      var ratingval = 0;
      if (this.state.is_search == 3) {
        ratingval = parseFloat(data.average_rating);
      } else if (data && data.total_rating_as_service_provider) {
        ratingval = parseFloat(data.total_rating_as_service_provider);
      }
      var id = 0;
      if (data) {
        id = data.id;
        console.log('appointment_settings data=== u = ' + data.id);
        if (this.state.is_search == 3 || this.state.is_search == 2) {
          return (
            <View
              style={{
                flex: 0.9,
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor: AppColors.brand.grey,
                borderColor: AppColors.brand.black,
                borderBottomWidth: 0.3,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: AppColors.brand.white,
                }}>
                <View style={{ flex: 0.25 }}>
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
                </View>
                <View style={{ flex: 0.75 }}>
                  <Text
                    style={[
                      AppStyles.boldedFontText,
                      { fontSize: 14, textTransform: 'capitalize' },
                    ]}>
                    {data.name}
                  </Text>
                  <View style={{ alignItems: 'flex-start' }}>
                    <Rating
                      showRating={false}
                      imageSize={18}
                      fractions={1}
                      ratingCount={5}
                      readonly
                      startingValue={ratingval}
                      style={{ paddingVertical: 5 }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                    }}>
                    <Icon
                      name="map-marker"
                      size={14}
                      color="#000"
                      style={{ marginRight: 8, paddingTop: 3 }}
                    />
                    <Text style={{ fontSize: 12, paddingRight: 10 }}>
                      {data.full_address}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  width: AppSizes.screen.width,
                  padding: 10,
                  paddingTop: 0,
                  backgroundColor: AppColors.brand.white,
                }}>
                <ViewMoreText
                  numberOfLines={3}
                  renderViewMore={this.renderViewMore}
                  renderViewLess={this.renderViewLess}
                  textStyle={{ textAlign: 'left', color: AppColors.brand.black }}>
                  <Text style={{ fontSize: 12, color: AppColors.brand.black }}>
                    {data.description}
                  </Text>
                </ViewMoreText>
                <View style={{ height: 6 }} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  }}>
                  {(this.state.user && this.state.user.role_id == 2) ||
                    this.state.user == '' ? (
                    <TouchableOpacity
                      onPress={this.DiagnosticListingDetail.bind(this, id)}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: AppColors.brand.btnColor,
                        borderRadius: 30,
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}>
                      <Text
                        style={[
                          AppStyles.regularFontText,
                          {
                            fontSize: 11,
                            color: AppColors.brand.white,
                            lineHeight: 15,
                          },
                        ]}>
                        {Strings.bookanappointment}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          );
        } else {
          return (
            <View
              style={{
                flex: 0.9,
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor: AppColors.brand.grey,
                borderColor: AppColors.brand.black,
                borderBottomWidth: 0.3,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: AppColors.brand.white,
                }}>
                <View style={{ flex: 0.25 }}>
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
                </View>
                <View style={{ flex: 0.75 }}>
                  <Text style={[AppStyles.boldedFontText, { fontSize: 14 }]}>
                    {data.user_profile &&
                      data.user_profile.first_name &&
                      data.user_profile.last_name
                      ? data.user_profile.first_name +
                      ' ' +
                      data.user_profile.last_name
                      : data.username}
                  </Text>
                  {data.primary_speciality && data.primary_speciality.name ? (
                    <Text style={{ fontSize: 12 }}>
                      {Strings.lblspecialities[data.primary_speciality.id]}
                    </Text>
                  ) : null}

                  {data.branches_doctor &&
                    data.branches_doctor[0] &&
                    data.branches_doctor[0].branch ? (
                    <Text style={{ fontSize: 12 }}>
                      {data.branches_doctor[0].branch.name}
                    </Text>
                  ) : null}

                  {data.branches_doctor &&
                    data.branches_doctor[0] &&
                    data.branches_doctor[0].branch ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}>
                      <Icon
                        name="map-marker"
                        size={16}
                        color="#000"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontSize: 12, paddingRight: 10 }}>
                        {data.branches_doctor[0].branch.full_address}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {data.user_profile && data.user_profile.address ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                          }}>
                          <Icon
                            name="map-marker"
                            size={14}
                            color="#000"
                            style={{ marginRight: 8, paddingTop: 3 }}
                          />
                          <View
                            style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 11 }}>
                              {data.user_profile.address}
                            </Text>
                            {data.user_profile.state ? (
                              <Text style={{ fontSize: 11 }}>
                                , {data.user_profile.state.name}
                              </Text>
                            ) : null}
                            {data.user_profile.city ? (
                              <Text style={{ fontSize: 11 }}>
                                , {data.user_profile.city.name}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  )}
                  <View style={{ alignItems: 'flex-start' }}>
                    <Rating
                      showRating={false}
                      imageSize={18}
                      fractions={1}
                      ratingCount={5}
                      readonly
                      startingValue={ratingval}
                      style={{ paddingVertical: 5 }}
                    />
                  </View>
                  <View style={{ height: 6 }} />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    }}>
                    <TouchableOpacity
                      onPress={this.FListingDetails.bind(this, id)}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: AppColors.brand.navbar,
                        borderRadius: 30,
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}>
                      <Text
                        style={[
                          AppStyles.regularFontText,
                          {
                            fontSize: 11,
                            color: AppColors.brand.white,
                            lineHeight: 15,
                          },
                        ]}>
                        {Strings.viewprofile}
                      </Text>
                    </TouchableOpacity>
                    {(this.state.user && this.state.user.role_id == 2) ||
                      this.state.user == '' ? (
                      <TouchableOpacity
                        onPress={this.bookingDetails.bind(this, id)}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: AppColors.brand.btnColor,
                          borderRadius: 30,
                          marginLeft: 10,
                          padding: 10,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}>
                        <Text
                          style={[
                            AppStyles.regularFontText,
                            {
                              fontSize: 11,
                              color: AppColors.brand.white,
                              lineHeight: 15,
                            },
                          ]}>
                          {Strings.bookanappointment}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          );
        }
      } else {
        return null;
      }
    }
  };
  render = () => {
    var bottomSpace = 65;
    if (Platform.OS == 'ios' && AppSizes.screen.height >= 812) {
      bottomSpace = 90;
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.searchresults} />
        {this.state.nodata == 0 ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - bottomSpace,
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
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Listing);
