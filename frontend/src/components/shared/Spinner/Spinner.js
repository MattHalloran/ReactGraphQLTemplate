import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledSpinner } from './Spinner.styled';
import { PUBS } from 'consts';
import { getTheme } from 'storage';

function Spinner({
    theme = getTheme(),
    spinning,
}) {
    let [spin_state, setSpinState] = useState(spinning);

    useEffect(() => {
        let loading_sub = PubSub.subscribe(PUBS.Loading, (_, data) => setSpinState(data));
        return () => PubSub.unsubscribe(loading_sub);
    }, [])

    return (
        <StyledSpinner theme={theme}>
            {spin_state ? <span className="spinner">
                <div style={{color: '#68a174'}} className="la-ball-spin-clockwise la-3x">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </span> : null}
        </StyledSpinner>
    );
}

Spinner.propTypes = {
    theme: PropTypes.object,
    spinning: PropTypes.bool.isRequired,
}

export default Spinner;
