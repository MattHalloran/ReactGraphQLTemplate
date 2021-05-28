import { useHistory } from 'react-router-dom';
import { LINKS } from 'utils';
import { Typography, Card, CardContent, CardActions, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    card: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        cursor: 'pointer',
    },
    flexed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gridGap: '20px',
        alignItems: 'stretch',
    },
    button: {
        color: theme.palette.secondary.light,
    },
}));

function AdminMainPage() {
    let history = useHistory();
    const classes = useStyles();

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
                    <Card className={classes.card} onClick={() => history.push(link)}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {title}
                            </Typography>
                            <Typography variant="body2" component="p">
                                {description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button className={classes.button} variant="text" size="small" onClick={() => history.push(link)}>Open</Button>
                        </CardActions>
                    </Card>
                ))}
            </div>
        </div >
    );
}

AdminMainPage.propTypes = {
}

export { AdminMainPage };