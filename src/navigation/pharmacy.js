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
import MedicinesList from '@containers/Pharmacy/MedicinesList';
import Prescription from '@containers/search/Prescription';
import PrescriptionRequested from '@containers/Pharmacy/PrescriptionRequested';
import CreateMedicine from '@containers/Pharmacy/CreateMedicine';
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
      key={'SearchHome2'}
      title={'Search2'}
      hideNavBar={true}
    >
      <Scene
        hideNavBar
        titleStyle={[AppStyles.regularFontText,{color:'#FFF', fontSize: 14}]}
        key={'PrescriptionRequested'}
        title={'Prescription Requested'}
        clone
        component={PrescriptionRequested}
        type={ActionConst.RESET}
      />
      <Scene
        hideNavBar
        key={'viewPrescrition'}
        component={Prescription}
        title={'Prescription'}
      />
      <Scene
          hideNavBar
          key={'medicinesList'}
          title={'Medicines'}
          component={MedicinesList}
        />
      <Scene
        hideNavBar
        key={'createMedicine'}
        title={'Add New Medicine'}
        component={CreateMedicine}
      />
    </Scene>
);

export default scenes;
