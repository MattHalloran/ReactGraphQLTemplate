import React, { memo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { StyledGalleryPage, StyledGalleryImage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import { SortableGalleryPhoto } from "components/shared/GalleryPhoto/GalleryPhoto";
import * as imageQuery from 'query/gallery';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from "array-move";
import Modal from 'components/shared/Modal/Modal';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

//TODO add gallery modal part if url match (/gallery/:img)

const SortableGallery = SortableContainer(({ items, handleClick }) => (
  <Gallery photos={items} renderImage={props => <SortableGalleryPhoto handleClick={handleClick} {...props} />} />
));

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thumbnails: [],
        }
        //Prevents scroll listener from loading next page
        this.loading = true;
        this.images_meta = null;
        //Estimates how many images will fill the screen
        this.page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);
        this.openImage = this.openImage.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.queryImages();
    }

    componentDidMount() {
        document.title = "Gallery | New Life Nursery";
        document.addEventListener('scroll', this.trackScrolling);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    // Determines when to load the next page of thumbnails
    trackScrolling = () => {
        const divElement = document.getElementById('main-div');
        if (!this.loading && this.hitReloadPoint(divElement)) {
            console.log('header bottom reached!!!!!!!!!!!');
            this.loading = true;
            this.loadNextPage();
        }
    };

    hitReloadPoint(el) {
        return el.getBoundingClientRect().bottom <= 1.5 * window.innerHeight;
    }

    queryImages() {
        PubSub.publish('loading', true);
        imageQuery.getGallery().then(response => {
            this.images_meta = JSON.parse(response.images_meta);
            this.loadNextPage();
        }).catch(error => {
            console.log("Failed to load gallery pictures");
            console.error(error);
            PubSub.publishSync('loading', false);
            alert(error.error);
        })
    }

    loadNextPage() {
        //Check to make sure loading needs to be done
        if (this.images_meta === null ||
            this.images_meta.length === this.state.thumbnails.length) {
            return;
        }
        PubSub.publish('loading', true);
        let num_previously_procesed = this.state.thumbnails.length;
        //Grab all thumbnail images
        let thumbnail_images = null;
        let hashes = this.images_meta.map(meta => meta.hash);
        let load_to = Math.min(this.images_meta.length, num_previously_procesed + this.page_size - 1);
        hashes = hashes.slice(num_previously_procesed, load_to);
        imageQuery.getGalleryThumbnails(hashes).then(response => {
            thumbnail_images = response.thumbnails;
            let combined_data = [];
            //Combine metadata with thumbnail images
            for (let i = 0; i < hashes.length; i++) {
                let meta = this.images_meta[num_previously_procesed + i];
                let img = thumbnail_images[i];
                combined_data.push({
                    "key": meta.hash,
                    "src": `data:image/jpeg;base64,${img}`,
                    "width": meta.width,
                    "height": meta.height,
                });
            }
            this.setState({ thumbnails: this.state.thumbnails.concat(combined_data) });
            PubSub.publish('loading', false);
            this.loading = false;
        }).catch(error => {
            console.log("Failed to load thumbnails");
            console.error(error);
            PubSub.publishSync('loading', false);
            alert(error.error);
            return;
        });
    }

    openImage(event, photo, index) {
        console.log('OPEN IMAGEEEE', event, photo, index);
        this.props.history.push('/gallery/' + photo.key);
    }

    onSortEnd({oldIndex, newIndex}) {
        console.log('SORTINGGGGGGGG', this.state);
        console.log(oldIndex, newIndex);
        this.setState({ thumbnails: arrayMove(this.state.thumbnails, oldIndex, newIndex) });
        console.log('FINISHEDDDDD', this.state);
    }

    render() {
        return (
            <StyledGalleryPage id="main-div">
                <SortableGallery distance={5} items={this.state.thumbnails} handleClick={this.openImage} onSortEnd={this.onSortEnd} axis={"xy"} />
            </StyledGalleryPage>
        );
    }
}

GalleryPage.propTypes = {

}

export default memo(GalleryPage);

function GalleryImage(props) {
    const [src, setSrc] = useState(0);
    let url_params = useParams();
    imageQuery.getGalleryImage(url_params.img).then(response => {
        console.log("GOT FULL IMAGEEEE", response);
        setSrc(`data:image/jpeg;base64,${response.image}`);
    }).catch(error => {
        console.log('FAILED TO LOAD FULL IMAGE')
        console.error(error);
    });

    return (
        <StyledGalleryImage>
            <ChevronLeftIcon className="arrow left" onClick={props.goLeft}/>
            <ChevronRightIcon className="arrow right" onClick={props.goRight}/>
            <img src={src} alt="TODO" className="full-image" />
        </StyledGalleryImage>
    );
}

GalleryImage.propTypes = {
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
}

export { GalleryImage };