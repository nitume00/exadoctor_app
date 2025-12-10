/**
 * Order Screen
 *
 * Order that confirms the details
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ListView,
	ScrollView,
} from 'react-native';
import * as UserActions from '@reduxx/user/actions';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { AppConfig } from '@constants/';
import Loading from '@components/general/Loading';
import Strings from '@lib/string.js'
import NavComponent from '@components/NavComponent.js'
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from '@theme/';
import { CheckBox, Rating } from 'react-native-elements'
// Components
import { Spacer, Text, Button, Card, FormInput, LblFormInput } from '@ui/';
const mapStateToProps = state => { return ({ user_data: state.user.user_data }) };
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
const mapkey = "12345678";
const mapDispatchToProps = {
	bookings: UserActions.bookings,
	vehicle_coupons: UserActions.vehicle_coupons,
};
/* Styles ====================================================================  */
const styles = StyleSheet.create({
	background: {
		backgroundColor: AppColors.brand.white,
		height: AppSizes.screen.height,
		width: AppSizes.screen.width,
	},
	col: {
		width: (AppSizes.screen.width / 2) - 10,
	},
	header: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	headerTitle: {
		fontSize: 24,
	},
	subTitle: {
		fontSize: 16,
	},
	headerGrey: {
		fontSize: 15,
		color: '#ada8a8'
	},
	normalText11: {
		fontWeight: 'normal',
		fontSize: 11
	},
	logo: {
		width: AppSizes.screen.width * 0.85,
		resizeMode: 'contain',
	},
	whiteText: {
		color: '#FFF',
	},
	col: {
		width: (AppSizes.screen.width / 2) - 20, justifyContent: 'center', alignItems: 'center'
	},
	fare_title: {
		flex: 0.4, justifyContent: 'center', alignItems: 'flex-start'
	},
	fare_day: {
		flex: 0.3, justifyContent: 'center', alignItems: 'flex-start'
	},
});

