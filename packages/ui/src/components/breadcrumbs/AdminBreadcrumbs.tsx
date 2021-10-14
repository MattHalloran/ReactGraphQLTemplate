import React from 'react';
import { LINKS } from 'utils';
import { BreadcrumbsBase } from './BreadcrumbsBase';
import { BreadcrumbsBaseProps } from './types';

const paths = [
    ['Orders', LINKS.AdminOrders],
    ['Customers', LINKS.AdminCustomers],
    ['Inventory', LINKS.AdminInventory],
    ['Hero', LINKS.AdminHero],
    ['Gallery', LINKS.AdminGallery],
    ['Contact Info', LINKS.AdminContactInfo]
].map(row => ({ text: row[0], link: row[1] }))

export const AdminBreadcrumbs = (props: Omit<BreadcrumbsBaseProps, 'paths' | 'ariaLabel'>) => BreadcrumbsBase({
    paths: paths,
    ariaLabel: 'Admin breadcrumb',
    ...props
})