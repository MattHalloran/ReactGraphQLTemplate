import React from 'react';
import {
    Link,
    Typography
} from '@material-ui/core';
import { LINKS } from 'utils';

function Copyright({
    business,
    ...props
}) {
    return (
      <Typography {...props} variant="body2" color="textSecondary" align="center">
        {`© ${new Date().getFullYear()} `}
        <Link color="inherit" href={business?.WEBSITE}>
          {business?.BUSINESS_NAME?.Long}
        </Link>
        {' | '}
        <Link color="inherit" href={LINKS.PrivacyPolicy}>
            Privacy
        </Link>
        {' | '}
        <Link color="inherit" href={LINKS.Terms}>
            {'Terms & Conditions'}
        </Link>
      </Typography>
    );
}

export { Copyright };