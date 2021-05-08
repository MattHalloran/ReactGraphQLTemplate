import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { HotKeys } from "react-hotkeys";
import PropTypes from 'prop-types';
import Carousel from 'react-gallery-carousel';
import 'react-gallery-carousel/dist/index.css';
import PubSub from 'utils/pubsub';
import { useGet } from "restful-react";
import {
    InformationalBreadcrumbs,
    StyledModal as Modal,
} from 'components';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/img';
import { PUBS, LINKS, URL_BASE } from 'utils/consts';
import { ImageList, ImageListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getImage, getImages } from 'query/http_promises';
import SwipeableViews from 'react-swipeable-views';
import { NoImageIcon } from 'assets/img';

const useStyles = makeStyles((theme) => ({
    imageList: {
        spacing: 0,
    },
    tileImg: {

    },
    popupMain: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    popupImg: {
        maxHeight: '90vh',
        maxWidth: '100%',
        display: 'block',
        borderRadius: '10px',
        objectFit: 'contain',
    },
    carousel: {
        width: '100%',
        height: 'calc(100vw * 0.8)'
    }
}));

//TODO add gallery modal part if url match (/gallery/:img)

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
    onClick,
    ...props
}) {
    const classes = useStyles();
    return (
        <ImageList rowHeight={300} className={classes.imageList} cols={Math.round(window.innerWidth / 300)} spacing={1} {...props}>
            {data.map((tile) => (
                <ImageListItem key={tile.id} cols={tile.cols || 1} onClick={() => onClick(tile)}>
                    <img className={classes.tileImg} src={tile.src} alt={tile.alt} />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

function GalleryPage() {
    const classes = useStyles();
    const [imageKeys, setImageKeys] = useState([]);
    const [imageData, setImageData] = useState([]);

    useEffect(() => {
        if (imageKeys.length === 0)
            setImageData([]);
        else {
            let combined_data = [];
            //Combine metadata with thumbnail images
            for (let i = 0; i < imageKeys.length; i++) {
                let new_data = {
                    "id": imageKeys[i],
                    "src": `${URL_BASE}/image?key=${imageKeys[i]}&size=l`,
                    "thumbnail": `${URL_BASE}/image?key=${imageKeys[i]}&size=s`,
                };
                combined_data.push(new_data);
            }
            setImageData(combined_data);
            // let images = [900, 800, 700, 600, 500].map((size) => ({
            //     src: `https://placedog.net/${size}/${size}`
            //   }));
            // setImageData(images);
        }
    }, [imageKeys])

    useGet({
        path: "gallery",
        resolve: (response) => {
            if (response.ok) {
                setImageKeys(response.data ?? []);
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

    // useHotkeys('escape', () => setCurrImg([null, null]));
    // useHotkeys('arrowLeft', () => navigate(-1));
    // useHotkeys('arrowRight', () => navigate(1));

    return (
        <div id='page'>
            <InformationalBreadcrumbs />
            <Carousel className={classes.carousel} canAutoPlay={false} images={imageData} />
        </div>
    );
}

GalleryPage.propTypes = {
}

export default GalleryPage;