/**
 * Education List
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ListView,
  Alert,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import DatePicker from 'react-native-datepicker';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
import Loading from '@components/general/Loading';
// import ModalPicker from 'react-native-modal-picker';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
    specialities: state.user.specialities,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  questions: UserActions.questions,
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
    borderBottomWidth: 0.3,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class Education extends Component {
  static componentName = 'Education';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      specialities: props.specialities ? props.specialities : '',
      speciality_id: props.question_data
        ? props.question_data.specialty.id
        : '',
      speciality_lbl: props.question_data
        ? Strings.lblspecialities[props.question_data.specialty.id]
        : '',
      question_data: props.question_data ? props.question_data : '',
      askaquestion: props.question_data ? props.question_data.question : '',
      question_id: props.question_data ? props.question_data.id : '',
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  componentWillUnmount() {
    console.log('callbackcame 11 ');
    if (this.props.reload) this.props.reload();
  }
  submit = () => {
    if (
      this.state.speciality_id == '' ||
      this.state.askaquestion.trim() == ''
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.allfieldsarerequired,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.callInvoked == 0) {
        this.callInvoked = 1;
        this.setState({loading: true});
        if (this.state.question_id) {
          var payload = {
            id: this.state.question_id,
            specialty_id: this.state.speciality_id,
            question: this.state.askaquestion,
            is_active: 1,
          };
          this.props
            .questions({filter: payload, post_type: 'PUT'})
            .then(resp => {
              this.setState({loading: false});
              this.callInvoked = 0;
              console.log('resp ' + JSON.stringify(resp));
              if (resp.error && resp.error.code == 0) Actions.pop();
            })
            .catch(() => {
              this.callInvoked = 0;
              this.setState({loading: false});
              console.log('error');
            });
        } else {
          var payload = {
            specialty_id: this.state.speciality_id,
            question: this.state.askaquestion,
            is_active: 1,
          };
          this.props
            .questions({filter: payload, post_type: 'POST'})
            .then(resp => {
              this.setState({loading: false});
              this.callInvoked = 0;
              console.log('resp ' + JSON.stringify(resp));
              if (resp.error && resp.error.code == 0) Actions.pop();
            })
            .catch(() => {
              this.callInvoked = 0;
              this.setState({loading: false});
              console.log('error');
            });
        }
      }
    }
  };
  render = () => {
    var vmspecialities = [
      {key: 0, section: true, label: Strings.choosespeciality},
    ];
    if (this.state.specialities) {
      var carrayspecialities = this.state.specialities;
      Object.keys(carrayspecialities).forEach(function (key) {
        var lbl = carrayspecialities[key].name;
        vmspecialities.push({key: carrayspecialities[key].id, label: lbl});
      });
    }
    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={
            this.state.question_id ? Strings.editquestion : Strings.addquestion
          }
        />
        <ScrollView style={{flex: 1}}>
          <View style={{marginLeft: 10, marginRight: 10, marginTop: 30}}>
            <View
              style={{
                borderBottomWidth: 0.3,
                borderColor: AppColors.brand.black,
              }}>
              {/* <ModalPicker
                data={vmspecialities}
                initValue={Strings.speciality}
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
                  this.setState({
                    speciality_lbl: option.label,
                    speciality_id: `${option.key}`,
                  });
                }}>
                <LblFormInput
                  lblText={false}
                  height={60}
                  placeholderTxt={Strings.speciality}
                  lblTxt={Strings.speciality}
                  select_opt={true}
                  value={this.state.speciality_lbl}
                  editable={false}
                />
              </ModalPicker> */}
            </View>
            <View style={styles.inputBlock}>
              <LblFormInput
                numberOfLines={5}
                multiline={true}
                lblText={false}
                height={60}
                placeholderTxt={Strings.askaquestion}
                lblTxt={Strings.askaquestion}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.askaquestion}
                onChangeText={askaquestion => this.setState({askaquestion})}
              />
            </View>
          </View>
          <Button
            style={{padding: 5, backgroundColor: '#34d777'}}
            title={'Save'}
            onPress={this.submit}
            backgroundColor={'#34d777'}
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
export default connect(mapStateToProps, mapDispatchToProps)(Education);
