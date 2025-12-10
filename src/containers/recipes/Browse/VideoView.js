import React, { Component, PropTypes } from 'react';
import { AppRegistry, StyleSheet, View, VideoPlayer } from 'react-native'
import Video from 'react-native-af-video-player'

class VideoExample extends Component {

  render=()=> {
    return (
      <View style={{flex:1}}>
        <Video style={{height:100, width:100}} url='https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'/>
      </View>
    )
}
}


export default VideoExample;
