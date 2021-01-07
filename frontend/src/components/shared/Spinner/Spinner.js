import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import OakSpinner from 'assets/img/oak-spinner.svg';
import PubSub from 'utils/pubsub';
import { StyledSpinner } from './Spinner.styled';

function Spinner(props) {
    let [spinning, setSpinning] = useState(props.spinning);

    useEffect(() => {
        let loading_sub = PubSub.subscribe('loading', (_, data) => setSpinning(data));
        return () => PubSub.unsubscribe(loading_sub);
    }, [])

    return (
        <StyledSpinner>
            {spinning ? <section className="spinner">
                <img src={OakSpinner} className="spinner_component" alt="Designed by Creazilla" />
            </section> : null}
        </StyledSpinner>
    );
}

Spinner.propTypes = {
    spinning: PropTypes.bool.isRequired,
}

export default Spinner;
