import React from 'react';
import SearchComponent from '../components/SearchComponent/SearchComponent';
import BasePage from './base-page';

class SearchPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <SearchComponent {...props} location={this.props.location} />
                    );
                }}
            />
        );
    }
}

export default SearchPage;
