import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AdminBreadcrumbs } from 'components';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
// import { contactQuery } from 'graphql/query';
// import { contactMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import {
    Button,
    Grid,
    TextField,
    Typography
} from '@material-ui/core';
import { fetch_asset } from 'query/http_functions';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils';
import { readAssetsQuery } from 'graphql/query/readAssets';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    tall: {
        height: '100%',
    },
    hoursPreview: {
        border: '1px solid gray',
        borderRadius: '2px',
        width: '100%',
        height: '100%',
    },
    pad: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2)
    },
    gridItem: {
        display: 'flex',
    },
}));

function AdminContactPage() {
    const classes = useStyles();
    const { data: currHours } = useQuery(readAssetsQuery, { variables: { files: ['hours.md'] } });
    const [hours, setHours] = useState('');
    // const { data: contactInfo } = useQuery(contactQuery);
    // const [updateContactInfo] = useMutation(contactMutation);

    useEffect(() => {
        console.log('SETTING HOURS FROM CURR HOURS', currHours)
        setHours(currHours.readAssets[0]);
    }, [currHours])

    let options = (
        <Grid classes={{ container: classes.pad }} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={() => {}}>Apply Changes</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={() => {}}>Revert Changes</Button>
            </Grid>
        </Grid>
    )

    return (
        <div id="page" className={classes.root}>
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Edit Contact Info</Typography>
            </div>
            { options }
            <Grid container spacing={2} direction="row">
                <Grid item sm={12} md={6}>
                    <TextField
                        id="filled-multiline-static"
                        label="Hours edit"
                        className={classes.tall}
                        InputProps={{ classes: { input: classes.tall, root: classes.tall } }}
                        fullWidth
                        multiline
                        rows={4}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <ReactMarkdown plugins={[gfm]} className={classes.hoursPreview}>
                        {hours}
                        {/* {contactInfo?.hours} */}
                    </ReactMarkdown>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                
            </Grid>
            { options }
        </div>
    );
}

AdminContactPage.propTypes = {
}

export { AdminContactPage };