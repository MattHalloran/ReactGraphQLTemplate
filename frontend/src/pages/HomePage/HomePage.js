import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import Hero from 'components/Hero/Hero';
import { StyledHomePage } from './HomePage.styled';
import { SocialIcon } from 'react-social-icons';
import { BUSINESS_NAME } from 'utils/consts';
import { getTheme } from 'utils/storage';

function HomePage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `Home | ${BUSINESS_NAME}`;
    }, [])

    return (
        <StyledHomePage theme={theme}>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            <Collapsible title="Follow Us on Social Media!">
                <SocialIcon fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </Collapsible>
        </StyledHomePage >
    );
}

HomePage.propTypes = {
    theme: PropTypes.object,
}

export default HomePage;