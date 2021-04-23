import { useState } from "react";
import { useGet } from "restful-react";
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';

function PrivacyPolicyPage() {
    const [privacy, setPrivacy] = useState(null);

    useGet({
        path: 'privacy.md',
        resolve: (response) => setPrivacy(response),
    })

    return (
        <div id="page">
            <PolicyBreadcrumbs />
            <ReactMarkdown>{ privacy }</ReactMarkdown>
        </div>
    );
}

PrivacyPolicyPage.propTypes = {
    
}

export default PrivacyPolicyPage;