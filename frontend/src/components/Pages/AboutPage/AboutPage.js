import React from 'react';
import { StyledAboutPage } from './AboutPage.styled';

export default class AboutPage extends React.Component {
    componentDidMount() {
        document.title = "About | New Life Nursery"
    }
    render() {
        return (
            <StyledAboutPage>
                <h1>About New Life Nursery Inc</h1>
                <br/>
                <h3>For over thirty-five years, New Life Nursery, Inc has been striving to grow the most beautiful, healthy and consistent plant material at competitive prices. Family owned and operated by the Gianaris Family, we continue to hold to our original motto: "Growing top quality material for buyers who are interested in the best".

As wholesale growers, we are always looking ahead to the next season with anticipation for something new. In addition to the wonderful trees and shrubs you have come to expect from New Life Nursery, Inc, we look forward to offering many new varieties as we head into each new season. Feel free to contact us for access to our updated availability list. As always, we encourage our customers to send us their comments and suggestions.

With over 70 acres in production, New Life Nursery, Inc has the trees and shrubs you need, when you need them. All sizes, from 3-gallon shrubs to 25-gallon trees, are grown here on our farm in Southern New Jersey. Browse our Availability List, and contact us if you would like more information, or to speak with one of our experts at (856) 455-3601.

Warmest Wishes,

The Gianaris Family</h3>
            </StyledAboutPage >
        );
    }
}