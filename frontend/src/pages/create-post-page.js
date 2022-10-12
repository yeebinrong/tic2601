import React from 'react';
import CreatePostComponent from '../components/CreatePostComponent/CreatePostComponent';
import BasePage from './base-page';

class CreatePostPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <CreatePostComponent {...props} location={this.props.location} />
                    );
                }}
            />
        );
    }
}

export default CreatePostPage;
