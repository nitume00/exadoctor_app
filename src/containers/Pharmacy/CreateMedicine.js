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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import NavComponent from '@components/NavComponent.js';
// import ModalPicker from 'react-native-modal-picker';
import InternetConnection from '@components/InternetConnection.js';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-picker';
import Loading from '@components/general/Loading';
import Permissions from 'react-native-permissions';

// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';

// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  getmedicine_type: UserActions.getmedicine_type,
  getmedicine_categories: UserActions.getmedicine_categories,
  getmedicine_manufacturer: UserActions.getmedicine_manufacturer,
  getmedicine_unit: UserActions.getmedicine_unit,
  createmedicine: UserActions.createmedicine,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  headertitle: {
    flex: 1,
    fontSize: 18,
    paddingTop: 10,
    paddingLeft: 5,
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
class CreateMedicine extends Component {
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.site_url = '';
    this.state = {
      loading: false,
      medicine_id:
        props.medicine_details && props.medicine_details.id
          ? props.medicine_details.id
          : '',
      name:
        props.medicine_details && props.medicine_details.name
          ? props.medicine_details.name
          : '',
      genericname:
        props.medicine_details && props.medicine_details.generic_name
          ? props.medicine_details.generic_name
          : '',
      description:
        props.medicine_details && props.medicine_details.description
          ? props.medicine_details.description
          : '',
      sell_price:
        props.medicine_details && props.medicine_details.sell_price
          ? props.medicine_details.sell_price
          : '',
      manufacturer_price:
        props.medicine_details && props.medicine_details.manufacturer_price
          ? props.medicine_details.manufacturer_price
          : '',
      box_size:
        props.medicine_details && props.medicine_details.box_size
          ? props.medicine_details.box_size.toString()
          : '',
      category:
        props.medicine_details && props.medicine_details.medicine_category
          ? props.medicine_details.medicine_category
          : {},
      type:
        props.medicine_details && props.medicine_details.medicine_type
          ? props.medicine_details.medicine_type
          : {},
      unit:
        props.medicine_details && props.medicine_details.medicine_unit
          ? props.medicine_details.medicine_unit
          : {},
      manufacturer:
        props.medicine_details && props.medicine_details.manufacturer
          ? props.medicine_details.manufacturer
          : {},
      tax_val:
        props.medicine_details && props.medicine_details.tax
          ? props.medicine_details.tax.toString()
          : '',
      category_list: [],
      unit_list: [],
      manufacturer_list: [],
      type_list: [],
      tax_list: [
        {key: 1, label: '5'},
        {key: 2, label: '11.5'},
      ],
      type_name: '',
      category_name: '',
      manufacturer_name: '',
      medicine_category_id:
        props.medicine_details && props.medicine_details.medicine_category
          ? props.medicine_details.medicine_category.id
          : '',
      medicine_unit_id:
        props.medicine_details && props.medicine_details.medicine_unit
          ? props.medicine_details.medicine_unit.id
          : '',
      medicine_type_id:
        props.medicine_details && props.medicine_details.medicine_type
          ? props.medicine_details.medicine_type.id
          : '',
      reloadPreviousView: false,
      user: props.user ? props.user : '',
      camerapermission: '',
      photopermission: '',
      storagepermission: Platform.OS == 'ios' ? '1' : '',
      cvrUploadStatus: false,
      cvrprofileImage: AppConfig.noimage,
      attachment:
        props.medicine_details && props.medicine_details.attachment
          ? props.medicine_details.attachment
          : '',
    };
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.getmedicine_type();
    this.getmedicine_categories();
    this.getmedicine_manufacturer();
    this.getmedicine_unit();
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
  }

  componentWillUnmount = () => {
    if (this.props.reloadView) {
      this.props.reloadView();
    }
  };

  getmedicine_type = () => {
    this.setState({loading: true});
    this.props
      .getmedicine_type({filter: '{"skip":0,"limit":1000}'})
      .then(resp => {
        this.setState({loading: false});
        console.log('getmedicine_type_resp======> ' + JSON.stringify(resp));
        var tttt = [];
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            var temp = resp.data[i];
            temp['key'] = resp.data[i].id;
            temp['label'] = resp.data[i].name;
            tttt.push(temp);
            if (this.state.type.id == resp.data[i].id) {
              this.setState({type_name: this.state.type.name});
            }
          }
          this.setState({type_list: tttt});
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log('getmedicine_type_error======> ' + JSON.stringify(error));
      });
  };

  getmedicine_categories = () => {
    this.setState({loading: true});
    this.props
      .getmedicine_categories({filter: '{"skip":0,"limit":1000}'})
      .then(resp => {
        this.setState({loading: false});
        console.log(
          'getmedicine_categories_resp======> ' + JSON.stringify(resp),
        );
        var tttt = [];
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            var temp = resp.data[i];
            temp['key'] = resp.data[i].id;
            temp['label'] = resp.data[i].name;
            tttt.push(temp);
            if (this.state.category.id == resp.data[i].id) {
              this.setState({category_name: this.state.category.name});
            }
          }
          this.setState({category_list: tttt});
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log(
          'getmedicine_categories_error======> ' + JSON.stringify(error),
        );
      });
  };

  getmedicine_manufacturer = () => {
    this.setState({loading: true});
    this.props
      .getmedicine_manufacturer({filter: '{"skip":0,"limit":1000}'})
      .then(resp => {
        this.setState({loading: false});
        console.log(
          'getmedicine_manufacturer_resp======> ' + JSON.stringify(resp),
        );
        var tttt = [];
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            var temp = resp.data[i];
            temp['key'] = resp.data[i].id;
            temp['label'] = resp.data[i].name;
            tttt.push(temp);
            if (this.state.manufacturer.id == resp.data[i].id) {
              this.setState({manufacturer_name: this.state.manufacturer.name});
            }
          }
          this.setState({manufacturer_list: tttt});
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log(
          'getmedicine_manufacturer_error======> ' + JSON.stringify(error),
        );
      });
  };

  getmedicine_unit = () => {
    this.setState({loading: true});
    this.props
      .getmedicine_unit({filter: '{"skip":0,"limit":1000}'})
      .then(resp => {
        this.setState({loading: false});
        console.log('getmedicine_unit_resp======> ' + JSON.stringify(resp));
        var tttt = [];
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            var temp = resp.data[i];
            temp['key'] = resp.data[i].id;
            temp['label'] = resp.data[i].name;
            tttt.push(temp);
            if (this.state.unit.id == resp.data[i].id) {
              this.setState({unit_name: this.state.unit.name});
            }
          }
          this.setState({unit_list: tttt});
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log('getmedicine_unit_error======> ' + JSON.stringify(error));
      });
  };

  submit = () => {
    if (this.state.name == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenternameofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.genericname == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentergenericnameofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.medicine_category_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosecategoryofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.medicine_type_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosetypeofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.tax_val == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosetaxforthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.sell_price == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentersellingpriceofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (AppUtil.validateInt(this.state.sell_price) == false) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidsellingprice,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.manufacturer_price == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentermanufacturerpriceofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (AppUtil.validateInt(this.state.manufacturer_price) == false) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidmanufacturerprice,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.medicine_unit_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosetaxforthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.box_size == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterboxsizeofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (AppUtil.validateInt(this.state.box_size) == false) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidboxsize,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.manufacturer_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosemanufacturerofthemedicine,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.callInvoked == 0) {
        this.setState({loading: true});
        this.callInvoked = 1;
        var payload = {};
        payload['name'] = this.state.name;
        payload['generic_name'] = this.state.genericname;
        payload['description'] = this.state.description;
        payload['medicine_category_id'] = this.state.medicine_category_id;
        payload['tax'] = this.state.tax_val;
        payload['sell_price'] = this.state.sell_price;
        payload['manufacturer_price'] = this.state.manufacturer_price;
        payload['medicine_unit_id'] = this.state.medicine_unit_id;
        payload['box_size'] = this.state.box_size;
        payload['manufacturer_id'] = this.state.manufacturer_id;
        payload['medicine_type_id'] = this.state.medicine_type_id;
        if (this.props.editornew != 'edit') {
          payload['is_post'] = 1;
          payload['image'] = null;
          payload['ekta9a'] = null;
        } else {
          payload['is_put'] = 1;
          payload['id'] = this.props.medicine_details.id;
          payload['created_at'] = this.props.medicine_details.created_at;
          payload['updated_at'] = this.props.medicine_details.updated_at;
          payload['medicine_unit'] = this.state.unit;
          payload['attachment'] = this.state.cvrprofileImage;
          payload['image'] = this.state.cvrprofileImage;
          payload['is_active'] = 1; //this.state.is_active;
        }
        this.props
          .createmedicine({body: payload, token: this.state.user.userToken})
          .then(resp => {
            this.setState({loading: false});
            this.callInvoked = 0;
            if (resp.error && resp.error.code == 0) {
              this.setState({reloadPreviousView: true});
              Actions.pop();
            } else {
              Alert.alert(
                AppConfig.appName,
                resp.error.message,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
              );
            }
          })
          .catch(error => {
            this.callInvoked = 0;
            this.setState({loading: false});
            console.log(
              'createmedicine_error======> ' + JSON.stringify(error) + '\n',
            );
          });
      }
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
    } else if (Platform.OS != 'ios' && this.state.storagepermission === '') {
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

  render = () => {
    console.log('yyyyy=>' + this.state.tax + '==' + this.state.box_size);
    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={
            this.state.medicine_id
              ? Strings.editmedicine
              : Strings.addnewmedicine
          }
        />
        <ScrollView style={{flex: 1}}>
          <View style={{flex: 1, marginBottom: 200}}>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.name + '*'}
                lblTxt={Strings.name}
                select_opt={false}
                value={this.state.name}
                onChangeText={name => this.setState({name})}
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Generic Name
                        </Text>*/}
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.genericname + '*'}
                lblTxt={Strings.genericname}
                select_opt={false}
                value={this.state.genericname}
                onChangeText={genericname => this.setState({genericname})}
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Description
                        </Text>*/}
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.description}
                lblTxt={Strings.description}
                select_opt={false}
                value={this.state.description}
                onChangeText={description => this.setState({description})}
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Category
                        </Text>*/}
              {/* <ModalPicker
                data={this.state.category_list}
                initValue={Strings.category}
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
                  color: '#000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({
                    category_name: option.label,
                    medicine_category_id: option.id,
                  });
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.category + '*'}
                    lblTxt={Strings.category}
                    select_opt={true}
                    value={this.state.category_name}
                    editable={false}
                  />
                </View>
              </ModalPicker> */}
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Type
                        </Text>*/}
              {/* <ModalPicker
                data={this.state.type_list}
                initValue={Strings.type}
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
                  color: '#000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({
                    type_name: option.label,
                    medicine_type_id: option.id,
                  });
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.type + '*'}
                    lblTxt={Strings.type}
                    select_opt={true}
                    value={this.state.type_name}
                    editable={false}
                  />
                </View>
              </ModalPicker> */}
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Tax
                        </Text>*/}
              {/* <ModalPicker
                data={this.state.tax_list}
                initValue={Strings.tax}
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
                  color: '#000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({tax_val: option.label});
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.tax + '*'}
                    lblTxt={Strings.tax}
                    select_opt={true}
                    value={this.state.tax_val}
                    editable={false}
                  />
                </View>
              </ModalPicker> */}
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Sell Price
                        </Text>*/}
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt="Sell Price*"
                lblTxt="Sell Price"
                select_opt={false}
                value={this.state.sell_price}
                onChangeText={sell_price => this.setState({sell_price})}
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Manufacturer Price
                        </Text>*/}
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt="Manufacturer Price*"
                lblTxt="Manufacturer Price"
                select_opt={false}
                value={this.state.manufacturer_price}
                onChangeText={manufacturer_price =>
                  this.setState({manufacturer_price})
                }
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Unit
                        </Text>*/}
              {/* <ModalPicker
                data={this.state.unit_list}
                initValue={Strings.unit}
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
                  color: '#000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({
                    unit_name: option.label,
                    unit: option,
                    medicine_unit_id: option.id,
                  });
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.unit + '*'}
                    lblTxt={Strings.unit}
                    select_opt={true}
                    value={this.state.unit_name}
                    editable={false}
                  />
                </View>
              </ModalPicker> */}
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Box Size
                        </Text>*/}
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.boxsize + '*'}
                lblTxt={Strings.boxsize}
                select_opt={false}
                value={this.state.box_size}
                onChangeText={box_size => this.setState({box_size})}
              />
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Manufacturer
                        </Text>*/}
              {/* <ModalPicker
                data={this.state.manufacturer_list}
                initValue={Strings.manufacturer}
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
                  color: '#000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({
                    manufacturer_name: option.label,
                    manufacturer_id: option.id,
                  });
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.manufacturer + '*'}
                    lblTxt={Strings.manufacturer}
                    select_opt={true}
                    value={this.state.manufacturer_name}
                    editable={false}
                  />
                </View>
              </ModalPicker> */}
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 10}}>
              {/*<Text style = {[styles.headertitle]}>
                            Image
                        </Text>*/}
              <TouchableOpacity
                style={{
                  marginLeft: 5,
                  marginRight: 5,
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={this.pickerImagePressed.bind(this, 'home')}>
                <Image
                  source={{uri: this.state.cvrprofileImage}}
                  style={{marginLeft: 5, flex: 0.1, height: 30, width: 10}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'center',
                    padding: 10,
                    flex: 0.9,
                  }}>
                  {Strings.chooseimage}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.submit();
              }}
              style={{backgroundColor: AppColors.brand.green, marginTop: 10}}>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                  color: 'white',
                  padding: 10,
                }}>
                {Strings.submit}
              </Text>
            </TouchableOpacity>
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
export default connect(mapStateToProps, mapDispatchToProps)(CreateMedicine);
