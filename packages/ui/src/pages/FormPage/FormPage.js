import { Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { lightTheme } from 'utils';

const useStyles = makeStyles((theme) => ({
    header: {
        // backgroundColor: theme.palette.primary.main,
        backgroundColor: lightTheme.palette.primary.main,
        // color: theme.palette.background.default,
        color: lightTheme.palette.background.default,
        padding: '1em',
        textAlign: 'center'
    },
    container: {
        // backgroundColor: theme.palette.background.paper,
        backgroundColor: lightTheme.palette.background.paper,
        display: 'grid',
        position: 'relative',
        boxShadow: '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
        minWidth: '300px',
        maxWidth: 'min(100%, 700px)',
        borderRadius: '10px',
        overflow: 'hidden',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '20px'
    },
    // [theme.breakpoints.down("sm")]: {
    //     page: {
    //         padding: '0',
    //         paddingTop: 'calc(14vh + 20px)',
    //     }
    //   },
    [lightTheme.breakpoints.down("sm")]: {
        page: {
            padding: '0',
            paddingTop: 'calc(14vh + 20px)',
        }
      },
}));

function FormPage({
    title,
    autocomplete = 'on',
    children,
    maxWidth = '90%',
}) {
    const classes = useStyles();

    return (
        <div id='page' maxWidth={maxWidth}>
            <div className={classes.container}>
                <Container className={classes.header}>
                    <Typography variant="h3" >{title}</Typography>
                </Container>
                <Container>
                    {children}
                </Container>
            </div>
        </div>
    );
}

FormPage.propTypes = {
    title: PropTypes.string.isRequired,
    autocomplete: PropTypes.string,
    children: PropTypes.any,
    maxWidth: PropTypes.string,
}

export { FormPage };