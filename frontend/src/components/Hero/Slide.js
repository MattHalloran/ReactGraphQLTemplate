import { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((width) => ({
    slide: {
        height: '100%',
        width: width,
        objectFit: 'cover',
        overflow: 'hidden',
    },
}));

const Slide = ({ content, width }) => {
    const classes = useStyles(width);
    return (
        <img className={classes.slide} src={content} />
    )
}

export default memo(Slide)