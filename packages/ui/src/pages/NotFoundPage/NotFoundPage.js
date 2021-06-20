import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS_NAME } from '@local/shared';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    center: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
    },
}));

function NotFoundPage() {
    const classes = useStyles();

    useLayoutEffect(() => {
        document.title = `404 | ${BUSINESS_NAME.Short}`;
    })

    return (
        <div id="page">
            <div className={classes.center}>
                <h1>Page Not Found</h1>
                <h3>Looks like you've followed a broken link or entered a URL that doesn't exist on this site</h3>
                <br />
                <Link to="/">
                    <Button>Go to Home</Button>
                </Link>
            </div>
        </div>
    );
}

NotFoundPage.propTypes = {
    
}

export { NotFoundPage };