import update from 'immutability-helper';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { ImageCard } from 'components/cards/ImageCard/ImageCard';
import { useCallback, useEffect, useState } from 'react';
import { EditImageDialog } from 'components/dialogs/EditImageDialog/EditImageDialog';
import { Button, Grid } from '@material-ui/core';
import { lightTheme } from 'utils';

const useStyles = makeStyles((theme) => ({
    flexed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
    pad: {
        // marginBottom: theme.spacing(2),
        marginBottom: lightTheme.spacing(2),
        marginTop: lightTheme.spacing(2)
    },
    gridItem: {
        display: 'flex',
    },
}));

function ImageList({
    data,
    onApply
}) {
    const classes = useStyles();
    const [selected, setSelected] = useState(-1);
    const [changed, setChanged] = useState(null);

    useEffect(() => {
        setChanged(data);
    }, [data])

    const moveCard = useCallback((dragIndex, hoverIndex) => {
        console.log('IN MOVE CARD', dragIndex, hoverIndex);
        const dragCard = changed[dragIndex];
        setChanged(update(changed, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragCard],
            ],
        }));
    }, [changed]);

    const saveImageData = useCallback((d) => {
        let updated = [...changed];
        updated[selected] = {
            ...updated[selected],
            ...d
        };
        setChanged(updated);
        setSelected(-1);
    }, [selected])

    const deleteImage = (index) => {
        let updated = [...changed];
        updated.splice(index, 1);
        setChanged(updated);
    }

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
            <div className={classes.flexed}>
                <EditImageDialog
                    open={selected >= 0}
                    data={selected >= 0 ? changed[selected] : null}
                    onClose={() => setSelected(-1)}
                    onSave={saveImageData}
                />
                {changed?.map((item, index) => (
                    <ImageCard
                        key={index}
                        index={index}
                        data={item}
                        onDelete={() => deleteImage(index)}
                        onEdit={() => setSelected(index)}
                        moveCard={moveCard}
                    />
                ))}
            </div>
            { options}
        </div>
    );
}

ImageList.propTypes = {
    data: PropTypes.object.isRequired,
    onApply: PropTypes.func.isRequired,
}

export { ImageList };