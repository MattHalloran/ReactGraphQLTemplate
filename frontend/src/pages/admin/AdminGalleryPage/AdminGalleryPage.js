import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminGalleryPage } from './AdminGalleryPage.styled';
import * as imageQuery from '../../../query/gallery';

class AdminGalleryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
        }
        this.applyChanges = this.applyChanges.bind(this);
        this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
    }

    componentDidMount() {
        document.title = "Edit Gallery";
    }

    fileSelectedHandler(event) {
        let newImages = event.target.files;
        if (newImages.length <= 0) {
            return;
        }
        for(let i = 0; i < newImages.length; i++) {
            let fileSplit = newImages[i].name.split('.');
            this.processImage(newImages[i], fileSplit[0], fileSplit[1]);
        }
    }

    processImage(file, name, extension) {
        let imageData = []
        let reader = new FileReader();
        reader.onloadend = () => {
            imageData = {
                name: name,
                extension: extension,
                data: reader.result
            };
            this.setState({ images: [...this.state.images, imageData] });
        }
        reader.readAsDataURL(file);
    }

    uploadImage() {
        if(this.state.images.length <= 0) {
            alert('No images selected!');
            return;
        }
        let form = new FormData();
        this.state.images.forEach(img => {
            form.append('name', img.name);
            form.append('extension', img.extension);
            form.append('image', img.data);
        });
        imageQuery.uploadGalleryImages(form).then(response => {
            alert('Upload success!');
        }).catch(error => {
            console.error(error);
            alert('Error uploading images!');
        });
    }

    applyChanges() {
        
    }

    render() {
        return (
            <StyledAdminGalleryPage>
                <h1>Gallery Edit</h1>
                <div>
                    <h2>Select image(s) for upload</h2>
                    <input type="file" onChange={this.fileSelectedHandler} multiple/>
                    <button onClick={this.uploadImage}>Upload</button>
                </div>
                <div>
                    <h2>Reorder and delete images</h2>
                </div>
                <button onClick={this.applyChanges}>Apply Changes</button>
            </StyledAdminGalleryPage>
        );
    }
}

AdminGalleryPage.propTypes = {

}

export default AdminGalleryPage;

class ImageCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            delete: false,
        }
        this.deleteClicked = this.deleteClicked.bind(this);
    }

    deleteClicked() {
        this.setState({ delete: !this.state.delete });
    }

    render() {
        return(
            <div className={this.state.delete ? "" : ""}>
                <img src={`data:image/jpeg;base64,${this.props.b64}`} width="100px" height="100px" />
                <button onClick={this.deleteClicked}/>
            </div>
        );
    }
}

ImageCard.propTypes = {
    b64: PropTypes.object.isRequired
}