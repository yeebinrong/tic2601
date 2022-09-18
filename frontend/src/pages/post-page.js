import React from 'react';
import Post from '../components/PostComponent/Post';
import BasePage from './base-page';


class ViewPostPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
        };
    }
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={<Post />}
            />
        );
    }
}

export default ViewPostPage;
