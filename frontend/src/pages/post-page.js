import React from 'react';
import Post from '../components/PostComponent/Post';
import BasePage from './base-page';


class ViewPostPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return <Post {...props} />;
                }}
            />
        );
    }
}

export default ViewPostPage;
