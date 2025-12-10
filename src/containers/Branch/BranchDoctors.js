import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import AppUtil from '@lib/util';
import {AppConfig} from '@constants/';
import Strings from '@lib/string.js';
import {AppStyles, AppSizes, AppColors} from '@theme/';
import {Rating, CheckBox} from '@rneui/themed';
import {Spacer, Text, Button, Card, FormInput} from '@ui/';
const mapStateToProps = state => {
  return {
    user_data: state.user.user_data,
    specialities: state.user.specialities,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* Component ==================================================================== */
class BranchDoctor extends Component {
  constructor(props) {
    super(props);
    this.site_url = '';
    this.state = {
      doctor_data: props.doctor_data ? props.doctor_data : '',
      specialities: props.specialities ? props.specialities : '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }
  selectedDoctor = data => {
    if (this.props.buttonPress) {
      this.props.buttonPress(data);
    }
  };
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  render = () => {
    var imageurl = AppConfig.noimage;
    if (
      this.site_url &&
      this.state.doctor_data.user.attachment &&
      this.state.doctor_data.user.attachment.filename
    ) {
      var md5string =
        'UserProfile' +
        this.state.doctor_data.user.attachment.id +
        'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserProfile/' +
        this.state.doctor_data.user.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('data=== u = ' + JSON.stringify(this.state.doctor_data.user));
    }
    console.log('data=== u = ' + JSON.stringify(this.state.doctor_data));
    var uname = this.state.doctor_data.user.username;
    if (uname.length > 15) uname = uname.substring(0, 15) + '...';

    let speciality = '';
    if (this.state.specialities !== '') {
      for (let i = 0; i < this.state.specialities.length; i++) {
        //console.log("data=== u = " + JSON.stringify(this.state.specialities[i]));
        if (
          this.state.specialities[i].id ==
          this.state.doctor_data.user.primary_speciality_id
        ) {
          speciality = this.state.specialities[i].name;
        }
      }
    }
    return (
      <TouchableOpacity
        onPress={this.selectedDoctor.bind(this, this.state.doctor_data)}
        style={[
          {
            flexDirection: 'row',
            padding: 5,
            borderColor: AppColors.brand.navbar,
            borderWidth: 0.5,
            marginRight: 5,
            marginBottom: 5,
            width: (AppSizes.screen.width - 20) / 2 - 10,
          },
        ]}>
        <Image
          style={{
            width: 40,
            height: 40,
            borderRadius: Platform.OS == 'ios' ? 20 : 50,
            borderColor: AppColors.brand.black,
            borderWidth: 0.3,
          }}
          source={{uri: imageurl}}
        />
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginLeft: 10,
          }}>
          <Text style={{fontSize: 12, color: AppColors.brand.navbar}}>
            {uname}
          </Text>
          {speciality ? <Text style={{fontSize: 12}}>{speciality}</Text> : null}
          <Rating
            type="star"
            fractions={1}
            ratingCount={5}
            startingValue={
              this.state.doctor_data.user.average_rating_as_service_provider
            }
            readonly
            imageSize={15}
            style={{paddingVertical: 5, alignItems: 'center', paddingTop: 10}}
          />
        </View>
      </TouchableOpacity>
    );
  };
}
/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(BranchDoctor);
