import React from 'react';
import HomeComponent from '../components/HomeComponent/HomeComponent';
import BasePage from './base-page';

class HomePage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={<HomeComponent />}
            />
        );
    }
}

export default HomePage;
