import React, { memo } from 'react';
import PubSub from '../../utils/pubsub';
import { StyledGalleryPage } from './GalleryPage.styled';
import Gallery from 'react-photo-gallery';
import * as imageQuery from '../../query/gallery';

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: []
        }
        this.images_meta = null;
        this.queryImages();
    }

    componentDidMount() {
        document.title = "Gallery | New Life Nursery";
    }

    queryImages() {
        PubSub.publish('loading', true);
        imageQuery.getGallery().then(response => {
            this.images_meta = JSON.parse(response.images_meta);
            console.log('FINISHED IMAGES META', this.images_meta);
            this.loadPage();
        }).catch(error => {
            console.log("Failed to load gallery pictures");
            console.error(error);
            PubSub.publishSync('loading', false);
            alert(error.error);
        })
    }

    loadPage() {
        console.log('LOADING PAGE', this.images_meta);
        if(this.images_meta === null) {
            this.setState({images: null});
            return;
        }
        this.images_meta.forEach(meta => {
            imageQuery.getGalleryImage(meta.location).then(response => {
                let imageData = {
                    "src": `data:image/jpeg;base64,${response.image}`,
                    "width": meta.width,
                    "height": meta.height,
                }
                this.setState({ images: [...this.state.images, imageData]} )
            }).catch(error => {
                PubSub.publishSync('loading', false);
                console.error(error);
            });
        });
        PubSub.publish('loading', false);
    }

    render() {
        // let gallery = []
        // let id = 0;
        // this.state.images.forEach(img => {
        //     gallery.push(<img key={id} src={img.src} width={img.width} height={img.height} className="tile" />);
        //     id = id + 1;
        // });
        let gallery = null;
        if (this.state.images.length > 0) {
            gallery = <Gallery photos={this.state.images} />
        }
        return (
            <StyledGalleryPage>
                <h1>BOOOOP</h1>
                {gallery}
            </StyledGalleryPage>
        );
    }
}

GalleryPage.propTypes = {
    
}

export default memo(GalleryPage);