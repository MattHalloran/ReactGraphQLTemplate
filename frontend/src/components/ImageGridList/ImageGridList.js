import PropTypes from 'prop-types';
import PropTypes from 'prop-types';
import { ImageList, ImageListItem } from '@material-ui/core';
import { SortableContainer } from 'react-sortable-hoc';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    imageList: {
        spacing: 0,
    },
    tileImg: {

    }
}));

function ListWrap({
    sortable,
    cellHeight,
    onClick,
    ...props
}) {
    const classes = useStyles();
    let list = (
        <ImageList cellHeight={cellHeight} className={classes.imageList} cols={Math.round(window.innerWidth / cellHeight)} spacing={1} {...props}>
            {data.map((tile) => (
                <ImageListItem key={tile.img} cols={tile.cols || 1} onClick={() => onClick && onClick(tile)}>
                    <img className={classes.tileImg} src={tile.img} alt={tile.title} />
                </ImageListItem>
            ))}
        </ImageList>
    );
    return sortable ? SortableContainer(list) : list;
}

/**
 * Data must be structured as follows:
 *
 * data = [
 *   {
 *     img: image,
 *     title: 'Image',
 *     author: 'author',
 *     cols: 2,
 *   },
 *   {
 *     [etc...]
 *   },
 * ];
 */
function ImageGridList({
    data,
    cellHeight = 300,
    sortable = false,
    onClick,
    ...props
}) {
    const classes = useStyles();

    let listBase = (
        <ImageList cellHeight={cellHeight} className={classes.imageList} cols={Math.round(window.innerWidth / cellHeight)} spacing={1} {...props}>
            {data.map((tile) => (
                <ImageListItem key={tile.img} cols={tile.cols || 1} onClick={() => onClick && onClick(tile)}>
                    <img className={classes.tileImg} src={tile.img} alt={tile.title} />
                </ImageListItem>
            ))}
        </ImageList>
    );
    let list = sortable ? SortableContainer(list) : list;

    return (
        <ImageList cellHeight={cellHeight} className={classes.imageList} cols={Math.round(window.innerWidth / cellHeight)} spacing={1} {...props}>
            {data.map((tile) => (
                <ImageListItem key={tile.img} cols={tile.cols || 1} onClick={() => onClick && onClick(tile)}>
                    <img className={classes.tileImg} src={tile.img} alt={tile.title} />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

ImageGridList.propTypes = {
    data: PropTypes.array.isRequired,
    cellHeight: PropTypes.number,
    sortable: PropTypes.bool,
    onClick: PropTypes.func
}

export default ImageGridList;