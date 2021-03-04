import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAboutPage } from './AboutPage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import { getTheme } from 'utils/storage';

function AboutPage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `About | ${BUSINESS_NAME}`;
    })
    return (
        <StyledAboutPage className="page" theme={theme}>
            <div className="header">
                <h1>About {BUSINESS_NAME}</h1>
            </div>
            <div className="content">
                <br />
                <h3>For  40 years, New Life Nursery, Inc has been striving to grow the most beautiful, healthy and consistent plant material at competitive prices. Family owned and operated by the Gianaris Family, we continue to hold to our original motto: "Growing top quality material for buyers who are interested in the best".</h3>
                <h3>As wholesale growers, we are always looking ahead to the next season with anticipation for something new. In addition to the wonderful trees and shrubs you have come to expect from New Life Nursery, Inc, we look forward to offering many new varieties as we head into each new season. Feel free to contact us for access to our updated availability list. As always, we encourage our customers to send us their comments and suggestions.</h3>
                <h3>With over 70 acres in production, New Life Nursery, Inc has the trees and shrubs you need, when you need them. All sizes, from 3-gallon shrubs to 25-gallon trees, are grown here on our farm in Southern New Jersey. Browse our Availability List, and contact us if you would like more information, or to speak with one of our experts at (856) 455-3601.</h3>
                <h3>Warmest Wishes,</h3>
                <h2 style={{fontFamily:'fantasy'}}>The Gianaris Family</h2>
            </div>
        </StyledAboutPage >
    );
}

AboutPage.propTypes = {
    theme: PropTypes.object,
}

export default AboutPage;