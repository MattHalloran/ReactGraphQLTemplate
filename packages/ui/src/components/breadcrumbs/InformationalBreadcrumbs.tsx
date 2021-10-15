import { LINKS } from 'utils';
import { BreadcrumbsBase } from './BreadcrumbsBase';
import { BreadcrumbsBaseProps } from './types';

const paths = [
    ['About Us', LINKS.About],
    ['Gallery', LINKS.Gallery]
].map(row => ({ text: row[0], link: row[1] }))

const InformationalBreadcrumbs = ({...props}: Omit<BreadcrumbsBaseProps, 'paths' | 'ariaLabel'>) => BreadcrumbsBase({
    paths: paths,
    ariaLabel: 'About us breadcrumb',
    ...props
})

export { InformationalBreadcrumbs };