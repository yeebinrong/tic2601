import React from 'react';
import DemoComponent from '../components/DemoComponent/DemoComponent';
import BasePage from './base-page';

class DemoPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <DemoComponent {...props} />
                    );
                }}
            />
        );
    }
}

export default DemoPage;
