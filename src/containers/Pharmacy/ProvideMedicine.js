import React, { Component } from 'react';
import {
  View,
  Image,
  TextInput,
} from 'react-native';
import { AppStyles, AppSizes, AppColors } from '@theme/';
// Components
import { Spacer, Text, Button,LblFormInput } from '@ui/';
import Strings from '@lib/string.js';

class ProvideMedicine extends Component {
  static componentName = 'ProvideMedicine';
  constructor(props) {
    super(props);
    this.state={
      prescription_details:(props.prescription_details)?props.prescription_details:''
    }
  }

 
  render() {
    console.log("ppprescriptiondetails == " + JSON.stringify(this.state.prescription_details));
    var i = this.props.i;
    return (
        <View key={i} style={{ marginTop:0.2,backgroundColor: this.props.viewColor }}>
            <View style={{flex:1,flexDirection:'row',backgroundColor:this.props.viewColor}}>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12}}>{this.state.prescription_details && this.state.prescription_details.prescription_medicine[i] && this.state.prescription_details.prescription_medicine[i].medicine_type.name}</Text>
              </View>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12}}>{this.state.prescription_details.prescription_medicine[i].name}</Text>
              </View>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12,textAlign:'center'}}>{this.state.prescription_details.prescription_medicine[i].dosage_unit}</Text>
              </View>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12}}>{this.state.prescription_details.prescription_medicine[i].dosage}</Text>
              </View>
            </View>
            <View style={{flex:1,flexDirection:'row'}}>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12,color:AppColors.brand.secondary}}>Usuage: {this.state.prescription_details.prescription_medicine[i].is_morning} - {this.state.prescription_details.prescription_medicine[i].is_noon} - {this.state.prescription_details.prescription_medicine[i].is_night}</Text>
              </View>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12,color:AppColors.brand.secondary}}>{(this.state.prescription_details.prescription_medicine[i].is_before_food)? "Take before food" : "Take after food"}</Text>
              </View>
            </View>
            <View style={{flex:1,flexDirection:'row'}}>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12,color:AppColors.brand.secondary}}>Days: {this.state.prescription_details.prescription_medicine[i].usage_days}</Text>
              </View>
              <View style={{flex:0.5}}>
                <Text style={{padding:5,fontSize:12,color:AppColors.brand.secondary}}>Notes: {this.state.prescription_details.prescription_medicine[i].description}</Text>
              </View>
            </View>
            {this.props.show ?
                <View style={{flex:1,marginBottom:15,flexDirection:'row',justifyContent:'flex-start',alignItems:'flex-start'}}>
                    <View style={{flex:0.49}}>
                      <TextInput onChangeText={(text)=> {
                        if(this.props.f_quantity)
                            this.props.f_quantity(this.props.id,text);
                         }}  keyboardType = 'numeric' maxLength={4} placeholder={Strings.quantity} style={[{height:40,width:150,borderBottomWidth:0.5,borderColor:AppColors.brand.black,color:AppColors.brand.black},AppStyles.regularFontText]} underlineColorAndroid={'transparent'}
                      />
                    </View>
                    <View style={{flex:0.05}}/>
                    <View style={{flex:0.49}}>
                      <TextInput  onChangeText={(text)=> {
                        if(this.props.f_price)
                            this.props.f_price(this.props.id,text);
                         }} keyboardType = 'numeric' maxLength={7} placeholder={Strings.price} style={[{height:40,width:150,borderBottomWidth:0.5,borderColor:AppColors.brand.black,color:AppColors.brand.black},AppStyles.regularFontText]} underlineColorAndroid={'transparent'}/>
                    </View>
                </View>
            :(null)
            }
          </View>
    );
  }
}

/* Export Component ==================================================================== */
export default ProvideMedicine;
