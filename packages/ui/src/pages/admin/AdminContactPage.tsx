import { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@material-ui/core';
import { AdminBreadcrumbs } from 'components';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import {
    Button,
    Grid,
    TextField,
    Theme,
    Typography
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { writeAssetsMutation } from 'graphql/mutation';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { pageStyles } from '../styles';
import { combineStyles } from 'utils';
import { CommonProps } from 'types';
import { writeAssets } from 'graphql/generated/writeAssets';

const componentStyles = (theme: Theme) => ({
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
})

const useStyles = makeStyles(combineStyles(pageStyles, componentStyles));

export const AdminContactPage = ({
    business
}: Pick<CommonProps, 'business'>) => {
    const classes = useStyles();
    const theme = useTheme();
    const [hours, setHours] = useState('');
    const [updateHours] = useMutation<writeAssets>(writeAssetsMutation);

    useEffect(() => {
        setHours(business?.hours);
    }, [business])

    const applyHours = () => {
        // Data must be sent as a file to use writeAssets
        const blob = new Blob([hours], { type: 'text/plain' });
        const file = new File([blob], 'hours.md', { type: blob.type });
        mutationWrapper({
            mutation: updateHours,
            data: { variables: { files: [file] } },
            successCondition: (response) => response.data.writeAssets,
            successMessage: () => 'Hours updated.',
            errorMessage: () => 'Failed to update hours.',
        })
    }

    const revertHours = () => {
        setHours(business?.hours);
    }

    let options = (
        <Grid classes={{ container: classes.pad }} container spacing={2}>
            <Grid className={classes.gridItem} item xs={12} sm={6}>
                <Button fullWidth disabled={business?.hours === hours} onClick={applyHours}>Apply Changes</Button>
            </Grid>
            <Grid className={classes.gridItem} item xs={12} sm={6}>
                <Button fullWidth disabled={business?.hours === hours} onClick={revertHours}>Revert Changes</Button>
            </Grid>
        </Grid>
    )

    const onUpdateHours = useCallback((e) => setHours(e.target.value), []);

    return (
        <div id="page" className={classes.root}>
            <AdminBreadcrumbs textColor={theme.palette.secondary.dark} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Contact Info</Typography>
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
                        onChange={onUpdateHours}
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