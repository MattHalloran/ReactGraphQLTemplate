import React from 'react';
import { LINKS } from 'utils';
import { BreadcrumbsBase } from './BreadcrumbsBase';

const paths = [
    ['Privacy', LINKS.PrivacyPolicy],
    ['Terms', LINKS.Terms]
].map(row => ({ text: row[0], link: row[1] }))

const PolicyBreadcrumbs: React.FC = ({...props}) => BreadcrumbsBase({
    paths: paths,
    ariaLabel: 'Policies breadcrumb',
    ...props
})

export { PolicyBreadcrumbs };