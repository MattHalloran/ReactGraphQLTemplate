import { useLayoutEffect, useState, useEffect } from 'react';
import { StyledTermsPage } from './TermsPage.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme } from 'utils/storage';
import { PubSub } from 'utils/pubsub';

function TermsPage() {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Terms & Conditions | ${BUSINESS_NAME}`;
    })

    return (
        <StyledTermsPage className="page" theme={theme}>
            <h2>Order Terms</h2>
            <ul>
                <li>Our prices are based on current market conditions and are subject to change without notice.</li>
                <li>ORDERS THAT INVOLVE REMOVAL FROM OTHER NURSERY LOCATIONS REQUIRE A 50% DEPOSIT UP FRONT.</li>
                <li>Custom tagging is subject to a 5% surcharge. NO pre-tagging of material will be allowed.</li>
                <li>Should order adjustments need to be made, we will substitute the closest possible size/variety as the original acknowledged order. If you do not wish us to substitute, please write “do not substitute” on your signed confirmation.</li>
                <li>Spring orders must be shipped or picked up prior to April 15th, unless previously agreed to otherwise. Any spring order held past this date may be released.</li>
                <li>Previous season’s accounts must be paid in full before orders for future delivery can be booked.</li>
                <li>Fall orders will be accepted after July 15 th of the current year, and spring orders will be accepted after November 15 th of the previous year.</li>
                <li>10% deposits are required with all orders upon confirmation. If no deposit is received within 30 days of confirmation, order is considered tentative. All confirmed orders must be signed by the purchaser.</li>
                <li>Signing the confirmation or invoice shows that you agree to all terms and conditions of sale.</li>
                <li>Order cancellations or revisions must be made no later than 30 days before scheduled delivery and must be signed by both parties.</li>
                <li>All orders are subject to stock on hand, crop conditions, and acts of nature beyond our control.</li>
            </ul>
            <h2>Payment Terms</h2>
            <ul>
                <li>All new accounts are C.O.D only and must pay in cash or certified check upon delivery. In the event that an account is referred to an attorney for collection, the purchaser agrees to pay all costs, including attorney’s fees.</li>
                <li>Invoices paid by credit card are subject to a 3% surcharge.</li>
                <li>Past due accounts are subject to a service charge of 1.5% per month (18% annum).</li>
                <li>Unpaid and past due accounts will require pre-payments on future orders.</li>
                <li>Seller reserves the right to refuse shipment to customers whose account balances are 30 days beyond terms.</li>
            </ul>
            <h2>Shipping Terms</h2>
            <ul>
                <li>All plants travel at the expense and risk of the purchaser. We are not liable for material damaged while unloading or after delivery.</li>
                <li>Please report claims within 48 hours of delivery. Damaged material must be returned to carrier in order to receive credit. Short counts and/or transit damage must be noted on the original invoice before the truck departs your location, and must be clearly noted with driver’s signature.</li>
                <li>All pickups must be arranged at least one day in advance.</li>
                <li>Shipping must be paid C.O.D. to carrier and can be arranged by New Life Nursery upon request.</li>
                <li>Spring orders must be shipped or picked up prior to April 15th, or the order may be released.</li>
            </ul>
        </StyledTermsPage>
    );
}

TermsPage.propTypes = {

}

export default TermsPage;