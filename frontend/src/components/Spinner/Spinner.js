import React from 'react';
import PropTypes from 'prop-types';
import OakSpinner from '../../assets/img/oak-spinner.svg';
import PubSub from '../../utils/pubsub';
import { StyledSpinner } from './Spinner.styled';

class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinning: this.props.spinning,
        }
    }
    componentDidMount() {
        this.loadingSub = PubSub.subscribe('Loading', (_,data) => this.setState({spinning:data}))
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.loadingSub)
    }
    render() {
        return (
            <StyledSpinner>
                {this.state.spinning ? <section className="spinner">
                    <img src={OakSpinner} className="spinner_component" alt="Designed by Creazilla" />
                </section> : null}
            </StyledSpinner>
        );
    }
}

Spinner.propTypes = {
    spinning: PropTypes.bool.isRequired,
}

export default Spinner;
