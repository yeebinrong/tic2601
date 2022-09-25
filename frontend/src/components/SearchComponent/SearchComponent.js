import React from 'react';
import { searchForPostWithParams } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(this.props.location.search),
                order: this.props.params.order,
            }).then(res => {
                this.props.setIsLoading(false);
                console.log(res.data.rows)
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        if (nextProps.isVerifyDone && !this.props.isVerifyDone) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(this.props.location.search),
                order: this.props.params.order,
            }).then(res => {
                this.props.setIsLoading(false);
                console.log(res.data.rows)
            });
        }
        return true;
    }

    render() {
        return (
            <div>
                hi welcome to search
            </div>
        );
    }
}


export default withParams(SearchComponent);
