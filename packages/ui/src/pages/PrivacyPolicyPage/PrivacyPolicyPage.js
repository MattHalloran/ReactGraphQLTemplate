import React, { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import { readAssetsQuery } from 'graphql/query/readAssets';
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';

function PrivacyPolicyPage() {
    const [privacy, setPrivacy] = useState(null);
    const { data: privacyData } = useQuery(readAssetsQuery, { variables: { files: ['privacy.md'] } });

    useEffect(() => {
        if (privacyData === undefined) return;
        let data = privacyData.readAssets[0] ? JSON.parse(privacyData.readAssets[0]) : {};
        setPrivacy(data);
    }, [privacyData])

    return (
        <div id="page">
            <PolicyBreadcrumbs />
            <ReactMarkdown>{ privacy }</ReactMarkdown>
        </div>
    );
}

PrivacyPolicyPage.propTypes = {
    
}

export { PrivacyPolicyPage };