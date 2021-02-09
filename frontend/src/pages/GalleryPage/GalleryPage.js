import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { HotKeys } from "react-hotkeys";
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledGalleryPage, StyledGalleryImage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import { SortableGalleryPhoto } from "components/GalleryPhoto/GalleryPhoto";
import { getGallery, getGalleryThumbnails, getImageFromHash } from 'query/http_promises';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from "array-move";
import Modal from 'components/wrappers/Modal/Modal';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/img';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { getTheme } from 'utils/storage';

//TODO add gallery modal part if url match (/gallery/:img)

const SortableGallery = SortableContainer(({ items, handleClick }) => (
    <Gallery photos={items} renderImage={props => <SortableGalleryPhoto handleClick={handleClick} {...props} />} />
));

function GalleryPage({
    theme = getTheme(),
}) {
    const [thumbnails, setThumbnails] = useState([]);
    // Key = corresponding thumbnail index, value = expanded imgae
    const full_images = useRef({});
    const images_meta = useRef(null);
    let history = useHistory();
    const urlParams = useParams();
    // [base64 data, alt]
    const [curr_img, setCurrImg] = useState(null);
    const curr_index = useMemo(() => images_meta.current?.findIndex(m => m.hash === urlParams.img) ?? -1, [images_meta, urlParams]);
    const loading = useRef(false);
    const track_scrolling_id = 'scroll-tracked';
    //Estimates how many images will fill the screen
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    // useHotkeys('escape', () => setCurrImg([null, null]));
    // useHotkeys('arrowLeft', () => prevImage());
    // useHotkeys('arrowRight', () => nextImage());

    const loading_full_image = useRef(false);
    const loadImage = useCallback((index, hash) => {
        // If this function hasn't finished yet
        if (loading_full_image.current) return;
        // If there is an image to load
        if (!hash) return;
        // First check if the image data has already been retrieved
        if (index in full_images.current) {
            setCurrImg(full_images.current[index]);
        } else {
            loading_full_image.current = true;
            // Request the image from the backend
            getImageFromHash(hash).then(response => {
                let image_data = [`data:image/jpeg;base64,${response.image}`, response.alt];
                setCurrImg(image_data);
                full_images.current[index] = image_data;
            }).catch(error => {
                console.error('FAILED TO LOAD FULL IMAGE', error)
            }).finally(() => loading_full_image.current = false);
        }
    }, [loading_full_image, full_images])

    useEffect(() => {
        if (urlParams.img) {
            loadImage(curr_index, urlParams.img);
            PubSub.publish(PUBS.PopupOpen, true);
        } else {
            setCurrImg([null, null]);
            PubSub.publish(PUBS.PopupOpen, false);
        }
    }, [urlParams, curr_index, loadImage])

    useLayoutEffect(() => {
        document.title = `Gallery | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', loadNextPage);
        return (() => document.removeEventListener('scroll', loadNextPage));
    })

    useEffect(() => {
        loading.current = false;
    }, [thumbnails])

    const readyToLoadPage = useCallback(() => {
        //If the image metadata hasn't been received, or
        //the next page is still loading
        if (loading.current) return false;
        //If all image thumbnails have already been loaded
        if (images_meta.current === null ||
            images_meta.current.length === thumbnails.length) {
            return false;
        }
        //If the first page hasn't loaded
        if (thumbnails.length < page_size) return true;
        //If the scrollbar is near the bottom
        const divElement = document.getElementById(track_scrolling_id);
        return divElement.getBoundingClientRect().bottom <= 1.5 * window.innerHeight;
    }, [thumbnails, page_size]);

    const loadNextPage = useCallback(() => {
        if (!readyToLoadPage()) return;
        loading.current = true;
        //Grab all thumbnail images
        let load_to = Math.min(images_meta.current.length, thumbnails.length + page_size - 1);
        let hashes = images_meta.current.map(meta => meta.hash).slice(thumbnails.length, load_to);
        getGalleryThumbnails(hashes).then(response => {
            let combined_data = [];
            //Combine metadata with thumbnail images
            for (let i = 0; i < hashes.length; i++) {
                let meta = images_meta.current[thumbnails.length + i];
                if (!meta) {
                    console.log('META IS EMPTY', images_meta.current, i);
                    continue;
                }
                let img = response.thumbnails[i];
                let new_data = {
                    "key": meta.hash,
                    "src": `data:image/jpeg;base64,${img}`,
                    "width": meta.width,
                    "height": meta.height,
                };
                // Prevent identical images from being added multiple times, if checks
                // up to this point have failed
                if (!images_meta.current.some(d => d.key === new_data.key)) {
                    combined_data.push(new_data);
                }
            }
            setThumbnails(thumbs => thumbs.concat(combined_data));
        }).catch(error => {
            console.error("Failed to load thumbnails!", error);
            loading.current = false;
        });
    }, [thumbnails, page_size, readyToLoadPage]);

    const prevImage = useCallback(() => {
        if (thumbnails.length <= 0) return;
        // Default to last image if none open
        if (curr_index < 0) {
            history.push(LINKS.Gallery + '/' + images_meta.current[thumbnails.length - 1].hash);
        } else {
            // Find previous image index using modulus
            let prev_index = (curr_index + images_meta.current.length - 1) % images_meta.current.length;
            let hash = images_meta.current[prev_index].hash
            history.replace(LINKS.Gallery + '/' + hash);
        }
    }, [thumbnails, images_meta, curr_index, history]);

    const nextImage = useCallback(() => {
        if (thumbnails.length <= 0) return;
        // Default to first image if none open
        if (curr_index < 0) {
            history.push(LINKS.Gallery + '/' + images_meta.current[0].hash);
        } else {
            // Find next image index using modulus
            let next_index = (curr_index + 1) % images_meta.current.length;
            let hash = images_meta.current[next_index].hash;
            history.replace(LINKS.Gallery + '/' + hash);
        }
    }, [thumbnails, images_meta, curr_index, history]);

    const openImage = (_event, photo, index) => {
        let hash = photo.key;
        history.push(LINKS.Gallery + '/' + hash);
    }

    const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
        setThumbnails(thumbs => arrayMove(thumbs, oldIndex, newIndex))
    }, []);

    useEffect(() => {
        let mounted = true;
        getGallery().then(response => {
            if (!mounted) return;
            images_meta.current = JSON.parse(response.images_meta);
            if (images_meta.current === null) {
                setThumbnails([]);
            } else {
                loadNextPage();
            }
        }).catch(error => {
            console.error("Failed to load gallery pictures!", error);
        })

        return () => mounted = false;
    }, [loadNextPage])

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
        <StyledGalleryPage className="page" theme={theme} id={track_scrolling_id}>
            {popup}
            <SortableGallery distance={5} items={thumbnails} handleClick={openImage} onSortEnd={onSortEnd} axis={"xy"} />
        </StyledGalleryPage>
    );
}

GalleryPage.propTypes = {
    theme: PropTypes.object,
}

export default GalleryPage;

function GalleryImage(props) {

    const keyMap = {
        PREVIOUS: "left",
        NEXT: "right",
    };

    const handlers = {
        PREVIOUS: () => {
            console.log('TRIGGA FINGA');
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