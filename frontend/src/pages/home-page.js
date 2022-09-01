import React from 'react';
import HomeComponent from '../components/HomeComponent/HomeComponent';
import BasePage from './base-page';
import PropTypes from 'prop-types';

class HomePage extends React.Component {
    render() {
        return <BasePage navigate={this.props.navigate} component={<HomeComponent />} />;
    }
}

HomePage.propTypes = {
    navigate: PropTypes.func,
};

export default HomePage;
