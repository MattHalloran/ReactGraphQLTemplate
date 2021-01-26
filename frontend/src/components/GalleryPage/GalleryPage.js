import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledGalleryPage, StyledGalleryImage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import { SortableGalleryPhoto } from "components/shared/GalleryPhoto/GalleryPhoto";
import * as imageQuery from 'query/gallery';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from "array-move";
import Modal from 'components/shared/wrappers/Modal/Modal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BUSINESS_NAME, PUBS, LINKS } from 'consts';

//TODO add gallery modal part if url match (/gallery/:img)

const SortableGallery = SortableContainer(({ items, handleClick }) => (
    <Gallery photos={items} renderImage={props => <SortableGalleryPhoto handleClick={handleClick} {...props} />} />
));

function GalleryPage() {
    const [thumbnails, setThumbnails] = useState([]);
    // Key = corresponding thumbnail index, value = expanded imgae
    const full_images = useRef({});
    const images_meta = useRef(null);
    let history = useHistory();
    let urlParams = useParams();
    const [curr_img, setCurrImg] = useState(null);
    let find_curr_index = () => images_meta.current?.findIndex(m => m.hash === urlParams.img) ?? -1;
    const num_loaded = useRef(0);
    const loading = useRef(false);
    const track_scrolling_id = 'scroll-tracked';
    //Estimates how many images will fill the screen
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useHotkeys('escape', () => setCurrImg(null));
    useHotkeys('left', () => prevImage());
    useHotkeys('right', () => nextImage());

    useLayoutEffect(() => {
        document.title = `Gallery | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', loadNextPage);
        return (() => document.removeEventListener('scroll', loadNextPage));
    })

    useEffect(() => {
        loading.current = false;
        PubSub.publishSync(PUBS.Loading, false);
    }, [thumbnails])

    useEffect(() => {
        console.log('CURRENT IMAGE UPDATED YIPPEE');
    }, [curr_img])

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
        if (find_curr_index() < 0) {
            history.push(LINKS.Gallery + '/' + images_meta.current[num_loaded.current - 1].hash);
        } else {
            // Find previous image index using modulus
            let prev_index = (find_curr_index() + images_meta.current.length - 1) % images_meta.current.length;
            history.replace(LINKS.Gallery + '/' + images_meta.current[prev_index].hash);
            loadImage(prev_index)
        }
    }

    const nextImage = () => {
        console.log('STARTING NEXT IMAGE')
        if (num_loaded.current <= 0) return;
        // Default to first image if none open
        if (find_curr_index() < 0) {
            console.log('NEXT IMAGE SETING TO DEFAULT UH OH')
            history.push(LINKS.Gallery + '/' + images_meta.current[0].hash);
        } else {
            // Find next image index using modulus
            let next_index = (find_curr_index() + 1) % images_meta.current.length;
            console.log('NEXT IMAGEEEEEE', next_index, find_curr_index())
            history.replace(LINKS.Gallery + '/' + images_meta.current[next_index].hash);
            loadImage(next_index);
        }
    }

    const loading_full_image = useRef(false);
    const loadImage = (index, hash) => {
        if (index === null || index === undefined || index < 0)
            index = find_curr_index();
        if (hash === null || hash === undefined)
            hash = urlParams.img;
        console.log('STARTING LOAD IMAGE', index)
        console.log(images_meta.current)
        console.log(hash)
        // If this function hasn't finished yet
        if (loading_full_image.current) return;
        // If there is an image to load
        console.log('AAAAAbBBBBB', hash)
        if (!hash) return;
        console.log('BBBBBBBBB')
        let curr_index = find_curr_index();
        console.log('CURRENT INDEX IS', curr_index)
        // First check if the image data has already been retrieved
        if (curr_index in full_images.current) {
            console.log('SETTING CURR IMAGE AAAA')
            setCurrImg(full_images.current[curr_index]);
        } else {
            loading_full_image.current = true;
            // Request the image from the backend
            imageQuery.getGalleryImage(hash).then(response => {
                let image_data = `data:image/jpeg;base64,${response.image}`;
                console.log('SETTING CURR IMAGE BBB')
                setCurrImg(image_data);
                full_images.current[curr_index] = image_data;
            }).catch(error => {
                console.error('FAILED TO LOAD FULL IMAGE', error)
            }).finally(() => loading_full_image.current = false);
        }
    }

    const openImage = (_event, photo, index) => {
        let hash = photo.key;
        history.push(LINKS.Gallery + '/' + hash);
        loadImage(index, hash);
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        console.log('SORTING IMAGESSSSS')
        setThumbnails(thumbs => arrayMove(thumbs, oldIndex, newIndex))
    }

    useEffect(() => {
        loadImage();
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


    let popup = curr_img ? (
        <Modal>
            <GalleryImage src={curr_img}
                goLeft={prevImage}
                goRight={nextImage} />
        </Modal>
    ) : null;
    console.log('POPUP ISSSSSS', popup)
    return (
        <StyledGalleryPage id={track_scrolling_id}>
            {popup}
            <SortableGallery distance={5} items={thumbnails} handleClick={openImage} onSortEnd={onSortEnd} axis={"xy"} />
        </StyledGalleryPage>
    );
}

GalleryPage.propTypes = {

}

export default GalleryPage;

function GalleryImage(props) {

    return (
        <StyledGalleryImage>
            <FaChevronLeft className="arrow left" onClick={props.goLeft} />
            <FaChevronRight className="arrow right" onClick={props.goRight} />
            <img src={props.src} alt="TODO" />
        </StyledGalleryImage>
    );
}

GalleryImage.propTypes = {
    src: PropTypes.string.isRequired, // base-64 image data
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
}

export { GalleryImage };