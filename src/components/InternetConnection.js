import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import {
Alert,View,TouchableOpacity,Image,Text,StyleSheet,TouchableHighlight,Dimensions,NetInfo,
} from 'react-native';
var {width, height} = Dimensions.get('window');
import { AppColors,AppStyles,AppSizes,Fonts } from '@theme/';
import { connect } from 'react-redux';
var styles = StyleSheet.create({

});
const mapStateToProps = () => ({
});
const mapDispatchToProps = {
}
/* Component ==================================================================== */
class InternetConnection extends Component {
	constructor() {
		super();
	}
	handleFirstConnectivityChange=(reach)=>{
		 var rech = reach.toLowerCase();
		 console.log('First change: ' + rech);
		 ((rech == 'wifi' || rech == 'cell') ?
				console.log(`First, connected with ${rech}` )
			:
				Alert.alert(
				  'ABS',
				  'No Internet Connection',
				  [
					{text: 'OK', onPress: () => console.log("ok")},
				  ],
				  { cancelable: false }
				))
	 }

	componentDidMount() {
		 /*NetInfo.fetch().done((reach) => {
			 console.log('Initial: ' + reach);
		 });
		 NetInfo.addEventListener(
			 'change',
			 this.handleFirstConnectivityChange
		 );*/
	 }
	render = () => {
		return (<View />);
	}
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps) (InternetConnection);
