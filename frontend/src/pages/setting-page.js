import React from 'react';
import SettingComponent from '../components/SettingComponent/SettingComponent';
import BasePage from './base-page';

class SettingPage extends React.Component {
    render() {
        return <BasePage component={(props) => { return (<SettingComponent {...props} />) }} />;
    }
}

export default SettingPage;
