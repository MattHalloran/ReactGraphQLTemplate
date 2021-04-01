import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { BUSINESS_NAME, LINKS } from 'utils/consts';
import { Typography, Card, CardContent, CardActions, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    card: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        cursor: 'pointer',
    },
    flexed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gridGap: '20px',
        alignItems: 'stretch',
    },
}));

function AdminMainPage() {
    let history = useHistory();
    const classes = useStyles();

    useLayoutEffect(() => {
        document.title = `Admin Portal | ${BUSINESS_NAME.Short}`;
    }, [])

    const card_data = [
        ['Orders', "Approve, create, and edit customer's orders", LINKS.AdminOrders],
        ['Customers', "Approve new customers, edit customer information", LINKS.AdminCustomers],
        ['Inventory', "Add, remove, and update inventory", LINKS.AdminInventory],
        ['Gallery', "Add, remove, and rearrange gallery images", LINKS.AdminGallery],
        ['Contact Info', "Edit business hours and other contact information", LINKS.AdminContactInfo],
    ]

    return (
        <div id='page'>
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Admin Portal</Typography>
            </div>
            <div className={classes.flexed}>
                {card_data.map(([title, description, link]) => (
                    <Card className={classes.card}>
                        <CardContent onClick={() => history.push(link)}>
                            <Typography variant="h5" component="h2">
                                {title}
                            </Typography>
                            <Typography variant="body2" component="p">
                                {description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => history.push(link)}>Open</Button>
                        </CardActions>
                    </Card>
                ))}
            </div>
        </div >
    );
}

AdminMainPage.propTypes = {
}

export default AdminMainPage;