import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminGalleryPage } from './AdminGalleryPage.styled';
import { uploadGalleryImages } from 'query/http_promises';
import Button from 'components/shared/Button/Button';

class AdminGalleryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_images: [],
        }
        this.applyChanges = this.applyChanges.bind(this);
        this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
        this.uploadImages = this.uploadImages.bind(this);
    }

    componentDidMount() {
        document.title = "Edit Gallery";
    }

    fileSelectedHandler(event) {
        let newImages = event.target.files;
        if (newImages.length <= 0) {
            return;
        }
        this.setState({ selected_images: [] });
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
            this.setState({ selected_images: [...this.state.selected_images, imageData] });
        }
        reader.readAsDataURL(file);
    }

    uploadImages() {
        if(this.state.selected_images.length <= 0) {
            alert('No images selected!');
            return;
        }
        let form = new FormData();
        this.state.selected_images.forEach(img => {
            form.append('name', img.name);
            form.append('extension', img.extension);
            form.append('image', img.data);
        });
        uploadGalleryImages(form).then(response => {
            alert('Successfully uploaded ' + response.passed_indexes?.length + ' images!');
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
                    <Button onClick={this.uploadImages}>Upload</Button>
                </div>
                <h2>Reorder and delete images</h2>
                <div>
                    
                </div>
                <Button onClick={this.applyChanges}>Apply Changes</Button>
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
                <Button onClick={this.deleteClicked}/>
            </div>
        );
    }
}

ImageCard.propTypes = {
    b64: PropTypes.object.isRequired
}