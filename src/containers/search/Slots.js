import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ListView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import Strings from '@lib/string.js';
import {AppStyles, AppSizes, AppColors} from '@theme/';
import {Spacer, Text, Button, Card, FormInput} from '@ui/';
var moment = require('moment');
const mapStateToProps = state => {
  return {user_data: state.user.user_data};
};
const mapDispatchToProps = {
  appointment_settings: UserActions.appointment_settings,
};

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
class Slots extends Component {
  static propTypes = {
    appointment_settings: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    console.log(
      'appointment_settings www ' + JSON.stringify(props.appointment_id),
    );
    this.state = {
      appointment_id: props.appointment_id ? props.appointment_id : 0,
      view_slot_week: props.view_slot_week ? props.view_slot_week : 0,
      slot_data: [],
      current_date: props.current_date ? props.current_date : 0,
      current_day: props.current_day ? props.current_day : 0,
      doctor_data: props.doctor_data ? props.doctor_data : '',
      branch_data: props.branch_data ? props.branch_data : '',
      reschedule_id: props.reschedule_id ? props.reschedule_id : '',
    };
    console.log('reschedule constructor');
    console.log('appointment_settings current_day -----------------');
  }
  componentWillReceiveProps(props) {
    console.log('reschedule componentWillReceiveProps');
    console.log('appointment_settings current_day -----------------');
    console.log('appointment_settings current_day ---' + JSON.stringify(props));
    if (this.state.view_slot_week != props.view_slot_week)
      this.getSlots(props.view_slot_week);
    this.setState({
      branch_data: props.branch_data ? props.branch_data : '',
      doctor_data: props.doctor_data ? props.doctor_data : '',
      current_date: props.current_date ? props.current_date : 0,
      current_day: props.current_day ? props.current_day : 0,
      view_slot_week: props.view_slot_week ? props.view_slot_week : 0,
    });
  }
  componentDidMount() {
    console.log('reschedule componentDidMount');
    this.getSlots(this.state.view_slot_week);
  }
  getSlots(w) {
    console.log('reschedule getSlots');
    var payload = {id: this.state.appointment_id, view_slot_week: w};
    console.log('appointment_settings web ' + JSON.stringify(payload));
    this.props
      .appointment_settings(payload)
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          console.log('reschedule getSlots resp');
          this.setState({slot_data: resp.data});
        }
      })
      .catch(() => {
        console.log('reschedule getSlots err');
        console.log('error');
      });
  }
  schedule = data => {
    if (this.props.buttonPress && data.time != '--') {
      this.props.buttonPress(data);
    }
  };
  render = () => {
    var slots = [];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    console.log(
      'appointment_settings current_day1 == ' + this.state.current_day,
    );
    var current_day = days[this.state.current_day];
    console.log('appointment_settings current_day1 == ' + current_day);
    if (this.state.slot_data) {
      var slot_data = this.state.slot_data;
      console.log(
        'appointment_settings slotdata == ' + JSON.stringify(slot_data),
      );
      for (var key in slot_data) {
        if (slot_data.hasOwnProperty(key)) {
          console.log(
            'appointment_settings current_day2 == ' + current_day + '==' + key,
          );
          if (current_day.toLowerCase() == key.toLowerCase()) {
            var timings = slot_data[key];
            console.log(
              'appointment_settings slots == ' + JSON.stringify(timings),
            );
            var i = 0;
            for (var k in timings) {
              console.log(
                'appointment_settings ===>>>' + k + ' -> ' + timings[k],
              );
              slots.push(
                <TouchableOpacity
                  key={i}
                  style={{
                    backgroundColor: AppColors.brand.btnColor,
                    margin: 5,
                    height: 35,
                  }}
                  onPress={this.schedule.bind(this, {
                    reschedule_id: this.state.reschedule_id,
                    branch_data: this.state.branch_data,
                    doctor_data: this.state.doctor_data,
                    view_slot_week: this.state.view_slot_week,
                    booking_date: this.state.current_date,
                    time: timings[k],
                  })}>
                  <Text style={{padding: 5, color: AppColors.brand.white}}>
                    {timings[k]}
                  </Text>
                </TouchableOpacity>,
              );
              i++;
            }
          }
        }
      }
    }
    return (
      <View style={[styles.background]}>
        {slots.length ? (
          <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
            {slots}
          </View>
        ) : (
          <Text>{Strings.noslots}</Text>
        )}
      </View>
    );
  };
}
/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Slots);
