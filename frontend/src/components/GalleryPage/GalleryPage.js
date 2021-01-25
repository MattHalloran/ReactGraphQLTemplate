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
import { BUSINESS_NAME, PUBS, LINKS } from 'consts';

//TODO add gallery modal part if url match (/gallery/:img)

const SortableGallery = SortableContainer(({ items, handleClick }) => (
    <Gallery photos={items} renderImage={props => <SortableGalleryPhoto handleClick={handleClick} {...props} />} />
));

function GalleryPage() {
    const [thumbnails, setThumbnails] = useState([]);
    const images_meta = useRef(null);
    let history = useHistory();
    let urlParams = useParams();
    let curr_img = urlParams.img;
    let curr_img_index = images_meta.current?.findIndex(m => m.hash === curr_img) ?? -1;
    const num_loaded = useRef(0);
    const loading = useRef(false);
    const track_scrolling_id = 'scroll-tracked';
    //Estimates how many images will fill the screen
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useLayoutEffect(() => {
        document.title = `Gallery | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', trackScrolling);
        return (() => document.removeEventListener('scroll', trackScrolling));
    })

    const trackScrolling = useCallback(() => loadNextPage());

    useEffect(() => {
        loading.current = false;
        PubSub.publishSync(PUBS.Loading, false);
    }, [thumbnails])

    const readyToLoadPage = () => {
        console.log('IN READTY TO LOAD PAGE', loading.current)
        //If the image metadata hasn't been received, or
        //the next page is still loading
        if (loading.current) return false;
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
        loading.current = true;
        PubSub.publishSync(PUBS.Loading, true);
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
            console.error("Failed to load thumbnails!", error);
            loading.current = false;
            PubSub.publishSync(PUBS.Loading, false);
        });
    }

    const prevImage = () => {
        if (num_loaded.current <= 0) return;
        // Default to last image if none open
        if (!curr_img) {
            history.push(LINKS.Gallery + '/' + images_meta.current[num_loaded.current - 1].hash);
        } else {
            // Find previous image index using modulus
            let prev_index = (curr_img_index + images_meta.current.length - 1) % images_meta.current.length;
            console.log('Prevvv INDEX SSSSS', prev_index)
            history.replace(LINKS.Gallery + '/' + images_meta.current[prev_index].hash);
        }
    }

    const nextImage = () => {
        console.log('NEXT IMAGEEEEEE', num_loaded.current, curr_img)
        if (num_loaded.current <= 0) return;
        // Default to first image if none open
        if (!curr_img) {
            history.push(LINKS.Gallery + '/' + images_meta.current[0].hash);
        } else {
            // Find next image index using modulus
            console.log('SOMEBODY SUCK ME', curr_img_index, images_meta.current)
            let next_index = (curr_img_index + 1) % images_meta.current.length;
            console.log('NEXT INDEX SSSSS', next_index)
            history.replace(LINKS.Gallery + '/' + images_meta.current[next_index].hash);
        }
    }

    const openImage = (_event, photo, index) => {
        curr_img_index = index;
        history.push(LINKS.Gallery + '/' + photo.key);
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setThumbnails(thumbs => arrayMove(thumbs, oldIndex, newIndex))
    }

    useEffect(() => {
        if (loading.current || images_meta.current) return;
        loading.current = true;
        PubSub.publishSync(PUBS.Loading, true);
        imageQuery.getGallery().then(response => {
            loading.current = false;
            console.log('SETTING IMAGES METAAAAA', JSON.parse(response.images_meta))
            images_meta.current = JSON.parse(response.images_meta);
            if (images_meta.current === null) {
                setThumbnails([]);
            } else {
                loadNextPage();
            }
        }).catch(error => {
            console.error("Failed to load gallery pictures!", error);
            loading.current = false;
        })
    }, [])


    let popup = curr_img ? <Modal><GalleryImage img_id={curr_img} goLeft={prevImage} goRight={nextImage} /></Modal> : null;
    return (
        <StyledGalleryPage id={track_scrolling_id}>
            { popup }
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
            <img src={src} alt="TODO" />
        </StyledGalleryImage>
    );
}

GalleryImage.propTypes = {
    img_id: PropTypes.string.isRequired,
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
}

export { GalleryImage };