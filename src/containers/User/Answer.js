/**
 * Answer for Question
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
import {AppConfig} from '@constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    specialities: state.user.specialities,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  questions: UserActions.questions,
  answers: UserActions.answers,
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
class Answer extends Component {
  static componentName = 'Answer';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      question_data: props.question_data ? props.question_data : '',
      askaquestion: props.question_data ? props.question_data.question : '',
      question_id: props.question_data ? props.question_data.id : '',
      answer_data: props.answer_data ? props.answer_data : '',
      answer_id:
        props.answer_data && props.answer_data.id ? props.answer_data.id : '',
      txtanswer:
        props.answer_data && props.answer_data.answer
          ? props.answer_data.answer
          : '',
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
    if (this.props.reload) this.props.reload();
  }
  submitAnswer = () => {
    if (this.state.txtanswer.trim() == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.allfieldsarerequired,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      this.setState({loading: true});
      var payload = {id: this.state.answer_id, answer: this.state.txtanswer};
      var p = {filter: payload, post_type: 'PUT'};
      if (this.state.answer_id == '') {
        payload = {
          question_id: this.state.question_id,
          answer: this.state.txtanswer,
        };
        p = {filter: payload, post_type: 'POST'};
      }
      this.props
        .answers(p)
        .then(resp => {
          this.setState({loading: false});
          console.log('resp ' + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) Actions.pop();
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
        <NavComponent
          backArrow={true}
          title={this.state.answer_id ? Strings.editanswer : Strings.addanswer}
        />
        <ScrollView style={{flex: 1}}>
          <View style={{marginLeft: 10, marginRight: 10, marginTop: 30}}>
            <Text>
              <Text style={{fontWeight: 'bold'}}>{Strings.q}: </Text>
              {this.state.askaquestion}
            </Text>
            <View style={styles.inputBlock}>
              <LblFormInput
                numberOfLines={10}
                multiline={true}
                lblText={false}
                height={100}
                placeholderTxt={Strings.answer}
                lblTxt={Strings.answer}
                select_opt={false}
                autoCapitalize={'sentences'}
                value={this.state.txtanswer}
                onChangeText={txtanswer => this.setState({txtanswer})}
              />
            </View>
          </View>
          <Button
            style={{padding: 5, backgroundColor: '#34d777'}}
            title={'Save'}
            onPress={this.submitAnswer}
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
export default connect(mapStateToProps, mapDispatchToProps)(Answer);
