import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import InternetConnection from '@components/InternetConnection.js'
import Strings from '@lib/string.js'

// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from '@theme/';

// Components
import { Spacer, Text, Button, LblFormInput } from '@ui/';

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1
  },
  view_divider_horizontal: {
      height: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ccc',
      marginTop: 10
  },
});

/* Component ==================================================================== */
class PrescriptionDetails extends Component {

  constructor(props) {
  super(props);
  this.state = {

    };
  }

  componentDidMount = () => {
    Actions.refresh({renderRightButton: this.renderRightButton})
  }

  renderRightButton = () => {
    return (
      <TouchableOpacity onPress={()=>{this.setState({editing:true})}}>
          <Image style ={{ resizeMode: 'center', height: 20, width: 20 }}source = {require('../../images/edit_pro.png')}/>
      </TouchableOpacity>
    )
  }

  render = () => {
    return (
      <View style={[styles.background,]}>
        <InternetConnection />
          <ScrollView style = {{ flex: 1, }}>
              <View style = {{ flex: 1, }}>
                  <View style={{ backgroundColor: 'white' }}>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Date
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Nov. 09,2018, 10:00PM
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Patient Name
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              John Smith
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Patient Age
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              40
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Gender
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black,  }}>
                              Male
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                  </View>
                  <View style={{ backgroundColor: AppColors.brand.grey }}>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              1.Medicine Name
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Analgesic Ear Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Medicine Type
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Timing
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Night
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                  </View>
                  <View style={{ backgroundColor: 'white' }}>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              1.Medicine Name
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Analgesic Ear Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Medicine Type
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Timing
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Night
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                  </View>
                  <View style={{ backgroundColor: AppColors.brand.grey }}>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              1.Medicine Name
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Analgesic Ear Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Medicine Type
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Drops
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                      <View style = {{ flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.txtplaceholder }}>
                              Timing
                          </Text>
                          <Text style = {{ flex: 0.5, fontSize: 14, color: AppColors.brand.black }}>
                              Night
                          </Text>
                      </View>
                      <View style={[styles.view_divider_horizontal]}></View>
                  </View>
                  <Button
          					title='Delivered'
                    style={{marginTop: 20,}}
          					backgroundColor={'#33BB76'}
          					fontSize={15}
          					onPress={()=>{Actions.pop()}}
          				  />
                  
              </View>
          </ScrollView>
      </View>
    )
  }

}

/* Export Component ==================================================================== */
export default PrescriptionDetails;
