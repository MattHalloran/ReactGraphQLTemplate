import React from 'react';
import { BreadcrumbsBase } from 'components';
import { LINKS } from 'utils';

interface Props  {
    business: { BUSINESS_NAME: { Long: string; Short: string; } };
    separator?: string;
    textColor?: string;
    className?: string;
}

const CopyrightBreadcrumbs: React.FC<Props> = ({ business, ...props }) => {
    const paths = [
        [`© ${new Date().getFullYear()} ${business?.BUSINESS_NAME?.Long ?? business?.BUSINESS_NAME?.Short ?? 'Home'}`, LINKS.Home],
        ['Privacy', LINKS.PrivacyPolicy],
        ['Terms', LINKS.Terms]
    ].map(row => ({ text: row[0], link: row[1] }))
    return BreadcrumbsBase({
        paths: paths,
        ariaLabel: 'Copyright breadcrumb',
        style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        ...props
    })
}

export { CopyrightBreadcrumbs };