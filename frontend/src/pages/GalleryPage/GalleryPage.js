import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { HotKeys } from "react-hotkeys";
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledGalleryImage } from './GalleryPage.styled';
import { useGet } from "restful-react";
import { getImages, getImage } from 'query/http_promises';
import {
    InformationalBreadcrumbs,
    StyledModal as Modal,
} from 'components';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/img';
import { PUBS, LINKS } from 'utils/consts';
import { ImageList, ImageListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    imageList: {
        spacing: 0,
    },
    tileImg: {
        
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
        <ImageList cellHeight={300} className={classes.imageList} cols={Math.round(window.innerWidth/300)} spacing={1} {...props}>
            {data.map((tile) => (
                <ImageListItem key={tile.img} cols={tile.cols || 1} onClick={() => onClick(tile)}>
                    <img className={classes.tileImg} src={tile.img} alt={tile.title} />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

function GalleryPage() {
    const classes = useStyles();
    const [thumbnails, setThumbnails] = useState([]);
    // Key = corresponding thumbnail index, value = expanded imgae
    const full_images = useRef({});
    const images_meta = useRef([]);
    let history = useHistory();
    const urlParams = useParams();
    // [base64 data, alt]
    const [curr_img, setCurrImg] = useState(null);
    const curr_index = useMemo(() => images_meta.current?.findIndex(m => m.id == urlParams.img) ?? -1, [images_meta, urlParams]);
    const loading = useRef(false);
    const track_scrolling_id = 'page';
    //Estimates how many images will fill the screen
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useGet({
        path: "gallery",
        resolve: (response) => {
            if (response.ok) {
                images_meta.current = response.images_meta ?? [];
                console.log('IMAGES META SET', images_meta.current);
                if (images_meta.current.length === 0) {
                    setThumbnails([]);
                } else {
                    loadNextPage();
                }
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

    // useHotkeys('escape', () => setCurrImg([null, null]));
    // useHotkeys('arrowLeft', () => prevImage());
    // useHotkeys('arrowRight', () => nextImage());

    const loading_full_image = useRef(false);
    const loadImage = useCallback((index, id) => {
        // If this function hasn't finished yet
        if (loading_full_image.current) return;
        // If there is an image to load
        if (!id) return;
        // First check if the image data has already been retrieved
        if (index in full_images.current) {
            setCurrImg(full_images.current[index]);
        } else if (index >= 0) {
            loading_full_image.current = true;
            console.log(full_images.current);
            // Request the image from the backend
            getImage(id, 'l').then(response => {
                let image_data = [`data:image/jpeg;base64,${response.image}`, response.alt];
                setCurrImg(image_data);
                full_images.current[index] = image_data;
            }).catch(error => {
                console.error('FAILED TO LOAD FULL IMAGE', error)
            }).finally(() => loading_full_image.current = false);
        } else {
            setCurrImg(null);
        }
    }, [loading_full_image, full_images])

    useEffect(() => {
        if (urlParams.img) {
            loadImage(curr_index, urlParams.img);
        } else {
            setCurrImg([null, null]);
        }
    }, [urlParams, curr_index, loadImage])

    useEffect(() => {
        loading.current = false;
    }, [thumbnails])

    const loadNextPage = useCallback(() => {
        if (loading.current || images_meta.current.length <= thumbnails.length) return;
        loading.current = true;
        //Grab all thumbnail images
        let load_to = Math.min(images_meta.current.length, thumbnails.length + page_size - 1);
        let ids = images_meta.current.map(meta => meta.id).slice(thumbnails.length, load_to);
        getImages(ids, 'ml').then(response => {
            let combined_data = [];
            //Combine metadata with thumbnail images
            for (let i = 0; i < ids.length; i++) {
                let meta = images_meta.current[thumbnails.length + i];
                if (!meta) {
                    console.log('META IS EMPTY', images_meta.current, i);
                    continue;
                }
                let img = response.images[i];
                let new_data = {
                    "key": meta.id,
                    "img": `data:image/jpeg;base64,${img}`,
                    "title": meta.alt,
                    "author": 'New Life Nursery', //TODO credit actual author, if not New Life
                    "cols": Math.round((meta.width*0.9) / meta.height),
                };
                // Prevent identical images from being added multiple times, if checks
                // up to this point have failed
                if (!images_meta.current.some(d => d.key === new_data.key)) {
                    combined_data.push(new_data);
                }
            }
            setThumbnails(thumbs => thumbs.concat(combined_data));
            loading.current = false;
        }).catch(error => {
            console.error("Failed to load thumbnails!", error);
            loading.current = false;
        });
        return () => loading.current = false;
    }, [thumbnails, page_size]);

    //Load next page if scrolling near the bottom of the page
    const checkScroll = useCallback(() => {
        const divElement = document.getElementById(track_scrolling_id);
        if (divElement.getBoundingClientRect().bottom <= 1.5 * window.innerHeight) {
            loadNextPage();
        }
    }, [track_scrolling_id, loadNextPage])

    useLayoutEffect(() => {
        document.addEventListener('scroll', checkScroll);
        return (() => document.removeEventListener('scroll', checkScroll));
    })

    const prevImage = useCallback(() => {
        if (thumbnails.length <= 0) return;
        // Default to last image if none open
        if (curr_index < 0) {
            history.push(LINKS.Gallery + '/' + images_meta.current[thumbnails.length - 1].id);
        } else {
            // Find previous image index using modulus
            let prev_index = (curr_index + images_meta.current.length - 1) % images_meta.current.length;
            let id = images_meta.current[prev_index].id
            history.replace(LINKS.Gallery + '/' + id);
        }
    }, [thumbnails, images_meta, curr_index, history]);

    const nextImage = useCallback(() => {
        if (thumbnails.length <= 0) return;
        // Default to first image if none open
        if (curr_index < 0) {
            history.push(LINKS.Gallery + '/' + images_meta.current[0].id);
        } else {
            // Find next image index using modulus
            let next_index = (curr_index + 1) % images_meta.current.length;
            let id = images_meta.current[next_index].id;
            history.replace(LINKS.Gallery + '/' + id);
        }
    }, [thumbnails, images_meta, curr_index, history]);

    const openImage = (tile) => {
        let key = tile?.key;
        if (key) {
            history.push(LINKS.Gallery + '/' + key);
        }
    }

    let popup = (curr_img && curr_img[0]) ? (
        <Modal onClose={() => history.goBack()}>
            <GalleryImage
                src={curr_img[0]}
                alt={curr_img[1]}
                goLeft={prevImage}
                goRight={nextImage} >
            </GalleryImage>
        </Modal>
    ) : null;
    return (
        <div id='page'>
            {popup}
            <InformationalBreadcrumbs />
            <ImageGridList data={thumbnails} onClick={openImage} />
        </div>
    );
}

GalleryPage.propTypes = {
}

export default GalleryPage;

function GalleryImage(props) {

    const keyMap = {
        PREVIOUS: "left",
        NEXT: "right",
    };

    const handlers = {
        PREVIOUS: () => {
            props.goLeft()
        },
        NEXT: () => props.goRight(),
    };

    useEffect(() => {
        document.getElementById('boop').focus()
    }, [])

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <StyledGalleryImage id='boop'>
                <ChevronLeftIcon width="50px" height="50px" className="arrow left" onClick={props.goLeft} />
                <ChevronRightIcon width="50px" height="50px" className="arrow right" onClick={props.goRight} />
                <img src={props.src} alt={props.alt} />
            </StyledGalleryImage>
        </HotKeys>
    );
}

GalleryImage.propTypes = {
    src: PropTypes.string.isRequired, // base-64 image data
    alt: PropTypes.string.isRequired,
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
}

export { GalleryImage };