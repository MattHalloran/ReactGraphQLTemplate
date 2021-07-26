import React, { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import { readAssetsQuery } from 'graphql/query/readAssets';
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';

function TermsPage() {
    const [terms, setTerms] = useState(null);
    const { data: termsData } = useQuery(readAssetsQuery, { variables: { files: ['terms.md'] } });

    useEffect(() => {
        if (termsData === undefined) return;
        let data = termsData.readAssets[0] ? JSON.parse(termsData.readAssets[0]) : {};
        setTerms(data);
    }, [termsData])

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