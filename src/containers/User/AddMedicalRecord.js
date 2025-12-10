/**
 * Add Medical Record
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
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// import ModalPicker from 'react-native-modal-picker';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Permissions from 'react-native-permissions';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
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
  medical_history: UserActions.medical_history,
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
    borderBottomWidth: 1,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class AddMedicalHistory extends Component {
  static componentName = 'AddMedicalHistory';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      loading: false,
      description: '',
      nodata: 0,
      userLang: 'en',
      year: '',
      user: props.user ? props.user : '',
      photopermission: '',
      camerapermission: '',
      storagepermission: (Platform.OS: 'ios') ? '1' : '',
      cvrprofileImage: [],
      cvrUploadStatus: false,
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
  }
  submit = () => {
    if (
      this.state.year == '' ||
      this.state.description.trim() == '' ||
      this.state.cvrprofileImage == ''
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.allfieldsarerequired,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      this.setState({loading: true});
      var imgs = [];
      if (this.state.cvrprofileImage && this.state.cvrprofileImage.length) {
        for (var i = 0; i < this.state.cvrprofileImage.length; i++) {
          console.log('ppp ' + JSON.stringify(this.state.cvrprofileImage[i]));
          imgs.push({image_data: this.state.cvrprofileImage[i]});
        }
      }

      var payload = {
        post_type: 'POST',
        description: this.state.description,
        years: this.state.year,
        medical_history_image: imgs,
      };
      this.props
        .medical_history(payload)
        .then(resp => {
          this.setState({loading: false});
          if (resp.error && resp.error.code == 0) Actions.pop();
        })
        .catch(() => {
          this.setState({loading: false});
          console.log('error');
        });
    }
  };
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
      this.setState({cvrUploadStatus: true, video_post_url: ''});
      this.state.cvrprofileImage.push('data:image/png;base64,' + image.image);
    }
  };
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  render = () => {
    var vmbg = [{key: 0, section: true, label: Strings.treatmentyear}];
    for (i = 1970; i <= moment().format('YYYY'); i++) {
      vmbg.push({key: i, label: i});
    }

    var imgs = [];
    if (this.state.cvrprofileImage && this.state.cvrprofileImage.length) {
      for (var i = 0; i < this.state.cvrprofileImage.length; i++) {
        imgs.push(
          <Image
            style={{height: 100, width: 100, margin: 3}}
            source={{uri: this.state.cvrprofileImage[i]}}
          />,
        );
      }
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.addmedicalrecord} />
        <ScrollView style={{flex: 1}}>
          <View
            style={{
              borderBottomWidth: 0.5,
              borderColor: AppColors.brand.color,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{paddingLeft: 10, paddingTop: 5}}>
                {Strings.description}
              </Text>
              <Text style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                *
              </Text>
            </View>
            <LblFormInput
              textAlignVertical={'top'}
              lblText={false}
              height={60}
              placeholderTxt={Strings.description}
              lblTxt={Strings.description}
              select_opt={false}
              numberOfLines={2}
              multiline={true}
              value={this.state.description}
              onChangeText={text => {
                this.setState({description: text});
              }}
            />
          </View>
          <View
            style={{
              borderBottomWidth: 0.3,
              borderColor: AppColors.brand.black,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{paddingLeft: 10, paddingTop: 5}}>
                {Strings.treatmentyear}
              </Text>
              <Text style={{paddingLeft: 5, paddingTop: 5, color: 'red'}}>
                *
              </Text>
            </View>
            {/* <ModalPicker
              data={vmbg}
              initValue={Strings.treatmentyear}
              sectionTextStyle={{
                textAlign: 'left',
                color: '#000',
                fontSize: 16,
                fontWeight: 'bold',
              }}
              optionTextStyle={{
                textAlign: 'left',
                color: '#000',
                fontSize: 16,
                fontWeight: 'normal',
              }}
              cancelStyle={{
                backgroundColor: '#F75174',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 50 / 2,
              }}
              cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
              overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
              onChange={option => {
                this.setState({year: option.label.toString()});
              }}>
              <View style={{marginLeft: 5}}>
                <LblFormInput
                  lblText={false}
                  height={50}
                  select_opt={true}
                  value={this.state.year}
                  editable={false}
                />
              </View>
            </ModalPicker> */}
          </View>
          <View style={{margin: 10}}>
            <TouchableOpacity
              onPress={this.pickerImagePressed.bind(this, 'home')}
              style={{
                borderRadius: 10,
                backgroundColor: AppColors.brand.btnColor,
                width: 75,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={[
                  AppStyles.regularFontText,
                  {fontSize: 12, padding: 10, color: AppColors.brand.white},
                ]}>
                {Strings.upload}
              </Text>
            </TouchableOpacity>
          </View>

          {this.state.cvrprofileImage && this.state.cvrprofileImage.length ? (
            <View style={{margin: 10}}>
              <ScrollView horizontal={true}>{imgs}</ScrollView>
            </View>
          ) : null}

          <Button
            style={{padding: 5, backgroundColor: AppColors.brand.success}}
            title={'Save'}
            onPress={this.submit}
            backgroundColor={AppColors.brand.success}
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
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(AddMedicalHistory);
