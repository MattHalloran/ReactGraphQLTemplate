import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid } from '@material-ui/core';
import { ImageList } from './ImageList';

const useStyles = makeStyles((theme) => ({
    pad: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2)
    },
    gridItem: {
        display: 'flex',
    },
}));

interface Props {
    data: any[];
    onApply: () => any;
}

export const WrappedImageList: React.FC<Props> = ({
    data,
    onApply
}) => {
    const classes = useStyles();
    const [changed, setChanged] = useState(null);

    useEffect(() => {
        setChanged(data);
    }, [data])

    let options = (
        <Grid classes={{ container: classes.pad }} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={() => onApply(changed)}>Apply Changes</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={() => setChanged(data)}>Revert Changes</Button>
            </Grid>
        </Grid>
    )

    return (
        <div>
            { options}
                <ImageList data={changed} onUpdate={(d) => setChanged(d)}/>
            { options}
        </div>
    );
}