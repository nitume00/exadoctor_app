/**
 * Add Medicine
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// import ModalPicker from 'react-native-modal-picker';
import {CheckBox} from '@rneui/themed';
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
  medicine_type: UserActions.getmedicine_type,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar,
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
    borderBottomWidth: 2,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class AddMedicine extends Component {
  static componentName = 'AddMedicine';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.uspecialities = [];
    this.state = {
      loading: false,
      userLang: 'en',
      medicinename: '',
      mgml: '',
      dose: '',
      days: '',
      comments: '',
      food_id: 1,
      is_morning: false,
      is_noon: false,
      is_night: false,
      medicine_type_list: [],
      medicine_type: 'default',
      medicines_list: this.props.medicines_list
        ? this.props.medicines_list
        : [],
      medicine_type_id: '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }

  componentDidMount = () => {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.setState({loading: true});
    this.props
      .medicine_type()
      .then(resp => {
        this.setState({loading: false});
        console.log('medicine_type_resp======> ' + JSON.stringify(resp));
        if (resp.error != 'true') {
          var tttt = [];
          for (var i = 0; i < resp.data.length; i++) {
            var temp = resp.data[i];
            temp['key'] = resp.data[i].id;
            temp['label'] = resp.data[i].name;
            tttt.push(temp);
          }
          this.setState({medicine_type_list: tttt});
          console.log(
            'medicine_type_resp======> ' +
              JSON.stringify(this.state.medicine_type_list),
          );
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
        console.log('medicine_type_error======> ' + JSON.stringify(error));
      });
  };

  foodtime = val => {
    if (val == 1) {
      this.setState({food_id: 1});
    } else {
      this.setState({food_id: 2});
    }
  };

  time = val => {
    if (val == 1) {
      var temp = this.state.is_morning;
      this.setState({is_morning: !temp});
    } else if (val == 2) {
      var temp = this.state.is_noon;
      this.setState({is_noon: !temp});
    } else if (val == 3) {
      var temp = this.state.is_night;
      this.setState({is_night: !temp});
    }
  };

  validate = () => {
    let numreg = /^[0-9]+$/;
    if (this.state.medicine_type == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechooseamedicinetype,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } 
    else if (this.state.medicinename == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteramedicinename,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.mgml != '' && !numreg.test(this.state.mgml)) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravalidmgml,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.dose != '' && !numreg.test(this.state.dose)) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravaliddose,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.days != '' && !numreg.test(this.state.days)) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteravaliddays,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (
      this.state.is_morning == false &&
      this.state.is_noon == false &&
      this.state.is_night == false
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleasechoosewhentohave,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.callInvoked == 0) {
        this.callInvoked = 1;
        this.setState({reloadPreviousView: true});
        Actions.pop();
      }
    }
  };

  componentWillUnmount = () => {
    if (this.state.reloadPreviousView) {
      var data = this.state.medicines_list;
      var medicine_list = {};
      medicine_list['type'] = this.state.medicine_type_id;
      medicine_list['medicine_type'] = this.state.medicine_type;
      medicine_list['name'] = this.state.medicinename;
      medicine_list['mgml'] = this.state.mgml;
      medicine_list['dose'] = this.state.dose;
      medicine_list['days'] = this.state.days;
      medicine_list['comments'] = this.state.comments;
      medicine_list['is_before_food'] = this.state.food_id == 1 ? 1 : 0;
      medicine_list['is_after_food'] = this.state.food_id == 2 ? 1 : 0;
      medicine_list['is_morning'] = this.state.is_morning == true ? 1 : 0;
      medicine_list['is_noon'] = this.state.is_noon == true ? 1 : 0;
      medicine_list['is_night'] = this.state.is_night == true ? 1 : 0;
      data.push(medicine_list);
      console.log('reloadViewdata==> ' + JSON.stringify(data));
      this.props.reloadView_medicine(data);
    }
  };

  render = () => {
    console.log(
      'medicinelist == ' + JSON.stringify(this.state.medicine_type_list),
    );
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.addmedicine} />
        <ScrollView style={{flex: 1, backgroundColor: AppColors.brand.primary}}>
          <View style={{flex: 1}}>
            {/* <ModalPicker
              data={this.state.medicine_type_list}
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
                  medicine_type: option.name,
                  medicine_type_id: option.id,
                });
              }}>
              <View style={{marginLeft: 5}}>
                <LblFormInput
                  lblText={false}
                  height={60}
                  placeholderTxt={Strings.type + ' *'}
                  lblTxt={Strings.type + ' *'}
                  select_opt={true}
                  value={this.state.medicine_type}
                  editable={false}
                />
              </View>
            </ModalPicker> */}
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.medicinename + ' *'}
              lblTxt={Strings.medicinename}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.medicinename}
              onChangeText={medicinename => this.setState({medicinename})}
            />
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.mgml}
              lblTxt={Strings.mgml}
              select_opt={false}
              keyboardType={'numeric'}
              autoCapitalize={'sentences'}
              value={this.state.mgml}
              onChangeText={mgml => this.setState({mgml})}
            />
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.dose}
              lblTxt={Strings.dose}
              select_opt={false}
              keyboardType={'numeric'}
              autoCapitalize={'sentences'}
              value={this.state.dose}
              onChangeText={dose => this.setState({dose})}
            />
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.days}
              lblTxt={Strings.days}
              keyboardType={'numeric'}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.days}
              onChangeText={days => this.setState({days})}
            />
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.comments}
              lblTxt={Strings.comments}
              select_opt={false}
              autoCapitalize={'sentences'}
              value={this.state.comments}
              onChangeText={comments => this.setState({comments})}
            />
          </View>
          <Spacer size={20} />
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flex: 0.5}}>
              <CheckBox
                containerStyle={{
                  padding: 0,
                  margin: 0,
                  height: 30,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingTop: 5,
                }}
                textStyle={[
                  AppStyles.regularFontText,
                  {color: AppColors.brand.black},
                ]}
                title={Strings.beforefood}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checked={this.state.food_id == 1 ? true : false}
                onPress={() => this.foodtime(1)}
              />
            </View>
            <View style={{flex: 0.5}}>
              <CheckBox
                containerStyle={{
                  padding: 0,
                  margin: 0,
                  height: 30,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingTop: 5,
                }}
                textStyle={[
                  AppStyles.regularFontText,
                  {color: AppColors.brand.black},
                ]}
                title={Strings.afterfood}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checked={this.state.food_id == 2 ? true : false}
                onPress={() => this.foodtime(2)}
              />
            </View>
          </View>
          <Spacer size={20} />
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flex: 0.3}}>
              <CheckBox
                containerStyle={{
                  padding: 0,
                  margin: 0,
                  height: 30,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingTop: 5,
                }}
                textStyle={[
                  AppStyles.regularFontText,
                  {color: AppColors.brand.black},
                ]}
                title={Strings.morning}
                checked={this.state.is_morning}
                onPress={() => this.time(1)}
              />
            </View>
            <View style={{flex: 0.3}}>
              <CheckBox
                containerStyle={{
                  padding: 0,
                  margin: 0,
                  height: 30,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingTop: 5,
                  width: 100,
                }}
                textStyle={[
                  AppStyles.regularFontText,
                  {color: AppColors.brand.black},
                ]}
                title={Strings.afternoon}
                checked={this.state.is_noon}
                onPress={() => this.time(2)}
              />
            </View>
            <View style={{flex: 0.3}}>
              <CheckBox
                containerStyle={{
                  padding: 0,
                  margin: 0,
                  height: 30,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingTop: 5,
                }}
                textStyle={[
                  AppStyles.regularFontText,
                  {color: AppColors.brand.black},
                ]}
                title={Strings.night}
                checked={this.state.is_night}
                onPress={() => this.time(3)}
              />
            </View>
          </View>
          <Spacer size={40} />
          <Button
            onPress={this.validate}
            title={Strings.add}
            backgroundColor={AppColors.brand.buttonclick}
            fontSize={15}
          />
          <Spacer size={70} />
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
export default connect(mapStateToProps, mapDispatchToProps)(AddMedicine);
