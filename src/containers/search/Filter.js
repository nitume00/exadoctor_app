/**
 * Filter used to apply filter for search
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import * as UserActions from '@reduxx/user/actions';
import {Actions} from 'react-native-router-flux';
import Listing from '@containers/search/Listing';
import Icon from 'react-native-vector-icons/Ionicons';
import FA from 'react-native-vector-icons/FontAwesome';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {connect} from 'react-redux';
import Strings from '@lib/string.js';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
import NavComponent from '@components/NavComponent.js';
// Components
import {Spacer, Text, Button, Card, FormInput} from '@ui/';
// What data from the store shall we send to the component?
const mapStateToProps = state => ({
  car_types: state.user.car_types,
  vehicle_filters: state.user.vehicle_filters,
});
// Any actions to map to the component?
const mapDispatchToProps = {
  car_types: UserActions.car_types,
  vehicle_filters: UserActions.vehicle_filters,
};
/* Styles ==================================================================== */
const MENU_BG_COLOR = '#fff';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    left: 0,
    right: 0,
    backgroundColor: AppColors.brand.navbar,
  },

  // Main Menu
  menu: {
    flex: 3,
    left: 0,
    right: 0,
    backgroundColor: AppColors.brand.navbar,
    padding: 20,
    paddingTop: AppSizes.statusBarHeight + 20,
  },
  menuItem: {
    backgroundColor: '#df5749',
    borderRadius: 10,
    // borderBottomWidth: 1,
    //borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
  },
  menuItem_text: {
    fontSize: 16,
    lineHeight: parseInt(16 + 16 * 0.5, 10),
    fontWeight: '500',
    marginTop: 14,
    marginBottom: 8,
    color: '#EEEFF0',
  },

  // Menu Bottom
  menuBottom: {
    flex: 1,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  menuBottom_text: {
    color: '#EEEFF0',
  },
  RowBorder: {
    top: 2,
    borderWidth: 2,
  },
  Rows: {flex: 1, height: 50, flexDirection: 'row'},
  srows: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  RowHeaderView: {
    paddingLeft: 10,
    backgroundColor: '#df5749',
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginBottom: 5,
  },
  MainTitles: {
    marginLeft: 15,
    fontSize: 17,
    color: AppColors.brand.primary,
    paddingBottom: 3,
  },
  subTitles: {
    marginLeft: 15,
    fontSize: 16,
    color: '#000',
    paddingBottom: 3,
  },
  subMenuSep: {
    height: 1,
    backgroundColor: '#eee',
  },
});
var customStyles2 = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    borderColor: '#30a935',
    borderWidth: 2,
  },
});

