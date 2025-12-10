/**
 * Tabs Scenes
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React from 'react';
import { Scene, ActionConst } from 'react-native-router-flux';

// Consts and Libs
import { AppConfig } from '@constants/';
import { AppStyles, AppSizes } from '@theme/';

// Components
import { TabIcon } from '@ui/';
import { NavbarMenuButton } from '@containers/ui/NavbarMenuButton/NavbarMenuButtonContainer';

// Scenes
import Placeholder from '@components/general/Placeholder';
import Error from '@components/general/Error';
import StyleGuide from '@containers/StyleGuideView';

import Search from '@containers/search/Search';
import Listing from '@containers/search/Listing';
import ListingDetails from '@containers/search/ListingDetails';
import AppointmentDetail from '@containers/search/AppointmentDetail';
import Prescription from '@containers/search/Prescription';

import BookNow from '@containers/search/BookNow';
import Review from '@containers/search/Review';
import Reschedule from '@containers/search/Reschedule';
import DProfileView from '@containers/Doctor/ProfileView';
import MyDoctors from '@containers/User/mydoctors';
import Appointment from '@containers/User/Appointment';
import DoctorAppointment from '@containers/User/DoctorAppointment';
import PrescriptionDetails from '@containers/User/prescriptiondetails';
import CreateMedicine from '@containers/Pharmacy/CreateMedicine';
import MedicinesList from '@containers/Pharmacy/MedicinesList';
import EducationList from '@containers/Doctor/EducationList';
import Education from '@containers/Doctor/Education';
import Speciality from '@containers/Doctor/Speciality';
import Language from '@containers/Doctor/Language';
import GetVerified from '@containers/Doctor/GetVerified';
import Selection from '@containers/Doctor/Selection';
import Insurance from '@containers/Doctor/Insurance';

import ClinicListingDetail from '@containers/Clinic/ListingDetails';


import CreatePrescription from '@containers/Doctor/CreatePrescription';
import AddMedicine from '@containers/Doctor/AddMedicine';
import AddTest from '@containers/Doctor/AddTest';
import AddAdvice from '@containers/Doctor/AddAdvice';

import Camera from '@components/CameraView';
const navbarPropsTabs = {
  ...AppConfig.navbarProps,
  renderLeftButton: () => <NavbarMenuButton />,
  sceneStyle: {
    ...AppConfig.navbarProps.sceneStyle,
    //paddingBottom: AppSizes.tabbarHeight,
  },
};

/* Routes ==================================================================== */
const scenes = (
    <Scene
      headerLayoutPreset={'center'}
      key={'SearchHome1'}
      title={'Search1'}
      hideNavBar={true}
    >
      <Scene
        hideNavBar
        titleStyle={[AppStyles.regularFontText,{color:'#FFF', fontSize: 16}]}
        key={'DoctorAppointment'}
        title={'Doctor Appointment'}
        clone
        component={DoctorAppointment}
        type={ActionConst.RESET}
      />

      <Scene
        {...navbarPropsTabs}
        navigationBarStyle={AppStyles.navbarStyle}
        titleStyle={[AppStyles.regularFontText,{color:'#FFF', fontSize: 16}]}
        key={'appointment'}
        title={'Appointment List'}
        clone
        component={Appointment}
        type={ActionConst.RESET}
      />
      <Scene
        hideNavBar
        key={'Listing'}
        component={Listing}
        title={'Listing'}
      />
      <Scene
        hideNavBar
        key={'ListingDetails'}
        component={ListingDetails}
        title={'ListingDetails'}
      />
      <Scene
        hideNavBar
        key={'viewclinic'}
        component={ClinicListingDetail}
        title={'ClinicListingDetail'}
      />

      <Scene
        hideNavBar
        key={'DAppointmentDetail'}
        component={AppointmentDetail}
        title={'AppointmentDetail'}
      />
      <Scene
        hideNavBar
        key={'PrescriptionDoctor'}
        component={Prescription}
        title={'Prescription'}
      />
      <Scene
        hideNavBar
        key={'BookNow'}
        component={BookNow}
        title={'BookNow'}
      />
      <Scene
        hideNavBar
        key={'Review'}
        component={Review}
        title={'Review'}
      />
      <Scene
        hideNavBar
        key={'DReschedule'}
        component={Reschedule}
        title={'Reschedule'}
      />

      <Scene
        hideNavBar
        key={'dprofileView'}
        title={'Profile'}
        component={DProfileView}
      />
      <Scene
        hideNavBar
        key={'myDoctors'}
        title={'My Doctors'}
        clone
        component={MyDoctors}
      />
      <Scene
        {...navbarPropsTabs}
        navigationBarStyle={AppStyles.navbarStyle}
        titleStyle={{ color:'#FFF', fontSize: 20 }}
        key={'createMedicine'}
        title={'Add New Medicine'}
        clone
        component={CreateMedicine}
      />
      <Scene
        {...navbarPropsTabs}
        navigationBarStyle={AppStyles.navbarStyle}
        titleStyle={{color:'#FFF', fontSize: 20}}
        key={'prescriptionDetails'}
        title={'Prescription Details'}
        clone
        component={PrescriptionDetails}
      />

      <Scene
        hideNavBar
        key={'educationList'}
        title={'Education'}
        component={EducationList}
      />
      <Scene
        hideNavBar
        key={'education'}
        title={'Education'}
        component={Education}
      />
      <Scene
        hideNavBar
        key={'speciality'}
        title={'Specialty'}
        component={Speciality}
      />
      <Scene
        hideNavBar
        key={'language'}
        title={'Language'}
        component={Language}
      />
      
      <Scene
        hideNavBar
        key={'getverified'}
        title={'GetVerified'}
        component={GetVerified}
      />
      <Scene
        hideNavBar
        key={'selection'}
        title={'Selection'}
        component={Selection}
      />

      <Scene
        hideNavBar
        key={'insurance'}
        title={'Insurance'}
        component={Insurance}
      />
      <Scene
        hideNavBar
        key={'medicinesList'}
        title={'Medicines'}
        clone
        component={MedicinesList}
        type={ActionConst.RESET}
      />
      <Scene hideNavBar
          key={'Camera'}
          title={'ADD DATING PREFERENCE'}
          component={Camera}
      />

      <Scene
          hideNavBar
          key={'createprescription'}
          component={CreatePrescription}
          title={'Create Prescription'}
      />

      <Scene
          hideNavBar
          key={'addmedicine'}
          component={AddMedicine}
          title={'Add Medicine'}
      />

      <Scene
          hideNavBar
          key={'addtest'}
          component={AddTest}
          title={'Add Test'}
      />

      <Scene
          hideNavBar
          key={'addadvice'}
          component={AddAdvice}
          title={'Add Advice'}
      />
    </Scene>

);

export default scenes;
