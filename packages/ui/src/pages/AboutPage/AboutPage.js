import React from 'react';
import { InformationalBreadcrumbs } from 'components';

function AboutPage({
    business,
}) {
    return (
        <div id='page'>
            <InformationalBreadcrumbs />
            <div className="header">
                <h1>About {business?.BUSINESS_NAME?.Long}</h1>
            </div>
            <div className="content">
                <br />
                <h3>For  40 years, New Life Nursery, Inc has been striving to grow the most beautiful, healthy and consistent plant material at competitive prices. Family owned and operated by the Gianaris Family, we continue to hold to our original motto: "Growing top quality material for buyers who are interested in the best".</h3>
                <h3>As wholesale growers, we are always looking ahead to the next season with anticipation for something new. In addition to the wonderful trees and shrubs you have come to expect from New Life Nursery, Inc, we look forward to offering many new varieties as we head into each new season. Feel free to contact us for access to our updated availability list. As always, we encourage our customers to send us their comments and suggestions.</h3>
                <h3>With over 70 acres in production, New Life Nursery, Inc has the trees and shrubs you need, when you need them. All sizes, from 3-gallon shrubs to 25-gallon trees, are grown here on our farm in Southern New Jersey. Browse our Availability List, and contact us if you would like more information, or to speak with one of our experts at {business?.PHONE?.Link}.</h3>
                <h3>Warmest Wishes,</h3>
                <h2 style={{fontFamily:'fantasy'}}>The Gianaris Family</h2>
            </div>
        </div >
    );
}

AboutPage.propTypes = {
}

export { AboutPage };