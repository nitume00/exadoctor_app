/**
 * Camera View
 *
 */
'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Image,
  ImagePickerIOS,
  TouchableOpacity,
  Alert,
  AppRegistry,
  Dimensions,
  TouchableHighlight,
  Platform,
  NativeModules,
} from 'react-native';
import {Icon} from '@rneui/themed';
// Consts and Libs
import {AppStyles, AppColors} from '@theme/';
import {Actions} from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
// var RNGRP = require('react-native-get-real-path');
import Loading from '@components/general/Loading';
import Permissions from 'react-native-permissions';
// import CompressImage from 'react-native-compress-image';
// Components
import {Card, Text, Spacer, Button} from '@ui/';
import {RNCamera} from 'react-native-camera';
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  Small: {
    width: 70,
    height: 70,
    backgroundColor: 'transparent',
  },
  orientation: {
    width: 32,
    height: 32,
  },
  img_vid: {
    width: 30,
    height: 30,
  },
});

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Waiting</Text>
  </View>
);
/* Component ==================================================================== */
export default class CameraPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cameraType: RNCamera.Constants.Type.back,
      avatarSource: null,
      reload: false,
      img_video: require('@images/Lash972.png'),
      capture_video: require('@images/vooduvibe-icon-filled-transparent.png'),
      top_img_video: require('@images/Lash971.png'),
      image: '',
      loading: false,
      photopermission: '',
      storagepermission: Platform.OS == 'ios' ? '1' : '',
      camerapermission: '',
      microphonepermission: '',
    };
    this.checkCameraAndLibraryPermissions();
    this.checkPermissions();
  }
  checkCameraAndLibraryPermissions = () => {
    if (Platform.OS == 'ios') {
    } else {
      Permissions.checkMultiple([
        'camera',
        'photo',
        'storage',
        'microphone',
      ]).then(response => {
        //response is an object mapping type to permission
        if (response.photo == 'authorized') {
          this.setState({photopermission: '1'});
        }
        if (response.camera == 'authorized') {
          this.setState({camerapermission: '1'});
        }
        if (response.storage == 'authorized') {
          this.setState({storagepermission: '1'});
        }
      });
    }
  };
  checkPermissions = () => {
    if (this.state.camerapermission === '') {
      Permissions.request('camera').then(response => {
        if (response == 'authorized') {
          this.setState({camerapermission: '1'}, this.checkPermissions());
        }
      });
    } else if (this.state.photopermission === '') {
      Permissions.request('photo').then(response => {
        if (response == 'authorized') {
          this.setState({photopermission: '1'}, this.checkPermissions());
        }
      });
    } else if (this.state.storagepermission === '' && Platform.OS != 'ios') {
      Permissions.request('storage').then(response => {
        if (response == 'authorized') {
          this.setState({storagepermission: '1'}, this.checkPermissions());
        }
      });
    }
  };

  componentWillUnmount = () => {
    if (this.state.reload) {
      this.setState({reload: false});
      console.log('capturedImage === ' + JSON.stringify(this.state.image));
      this.props.reloadView({image: this.state.image});
    }
  };

  pickerImagePressed = imgtype => {
    if (
      this.state.photopermission === '' ||
      (Platform.OS != 'ios' && this.state.storagepermission === '')
    ) {
      Permissions.request('photo').then(response => {
        //returns once the user has chosen to 'allow' or to 'not allow' access
        //response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (response == 'authorized') {
          this.setState({photopermission: '1'});
        }
      });
      if (Platform.OS != 'ios') {
        Permissions.request('storage').then(response => {
          if (response == 'authorized') {
            this.setState({storagepermission: '1'});
          }
        });
      }
    } else {
      this.setState({loading: true});
      ImagePicker.launchImageLibrary(
        {
          title: 'Please select image',
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        },
        response => {
          if (response && response.data && response.data != '') {
            this.setState({image: response.data, loading: true});
            this.showLashImageView();
          }
        },
      );
    }
  };

  showLashImageView() {
    this.setState({reload: true, loading: true});
    Actions.pop();
  }

  takePicture = async () => {
    if (
      this.camera &&
      this.state.loading == false &&
      this.state.camerapermission &&
      this.state.storagepermission &&
      this.state.photopermission
    ) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log(data);
      this.setState({image: data.base64, loading: false});
      this.showLashImageView();
    }
  };

  orient() {
    var state = this.state;
    state.cameraType =
      state.cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back;
    this.setState(state);
  }

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={this.state.cameraType}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>
          {({camera, status, recordAudioPermissionStatus}) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}>
                <View
                  style={{
                    top: Platform.OS == 'ios' ? 20 : 0,
                    backgroundColor: 'transparent',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    height: 60,
                    width: Dimensions.get('window').width,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <TouchableOpacity
                      onPress={Actions.pop}
                      style={{
                        flex: 0.2,
                        marginLeft: 15,
                        width: 34,
                        height: 34,
                        backgroundColor: 'transparent',
                      }}>
                      <Image
                        style={{width: 24, height: 24}}
                        source={require('@images/closecamera.png')}
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        flex: 0.8,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                      <TouchableHighlight
                        underlayColor="transparent"
                        onPress={this.orient.bind(this)}
                        style={{width: 32, height: 32, marginRight: 10}}>
                        {this.state.cameraType == 1 ? (
                          <Image
                            style={styles.orientation}
                            source={require('@images/352452-32.png')}
                          />
                        ) : (
                          <Image
                            style={styles.orientation}
                            source={require('@images/352453-32.png')}
                          />
                        )}
                      </TouchableHighlight>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    top: Dimensions.get('window').height - 160,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 70,
                    width: Dimensions.get('window').width,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableHighlight
                      underlayColor="transparent"
                      onPress={this.takePicture.bind(this)}
                      style={(styles.Small, {marginLeft: 20, marginRight: 20})}>
                      <Image
                        style={styles.Small}
                        source={this.state.capture_video}
                      />
                    </TouchableHighlight>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      right: 15,
                      marginRight: 20,
                      width: 40,
                      height: 40,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableHighlight
                      underlayColor="transparent"
                      onPress={this.pickerImagePressed.bind(
                        this,
                        this.props.imgtype,
                      )}>
                      <Image
                        style={{width: 35, height: 35}}
                        source={require('@images/image_picker.png')}
                      />
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            );
          }}
        </RNCamera>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  }
}
