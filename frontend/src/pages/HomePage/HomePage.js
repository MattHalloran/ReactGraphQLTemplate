import React, { useLayoutEffect, useState, useEffect } from 'react';
import Hero from 'components/Hero/Hero';
import { StyledHomePage } from './HomePage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import FeaturedPlants from 'components/FeaturedPlants/FeaturedPlants';

function HomePage() {

    useLayoutEffect(() => {
        document.title = `Home | ${BUSINESS_NAME}`;
    }, [])

    return (
        <StyledHomePage>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            {/* <FeaturedPlants /> */}
            {/* <Collapsible title="Follow Us on Social Media!" contentClassName="social-collapse">
                <SocialIcon style={{width:'75px',height:'75px',margin:'15px'}} fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon style={{width:'75px',height:'75px',margin:'15px'}} fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </Collapsible> */}
        </StyledHomePage >
    );
}

HomePage.propTypes = {
    
}

export default HomePage;