import { useState } from "react";
import { useGet } from "restful-react";
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';

function TermsPage() {
    const [terms, setTerms] = useState(null);

    useGet({
        path: 'terms.md',
        resolve: (response) => setTerms(response),
    })

    return (
        <div id="page">
            <PolicyBreadcrumbs />
            <ReactMarkdown>{ terms }</ReactMarkdown>
        </div>
    );
}

TermsPage.propTypes = {

}

export default TermsPage;