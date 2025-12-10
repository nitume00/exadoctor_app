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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import * as UserActions from '@reduxx/user/actions';
import {AppConfig} from '@constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavComponent from '@components/NavComponent.js';
import Strings from '@lib/string.js';
import ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-datepicker';
import Permissions from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import {CheckBox} from '@rneui/themed';
import AppUtil from '@lib/util';
import Loading from '@components/general/Loading';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
const mapkey = '12345678';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
var moment = require('moment');
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
const mapStateToProps = state => {
  console.log(
    'props_country_details====> sss == ' + JSON.stringify(state.user.cities),
  );
  return {
    user: state.user.user_data,
    country_code_list: state.user.countries,
    city_list: state.user.cities,
    state_list: state.user.states,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  getCountries: UserActions.getCountries,
  user_profiles: UserActions.user_profiles,
  auth: UserActions.auth,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar, //AppColors.brand.primary,
    flex: 1,
  },
  headertitle: {
    flex: 1,
    fontSize: 14,
    paddingTop: 15,
    paddingLeft: 10,
    color: '#A9A9A9',
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    marginTop: 10,
  },
});

/* Component ==================================================================== */
class ProfileView extends Component {
  static propTypes = {
    countries: PropTypes.func.isRequired,
    user_profiles: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    console.log('sdfdsfsdfsdf == ' + JSON.stringify(props.user));
    this.site_url = '';
    this.state = {
      loading: false,
      editing: false,
      role_id: props.user ? props.user.role_id : '',
      prefered_language:
        props.user && props.user.prefered_language
          ? props.user.prefered_language
          : 'English',
      gender_id:
        props.user && props.user.user_profile
          ? props.user.user_profile.gender_id
          : '',
      bloodgroup:
        props.user && props.user.user_profile
          ? props.user.user_profile.blood_group
          : '',
      otherdetails:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.about_me)
          : '',
      photopermission: '',
      camerapermission: '',
      countries: '',
      storagepermission: Platform.OS == 'ios' ? '1' : '',
      locationpermission: '',
      cvrprofileImage: AppConfig.noimage,
      cvrUploadStatus: false,
      mindate: moment(new Date('January 01, 1901 00:00:00')).format(
        'MM-DD-YYYY',
      ),
      maxdate: moment(new Date()).add(-16, 'years').format('MM-DD-YYYY'),
      email: props.user ? props.user.email : '',
      phone: props.user ? props.user.mobile : '',
      phonecode: props.user ? props.user.mobile_code : '',
      user: props.user ? props.user : '',
      first_name:
        props.user && props.user.user_profile
          ? props.user.user_profile.first_name
          : '',
      last_name:
        props.user && props.user.user_profile
          ? props.user.user_profile.last_name
          : '',
      dob:
        props.user && props.user.user_profile && props.user.user_profile.dob
          ? moment(props.user.user_profile.dob).format('MM-DD-YYYY')
          : moment().format('MM-DD-YYYY'),
      nationality_id: props.user ? props.user.nationality_id : '',
      nationality_lbl: '',
      about_me:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.about_me)
          : '',
      awards:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.awards)
          : '',
      board_certifications:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.board_certifications)
          : '',
      experience:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.experience)
          : '',
      latitude: props.user && props.user.latitude ? props.user.latitude : 0.0,
      longitude:
        props.user && props.user.longitude ? props.user.longitude : 0.0,
      attachment:
        props.user && props.user.attachment ? props.user.attachment : '',
      is_selected: 0,
      country_code: [],
      selected_country_code:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.mobile_code
          ? props.user.user_profile.mobile_code
          : '',

      //Pharmacy
      company_name:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.practice_name
          ? props.user.user_profile.practice_name
          : '',
      webiste_url:
        props.user && props.user.user_profile && props.user.user_profile.website
          ? props.user.user_profile.website
          : '',
      primary_telephone_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.primary_telephone_number
          ? props.user.user_profile.primary_telephone_number
          : '',
      primary_fax_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.primary_fax_number
          ? props.user.user_profile.primary_fax_number
          : '',
      address:
        props.user && props.user.user_profile && props.user.user_profile.address
          ? props.user.user_profile.address
          : '',
      address1: '',
      city_id:
        props.user && props.user.user_profile && props.user.user_profile.city_id
          ? props.user.user_profile.city_id
          : '',
      city: '',
      selected_city: {},
      state_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.state_id
          ? props.user.user_profile.state_id
          : '',
      state: '',
      selected_state: {},
      country_list: [],
      country_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.country_id
          ? props.user.user_profile.country_id
          : '',
      country: '',
      selected_country: {},
      latitude: '',
      longitude: '',
      postal_code: '',
      country_code_list: props.country_code_list ? props.country_code_list : '',
      state_list: props.state_list ? props.state_list : '',
      city_list: props.city_list ? props.city_list : '',
      postData: {
        service_id: '',
        address: '',
        address1: '',
        zip_code: '',
        city_name: '',
        state_name: '',
        country_iso2: '',
        country_iso: '',
        latitude: '',
        longitude: '',
      },
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    console.log(
      'updateImagetoServer props ' + JSON.stringify(props.user.user_profile.id),
    );
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    var tttt = [];
    var ttt = [];
    var selectctry = '';
    var selectphcode = '';
    for (var i = 0; i < this.state.country_code_list.length; i++) {
      var lbl = this.state.country_code_list[i].name;
      tttt.push({key: this.state.country_code_list[i].iso2, label: lbl});
      ttt.push({key: this.state.country_code_list[i].iso2, label: lbl});
      if (this.state.country_id == this.state.country_code_list[i].id) {
        this.setState({
          country_iso2: this.state.country_code_list[i].iso2,
          country: this.state.country_code_list[i].name,
          selected_country: this.state.country_code_list[i],
        });
      }
    }
    var selected_state = '';
    for (var i = 0; i < this.state.state_list.length; i++) {
      if (this.state.state_id == this.state.state_list[i].id) {
        selected_state = this.state.state_list[i].name;
        console.log('ssss ' + selected_state);
        this.setState({state: selected_state});
      }
    }
    var selected_city = '';
    for (var i = 0; i < this.state.city_list.length; i++) {
      if (this.state.city_id == this.state.city_list[i].id) {
        selected_city = this.state.city_list[i].name;
        console.log('ssss = ' + selected_city);
        this.setState({city: selected_city});
      }
    }
    this.setState({country_code: tttt, country_list: ttt});

    console.log(
      'updateImagetoServer 111' + JSON.stringify(this.state.attachment),
    );
    if (this.state.attachment && this.state.attachment.filename) {
      var md5string = 'UserProfile' + this.state.attachment.id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserProfile/' +
        this.state.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('updateImagetoServer 111' + JSON.stringify(imageurl));
      this.setState({cvrprofileImage: imageurl});
    }
    if (this.state.locationpermission === '') {
      console.log('updateImagetoServer 222');
      Permissions.check('location').then(response => {
        //response is an object mapping type to permission
        if (response.location == 'authorized') {
          console.log('updateImagetoServer 333');
          this.setState({locationpermission: '1'});
        } else {
          console.log('updateImagetoServer 444');
          Permissions.request('location').then(response => {
            if (response == 'authorized') {
              this.setState({locationpermission: '1'});
              this.getLocation();
            }
          });
        }
      });
    }
  }
  getLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        console.log(
          'updateImagetoServer dsfsdf' +
            position.coords.latitude +
            '==' +
            position.coords.longitude,
        );
      },
      error => console.log('dsfsdf'),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
    );
  }

  pickerImagePressed = imgtype => {
    if (this.state.camerapermission === '') {
      Permissions.request('camera').then(response => {
        if (response == 'authorized') {
          this.setState(
            {camerapermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else if (this.state.photopermission === '') {
      Permissions.request('photo').then(response => {
        if (response == 'authorized') {
          this.setState(
            {photopermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else if (this.state.storagepermission === '') {
      Permissions.request('storage').then(response => {
        if (response == 'authorized') {
          this.setState(
            {storagepermission: '1'},
            this.pickerImagePressed(imgtype),
          );
        }
      });
    } else {
      Actions.Camera({
        imgtype: imgtype,
        reloadView: this.getCatpturedImage.bind(this, imgtype),
      });
    }
  };
  getCatpturedImage = (imgtype, image) => {
    if (image.image) {
      this.setState({
        cvrUploadStatus: true,
        cvrprofileImage: 'data:image/png;base64,' + image.image,
        video_post_url: '',
      });
    }
  };

  editProfile = () => {
    var first_name = this.state.first_name;
    first_name = first_name.trim();
    var last_name = this.state.last_name;
    last_name = last_name.trim();
    console.log(
      'updateImagetoServer user_profiles gender_id' + this.state.gender_id,
    );
    if (first_name == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourfirstname,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (first_name.length < 3) {
      Alert.alert(
        AppConfig.appName,
        Strings.fminimumlength,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (last_name == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourlastname,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (last_name.length < 3) {
      Alert.alert(
        AppConfig.appName,
        Strings.lminimumlength,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (
      this.state.role_id != 6 &&
      (this.state.gender_id == 0 || this.state.gender_id == '')
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.selectgender,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (
      this.state.role_id != 2 &&
      this.state.role_id != 6 &&
      (this.state.dob == '' ||
        this.state.dob == null ||
        this.state.dob == undefined)
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.dob,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.company_name == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentercompanyname,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.primary_telephone_number == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterprimarttelnumber,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (
      AppUtil.validateInt(this.state.primary_telephone_number) == false
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidtelephonenumber,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.address == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteraddress,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.city.trim() == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentercity,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.state.trim() == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterstate,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      var dateofbirth = moment(this.state.dob, 'MM-DD-YYYY').format(
        'YYYY-MM-DD',
      );

      var payload = {
        practice_name: this.state.company_name,
        primary_telephone_number: this.state.primary_telephone_number,
        primary_fax_number: this.state.primary_fax_number,
        website: this.state.webiste_url,
        address: this.state.address,
        address1: null,
        city: {name: this.state.city},
        state: {name: this.state.state},
        country: {iso2: this.state.country_iso2},
        postal_code: this.state.postal_code,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        full_address: this.state.address,
        about_me: this.state.about_me,
        prefered_language: this.state.prefered_language,
      };
      if (this.state.cvrUploadStatus == true)
        payload = {
          practice_name: this.state.company_name,
          primary_telephone_number: this.state.primary_telephone_number,
          primary_fax_number: this.state.primary_fax_number,
          website: this.state.webiste_url,
          address: this.state.address,
          address1: null,
          city: {name: this.state.city},
          state: {name: this.state.state},
          country: {iso2: this.state.country_iso2},
          postal_code: this.state.postal_code,
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          full_address: this.state.address,
          about_me: this.state.about_me,
          image_data: this.state.cvrprofileImage,
          prefered_language: this.state.prefered_language,
        };

      if (this.state.is_selected == 0) {
        payload = {
          practice_name: this.state.company_name,
          primary_telephone_number: this.state.primary_telephone_number,
          primary_fax_number: this.state.primary_fax_number,
          website: this.state.webiste_url,
          about_me: this.state.about_me,
          prefered_language: this.state.prefered_language,
        };
        if (this.state.cvrUploadStatus == true)
          payload = {
            practice_name: this.state.company_name,
            primary_telephone_number: this.state.primary_telephone_number,
            primary_fax_number: this.state.primary_fax_number,
            website: this.state.webiste_url,
            about_me: this.state.about_me,
            image_data: this.state.cvrprofileImage,
            prefered_language: this.state.prefered_language,
          };
      }
      console.log('user_profiles ' + JSON.stringify(payload));

      this.setState({loading: true});
      this.props
        .user_profiles(payload)
        .then(resp => {
          console.log('user_profiles ' + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) {
            Alert.alert(
              AppConfig.appName,
              Strings.userprofileupdated,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    this.setState({loading: false});
                    var payload = {
                      user_id: this.state.user.id,
                      token: this.state.user.userToken,
                    };
                    this.props
                      .auth(payload)
                      .then(resp => {
                        if (resp.data) {
                          Actions.pop();
                        }
                      })
                      .catch(() => {});
                  },
                },
              ],
              {cancelable: false},
            );
          } else {
            this.setState({loading: false});
            Alert.alert(
              AppConfig.appName,
              resp.error.message,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          }
        })
        .catch(() => {
          this.setState({loading: false});
          console.log('error');
        });
    }
  };
  render = () => {
    var imageurl = this.state.cvrprofileImage;
    console.log('stateuser == ' + JSON.stringify(this.state.user));
    var vmnationalityinfo = [
      {key: 0, section: true, label: Strings.nationalityinfo},
    ];

    if (this.state.countries) {
      var carraynationalityinfo = this.state.countries;
      Object.keys(carraynationalityinfo).forEach(function (key) {
        var lbl = carraynationalityinfo[key].name;
        vmnationalityinfo.push({
          key: carraynationalityinfo[key].id,
          label: lbl,
        });
      });
    }
    var vmbg = [{key: 0, section: true, label: Strings.bloodgroup}];
    var cbg = AppConfig.blood_group;
    var p = 0;
    Object.keys(cbg).forEach(function (key) {
      var lbl = cbg[key];
      vmbg.push({key: p, label: lbl});
      p++;
    });

    console.log('updateImagetoServer blgppp == ' + JSON.stringify(vmbg));
    var phone = this.state.phonecode + ' ' + this.state.phone;
    console.log(
      'updateImagetoServer stateuser == ' + JSON.stringify(this.state.dob),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.editprofile} />
        <ScrollView
          style={{flex: 1, backgroundColor: AppColors.brand.primary}}
          keyboardShouldPersistTaps="always">
          <View style={{flex: 1, marginBottom: 200}}>
            <TouchableOpacity
              onPress={this.pickerImagePressed.bind(this, 'home')}
              style={{
                flex: 1,
                height: 200,
                backgroundColor: AppColors.brand.navbar,
              }}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  style={{height: 150, width: 150, borderRadius: 75}}
                  source={{uri: imageurl}}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.brand.grey,
                justifyContent: 'center',
              }}>
              <Text style={{flex: 1, fontSize: 14, padding: 5}}>
                {Strings.personalinfo}
              </Text>
            </View>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{paddingLeft: 10, paddingTop: 5}}>
                  {Strings.email}: {this.state.email}
                </Text>
              </View>
              <View style={{marginTop: 3}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{paddingLeft: 10, paddingTop: 5}}>
                    {Strings.mobile}: {phone}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.headertitle]}>
              {Strings.prefered_language}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
              }}>
              <CheckBox
                left
                title={'English'}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                containerStyle={{
                  padding: 0,
                  margin: 10,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  width: 75,
                }}
                checked={this.state.prefered_language == 'English'}
                textStyle={{
                  fontFamily: AppFonts.base.family,
                  fontSize: 12,
                  color: AppColors.brand.black,
                  fontWeight: '400',
                }}
                onPress={() => {
                  this.setState({
                    prefered_language: 'English',
                  });
                }}
              />
              <CheckBox
                left
                title={'French'}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                containerStyle={{
                  padding: 0,
                  margin: 10,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  width: 75,
                }}
                checked={this.state.prefered_language == 'French'}
                textStyle={{
                  fontFamily: AppFonts.base.family,
                  fontSize: 12,
                  color: AppColors.brand.black,
                  fontWeight: '400',
                }}
                onPress={() => {
                  this.setState({
                    prefered_language: 'French',
                  });
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.brand.white,
                justifyContent: 'center',
                marginTop: 5,
              }}>
              <View style={{marginBottom: 10, marginTop: 10}}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{paddingLeft: 10, paddingTop: 5}}>
                      {Strings.centername}
                    </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                      *
                    </Text>
                  </View>
                  <LblFormInput
                    textAlignVertical={'top'}
                    lblText={false}
                    height={50}
                    placeholderTxt={Strings.diagnosticcenterfullname}
                    lblTxt={Strings.diagnosticcenterfullname}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.company_name}
                    onChangeText={text => {
                      this.setState({company_name: text});
                    }}
                  />
                </View>
                <View style={{marginTop: 10}}>
                  <Text style={{paddingLeft: 10, paddingTop: 5}}>
                    {Strings.websiteurl}
                  </Text>
                  <LblFormInput
                    textAlignVertical={'top'}
                    lblText={false}
                    height={50}
                    placeholderTxt={'http://'}
                    lblTxt={Strings.websiteurl}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.webiste_url}
                    onChangeText={text => {
                      this.setState({webiste_url: text});
                    }}
                  />
                </View>
                <View style={{marginTop: 10}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{paddingLeft: 10, paddingTop: 5}}>
                      {Strings.primarytelepnonenumber}
                    </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                      *
                    </Text>
                  </View>
                  <LblFormInput
                    textAlignVertical={'top'}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.primary_telephone_number}
                    onChangeText={text => {
                      this.setState({primary_telephone_number: text});
                    }}
                  />
                </View>
                <View style={{marginTop: 10}}>
                  <Text style={{paddingLeft: 10, paddingTop: 5}}>
                    {Strings.primaryfaxnumber}
                  </Text>
                  <LblFormInput
                    textAlignVertical={'top'}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.primary_fax_number}
                    onChangeText={text => {
                      this.setState({primary_fax_number: text});
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: AppColors.brand.grey,
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{flex: 1, fontSize: 14, padding: 5}}>
                    {Strings.addressandcontactinformation}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{paddingLeft: 10, paddingTop: 5}}>
                      {Strings.residentof}
                    </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                      *
                    </Text>
                  </View>
                  <GooglePlacesAutocomplete
                    placeholder={this.state.address}
                    placeholderTextColor="#9E9E9E"
                    minLength={4} // minimum length of text to search
                    autoFocus={false}
                    listViewDisplayed={true} // true/false/undefined
                    fetchDetails={true}
                    renderDescription={row => row.description} // custom description render
                    onPress={(data, details = null) => {
                      // 'details' is provided when fetchDetails = true
                      console.log(
                        'GooglePlacesAutocomplete_details=====> ' +
                          JSON.stringify(details),
                      );
                      var itemDetail = {};
                      var postData = Object.assign({}, this.state.postData);
                      itemDetail['adr_address'] = details.formatted_address;
                      postData.address = itemDetail.adr_address;
                      postData.address1 = itemDetail.adr_address;

                      // itemDetail['lat'] = details.geometry.location.lat;
                      // itemDetail['longi'] = details.geometry.location.lng;
                      // postData.latitude = itemDetail.lat;
                      // postData.longitude = itemDetail.longi;

                      this.setState({
                        is_selected: 1,
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      });
                      var postaltown = 0;
                      for (
                        var i = 0;
                        i < details.address_components.length;
                        i++
                      ) {
                        if (
                          details.address_components[i].types[0] == 'country'
                        ) {
                          itemDetail['country'] =
                            details.address_components[i].long_name;
                          this.setState({
                            country: details.address_components[i].long_name,
                            country_iso2:
                              details.address_components[i].short_name,
                          });
                          itemDetail['country_iso'] =
                            details.address_components[i].short_name;
                          postData.country_iso2 = itemDetail.country;
                          postData.country_iso = itemDetail.country_iso;
                        } else if (
                          details.address_components[i].types[0] == 'locality'
                        ) {
                          itemDetail['administrative_area_level_2'] =
                            details.address_components[i].short_name;
                          postData.city_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            city: itemDetail.administrative_area_level_2,
                            city_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                          'postal_town'
                        ) {
                          postaltown = 1;
                          itemDetail['administrative_area_level_2'] =
                            details.address_components[i].short_name;
                          postData.city_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            city: itemDetail.administrative_area_level_2,
                            city_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                            'administrative_area_level_2' &&
                          postaltown == 1
                        ) {
                          itemDetail['administrative_area_level_2'] =
                            details.address_components[i].short_name;
                          postData.state_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            state: itemDetail.administrative_area_level_2,
                            state_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                            'administrative_area_level_1' &&
                          postaltown == 0
                        ) {
                          itemDetail['administrative_area_level_1'] =
                            details.address_components[i].long_name;
                          postData.state_name =
                            itemDetail.administrative_area_level_1;
                          this.setState({
                            state: itemDetail.administrative_area_level_1,
                            state_id: itemDetail.administrative_area_level_1,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                          'postal_code'
                        ) {
                          itemDetail['postal_code'] =
                            details.address_components[i].short_name;
                          postData.zip_code = itemDetail.postal_code;
                          this.setState({
                            postal_code:
                              details.address_components[i].short_name,
                          });
                        }
                      }
                      this.setState({
                        postData: postData,
                        address: itemDetail.adr_address,
                      });
                    }}
                    getDefaultValue={() => {
                      return ''; // text input default value
                    }}
                    query={{
                      key: mapkey,
                      language: 'en', // language of the results
                      types: '', // default: 'geocode'
                    }}
                    styles={{
                      textInput: {
                        color: '#9E9E9E',
                        fontSize: 14,
                        textAlign: 'center',
                        marginLeft: 20,
                      },
                      description: {
                        fontSize: 14,
                        color: '#9E9E9E',
                      },
                      predefinedPlacesDescription: {
                        color: '#9E9E9E',
                      },
                    }}
                    nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                    debounce={0} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                  />

                  <View style={{marginTop: 10}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{paddingLeft: 10, paddingTop: 5}}>
                        {Strings.city}
                      </Text>
                      <Text
                        style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      textAlignVertical={'top'}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.city}
                      lblTxt={Strings.city}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.city}
                      onChangeText={text => {
                        this.setState({city: text, city_id: text});
                      }}
                    />
                  </View>
                  <View style={{marginTop: 10}}>
                    <Text style={{paddingLeft: 10, paddingTop: 5}}>
                      {Strings.state}
                    </Text>
                    <LblFormInput
                      textAlignVertical={'top'}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.state}
                      lblTxt={Strings.state}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.state}
                      onChangeText={text => {
                        this.setState({state: text});
                      }}
                    />
                  </View>
                  <View style={{marginTop: 10}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{paddingLeft: 10, paddingTop: 5}}>
                        {Strings.country}
                      </Text>
                      <Text
                        style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      editable={false}
                      textAlignVertical={'top'}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.country}
                      lblTxt={Strings.country}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.country}
                      onChangeText={text => {
                        this.setState({country: text});
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: AppColors.brand.grey,
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{flex: 1, fontSize: 14, padding: 5}}>
                    {Strings.otherdetail}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <LblFormInput
                    textAlignVertical={'top'}
                    lblText={false}
                    height={50}
                    placeholderTxt={Strings.aboutme}
                    lblTxt={Strings.aboutme}
                    select_opt={false}
                    numberOfLines={4}
                    multiline={true}
                    value={this.state.about_me}
                    onChangeText={text => {
                      this.setState({about_me: text});
                    }}
                  />
                </View>
              </View>
            </View>
            <Button
              onPress={this.editProfile}
              title={Strings.submit}
              backgroundColor={AppColors.brand.buttonclick}
              fontSize={15}
            />
          </View>
        </ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
