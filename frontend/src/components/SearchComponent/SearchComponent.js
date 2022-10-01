import React from 'react';
import { searchForPostWithParams } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: [],
        };

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(this.props.location.search),
                order: this.props.params.order,
            }).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        (nextProps.location.search !== this.props.location.search)) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(nextProps.location.search),
                order: nextProps.params.order,
            }).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
        return true;
    }

    render() {
        return (
            <div>
                hi welcome to search
                {console.log(this.state.posts)}
                {this.state.posts?.map(post => {
                    return (
                        <div>
                            <span>{post.order}</span>
                            <span>{post.title}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
}


export default withParams(SearchComponent);
