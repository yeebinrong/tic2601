import React from 'react';
import ProfilePageComponent from '../components/ProfilePageComponent/ProfilePageComponent';
import BasePage from './base-page';


class ProfilePage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return <ProfilePageComponent {...props} />;
                }}
            />
        );
    }
}

export default ProfilePage;
