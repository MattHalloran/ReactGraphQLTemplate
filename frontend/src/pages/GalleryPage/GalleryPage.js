import React, { memo } from 'react';
import PubSub from '../../utils/pubsub';
import { StyledGalleryPage } from './GalleryPage.styled';
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
            this.loadPage();
        }).catch(error => {
            console.log("Failed to load gallery pictures");
            console.error(error);
            PubSub.publishSync('loading', false);
            alert(error.error);
        })
    }

    loadPage() {
        if(this.images_meta === null) {
            this.setState({images: null});
            return;
        }
        this.images_meta.forEach(meta => {
            imageQuery.getGalleryImage(meta.location).then(response => {
                this.setState((oldState) => {
                    const newList = [...oldState.images];
                    newList.push(response.image);
                    return { images: newList };
                  });
            }).catch(error => {
                PubSub.publishSync('loading', false);
                console.error(error);
            });
        });
        PubSub.publish('loading', false);
    }

    render() {
        let imageTags = []
        this.state.images.forEach(b64 => {
            console.log('OH YEAH BABYY')
            imageTags.push(<img src={`data:image/jpeg;base64,${b64}`} width="100px" height="100px" />);
        })
        console.log('NIGGA', imageTags);
        return (
            <StyledGalleryPage>
                <h1>BOOOOP</h1>
                {imageTags}
            </StyledGalleryPage>
        );
    }
}

GalleryPage.propTypes = {
    
}

export default memo(GalleryPage);