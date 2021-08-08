import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AdminBreadcrumbs } from 'components';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import {
    Button,
    Grid,
    TextField,
    Typography
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { writeAssetsMutation } from 'graphql/mutation';
import { PUBS, PubSub } from 'utils';

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

function AdminContactPage({
    business
}) {
    const classes = useStyles();
    const [hours, setHours] = useState('');
    const [updateHours] = useMutation(writeAssetsMutation);

    useEffect(() => {
        setHours(business?.hours);
    }, [business])

    const applyHours = () => {
        // Data must be sent as a file to use writeAssets
        const blob = new Blob([hours], { type: 'text/plain' });
        const file = new File([blob], 'hours.md', { type: blob.type });
        updateHours({ variables: { files: [file] } })
            .then((response) => {
                if (response.data.writeAssets) {
                    PubSub.publish(PUBS.Snack, { message: 'Hours updated' });
                } else {
                    PubSub.publish(PUBS.Snack, { message: 'Failed to update hours', severity: 'error' });
                }
            })
            .catch((error) => {
                console.error(error);
                PubSub.publish(PUBS.Snack, { message: 'Failed to update hours', severity: 'error' });
            });
    }

    const revertHours = () => {
        setHours(business?.hours);
    }

    let options = (
        <Grid classes={{ container: classes.pad }} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth disabled={business?.hours === hours} onClick={applyHours}>Apply Changes</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth disabled={business?.hours === hours} onClick={revertHours}>Revert Changes</Button>
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