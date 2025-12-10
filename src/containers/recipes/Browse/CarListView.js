
import React, { Component, PropTypes } from 'react';
 import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ListView} from 'react-native';

   class CarList extends Component {
     constructor() {
       super();
       const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
       this.state = {
         dataSource: ds.cloneWithRows(['row 1', 'row 2']),
       };
     }
     postComment(){
       alert('hey');
     }
renderRow=(data)=>{
  return(
    <View style={{paddingTop: 30, paddingHorizontal: 10, paddingBottom: 20, flexDirection: 'column'}}>
        <View>
            <View style={{ marginLeft: 70, height: 120, backgroundColor: 'white', borderRadius:15, shadowColor: 'black', shadowOpacity: 0.5}}>
                <View style={{flexDirection: 'row'}}>
                    <View><Text style={{marginLeft:50,top:10, fontSize:25}}>Chevy Beat</Text></View>
                    <View style={{flex: 2, marginRight: 20, top: 8}}><Text style={{top:10,textAlign: 'right'}}>(4 + 1)</Text></View>
                </View>
                <View style={{flexDirection: 'row', top: 10}}>
                    <View style={{flexDirection: 'column', marginLeft: 50, top: 10, flex: 1.5}}>
                        <View style={{flexDirection: 'row'}}>
                            <View><Text style={{fontWeight:'bold', fontSize:18}}>₹750 </Text></View>
                            <View><Text style={{fontSize:18}}>min</Text></View>
                        </View>
                        <View style={{top:5}}><Text style={{fontSize:18}}>*50 Km free</Text></View>
                    </View>
                    <View style={{flex: 1, width: 100, borderRadius: 10, shadowColor: 'black', shadowOpacity: 0.5, marginRight: 20 ,top: 10}}>
                          <TouchableOpacity onPress={this.getData} style={{backgroundColor: 'red', borderRadius: 10, alignItems: 'center', justifyContent: 'center', flex:1 }}>
                              <Text style={{color: 'white', fontSize:20}}>BOOK</Text>
                          </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={{backgroundColor: 'white', height: 100, width: 100, top: -110, borderRadius: 15,left: 5, shadowColor: 'black', shadowOpacity: 0.5}}>
                <Image style={{height:100, width:100, borderRadius: 15}} source={{uri:'https://images6.alphacoders.com/318/thumb-1920-318717.jpg'}}/>
            </View>
        </View>
    </View>
  );
}

getData =()=> {
    fetch('http://bookorrent.servicepg.develag.com/public/api/countries', {
    method:'GET',
    body:null,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then((responseJson) => {
        console.log(responseJson.data);
    })
    .catch((error) => {
      console.error(error);
    });
}
     render() {
       return (
         <View style={{flex:1}}>
               <View style={{flexDirection: 'row',backgroundColor: 'black', height: 60, alignItems: 'center'}}>
                   <View style={{flex:4,flexDirection: 'column', left: 10}}>
                         <View><Text style={{fontSize: 15, color: 'white'}}>Thursday</Text></View>
                         <View><Text style={{fontSize: 15, color: 'white'}}>25 JAN, 05:30 PM</Text></View>
                   </View>
                   <View style={{flex:2, flexDirection: 'column'}}>
                         <Image style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'white',alignItems: 'center'}} source={require('/Users/mac1/Documents/Nija/React\ Native/Check/react-native-starter-latest/src/images/right-arrow.png')}/>
                   </View>
                   <View style={{flex:4,flexDirection: 'column', left: 10}}>
                         <View><Text style={{fontSize: 15, color: 'white'}}>Friday</Text></View>
                         <View><Text style={{fontSize: 15, color: 'white'}}>26 JAN, 09:30 PM</Text></View>
                   </View>
               </View>
         <ListView
           dataSource={this.state.dataSource}
           renderRow={this.renderRow}
         />
         </View>
       );
     }
   }
 /* Export Component ==================================================================== */
 export default CarList;
