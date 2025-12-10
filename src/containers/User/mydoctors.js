import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {Rating} from '@rneui/themed';
import * as UserActions from '@reduxx/user/actions';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import NavComponent from '@components/NavComponent.js';
import Loading from '@components/general/Loading';
import ViewMoreText from 'react-native-view-more-text';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  user_favorites: UserActions.user_favorites,
  branches: UserActions.branches,
  users: UserActions.users,
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
  },
  Listcontainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  tab: {
    padding: 15,
    minWidth: AppSizes.screen.width / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_tab: {
    padding: 15,
    minWidth: AppSizes.screen.width / 3,
    borderBottomWidth: 4,
    borderColor: AppColors.brand.navbar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    fontSize: 12,
    lineHeight: 15,
    color: AppColors.brand.white,
  },
});

/* Component ==================================================================== */
class MyDoctors extends Component {
  static propTypes = {
    user_favorites: PropTypes.func.isRequired,
    branches: PropTypes.func.isRequired,
    users: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'clinic',
      userLang: 'en',
      cnt: 0,
      user: props.user ? props.user : '',
    };
  }
  renderViewMore(onPress) {
    return (
      <Text onPress={onPress} style={{color: AppColors.brand.navbar}}>
        {Strings.viewmore}
      </Text>
    );
  }
  renderViewLess(onPress) {
    return (
      <Text onPress={onPress} style={{color: AppColors.brand.navbar}}>
        {Strings.viewless}
      </Text>
    );
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_user_favorites('clinic', 1);
  }
  DiagnosticListingDetail = id => {
    var payload =
      '{"include":{"0":"clinic_user","1":"branch_doctor","2":"branches_specialty.specialty","3":"branches_insurance.insurance","4":"attachment","5":"branch_doctor.user.user_profile","6":"branch_doctor.user.attachment"}}';
    console.log('appointment_settings profile_data ' + id);
    this.setState({loading: true});
    this.props
      .branches({filter: payload, branch_id: id})
      .then(resp => {
        this.setState({loading: false});
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data),
          );

          if (this.state.cfilter == 'clinic')
            Actions.BranchListingDetail({profile_data: resp.data});
          else Actions.DiagnosticListingDetail({profile_data: resp.data});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  };
  get_user_favorites(q, p) {
    if (this.callInvoked == 0) {
      var cf = q;
      var page = p ? p : this.state.page;
      var skip = 0;
      if (page == 1) {
        skip = 0;
      } else {
        skip = (page - 1) * 10;
      }
      console.log(
        'res booking data data=== == ' + JSON.stringify(this.state.user),
      );
      var payload = {
        where: {user_id: this.state.user.id, class: 'Branch'},
        include: {
          0: 'branch.city',
          1: 'branch.country',
          2: 'clinic_user.attachment',
          3: 'clinic_user.user_profile',
          clinic_user: {whereHas: {role_id: 5}},
        },
      };
      if (q == 'lab')
        payload = {
          where: {user_id: this.state.user.id, class: 'Branch'},
          include: {
            0: 'branch.city',
            1: 'branch.country',
            2: 'clinic_user.attachment',
            3: 'clinic_user.user_profile',
            clinic_user: {whereHas: {role_id: 7}},
          },
        };
      if (q == 'doctor')
        payload = {
          where: {user_id: this.state.user.id, class: 'User'},
          include: {
            0: 'favorite_foreign.primary_speciality',
            1: 'favorite_foreign.attachment',
          },
        };
      this.callInvoked = 1;
      this.props
        .user_favorites({
          filter: payload,
          type: q,
          token: this.state.user.userToken,
        })
        .then(resp => {
          console.log('res booking data data=== == ' + JSON.stringify(resp));
          var datares = this.state.dataList.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
          if (page == 1 && resp.data.length == 0)
            this.setState({nodata: 1, page: cpage, dataList: datares});
          else this.setState({page: cpage, dataList: datares});
        })
        .catch(() => {
          console.log('error');
        });
    }
  }

  filter = id => {
    var cf = '';
    if (id == 'clinic') {
      cf = 'clinic';
    } else if (id == 'doctor') {
      cf = 'doctor';
    } else if (id == 'lab') {
      cf = 'lab';
    }
    this.setState(
      {cfilter: id, page: 1, dataList: [], nodata: 0},
      this.get_user_favorites(cf, 1),
    );
  };
  FListingDetails = id => {
    var payload =
      '{"include":{"0":"attachment","1":"user_profile","2":"user_profile.city","3":"user_profile.country","4":"branches_doctor.appointment_settings","5":"specialties_user.specialty","6":"languages_users.language","7":"branches_doctor.branch.city","8":"branches_doctor.branch.country","9":"user_education","user_favorites":{"where":{"user_id":' +
      id +
      '}}}}';
    console.log('appointment_settings profile_data ' + id);
    this.setState({loading: true});
    this.props
      .users({filter: payload, is_slot_need: 1, view_slot_week: 1, user_id: id})
      .then(resp => {
        this.setState({loading: false});
        if (resp.error && resp.error.code == 0) {
          console.log(
            'appointment_settings profile_data ' + JSON.stringify(resp.data[0]),
          );
          Actions.ListingDetails({profile_data: resp.data[0]});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  };
  removefavorite = id => {
    this.callInvoked = 1;
    this.setState({loading: true});
    var that = this;
    Alert.alert(
      '',
      Strings.areyousureyouwanttoremovefavorite,
      [
        {
          text: Strings.ok,
          onPress: () => {
            this.props
              .user_favorites({
                id: id,
                post_type: 'DELETE',
                token: this.state.user.userToken,
              })
              .then(resp => {
                this.setState({loading: false});
                if (resp.error && resp.error.code == 0) {
                  that.setState({dataList: []});
                  console.log('deleted = ' + that.state.cfilter);
                  this.callInvoked = 0;
                  that.get_user_favorites(that.state.cfilter, 1);
                }
              })
              .catch(() => {
                this.setState({loading: false});
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => this.setState({loading: false})},
      ],
      {cancelable: false},
    );
  };
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    console.log('data===' + this.state.cfilter + '==' + JSON.stringify(data));
    if (this.state.cfilter == 'clinic' || this.state.cfilter == 'lab') {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 10,
            paddingBottom: 10,
            borderColor: AppColors.brand.black,
            borderBottomWidth: 0.3,
          }}>
          <View style={{flex: 1}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.7}}>
                <Text
                  style={{
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                    lineHeight: 20,
                  }}>
                  {data.clinic_user
                    ? this.Capitalize(data.clinic_user.username)
                    : ''}
                </Text>
              </View>
              <View>
                <Rating
                  type="star"
                  fractions={1}
                  ratingCount={5}
                  startingValue={
                    data.branch.average_rating ? data.branch.average_rating : 0
                  }
                  readonly
                  imageSize={20}
                  style={{paddingVertical: 5, alignItems: 'center'}}
                />
              </View>
            </View>
            <View style={{height: 3}} />
            {data.branch && data.branch.address ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 3,
                }}>
                <Icon
                  name="map-marker"
                  color={AppColors.brand.black}
                  size={18}
                />
                <Text style={{marginLeft: 10, fontSize: 12}}>
                  {data.branch.address
                    ? this.Capitalize(data.branch.address)
                    : ''}
                </Text>
              </View>
            ) : null}
            <ViewMoreText
              numberOfLines={3}
              renderViewMore={this.renderViewMore}
              renderViewLess={this.renderViewLess}
              textStyle={{textAlign: 'left', color: AppColors.brand.black}}>
              <Text style={{fontSize: 14, color: AppColors.brand.black}}>
                {data.branch.description ? data.branch.description : ''}
              </Text>
            </ViewMoreText>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}>
            <TouchableOpacity
              onPress={this.DiagnosticListingDetail.bind(this, data.branch.id)}
              style={{
                marginTop: 10,
                backgroundColor: AppColors.brand.btnColor,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  lineHeight: 15,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  color: AppColors.brand.white,
                  fontSize: 12,
                }}>
                {Strings.bookanappointment}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.removefavorite.bind(this, data.id)}
              style={{
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: AppColors.brand.red,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  lineHeight: 15,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  color: AppColors.brand.white,
                  fontSize: 12,
                }}>
                {Strings.removefavorite}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      var addr = '';
      if (
        data.favorite_foreign &&
        data.favorite_foreign.activity &&
        data.favorite_foreign.activity.branches_doctor[0] &&
        data.favorite_foreign.activity.branches_doctor[0].branch.full_address
      )
        addr = data.favorite_foreign.activity.branches_doctor[0].branch.address;
      else if (
        data.favorite_foreign &&
        data.favorite_foreign.activity &&
        data.favorite_foreign.activity.branches_doctor[0] &&
        data.favorite_foreign.activity.branches_doctor[0]
      )
        addr =
          data.favorite_foreign &&
          data.favorite_foreign.activity &&
          data.favorite_foreign.activity.branches_doctor[0] &&
          data.favorite_foreign.activity.branches_doctor[0].name;

      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 10,
            paddingBottom: 10,
            borderColor: AppColors.brand.black,
            borderBottomWidth: 0.3,
          }}>
          <View style={{flex: 1}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.7}}>
                <Text
                  style={{
                    fontSize: 16,
                    color: AppColors.brand.navbar,
                    lineHeight: 20,
                  }}>
                  {this.Capitalize(data.favorite_foreign.username)}
                </Text>
              </View>
              <View>
                <Rating
                  type="star"
                  fractions={1}
                  ratingCount={5}
                  startingValue={
                    data.favorite_foreign.average_rating_as_service_provider
                  }
                  readonly
                  imageSize={20}
                  style={{paddingVertical: 5, alignItems: 'center'}}
                />
              </View>
            </View>
            <View style={{height: 3}} />
            {addr ? (
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <Icon
                  name="map-marker"
                  color={AppColors.brand.black}
                  size={18}
                />
                <Text style={{marginLeft: 10, fontSize: 12}}>{addr}</Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}>
            <TouchableOpacity
              onPress={this.FListingDetails.bind(this, data.foreign_id)}
              style={{
                marginTop: 10,
                backgroundColor: AppColors.brand.btnColor,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  lineHeight: 15,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  color: AppColors.brand.white,
                  fontSize: 12,
                }}>
                {Strings.bookanappointment}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.removefavorite.bind(this, data.id)}
              style={{
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: AppColors.brand.red,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  lineHeight: 15,
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  color: AppColors.brand.white,
                  fontSize: 12,
                }}>
                {Strings.removefavorite}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  render = () => {
    var fclinic =
      this.state.cfilter == 'clinic' ? styles.selected_tab : styles.tab;
    var fdoctor =
      this.state.cfilter == 'doctor' ? styles.selected_tab : styles.tab;
    var flab = this.state.cfilter == 'lab' ? styles.selected_tab : styles.tab;

    var fclinict =
      this.state.cfilter == 'clinic'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fdoctort =
      this.state.cfilter == 'doctor'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var flabt =
      this.state.cfilter == 'lab'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];

    var disabled = false;
    if (this.callInvoked) disabled = true;
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.myfavorites} />
        <View
          style={{
            backgroundColor: '#303030',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: AppSizes.screen.width,
          }}>
          <TouchableOpacity
            disabled={disabled}
            onPress={this.filter.bind(this, 'clinic')}
            style={fclinic}>
            <Text style={fclinict}>{Strings.clinics}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            onPress={this.filter.bind(this, 'doctor')}
            style={fdoctor}>
            <Text style={fdoctort}>{Strings.doctors}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            onPress={this.filter.bind(this, 'lab')}
            style={flab}>
            <Text style={flabt}>{Strings.diagnosticcenter}</Text>
          </TouchableOpacity>
        </View>
        {this.state.nodata == 0 ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - 130,
            }}>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <FlatList
                data={this.state.dataList}
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
export default connect(mapStateToProps, mapDispatchToProps)(MyDoctors);
