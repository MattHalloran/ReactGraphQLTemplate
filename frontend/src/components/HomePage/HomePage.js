import React, { useLayoutEffect } from 'react';
import Collapsible from 'components/shared/wrappers/Collapsible/Collapsible';
import Hero from 'components/shared/Hero/Hero';
import { SocialIcon } from 'react-social-icons';
import { BUSINESS_NAME } from 'consts';

function HomePage() {
    useLayoutEffect(() => {
        document.title = `Home | ${BUSINESS_NAME}`;
    }, [])

    return (
        <div>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            <Collapsible title="Social Media">
                <SocialIcon fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </Collapsible>
        </div >
    );
}

HomePage.propTypes = {

}

export default HomePage;