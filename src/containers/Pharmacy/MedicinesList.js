/**
 * Medicines List Screen
 *  - Entry screen for all authentication
 *  - User can tap to login, forget password, signup...
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, {Component} from 'react';
import {
  View,
  Image,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import NavComponent from '@components/NavComponent.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Consts and Libs
import {AppConfig} from '@constants/';
import {AppStyles, AppSizes, AppColors} from '@theme/';
// Components
import {Spacer, Text, Button} from '@ui/';
import {Icon} from '@rneui/themed';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import AppUtil from '@lib/util';
import Strings from '@lib/string.js';

import Loading from '@components/general/Loading';
import InternetConnection from '@components/InternetConnection.js';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  getmedicines: UserActions.getmedicines,
  createmedicine: UserActions.createmedicine,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  newlogo: {
    height: 50,
    width: 50,
  },
  newUserName: {
    textAlign: 'left',
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  userName: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  textBlue: {
    color: '#24c9ff',
    fontWeight: '600',
    fontSize: 16,
  },
});

/* Component ==================================================================== */
class MedicinesList extends Component {
  static componentName = 'MedicinesList';
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      nodata: 0,
      dataList: [],
      user: props.user ? props.user : '',
      cvrprofileImage: AppConfig.noimage,
      attachment: '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.site_url = '';
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.setState({loading: true});
    Actions.refresh({renderRightButton: this.renderRightButton});
    this.getmedicine();
  }

  getmedicine = () => {
    this.props
      .getmedicines({
        filter:
          '{"include":{"0":"medicine_category","1":"medicine_type","2":"medicine_unit","3":"manufacturer","4":"attachment"},"skip":0,"limit":"10","order":"id DESC"}',
      })
      .then(resp => {
        this.setState({loading: false});
        console.log('getmedicines_resp=====> ' + JSON.stringify(resp));
        if (resp.error.code == 0 && resp.data) {
          this.setState({dataList: resp.data, nodata: 1});
        } else {
          Alert.alert(
            AppConfig.appName,
            resp.error.message,
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
        }
      })
      .catch(error => {
        this.setState({loading: false});
        console.log('getmedicines_error=====> ' + JSON.stringify(error));
      });
  };

  renderRightButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          Actions.createMedicine({
            reloadView: this.reloadView,
            editornew: 'new',
          });
        }}>
        <Image
          style={{resizeMode: 'center', height: 20, width: 20}}
          source={require('../../images/edit_pro.png')}
        />
      </TouchableOpacity>
    );
  };

  editmed = data => {
    Actions.createMedicine({
      reloadView: this.reloadView,
      medicine_details: data,
      editornew: 'edit',
    });
  };

  deletemed = data => {
    Alert.alert(
      AppConfig.appName,
      Strings.areyousurewanttodelete,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
        {
          text: 'OK',
          onPress: () => {
            this.setState({loading: true});
            var payload = {};
            payload['id'] = data.id;
            payload['is_delete'] = 1;
            this.props
              .createmedicine({body: payload, token: this.state.user.userToken})
              .then(resp => {
                this.setState({loading: false});
                console.log(
                  'deletemed_createmedicine_resp======> ' +
                    JSON.stringify(resp),
                );
                if (resp.error && resp.error.code == 0) {
                  if (resp.status == 'success') {
                    this.setState({dataList: [], nodata: 0});
                    this.getmedicine();
                  }
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
                this.setState({loading: false});
                console.log(
                  'deletemed_createmedicine_error======> ' +
                    JSON.stringify(error),
                );
              });
          },
        },
      ],
      {cancelable: false},
    );
  };
  add = () => {
    Actions.createMedicine({reloadView: this.reloadView});
  };
  reloadView = data => {
    this.setState({dataList: [], nodata: 0});
    console.log('reloadView_data=====> ' + JSON.stringify(data));
    this.getmedicine();
  };

  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var imageurl = '';
    if (data.attachment && data.attachment.filename) {
      var md5string = 'UserProfile' + data.attachment.id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/UserProfile/' +
        data.attachment.id +
        '.' +
        imagetemp +
        '.png';
      console.log('updateImagetoServer 111' + JSON.stringify(imageurl));
    }
    return (
      <View
        style={{
          flex: 1,
          margin: 10,
          borderWidth: 1,
          borderColor: AppColors.brand.navbar,
          borderRadius: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            paddingTop: 10,
            paddingBottom: 10,
          }}>
          <View
            style={{
              flex: 0.15,
              flexDirection: 'column',
              marginLeft: 5,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            {data.attachment && data.attachment.filename ? (
              <Image source={{uri: imageurl}} style={[styles.newlogo]} />
            ) : (
              <Image
                source={require('../../images/medicine.png')}
                style={[styles.newlogo]}
              />
            )}
          </View>
          <View
            style={{
              flex: 0.85,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.name + ': ' + data.name}{' '}
                </Text>
              </View>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.sellprice + ': ' + data.sell_price}{' '}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', flex: 1, marginTop: 10}}>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.unit + ': ' + data.medicine_unit.name}{' '}
                </Text>
              </View>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.type + ': ' + data.medicine_type.name}{' '}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', flex: 1, marginTop: 10}}>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.tax + '(%): ' + data.tax}{' '}
                </Text>
              </View>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.boxsize + ': ' + data.box_size}{' '}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', flex: 1, marginTop: 10}}>
              <View style={{flex: 0.5}}>
                <Text style={[styles.newUserName]}>
                  {' '}
                  {Strings.mfprice + ': ' + data.manufacturer_price}{' '}
                </Text>
              </View>
              <View style={{flex: 0.5}}>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => {
                      this.deletemed(data);
                    }}>
                    <Icon name="delete" color="#f9abaa" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{marginLeft: 5}}
                    onPress={() => {
                      this.editmed(data);
                    }}>
                    <Icon name="edit" color="#34d777" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: AppColors.brand.primary}}>
        <NavComponent
          backArrow={true}
          title={Strings.medicinelist}
          rightBarAdd={true}
          onRightNavPress={this.add}
        />
        <View style={{flex: 1}}>
          {this.state.nodata == 1 ? (
            <View>
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
                    {Strings.nodata}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[AppStyles.regularFontText]}>{Strings.loading}</Text>
            </View>
          )}
        </View>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  }
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(MedicinesList);
