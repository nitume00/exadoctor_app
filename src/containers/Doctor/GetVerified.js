/**
 * Wallet
 *
 *
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';
import NavComponent from '@components/NavComponent.js';
import ImagePicker from 'react-native-image-picker';
import Permissions from 'react-native-permissions';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
import {CheckBox} from '@rneui/themed';
import Loading from '@components/general/Loading';
// Components
import {Spacer, Text, Button, Card, FormInput, LblFormInput} from '@ui/';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  user_me: UserActions.user_me,
  proof_types: UserActions.proof_types,
  user_profiles: UserActions.user_profiles,
  auth: UserActions.auth,
};
import moment from 'moment';

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
});
/* Component ==================================================================== */
class Wallet extends Component {
  static componentName = 'Wallet';
  static propTypes = {
    user_me: PropTypes.func.isRequired,
    proof_types: PropTypes.func.isRequired,
    user_profiles: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.userdata = '';
    this.callInvoked = 0;
    this.state = {
      user: props.user ? props.user : '',
      me: '',
      doctor_proof_url: '',
      id_proof_url: '',
      address_proof_url: '',
      id_proofs: '',
      address_proofs: '',
      selected_id_proof_id: '',
      selected_id_proof_label: '',
      selected_address_proof_id: '',
      selected_address_proof_label: '',
      photopermission: '',
      camerapermission: '',
      storagepermission: '',
      doctor_proof_image: '',
      id_proof_image: '',
      address_proof_image: '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this._refreshData();
    this.site_url = '';
  }
  async _refreshData() {
    this.userdata = await AsyncStorage.getItem('userToken');
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_me();
    this.id_proof_types();
    this.address_proof_types();
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
    if (imgtype === 'doctor_proof') {
      this.setState({
        doctor_proof_image: 'data:image/png;base64,' + image.image,
      });
    }
    if (imgtype === 'id_proof') {
      this.setState({
        id_proof_image: 'data:image/png;base64,' + image.image,
      });
    }
    if (imgtype === 'address_proof') {
      this.setState({
        address_proof_image: 'data:image/png;base64,' + image.image,
      });
    }
    //if(image.image){
    // this.setState({cvrUploadStatus:true,cvrprofileImage: "data:image/png;base64,"+image.image,});
    //
  };

  get_me() {
    if (this.callInvoked == 0) {
      var payload = {
        user_id: this.state.user.id,
        filter: {
          include: {0: 'id_proof', 1: 'address_proof', 2: 'doctor_proof'},
        },
      };
      this.callInvoked = 1;
      this.props
        .user_me(payload)
        .then(resp => {
          if (resp.error.code == 0) {
            let dp = '';
            let ip = '';
            let adp = '';

            if (resp.data.doctor_proof && resp.data.doctor_proof[0]) {
              var md5string =
                'Certificate' + resp.data.doctor_proof[0].id + 'pngoriginal';
              var imagetemp = AppUtil.MD5(md5string);
              dp =
                this.site_url +
                '/images/original/Certificate/' +
                resp.data.doctor_proof[0].id +
                '.' +
                imagetemp +
                '.png';
            }
            if (resp.data.doctor_proof && resp.data.id_proof[0]) {
              var md5string =
                'IdProof' + resp.data.id_proof[0].id + 'pngoriginal';
              var imagetemp = AppUtil.MD5(md5string);
              ip =
                this.site_url +
                '/images/original/IdProof/' +
                resp.data.id_proof[0].id +
                '.' +
                imagetemp +
                '.png';
            }
            if (resp.data.doctor_proof && resp.data.address_proof[0]) {
              var md5string =
                'AddressProof' + resp.data.address_proof[0].id + 'pngoriginal';
              var imagetemp = AppUtil.MD5(md5string);
              adp =
                this.site_url +
                '/images/original/AddressProof/' +
                resp.data.address_proof[0].id +
                '.' +
                imagetemp +
                '.png';
            }
            this.setState({
              me: resp.data,
              address_proof_url: adp,
              id_proof_url: ip,
              doctor_proof_url: dp,
            });
          }
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  id_proof_types() {
    var payload = {
      user_id: this.state.user.id,
      filter: {where: {is_address_proof: 0}},
    };
    this.props
      .proof_types(payload)
      .then(resp => {
        if (resp.error.code == 0) {
          console.log('tttt ff ' + JSON.stringify(resp.data));
          this.setState({id_proofs: resp.data});
        }
      })
      .catch(() => {
        console.log('error');
      });
  }
  address_proof_types() {
    var payload = {
      user_id: this.state.user.id,
      filter: {where: {is_address_proof: 1}},
    };
    this.props
      .proof_types(payload)
      .then(resp => {
        if (resp.error.code == 0) {
          console.log('tttt ss ' + JSON.stringify(resp.data));
          this.setState({address_proofs: resp.data});
        }
      })
      .catch(() => {
        console.log('error');
      });
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide.bind(this),
    );
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({scrollSpacer: 200});
  }

  _keyboardDidHide() {
    this.setState({scrollSpacer: 50});
  }

  webView = (url, title) => {
    if (url !== '') {
      setTimeout(() => {
        Actions.Pages({url, title});
      }, 1000);
    }
  };

  selection = (types, title, ptype) => {
    if (types && types.length)
      Actions.selection({types, title, reload: this.reload, ptype});
  };

  reload = (ptype, id, label) => {
    if (ptype === 'id') {
      this.setState({
        selected_id_proof_id: id,
        selected_id_proof_label: label,
      });
    } else {
      this.setState({
        selected_address_proof_id: id,
        selected_address_proof_label: label,
      });
    }
  };

  submitProof = () => {
    if (this.state.doctor_proof_image == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.selectdoctorproof,
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
    } else if (this.state.selected_id_proof_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseselectanidtype,
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
    } else if (this.state.id_proof_image == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.selectidproof,
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
    } else if (this.state.selected_address_proof_id == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseselectadoctype,
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
    } else if (this.state.address_proof_image == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.selectaddressproof,
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
      var payload = {
        id_proof_type_id: this.state.selected_id_proof_id,
        address_proof_type_id: this.state.selected_address_proof_id,
        is_submitted_proof_document: 1,
        id_proofs: [{image_data: this.state.id_proof_image}],
        address_proofs: [{image_data: this.state.address_proof_image}],
        certificate_proofs: [{image_data: this.state.doctor_proof_image}],
      };
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
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.getverified} />
        <ScrollView style={{flex: 1, margin: 10, marginBottom: 0}}>
          <Text style={AppStyles.boldedFontText}>
            {Strings.getverfiedheader}
          </Text>
          <Text
            style={[AppStyles.regularFontText, {fontSize: 12, marginTop: 5}]}>
            {Strings.getverifieddesc}
          </Text>
          <View style={{height: 15}} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={[
                AppStyles.regularFontText,
                {fontSize: 12, marginTop: 10, flex: 0.55},
              ]}>
              Your Account Status
            </Text>
            <View style={{flex: 0.45, justifyContent: 'flex-start'}}>
              {this.state.me && this.state.me.is_proof_verified === 1 ? (
                <Button
                  style={{backgroundColor: '#34d777', borderRadius: 10}}
                  title={Strings.verified}
                  backgroundColor={'#34d777'}
                  fontSize={12}
                />
              ) : (
                <View>
                  {this.state.me &&
                  this.state.me.is_submitted_proof_document === 1 ? (
                    <Button
                      style={{
                        backgroundColor: AppColors.brand.navbar,
                        borderRadius: 10,
                      }}
                      title={Strings.waitingforapproval}
                      backgroundColor={AppColors.brand.navbar}
                      fontSize={12}
                    />
                  ) : (
                    <Button
                      style={{
                        backgroundColor: AppColors.brand.navbar,
                        borderRadius: 10,
                      }}
                      title={Strings.notyetsubmitted}
                      backgroundColor={AppColors.brand.navbar}
                      fontSize={12}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
          <View style={{height: 15}} />
          {this.state.me && this.state.me.is_submitted_proof_document == 1 ? (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{flex: 0.65}}>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.doctorcertifications}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.doctorcertdesc})
                </Text>
              </View>
              {this.state.me &&
              this.state.me.is_submitted_proof_document == 1 &&
              this.state.me.doctor_proof &&
              this.state.me.doctor_proof[0] ? (
                <View
                  style={{
                    flex: 0.15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={this.webView.bind(
                      this,
                      this.state.doctor_proof_url,
                      'Certification Proof',
                    )}>
                    <Text
                      style={[
                        AppStyles.boldedFontText,
                        {fontSize: 12, textDecorationLine: 'underline'},
                      ]}>
                      {Strings.view}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {this.state.me &&
              this.state.me.is_submitted_proof_document === 1 &&
              this.state.me.is_proof_verified === 1 &&
              this.state.me.doctor_proof &&
              this.state.me.doctor_proof[0] ? (
                <View
                  style={{
                    flex: 0.2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      AppStyles.boldedFontText,
                      {fontSize: 12, color: AppColors.brand.success},
                    ]}>
                    {Strings.verified}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
              }}>
              <View>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.doctorcertifications}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.doctorcertdesc})
                </Text>
              </View>
              <View style={{height: 15}} />
              <Button
                title={Strings.upload}
                onPress={this.pickerImagePressed.bind(this, 'doctor_proof')}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
            </View>
          )}

          <View style={{height: 15}} />
          {this.state.me && this.state.me.is_submitted_proof_document === 1 ? (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{flex: 0.65}}>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.identityproof}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.identityproofdesc})
                </Text>
              </View>
              {this.state.me &&
              this.state.me.is_submitted_proof_document === 1 &&
              this.state.me.id_proof &&
              this.state.me.id_proof[0] ? (
                <View
                  style={{
                    flex: 0.15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={this.webView.bind(
                      this,
                      this.state.id_proof_url,
                      'ID Proof',
                    )}>
                    <Text
                      style={[
                        AppStyles.boldedFontText,
                        {fontSize: 12, textDecorationLine: 'underline'},
                      ]}>
                      {Strings.view}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {this.state.me &&
              this.state.me.is_submitted_proof_document === 1 &&
              this.state.me.is_proof_verified === 1 &&
              this.state.me.id_proof &&
              this.state.me.id_proof[0] ? (
                <View
                  style={{
                    flex: 0.2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      AppStyles.boldedFontText,
                      {fontSize: 12, color: AppColors.brand.success},
                    ]}>
                    {Strings.verified}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
              }}>
              <View>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.identityproof}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.identityproofdesc})
                </Text>
              </View>
              <View style={{height: 15}} />
              <Button
                title={
                  this.state.selected_id_proof_label
                    ? this.state.selected_id_proof_label
                    : Strings.pleaseselectanidtype
                }
                onPress={this.selection.bind(
                  this,
                  this.state.id_proofs,
                  Strings.idtypes,
                  'id',
                )}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
              <View style={{height: 15}} />
              <Button
                title={Strings.upload}
                onPress={this.pickerImagePressed.bind(this, 'id_proof')}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
            </View>
          )}

          <View style={{height: 15}} />

          {this.state.me && this.state.me.is_submitted_proof_document === 1 ? (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{flex: 0.65}}>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.addressproof}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.addressproofdesc})
                </Text>
              </View>
              {this.state.me &&
              this.state.me.is_submitted_proof_document === 1 &&
              this.state.me.address_proof &&
              this.state.me.address_proof[0] ? (
                <View
                  style={{
                    flex: 0.15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={this.webView.bind(
                      this,
                      this.state.address_proof_url,
                      'Address Proof',
                    )}>
                    <Text
                      style={[
                        AppStyles.boldedFontText,
                        {fontSize: 12, textDecorationLine: 'underline'},
                      ]}>
                      {Strings.view}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {this.state.me &&
              this.state.me.is_submitted_proof_document === 1 &&
              this.state.me.is_proof_verified === 1 &&
              this.state.me.address_proof &&
              this.state.me.address_proof[0] ? (
                <View
                  style={{
                    flex: 0.2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      AppStyles.boldedFontText,
                      {fontSize: 12, color: AppColors.brand.success},
                    ]}>
                    {Strings.verified}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View
              style={{
                padding: 10,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: AppColors.brand.navbar,
              }}>
              <View style={{flex: 0.7}}>
                <Text style={AppStyles.boldedFontText}>
                  {Strings.addressproof}
                </Text>
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {fontSize: 10, marginTop: 3},
                  ]}>
                  ({Strings.addressproofdesc})
                </Text>
              </View>
              <View style={{height: 15}} />
              <Button
                title={
                  this.state.selected_address_proof_label
                    ? this.state.selected_address_proof_label
                    : Strings.pleaseselectadoctype
                }
                onPress={this.selection.bind(
                  this,
                  this.state.address_proofs,
                  Strings.documenttypes,
                  'address',
                )}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
              <View style={{height: 15}} />
              <Button
                title={Strings.upload}
                onPress={this.pickerImagePressed.bind(this, 'address_proof')}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
            </View>
          )}
          <View style={{height: 15}} />
          {this.state.me && this.state.me.is_submitted_proof_document === 0 ? (
            <Button
              title={Strings.submit}
              onPress={this.submitProof}
              backgroundColor={AppColors.brand.btnColor}
              fontSize={14}
            />
          ) : null}
          <View style={{height: 15}} />
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
export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
