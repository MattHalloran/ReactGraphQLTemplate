import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledGalleryPage, StyledGalleryImage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import { SortableGalleryPhoto } from "components/shared/GalleryPhoto/GalleryPhoto";
import * as imageQuery from 'query/gallery';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from "array-move";
import Modal from 'components/shared/wrappers/Modal/Modal';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { BUSINESS_NAME } from 'consts';

//TODO add gallery modal part if url match (/gallery/:img)

const SortableGallery = SortableContainer(({ items, handleClick }) => (
    <Gallery photos={items} renderImage={props => <SortableGalleryPhoto handleClick={handleClick} {...props} />} />
));

function GalleryPage() {
    let history = useHistory();
    const urlParams = useParams();
    const curr_img = urlParams.img;
    const curr_img_index = useRef(-1);
    const [thumbnails, setThumbnails] = useState([]);
    const images_meta = useRef(null);
    const num_loaded = useRef(0);
    const loading_thumbnails = useRef(false);
    const loading_gallery = useRef(false);
    const track_scrolling_id = 'scroll-tracked';
    //Estimates how many images will fill the screen
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useLayoutEffect(() => {
        document.title = `Gallery | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', trackScrolling);
        return (() => {
            document.removeEventListener('scroll', trackScrolling);
        })
    })

    const trackScrolling = useCallback(() => {
        loadNextPage();
    })

    useEffect(() => {
        loading_thumbnails.current = false;
    }, [thumbnails])

    useEffect(() => {
        PubSub.publishSync('loading', loading_thumbnails.current);
    }, [loading_thumbnails.current])

    useEffect(() => {
        loading_gallery.current = false;
        if (images_meta.current === null) {
            setThumbnails([]);
        } else {
            loadNextPage();
        }
    }, [images_meta.current])

    useEffect(() => {
        if (loading_gallery.current) PubSub.publishSync('loading', true);
    }, [loading_gallery.current])

    const readyToLoadPage = () => {
        //If the image metadata hasn't been received, or
        //the next page is still loading
        if (loading_gallery.current || loading_thumbnails.current) return false;
        //If all image thumbnails have already been loaded
        if (images_meta.current === null ||
            images_meta.current.length === num_loaded.current) {
            return false;
        }
        //If the first page hasn't loaded
        if (num_loaded.current < page_size) return true;
        //If the scrollbar is near the bottom
        const divElement = document.getElementById(track_scrolling_id);
        return divElement.getBoundingClientRect().bottom <= 1.5 * window.innerHeight;
    }

    const loadNextPage = () => {
        if (!readyToLoadPage()) return;
        loading_thumbnails.current = true;
        //Grab all thumbnail images
        let load_to = Math.min(images_meta.current.length, num_loaded.current + page_size - 1);
        let hashes = images_meta.current.map(meta => meta.hash).slice(num_loaded.current, load_to);
        imageQuery.getGalleryThumbnails(hashes).then(response => {
            let combined_data = [];
            //Combine metadata with thumbnail images
            for (let i = 0; i < hashes.length; i++) {
                let meta = images_meta.current[num_loaded.current + i];
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
                    num_loaded.current++;
                }
            }
            setThumbnails(thumbs => thumbs.concat(combined_data));
        }).catch(error => {
            console.log("Failed to load thumbnails!", error);
            loading_thumbnails.current = false;
        });
    }

    // If image url loaded directly (i.e. opened from link instead of navigated),
    // then we must search for its index in the gallery
    const findCurrentImageIndex = () => {
        if (curr_img_index.current <= 0) {
            curr_img_index.current = images_meta.current.findIndex(m => m.hash === curr_img);
        }
    }

    const prevImage = () => {
        if (num_loaded.current <= 0) return;
        // Default to last image if none open
        if (!curr_img) {
            history.push('/gallery/' + images_meta.current[num_loaded.current - 1].hash);
        } else {
            findCurrentImageIndex();
            // Find previous image index using modulus
            let prev_index = (curr_img_index.current + images_meta.current.length - 1) % images_meta.current.length;
            history.replace('/gallery/' + images_meta.current[prev_index].hash);
        }
    }

    const nextImage = () => {
        if (num_loaded.current <= 0) return;
        // Default to first image if none open
        if (!curr_img) {
            history.push('/gallery/' + images_meta.current[0].hash);
        } else {
            findCurrentImageIndex();
            // Find next image index using modulus
            let next_index = (curr_img_index.current + 1) % images_meta.current.length;
            history.replace('/gallery/' + images_meta.current[next_index].hash);
        }
    }

    const openImage = (_event, photo, index) => {
        curr_img_index.current = index;
        history.push('/gallery/' + photo.key);
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setThumbnails(thumbs => arrayMove(thumbs, oldIndex, newIndex))
    }

    useEffect(() => {
        if (loading_gallery.current || images_meta.current) return;
        loading_gallery.current = true;
        imageQuery.getGallery().then(response => {
            images_meta.current = JSON.parse(response.images_meta);
        }).catch(error => {
            console.error("Failed to load gallery pictures!", error);
            loading_gallery.current = false;
        })
    }, [])


    let popup = curr_img ? <Modal><GalleryImage img_id={curr_img} goLeft={prevImage} goRight={nextImage} /></Modal> : null;
    return (
        <StyledGalleryPage id={track_scrolling_id}>
            { popup}
            <SortableGallery distance={5} items={thumbnails} handleClick={openImage} onSortEnd={onSortEnd} axis={"xy"} />
        </StyledGalleryPage>
    );
}

GalleryPage.propTypes = {

}

export default GalleryPage;

function GalleryImage(props) {
    const [src, setSrc] = useState(0);
    imageQuery.getGalleryImage(props.img_id).then(response => {
        setSrc(`data:image/jpeg;base64,${response.image}`);
    }).catch(error => {
        console.error('FAILED TO LOAD FULL IMAGE', error)
    });

    return (
        <StyledGalleryImage>
            <ChevronLeftIcon className="arrow left" onClick={props.goLeft} />
            <ChevronRightIcon className="arrow right" onClick={props.goRight} />
            <img src={src} alt="TODO" className="full-image" />
        </StyledGalleryImage>
    );
}

GalleryImage.propTypes = {
    img_id: PropTypes.string.isRequired,
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
}

export { GalleryImage };