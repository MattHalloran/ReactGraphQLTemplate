import { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    slide: props => ({
        height: '100%',
        width: `${props.width}px`,
        objectFit: 'cover',
        overflow: 'hidden',
    }),
});

const Slide = ({ content, width }) => {
    const classes = useStyles({width});
    return (
        <img className={classes.slide} src={content} alt='' />
    )
}

export default memo(Slide)