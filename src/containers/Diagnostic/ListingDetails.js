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
import {Rating, CheckBox} from '@rneui/themed';
import Slots from '@containers/search/Slots.js';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';
import Loading from '@components/general/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

var moment = require('moment');
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';

// Components
import {Spacer, Text, Button, Card, FormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
  };
};
const mapDispatchToProps = {
  diagnostic_center_tests: UserActions.diagnostic_center_tests,
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
      daycount: 1,
      nodata: 0,
      dataList: [],
      labTests: [],
      is_favorite: 0,
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
    console.log('ggggggggggg 22');
    this.get_favorite();
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    var payload =
      '{"where":{"diagnostic_center_user_id":' +
      this.props.profile_data.clinic_user_id +
      ', "branch_id":' +
      this.props.profile_data.id +
      '},"include":{"0":"diagonostic_test_image","1":"lab_test"}}';
    console.log(
      'diagnostic_center_tests profile_data ' + JSON.stringify(payload),
    );
    this.setState({loading: true});
    this.props
      .diagnostic_center_tests({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0 && resp.data.length) {
          this.setState({nodata: 0, dataList: resp.data, loading: false});
        } else {
          this.setState({nodata: 1, loading: false});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error wwww');
      });
  }
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
        console.log('error dddd');
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
        console.log('user_favorites == ' + JSON.stringify(resp));
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
        console.log('error 1111');
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
        {this.total > 0 ? (
          <View
            style={{
              width: AppSizes.screen.width,
              position: 'absolute',
              top: AppSizes.screen.height - 65,
            }}>
            <Button
              title={Strings.next}
              backgroundColor={'#33BB76'}
              fontSize={16}
              onPress={() => {
                console.log('lbtests == ' + JSON.stringify(this.state.user));
                if (this.state.user && this.state.user.id) {
                  Actions.DiagnosticBookNow({
                    total: this.total,
                    labtests: this.labTests,
                    profile_data: this.state.profile_data,
                  });
                } else {
                  Actions.authenticate();
                }
              }}
            />
          </View>
        ) : null}
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
  book = data => {
    this.setState({dataList: []});
    if (this.labTests.includes(data.id)) {
      var index = this.labTests.indexOf(data.id);
      if (index > -1) {
        this.labTests.splice(index, 1);
        this.state.labTests.splice(index, 1);
        this.total = this.total - data.price;
      }
    } else {
      this.labTests.push(data.id);
      this.state.labTests.push(data.id);
      this.total = this.total + data.price;
    }
    this.setState({dataList: this.state.dataList});
    console.log('lbtests == ' + JSON.stringify(this.labTests));
  };

  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var checked = false;
    if (this.labTests.includes(data.id)) {
      checked = true;
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          flex: 0.9,
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: AppColors.brand.black,
          borderBottomWidth: 0.2,
        }}>
        <View style={{flex: 0.8, padding: 5, paddingBottom: 10}}>
          <Text style={{fontSize: 14, color: AppColors.brand.navbar}}>
            {data.lab_test.name}
          </Text>
          <Text style={{fontSize: 14, paddingTop: 5, paddingBottom: 5}}>
            {this.site_currency}
            {data.price}
          </Text>
          <Text style={{fontSize: 12, lineHeight: 17}}>
            {data.lab_test.description}
          </Text>
        </View>
        <View
          style={{flex: 0.2, justifyContent: 'center', alignItems: 'center'}}>
          <CheckBox
            center
            containerStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
            }}
            iconType="material"
            checkedIcon="check-box"
            uncheckedIcon="check-box-outline-blank"
            checkedColor={AppColors.brand.navbar}
            checked={checked}
            onPress={this.book.bind(this, data)}
          />
        </View>
      </View>
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
        <View style={{flex: 1, paddingTop: 10, marginBottom: 10}}>
          <Button
            title={Strings.labtests}
            backgroundColor={AppColors.brand.navbar}
            fontSize={16}
            onPress={() => {
              console.log('ok');
            }}
          />
        </View>
        {this.state.nodata == 0 ? (
          <View>
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
        {this.state.region.latitude != 0.0 ? (
          <View style={{flex: 1, paddingTop: 10}}>
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
