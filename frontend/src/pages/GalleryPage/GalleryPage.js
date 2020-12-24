import React, { lazy, memo } from 'react';
import PubSub from '../../utils/pubsub';
import { StyledGalleryPage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import * as imageQuery from '../../query/gallery';

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            loading: true,
            first_load: true,
        }
        this.images_meta = null;
        //Estimates how many images will fill the screen
        this.page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);
        this.queryImages();
    }

    componentDidMount() {
        document.title = "Gallery | New Life Nursery";
        document.addEventListener('scroll', this.trackScrolling);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    // Determines when to load the next page of images
    trackScrolling = () => {
        const divElement = document.getElementById('main-div');
        if (!this.state.loading && this.hitReloadPoint(divElement)) {
            console.log('header bottom reached!!!!!!!!!!!');
            this.setState({ loading: true })
            this.loadNextPage();
        }
    };

    hitReloadPoint(el) {
        return el.getBoundingClientRect().bottom <= 1.5*window.innerHeight;
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
        if (this.images_meta === null || 
            this.images_meta.length === this.state.images.length) {
            return;
        }
        PubSub.publish('loading', true);
        let images_processed = this.state.images.length;
        console.log('STARTING IMAGE QUERY', this.images_meta);
        let load_to = Math.min(images_processed + this.page_size, this.images_meta.length);
        for (let i = images_processed; i < load_to; i++) {
            let meta = this.images_meta[i];
            imageQuery.getGalleryImage(meta.location).then(response => {
                let imageData = {
                    "src": `data:image/jpeg;base64,${response.image}`,
                    "width": meta.width,
                    "height": meta.height,
                }
                this.setState({ images: [...this.state.images, imageData] });
                images_processed = images_processed + 1;
                console.log('PROCESSED IMAGE', images_processed);
                // After all images in the page finish loading
                if (i === load_to - 1) {
                    PubSub.publish('loading', false);
                    this.setState({ loading: false,
                                    first_load: false });
                    console.log('FINISHED PROCESSING')
                }
            }).catch(error => {
                PubSub.publishSync('loading', false);
                console.error(error);
            });
        }
    }

    render() {
        let gallery = null;
        if (!this.state.first_load && this.state.images.length > 0) {
            gallery = <Gallery photos={this.state.images} />
        }
        return (
            <StyledGalleryPage id="main-div">
                <h1>BOOOOP</h1>
                {gallery}
            </StyledGalleryPage>
        );
    }
}

GalleryPage.propTypes = {

}

export default memo(GalleryPage);