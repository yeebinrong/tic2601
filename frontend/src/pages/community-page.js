import React from 'react';
import CommunityComponent from '../components/CommunityComponent/CommunityComponent';
import BasePage from './base-page';

class CommunityPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <CommunityComponent {...props} location={this.props.location} />
                    );
                }}
            />
        );
    }
}

export default CommunityPage;
