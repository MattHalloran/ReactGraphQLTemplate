import React, { useLayoutEffect, useState, useEffect } from 'react';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import Hero from 'components/Hero/Hero';
import { StyledHomePage } from './HomePage.styled';
import { SocialIcon } from 'react-social-icons';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme } from 'utils/storage';
import { PubSub } from 'utils/pubsub';

function HomePage() {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Home | ${BUSINESS_NAME}`;
    }, [])

    return (
        <StyledHomePage theme={theme}>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            <Collapsible title="Follow Us on Social Media!" contentClassName="social-collapse">
                <SocialIcon fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </Collapsible>
        </StyledHomePage >
    );
}

HomePage.propTypes = {
    
}

export default HomePage;