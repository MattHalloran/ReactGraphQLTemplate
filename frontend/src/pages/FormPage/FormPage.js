import { Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    page: {
        maxWidth: '100%',
        maxHeight: '100%',
        padding: '2em',
        marginTop: 'calc(14vh + 20px)',
        backgroundColor: theme.palette.background.paper
    },
    header: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        padding: '1em',
        textAlign: 'center'
    },
    container: {
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
    [theme.breakpoints.down("sm")]: {
        page: {
            padding: '0'
        }
      },
}));

function FormPage({
    header,
    autocomplete = 'on',
    children,
    maxWidth = '90%',
}) {
    const classes = useStyles();

    return (
        <div className={classes.page} maxWidth={maxWidth}>
            <div className={classes.container}>
                <Container className={classes.header}>
                    <Typography variant="h3" >{header}</Typography>
                </Container>
                <Container>
                    {children}
                </Container>
            </div>
        </div>
    );
}

FormPage.propTypes = {
    header: PropTypes.string.isRequired,
    autocomplete: PropTypes.string,
    children: PropTypes.any,
    maxWidth: PropTypes.string,
}

export default FormPage;