/* Component ==================================================================== */
class Search extends Component {
  static componentName = 'Search';
  constructor(props) {
    super(props);
    console.log('reloadData' + JSON.stringify(this.props.fdata));
    this.price_type = 'day';
    this.max_day_price = parseFloat(
      this.props.vehicle_filters.vehicle_type_price.max_day_price,
    );
    this.min_day_price = parseFloat(
      this.props.vehicle_filters.vehicle_type_price.min_day_price,
    );
    this.price = [this.min_day_price, this.max_day_price];
    if (this.props.payload && this.props.payload.price_type == 'day') {
      this.price = [
        parseFloat(this.props.payload.min_price),
        parseFloat(this.props.payload.max_price),
      ];
    }

    this.max_hour_price = parseFloat(
      this.props.vehicle_filters.vehicle_type_price.max_hour_price,
    );
    this.min_hour_price = parseFloat(
      this.props.vehicle_filters.vehicle_type_price.min_hour_price,
    );
    this.hourprice = [this.min_hour_price, this.max_hour_price];
    if (this.props.payload && this.props.payload.price_type == 'hour') {
      this.price_type = 'hour';
      this.hourprice = [
        parseFloat(this.props.payload.min_price),
        parseFloat(this.props.payload.max_price),
      ];
    }

    this.max_seat = parseFloat(this.props.vehicle_filters.settings.seats);
    this.min_seat = parseFloat(1);
    this.seat = [this.min_seat, this.max_seat];
    if (this.props.payload && this.props.payload.seat_min) {
      this.seat = [
        parseFloat(this.props.payload.seat_min),
        parseFloat(this.props.payload.seat_max),
      ];
    }

    var pref = [];
    if (this.props.payload && this.props.payload.ac) pref.push('ac');
    if (this.props.payload && this.props.payload.non_ac) pref.push('non_ac');
    if (this.props.payload && this.props.payload.airbag) pref.push('airbag');
    if (this.props.payload && this.props.payload.manual_transmission)
      pref.push('manual_transmission');
    if (this.props.payload && this.props.payload.auto_transmission)
      pref.push('auto_transmission');
    this.state = {
      car_types: true,
      day_price: false,
      hour_price: false,
      preferences: false,
      fuel_options: false,
      seating_capacity: false,
      selected_car_types:
        this.props.payload && this.props.payload.vehicle_type
          ? this.props.payload.vehicle_type
          : [],
      selected_fuel_types:
        this.props.payload && this.props.payload.fuel_type
          ? this.props.payload.fuel_type
          : [],
      selected_preference_types: pref.length ? pref : [],
      vehicle_type_price: this.props.vehicle_filters.vehicle_type_price,
      day_price_min: this.price[0],
      day_price_max: this.price[1],
      hour_price_min: this.hourprice[0],
      hour_price_max: this.hourprice[1],
      seat_capacity_min: this.seat[0],
      seat_capacity_max: this.seat[1],
    };
  }
  componentWillReceiveProps() {
    console.log('reloadData' + JSON.stringify(this.props));
  }
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string,
    }),
    car_types: PropTypes.arrayOf(PropTypes.object),
    vehicle_filters: PropTypes.arrayOf(PropTypes.object),
    callBack: PropTypes.func,
  };

  static defaultProps = {
    user: null,
    callBack: null,
  };

  /**
   * Each Menu Item looks like this
   */
  menuItem = item => (
    <TouchableOpacity
      key={`menu-item-${item.title}`}
      onPress={() => this.onPress(item.onPress)}>
      <View style={[styles.menuItem]}>
        <Text style={[styles.menuItem_text]}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  _open = menu_type => {
    if (menu_type == 'car_types') {
      var cSetting = !this.state.car_types;
      this.setState({
        car_types: cSetting,
        day_price: false,
        hour_price: false,
        preferences: false,
        fuel_options: false,
        seating_capacity: false,
      });
    } else if (menu_type == 'day_price') {
      var cSetting = !this.state.day_price;
      this.setState({
        car_types: false,
        day_price: cSetting,
        hour_price: false,
        preferences: false,
        fuel_options: false,
        seating_capacity: false,
      });
      this.price_type = 'day';
    } else if (menu_type == 'hour_price') {
      var cSetting = !this.state.hour_price;
      this.setState({
        car_types: false,
        day_price: false,
        hour_price: cSetting,
        preferences: false,
        fuel_options: false,
        seating_capacity: false,
      });
      this.price_type = 'hour';
    } else if (menu_type == 'preferences') {
      var cSetting = !this.state.preferences;
      this.setState({
        car_types: false,
        day_price: false,
        hour_price: false,
        preferences: cSetting,
        fuel_options: false,
        seating_capacity: false,
      });
    } else if (menu_type == 'fuel_options') {
      var cSetting = !this.state.fuel_options;
      this.setState({
        car_types: false,
        day_price: false,
        hour_price: false,
        preferences: false,
        fuel_options: cSetting,
        seating_capacity: false,
      });
    } else if (menu_type == 'seating_capacity') {
      var cSetting = !this.state.seating_capacity;
      this.setState({
        car_types: false,
        day_price: false,
        hour_price: false,
        preferences: false,
        fuel_options: false,
        seating_capacity: cSetting,
      });
    }
  };
  funcCarType(id) {
    if (
      this.state.selected_car_types.length &&
      this.state.selected_car_types.indexOf(id) >= 0
    ) {
      var arr_selected_car_types = this.state.selected_car_types;
      var idx = this.state.selected_car_types.indexOf(id);
      arr_selected_car_types.splice(idx, 1);
      this.setState({selected_car_types: arr_selected_car_types});
    } else {
      var joined = this.state.selected_car_types.concat(id);
      this.setState({selected_car_types: joined});
    }
  }
  funcFuelType(id) {
    if (
      this.state.selected_fuel_types.length &&
      this.state.selected_fuel_types.indexOf(id) >= 0
    ) {
      var arr_selected_fuel_types = this.state.selected_fuel_types;
      var idx = this.state.selected_fuel_types.indexOf(id);
      arr_selected_fuel_types.splice(idx, 1);
      this.setState({selected_fuel_types: arr_selected_fuel_types});
    } else {
      var joined = this.state.selected_fuel_types.concat(id);
      this.setState({selected_fuel_types: joined});
    }
  }
  funcPreferenceType(id) {
    if (
      this.state.selected_preference_types.length &&
      this.state.selected_preference_types.indexOf(id) >= 0
    ) {
      var arr_selected_preference_types = this.state.selected_preference_types;
      var idx = this.state.selected_preference_types.indexOf(id);
      arr_selected_preference_types.splice(idx, 1);
      this.setState({selected_preference_types: arr_selected_preference_types});
    } else {
      var joined = this.state.selected_preference_types.concat(id);
      this.setState({selected_preference_types: joined});
    }
  }
  moveTo = val => {
    if (val == 'InfoAbout') Actions.InfoAbout();
    else if (val == 'InfoQuote') Actions.InfoQuote();
  };
  multiSliderHValuesChange = values => {
    console.log('slidervalues hour' + JSON.stringify(values));
    this.setState({hour_price_min: values[0], hour_price_max: values[1]});
    this.hourprice = values;
  };
  multiSliderValuesChange = values => {
    console.log('slidervalues price' + JSON.stringify(values));
    this.setState({day_price_min: values[0], day_price_max: values[1]});
    this.price = values;
  };
  multiSliderSValuesChange = values => {
    console.log('slidervalues seat' + JSON.stringify(values));
    this.setState({seat_capacity_min: values[0], seat_capacity_max: values[1]});
    this.seat = values;
  };
  btn_filter = () => {
    if (this.props.callBack) {
      var vals = {
        car_types: this.state.selected_car_types,
        day_price: this.price,
        hour_price: this.hourprice,
        preferences: this.state.selected_preference_types,
        fuel_options: this.state.selected_fuel_types,
        seating_capacity: this.seat,
        price_type: this.price_type,
      };
      console.log(
        'filter_values selected_preference_types' +
          JSON.stringify(this.state.selected_preference_types),
      );
      this.props.callBack({selected_filter: vals});
    }
  };
  render = () => {
    var cartypes = [];
    for (var i = 0; i < this.props.car_types.length; i++) {
      var arr_selected_car_types = this.state.selected_car_types;
      var unchecked = require('@images/unchecked.png');
      var checked = require('@images/checked.png');
      if (
        arr_selected_car_types.length &&
        arr_selected_car_types.indexOf(this.props.car_types[i].id) >= 0
      ) {
        unchecked = checked;
      }
      var id = this.props.car_types[i].id;
      console.log('arr_selected_car_types =' + id);
      cartypes.push(
        <View key={i}>
          <TouchableOpacity
            style={styles.srows}
            onPress={this.funcCarType.bind(this, this.props.car_types[i].id)}>
            <Image style={{width: 22, height: 22}} source={unchecked} />
            <Text style={[styles.subTitles]}>
              {this.props.car_types[i].name}
            </Text>
          </TouchableOpacity>
          <View style={styles.subMenuSep} />
        </View>,
      );
    }
    var fueloptions = [];
    if (
      this.props.vehicle_filters &&
      this.props.vehicle_filters.fuel_type_list
    ) {
      console.log(
        'fueltypes aaaa' +
          JSON.stringify(this.props.vehicle_filters.fuel_type_list),
      );
      var flist = this.props.vehicle_filters.fuel_type_list;
      var i = 0;
      Object.entries(flist).forEach(([key, value]) => {
        var arr_selected_fuel_types = this.state.selected_fuel_types;
        var unchecked = require('@images/unchecked.png');
        var checked = require('@images/checked.png');
        if (
          arr_selected_fuel_types.length &&
          arr_selected_fuel_types.indexOf(value) >= 0
        ) {
          unchecked = checked;
        }
        var id = value;
        console.log('fueltypes ffff =' + id);
        fueloptions.push(
          <View key={i}>
            <TouchableOpacity
              style={styles.srows}
              onPress={this.funcFuelType.bind(this, id)}>
              <Image style={{width: 22, height: 22}} source={unchecked} />
              <Text style={[styles.subTitles]}>{key}</Text>
            </TouchableOpacity>
            <View style={styles.subMenuSep} />
          </View>,
        );
        i++;
      });
    }
    var preferences = [];
    var objPreferences = {
      ac: Strings.preferenceairconditioning,
      non_ac: Strings.preferencenonairconditioning,
      manual_transmission: Strings.preferencemanualtransmission,
      auto_transmission: Strings.preferenceautotransmission,
      airbag: Strings.preferenceairbag,
    };

    var i = 0;
    Object.entries(objPreferences).forEach(([key, value]) => {
      var arr_selected_preference_types = this.state.selected_preference_types;
      var unchecked = require('@images/unchecked.png');
      var checked = require('@images/checked.png');
      if (
        arr_selected_preference_types.length &&
        arr_selected_preference_types.indexOf(key) >= 0
      ) {
        unchecked = checked;
      }
      var id = value;
      preferences.push(
        <View key={i}>
          <TouchableOpacity
            style={styles.srows}
            onPress={this.funcPreferenceType.bind(this, key)}>
            <Image style={{width: 22, height: 22}} source={unchecked} />
            <Text style={[styles.subTitles]}>{value}</Text>
          </TouchableOpacity>
          <View style={styles.subMenuSep} />
        </View>,
      );
      i++;
    });

    return (
      <View style={[styles.container]}>
        {/*<NavComponent backArrow={true} title={Strings.searchfilter} />*/}
        <View style={[styles.menuContainer]}>
          <View style={[styles.menu]}>
            <Animated.View style={{backgroundColor: AppColors.brand.navbar}}>
              {/*car_types*/}
              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'car_types')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <Icon
                        name={'md-car'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.cartypes}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.car_types
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.car_types ? (
                <View style={{flexDirection: 'column'}}>
                  {this.props.car_types ? (
                    <View>{cartypes}</View>
                  ) : (
                    <View style={styles.srows}>
                      <Text style={[styles.subTitles]}>
                        {Strings.nocartypes}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
              {/*car_types*/}
              {/*hour_price*/}
              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'hour_price')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <Icon
                        name={'md-pricetag'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.hourprice}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.hour_price
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.hour_price ? (
                <View style={{flexDirection: 'column'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>{this.min_hour_price}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>{this.max_hour_price}</Text>
                    </View>
                  </View>

                  <View style={styles.srows}>
                    <MultiSlider
                      containerStyle={{
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: AppSizes.screen.width - 40,
                        paddingLeft: 10,
                      }}
                      touchDimensions={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        slipDisplacement: 40,
                        backgroundColor: 'black',
                      }}
                      trackStyle={{
                        backgroundColor: AppColors.brand.btnColor,
                      }}
                      values={[this.hourprice[0], this.hourprice[1]]}
                      sliderLength={240}
                      onValuesChange={this.multiSliderHValuesChange}
                      min={this.min_hour_price}
                      max={this.max_hour_price}
                      step={1}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>
                        {Strings.minvalue}
                        {this.state.hour_price_min}
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>
                        {Strings.maxvalue}
                        {this.state.hour_price_max}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.subMenuSep} />
                </View>
              ) : null}
              {/*hour_price*/}
              {/*day_price*/}

              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'day_price')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <Icon
                        name={'md-pricetag'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.dayprice}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.day_price
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.day_price ? (
                <View style={{flexDirection: 'column'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>{this.min_day_price}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>{this.max_day_price}</Text>
                    </View>
                  </View>

                  <View style={styles.srows}>
                    <MultiSlider
                      containerStyle={{
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: AppSizes.screen.width - 40,
                        paddingLeft: 10,
                      }}
                      touchDimensions={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        slipDisplacement: 40,
                        backgroundColor: 'black',
                      }}
                      trackStyle={{
                        backgroundColor: AppColors.brand.btnColor,
                      }}
                      values={[this.price[0], this.price[1]]}
                      sliderLength={240}
                      onValuesChange={this.multiSliderValuesChange}
                      min={this.min_day_price}
                      max={this.max_day_price}
                      step={1}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>
                        {Strings.minvalue}
                        {this.state.day_price_min}
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>
                        {Strings.maxvalue}
                        {this.state.day_price_max}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subMenuSep} />
                </View>
              ) : null}
              {/*day_price*/}
              {/*preferences*/}
              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'preferences')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <Icon
                        name={'md-switch'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.preferences}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.preferences
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.preferences ? (
                <View style={{flexDirection: 'column'}}>
                  {this.props.car_types ? <View>{preferences}</View> : null}
                </View>
              ) : null}
              {/*preferences Curves*/}
              {/*Tools*/}
              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'fuel_options')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <Icon
                        name={'md-flame'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.fueloptions}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.fuel_options
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.fuel_options ? (
                <View style={{flexDirection: 'column'}}>
                  {this.props.vehicle_filters &&
                  this.props.vehicle_filters.fuel_type_list ? (
                    <View>{fueloptions}</View>
                  ) : (
                    <View style={styles.srows}>
                      <Text style={[styles.subTitles]}>
                        {Strings.nofueltypes}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
              {/*Tools*/}
              {/*seating_capacity*/}
              <TouchableOpacity
                style={{height: 40}}
                onPress={this._open.bind(this, 'seating_capacity')}>
                <View style={styles.Rows}>
                  <View style={styles.RowHeaderView}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                      <FA
                        name={'eraser'}
                        size={20}
                        color={AppColors.brand.primary}
                      />
                      <Text style={[styles.MainTitles]}>
                        {Strings.seatingcapacity}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: 5,
                      }}>
                      <Icon
                        name={
                          this.state.seating_capacity
                            ? 'md-arrow-dropdown'
                            : 'md-arrow-dropright'
                        }
                        size={20}
                        color={'#fff'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.seating_capacity ? (
                <View style={{flexDirection: 'column'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>{this.min_seat}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>{this.max_seat}</Text>
                    </View>
                  </View>

                  <View style={styles.srows}>
                    <MultiSlider
                      containerStyle={{
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: AppSizes.screen.width - 40,
                        paddingLeft: 10,
                      }}
                      touchDimensions={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        slipDisplacement: 40,
                        backgroundColor: 'black',
                      }}
                      trackStyle={{
                        backgroundColor: AppColors.brand.btnColor,
                      }}
                      values={[this.seat[0], this.seat[1]]}
                      sliderLength={240}
                      onValuesChange={this.multiSliderSValuesChange}
                      min={this.min_seat}
                      max={this.max_seat}
                      step={1}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{alignItems: 'flex-start'}}>
                      <Text>
                        {Strings.minvalue}
                        {this.state.seat_capacity_min}
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text>
                        {Strings.maxvalue}
                        {this.state.seat_capacity_max}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.subMenuSep} />
                </View>
              ) : null}
              {/*seating_capacity*/}
              <Spacer size={20} />
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Button
                  title={Strings.searchfilter}
                  backgroundColor={'#33BB76'}
                  onPress={this.btn_filter}
                  borderRadius={50}
                  fontSize={15}
                  buttonStyle={{padding: 5, paddingLeft: 40, paddingRight: 40}}
                  outlined
                />
              </View>
              <Spacer size={40} />
            </Animated.View>
          </View>
        </View>
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Search);
