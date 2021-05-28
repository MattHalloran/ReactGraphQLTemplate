import {
    Link,
    Typography
} from '@material-ui/core';
import { BUSINESS_NAME, WEBSITE_URL } from '@local/shared';
import { LINKS } from 'utils/consts';

function Copyright({
    ...props
}) {
    return (
      <Typography {...props} variant="body2" color="textSecondary" align="center">
        {`© ${new Date().getFullYear()} `}
        <Link color="inherit" href={WEBSITE_URL}>
          {BUSINESS_NAME.Long}
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