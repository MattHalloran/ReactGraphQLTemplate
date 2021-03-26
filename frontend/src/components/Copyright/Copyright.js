import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { WEBSITE_URL, FULL_BUSINESS_NAME, LINKS } from 'utils/consts';

function Copyright({
    ...props
}) {
    return (
      <Typography {...props} variant="body2" color="textSecondary" align="center">
        {`© ${new Date().getFullYear()} `}
        <Link color="inherit" href={WEBSITE_URL}>
          {FULL_BUSINESS_NAME}
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

export default Copyright;