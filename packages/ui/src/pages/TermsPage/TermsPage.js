import React, { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import { readAssetsQuery } from 'graphql/query/readAssets';
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';
import { convertToDot, valueFromDot } from "utils";

function TermsPage({
    business
}) {
    const [terms, setTerms] = useState(null);
    const { data: termsData } = useQuery(readAssetsQuery, { variables: { files: ['terms.md'] } });

    useEffect(() => {
        if (termsData === undefined) return;
        let data = termsData.readAssets[0];
        // Replace variables
        const business_fields = Object.keys(convertToDot(business));
        business_fields.forEach(f => data = data.replaceAll(`<${f}>`, valueFromDot(business, f) || ''));
        setTerms(data);
    }, [termsData, business])

    return (
        <div id="page">
            <PolicyBreadcrumbs />
            <ReactMarkdown>{ terms }</ReactMarkdown>
        </div>
    );
}

TermsPage.propTypes = {
    
}

export { TermsPage };