/* Component ==================================================================== */
class Order extends Component {
	static componentName = 'Order';
	static propTypes = {
		bookings: PropTypes.func.isRequired,
		vehicle_coupons: PropTypes.func.isRequired,
	}
	constructor(props) {
		super(props);
		this.state = {
			data: '',
			insurance_checked: false,
			fuel_options_checked: false,
			accessories_checked: false,
			insurance_id: '',
			fuel_options_id: '',
			accessories_id: '',
			firstname: '',
			lastname: '',
			email: '',
			mobile: '',
			address: '',
			loading: false,
			couponcode: '',
		}
	}
	componentDidMount() {
		this.activity_data();
		if (this.state.data.vehicle_rental_additional_chargable && this.state.data.vehicle_rental_additional_chargable.data) {
			var insurance_id = '';
			var fuel_id = '';
			var accessory_id = '';
			for (var i = 0; i < this.state.data.vehicle_rental_additional_chargable.data.length; i++) {
				if (this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphExtraAccessory') {
					accessory_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					this.setState({ accessories_id: accessory_id, accessories_checked: true });
				}
				else if (this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphInsurance') {
					insurance_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					this.setState({ insurance_id: insurance_id, insurance_checked: true });
				}
				else if (this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphFuelOption') {
					fuel_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					this.setState({ fuel_options_id: fuel_id, fuel_options_checked: true });
				}
			}
		}
	}
	componentWillUnmount() {
		if (this.props.reload)
			this.props.reload();
	}
	activity_data() {
		var payload = { "booking_id": this.props.viewdata.id, "call_from": "activity" };
		this.props.bookings(payload).then((resp) => {
			if (resp.booker_detail) {
				console.log("gggg" + JSON.stringify(resp));
				this.setState({
					data: resp,
					firstname: resp.booker_detail.first_name,
					lastname: resp.booker_detail.last_name,
					email: resp.booker_detail.email,
					mobile: resp.booker_detail.mobile,
					address: resp.booker_detail.address,
				});
			}
			else if (resp.id) {
				this.setState({ data: resp });
			}
		}).catch(() => {
			console.log("error");
		});
	}
	apply_coupon = () => {
		if (this.state.couponcode == '') {
			Alert.alert(
				AppConfig.appName,
				Strings.entercouponcode,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		} else {
			this.setState({ loading: true });
			var payload = { "name": this.state.couponcode, "id": this.state.data.id }
			this.props.vehicle_coupons(payload).then((resp) => {
				if (resp.Success) {
					this.setState({ couponcode: '', loading: false });
					this.activity_data();
					Alert.alert(
						AppConfig.appName,
						resp.Success,
						[
							{ text: 'OK', onPress: () => console.log('OK Pressed') },
						],
						{ cancelable: false }
					);
				}
				else if (resp.message) {
					this.setState({ loading: false });
					Alert.alert(
						AppConfig.appName,
						resp.message,
						[
							{ text: 'OK', onPress: () => console.log('OK Pressed') },
						],
						{ cancelable: false }
					);
				}
			}).catch((err) => {
				this.setState({ loading: false });
				Alert.alert(
					AppConfig.appName,
					err.message,
					[
						{ text: 'OK', onPress: () => console.log('OK Pressed') },
					],
					{ cancelable: false }
				);
			});
		}
	}
	updateextras(resp) {
		console.log("llllllllllllllll resp" + JSON.stringfy(resp.vehicle_rental_additional_chargable));
		/*
		if(this.state.data.vehicle_rental_additional_chargable && this.state.data.vehicle_rental_additional_chargable.data){
			  var insurance_id = '';
			  var fuel_id='';
			  var accessory_id = '';
			  for(var i=0;i<this.state.data.vehicle_rental_additional_chargable.data.length;i++){
				  if(this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphExtraAccessory'){
					  accessory_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					  this.setState({accessories_id:accessory_id,accessories_checked:true});
					  console.log("llllllllllllllll");
				  }
				  else if(this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphInsurance'){
					  insurance_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					  this.setState({insurance_id:insurance_id,insurance_checked:true});
					  console.log("llllllllllllllll ccc");
				  }
				  else if(this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphFuelOption'){
					  fuel_id = this.state.data.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
					  this.setState({fuel_options_id:fuel_id,fuel_options_checked:true});
					  console.log("llllllllllllllll ddd");
				  }
			  }
		  }
		   
		if(resp.vehicle_rental_additional_chargable && resp.vehicle_rental_additional_chargable.data){
		  var insurance_id = '';
		  var fuel_id='';
		  var accessory_id = '';
		  console.log("llllllllllllllll" + JSON.stringfy(resp.vehicle_rental_additional_chargable)); 
		  for(var i=0;i<resp.vehicle_rental_additional_chargable.data.length;i++){
			  if(resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphExtraAccessory'){
				  accessory_id = resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
				  this.setState({accessories_id:accessory_id,accessories_checked:true});
				  console.log("llllllllllllllll");
			  }
			  else if(resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphInsurance'){
				  insurance_id = resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
				  this.setState({insurance_id:insurance_id,insurance_checked:true});
				  console.log("llllllllllllllll ccc");
			  }
			  else if(resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_type == 'MorphFuelOption'){
				  fuel_id = resp.vehicle_rental_additional_chargable.data[i].item_user_additional_chargable_id;
				  this.setState({fuel_options_id:fuel_id,fuel_options_checked:true});
				  console.log("llllllllllllllll ddd");
			  }
		  }
	  }*/
	}
	validateEmail = (email) => {
		var re = /^.+@.+\..+$/i;
		return re.test(email);
	};
	validateMobile = (mobile) => {
		var re = /^\d{10}$/;
		return re.test(mobile);
	}
	update = () => {
		// http://bookorrent.servicepg.develag.com/public/api/vehicle_rentals/75
		// Request Method:PUT
		//{"vehicle_type_extra_accessories":[],"vehicle_type_fuel_options":[],"vehicle_type_insurances":[],"first_name":"johndevah","last_name":"ARS","email":"ahdeveloper1980@gmail.com","mobile":"9898989898","address":"Kamdar Nagar, Nungambakkam, Chennai, Tamil Nadu 600034, India","id":"75"}

		//on success need to call this.activity_data();
		if (this.state.firstname == '') {
			Alert.alert(
				AppConfig.appName,
				Strings.enteryourfirstname,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
		else if (this.state.lastname == '') {
			Alert.alert(
				AppConfig.appName,
				Strings.enteryourlastname,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
		else if (this.state.email == '' || !this.validateEmail(this.state.email)) {
			Alert.alert(
				AppConfig.appName,
				Strings.entervalidemail,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
		else if (this.state.mobile == '' || !this.validateMobile(this.state.mobile)) {
			Alert.alert(
				AppConfig.appName,
				Strings.entervalidmobilenumber,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
		else if (this.state.address == '') {
			Alert.alert(
				AppConfig.appName,
				Strings.addresspickmessage,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
		else {
			this.setState({ loading: true });
			var payload = { "vehicle_type_extra_accessories": [this.state.accessories_id], "vehicle_type_fuel_options": [this.state.fuel_options_id], "vehicle_type_insurances": [this.state.insurance_id], "first_name": this.state.firstname, "last_name": this.state.lastname, "email": this.state.email, "mobile": this.state.mobile, "address": this.state.address, "id": this.state.data.id, "call_from": "order" };
			this.props.bookings(payload).then((response) => {
				if (response.id) {
					this.setState({ loading: false });
					this.activity_data();
				}
			}).catch(() => {
				console.log("respppp dddd error");
			});
		}
	}
	paynow = () => {
		Actions.PayListing({ 'reload': this.reload, 'vehicle_rental_id': this.state.data.id, 'amount': this.state.data.total_amount, "call_from": "order" });
	}
	reload = () => {
		Actions.pop();
	}
	render = () => {
		var imageurl = AppConfig.car_image;
		if (this.state.data && this.state.data.item_userable && this.state.data.item_userable.attachments && this.state.data.item_userable.attachments.thumb) {
			imageurl = this.state.data.item_userable.attachments.thumb.large;
		}
		var accessories_data = [];
		var accessories_id = 0;
		if (this.state.data && this.state.data.item_userable && this.state.data.item_userable.vehicle_type && this.state.data.item_userable.vehicle_type.vehicle_type_extra_accessory) {
			var extra_accessory = this.state.data.item_userable.vehicle_type.vehicle_type_extra_accessory.data;
			for (var j = 0; j < extra_accessory.length; j++) {
				var xdata = extra_accessory[j].vehicle_extra_accessory;
				accessories_id = extra_accessory[j].id;
				console.log('xdata' + JSON.stringify(xdata.name));
				var xrate = extra_accessory[j];
				console.log('xrate' + JSON.stringify(xdata.description));
				if (xdata) {
					accessories_data.push(<View key={j}><View><Text>{xdata.name}</Text></View><View><Text style={{ fontSize: 9 }}>{xdata.description}</Text></View><View style={{ marginTop: 5 }}><Text>{xrate.rate} / {Strings.perrental}</Text></View></View>
					)
				}
			}
		}
		var insurance_data = [];
		var insurance_id = 0;
		if (this.state.data && this.state.data.item_userable && this.state.data.item_userable.vehicle_type && this.state.data.item_userable.vehicle_type.vehicle_type_insurance) {
			var extra_accessory = this.state.data.item_userable.vehicle_type.vehicle_type_insurance.data;
			for (var j = 0; j < extra_accessory.length; j++) {
				var xdata = extra_accessory[j].vehicle_insurance;
				var xrate = extra_accessory[j];
				insurance_id = extra_accessory[j].id;
				if (xdata) {
					insurance_data.push(<View key={j}><View><Text >{xdata.name}</Text></View><View><Text style={{ fontSize: 9 }}>{xdata.description}</Text></View><View style={{ marginTop: 5 }}><Text >{xrate.rate} / {Strings.perrental}</Text></View></View>
					)
				}
			}
		}
		var fuel_data = [];
		var fuel_id = 0;
		if (this.state.data && this.state.data.item_userable && this.state.data.item_userable.vehicle_type && this.state.data.item_userable.vehicle_type.vehicle_type_fuel_option) {
			var extra_accessory = this.state.data.item_userable.vehicle_type.vehicle_type_fuel_option.data;
			for (var j = 0; j < extra_accessory.length; j++) {
				var xdata = extra_accessory[j].vehicle_fuel_option;
				console.log('xdata' + JSON.stringify(xdata.name));
				fuel_id = extra_accessory[j].id;
				var xrate = extra_accessory[j];
				if (xdata) {
					fuel_data.push(<View key={j}><View><Text>{xdata.name}</Text></View><View><Text style={{ fontSize: 9 }}>{xdata.description}</Text></View><View style={{ marginTop: 5 }}><Text>{xrate.rate} / {Strings.perrental}</Text></View></View>
					)
				}
			}
		}
		var days_hours = '';
		var days_hours_amount = 0;
		if (this.state.data && this.state.data.date_diff && this.state.data.date_diff.total_days && !this.state.data.date_diff.total_hours) {
			days_hours = this.state.data.date_diff.total_days + " " + Strings.days;
			days_hours_amount = this.state.data.date_diff.total_days * this.state.data.item_userable.per_day_amount;
		}
		else if (this.state.data && this.state.data.date_diff && !this.state.data.date_diff.total_days && this.state.data.date_diff.total_hours) {
			days_hours = this.state.data.date_diff.total_hours + " " + Strings.hours;
			days_hours_amount = this.state.data.date_diff.total_hours * this.state.data.item_userable.per_hour_amount;
		}
		else if (this.state.data && this.state.data.date_diff && this.state.data.date_diff.total_days && this.state.data.date_diff.total_hours) {
			days_hours = this.state.data.date_diff.total_days + " " + Strings.days + " " + this.state.data.date_diff.total_hours + " " + Strings.hours;
			var h = this.state.data.date_diff.total_hours * this.state.data.item_userable.per_hour_amount;
			var d = this.state.data.date_diff.total_days * this.state.data.item_userable.per_day_amount;
			days_hours_amount = parseFloat(h) + parseFloat(d);
		}

		return (
			<View style={[AppStyles.container, styles.background], {justifyContent:'center', alignItems: 'center', backgroundColor: AppColors.brand.white
	}
}>
	<ScrollView keyboardShouldPersistTaps='always'>
		<View style={{ flexDirection: 'column' }}>
			<Image style={{ width: AppSizes.screen.width, height: 200, marginBottom: 5, marginTop: 5 }} source={{ uri: imageurl }} />
			<View style={{ margin: 20, backgroundColor: AppColors.brand.white }}>
				<Text style={styles.header}>{(this.state.data) ? this.state.data.item_userable.name : ''}</Text>
				<Spacer size={5} />
				<TouchableOpacity onPress={Actions.Review}>
					<Rating
						showRating={false}
						type="star"
						fractions={1}
						startingValue={(this.state.data) ? this.state.data.item_userable.feedback_rating : 0}
						readonly
						imageSize={18}
						style={{ paddingTop: 5 }}
					/>
				</TouchableOpacity>
				<Spacer size={5} />
				<Text style={styles.headerGrey}>${(this.state.data) ? this.state.data.item_userable.per_day_amount : 0} / {Strings.day}</Text>
				<Spacer size={5} />
				<Text style={styles.headerGrey}>${(this.state.data) ? this.state.data.item_userable.per_hour_amount : 0} / {Strings.hour}</Text>
			</View>
		</View>
		<View style={{ margin: 20, marginTop: 0, backgroundColor: AppColors.brand.white, justifyContent: 'center', alignItems: 'flex-start' }}>
			<View><Text style={styles.header}>{Strings.travellerdetails}</Text></View>
			<Spacer size={5} />
			<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent' }}>
				<LblFormInput placeholderTxt={Strings.firstname} lblTxt={Strings.firstname} value={this.state.firstname} onChangeText={(firstname) => this.setState({ firstname })} />
			</View>
			<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent' }}>
				<LblFormInput placeholderTxt={Strings.lastname} lblTxt={Strings.lastname} value={this.state.lastname} onChangeText={(lastname) => this.setState({ lastname })} />
			</View>
			<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent' }}>
				<LblFormInput placeholderTxt={Strings.email} lblTxt={Strings.email} value={this.state.email} onChangeText={(email) => this.setState({ email })} />
			</View>
			<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent' }}>
				<LblFormInput placeholderTxt={Strings.mobile} lblTxt={Strings.mobile} value={this.state.mobile} onChangeText={(mobile) => this.setState({ mobile })} />
			</View>
			<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent', margin: 0, padding: 0 }}>
				<View style={{ width: AppSizes.screen.width - 50, margin: 0, padding: 0 }}>
					<Text style={{ color: AppColors.brand.black, fontSize: 14, },[AppStyles.regularFontText]}>{Strings.address}:</Text>
			</View>
		</View>
		<View style={{ width: AppSizes.screen.width - 50, backgroundColor: 'transparent', borderBottomWidth: 0.5, borderColor: AppColors.brand.black, marginBottom: 10 }}>
			<GooglePlacesAutocomplete
				placeholder={(this.state.address) ? this.state.address : Strings.address}
				minLength={2} // minimum length of text to search 
				autoFocus={false}
				returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
				listViewDisplayed='auto'    // true/false/undefined
				fetchDetails={true}
				renderDescription={row => row.description} // custom description render
				onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
					this.setState({ address: data.description });
				}}
				getDefaultValue={() => this.state.address}
				query={{
					// available options: https://developers.google.com/places/web-service/autocomplete
					key: mapkey,
					language: 'en', // language of the results
				}}
				styles={{
					textInputContainer: {
						backgroundColor: 'transparent',
						borderTopWidth: 0,
						borderBottomWidth: 0, height: 35, justifyContent: 'flex-start', alignItems: 'center', margin: 0, padding: 0, paddingTop: 5, paddingBottom: 10, margin: 0, borderBottomWidth: 1, borderColor: 'black'
					},
					textInput: {
						fontFamily: AppStyles.regulatFontText, fontSize: 12,
						backgroundColor: 'transparent', color: AppColors.brand.txtinputcolor,
						height: 28,
						borderRadius: 0,
						paddingTop: 0,
						paddingBottom: 0,
						paddingLeft: 0,
						paddingRight: 0,
						marginTop: 0,
						marginLeft: 0,
						marginRight: 0,
						fontSize: 12,
					},
					description: {
						fontFamily: AppFonts.base.family,, fontSize: 12, color: AppColors.brand.txtinputcolor
				},
			predefinedPlacesDescription: {
				color: AppColors.brand.txtinputcolor
		  }
		}}
		nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
					  GoogleReverseGeocodingQuery={{
				// available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
			}}
			GooglePlacesSearchQuery={{
				// available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
				rankby: 'distance',
			}}

			filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
			debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
			renderRightButton={() => <TouchableOpacity onPress={() => { this.setState({ address: '' }) }}><Image style={{ width: 20, height: 20 }} source={require('@images/close.png')} /></TouchableOpacity>}
			/>
			</View>
		<Spacer size={10} />
		{accessories_data ?
			<View >
				<View style={{ justifyContent: 'center', alignItems: 'flex-start', marginBottom: 10 }}>
					<CheckBox
						left
						title={Strings.accessories}
						checked={this.state.accessories_checked}
						onPress={() => {
							var ste = !this.state.accessories_checked;
							if (ste)
								this.setState({ accessories_checked: ste, accessories_id: accessories_id })
							else
								this.setState({ accessories_checked: ste, accessories_id: '' })
						}}
						containerStyle={{ margin: 0, padding: 0, borderRadius: 0, borderColor: 'transparent', backgroundColor: 'transparent' }}
					/>
				</View>
				<View style={{ marginLeft: 30 }}>{(this.state.accessories_checked) ? accessories_data : null}</View>
				<Spacer size={10} />
			</View>
			: null}
		{insurance_data ?
			<View >
				<View style={{ justifyContent: 'center', alignItems: 'flex-start', marginBottom: 10 }}>
					<CheckBox
						left
						title={Strings.insurance}
						checked={this.state.insurance_checked}
						onPress={() => {
							var ste = !this.state.insurance_checked;
							if (ste)
								this.setState({ insurance_checked: ste, insurance_id: insurance_id })
							else
								this.setState({ insurance_checked: ste, insurance_id: '' })
						}}
						containerStyle={{ margin: 0, padding: 0, borderRadius: 0, borderColor: 'transparent', backgroundColor: 'transparent' }}
					/>
				</View>
				<View style={{ marginLeft: 30 }}>{(this.state.insurance_checked) ? insurance_data : null}</View>
				<Spacer size={10} />
			</View>
			: null}
		{fuel_data ?
			<View >
				<View style={{ justifyContent: 'center', alignItems: 'flex-start', marginBottom: 10 }}>
					<CheckBox
						left
						title={Strings.fueloptions}
						checked={this.state.fuel_options_checked}
						onPress={() => {
							var ste = !this.state.fuel_options_checked;
							if (ste)
								this.setState({ fuel_options_checked: ste, fuel_options_id: fuel_id })
							else
								this.setState({ fuel_options_checked: ste, fuel_options_id: '' })
						}}
						containerStyle={{ margin: 0, padding: 0, borderRadius: 0, borderColor: 'transparent', backgroundColor: 'transparent' }}
					/>
				</View>
				<View style={{ marginLeft: 30 }}>{(this.state.fuel_options_checked) ? fuel_data : null}</View>
				<Spacer size={10} />
			</View>
			: null}
		<Spacer size={20} />
		<View ><Text style={styles.header}>{Strings.coupons}:</Text></View>
		<Spacer size={10} />
		<View style={{ flexDirection: 'row' }}>
			<View style={{ width: 150 }}>
				<LblFormInput width={150} placeholderTxt={Strings.couponcode} lblTxt={Strings.couponcode} value={this.state.couponcode} onChangeText={(couponcode) => this.setState({ couponcode })} />
			</View>
			<TouchableOpacity onPress={this.apply_coupon} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#33BB76', width: 100, padding: 10, height: 30, borderRadius: 50, paddingBottom: 10 }} >
				<Text style={{ color: AppColors.brand.white }}>{Strings.apply}</Text>
			</TouchableOpacity>
		</View>
		<Spacer size={20} />
		<View ><Text style={styles.header}>{Strings.faredetails}</Text></View>
		<Spacer size={10} />
		<View style={{ justifyContent: 'center', alignItems: 'center' }}>
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text style={[AppStyles.boldedFontText]}>{Strings.details}</Text></View>
				<View style={styles.fare_day}><Text style={[AppStyles.boldedFontText]}>{Strings.days}</Text></View>
				<View style={styles.fare_day}><Text style={[AppStyles.boldedFontText]}>{Strings.total}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{(this.state.data) ? this.state.data.item_userable.name : ''}</Text></View>
				<View style={styles.fare_day}><Text>{days_hours}</Text></View>
				<View style={styles.fare_day}><Text>${days_hours_amount}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.tax}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.tax_amount : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.deposit}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.deposit_amount : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.onewaydropoffcharge}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.drop_location_differ_charges : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.droplocationdifferadditionalfee}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.drop_location_differ_additional_fee : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.surchargeamount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.surcharge_amount : 0}</Text></View>
			</View>

			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.extraaccessoryamount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.extra_accessory_amount : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.fuelamount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.fuel_option_amount : 0}</Text></View>
			</View>

			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.insuranceamount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.insurance_amount : 0}</Text></View>
			</View>

			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.typediscountamount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(-) ${(this.state.data) ? this.state.data.type_discount_amount : 0}</Text></View>
			</View>

			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.discount}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(-) ${(this.state.data) ? this.state.data.coupon_discount_amount : 0}</Text></View>
			</View>

			<Spacer size={10} />
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.fare_title}><Text>{Strings.totalprice}</Text></View>
				<View style={styles.fare_day}><Text></Text></View>
				<View style={styles.fare_day}><Text>(+) ${(this.state.data) ? this.state.data.total_amount : 0}</Text></View>
			</View>
			<Spacer size={10} />
			<View style={{ width: AppSizes.screen.width - 40, flexDirection: 'row' }}>
				<Button
					title={Strings.update}
					backgroundColor={'#33BB76'}
					onPress={this.update}
					borderRadius={50}
					fontSize={15}
					containerViewStyle={{ flex: 1 }}
					outlined
				/>
				{(this.state.data.booker_detail) ?
					<Button
						title={Strings.paynow}
						backgroundColor={'#33BB76'}
						onPress={this.paynow}
						borderRadius={50}
						fontSize={15}
						containerViewStyle={{ flex: 1 }}
						outlined
					/>
					: null}
			</View>
		</View>
		<Spacer size={10} />
			</View>
		</ScrollView >
	{ this.state.loading ? <View style={AppStyles.LoaderStyle}><Loading color={AppColors.brand.primary} /></View> : (null) }
    </View >
	);}
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Order);