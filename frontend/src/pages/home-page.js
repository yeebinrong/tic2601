import React from 'react';
import HomePageComponent from '../components/HomePageComponent/HomePageComponent';
import BasePage from './base-page';

class HomePage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <HomePageComponent
                            {...props}
                            location={this.props.location}
                        />
                    );
                }}
            />
        );
    }
}

export default HomePage;
