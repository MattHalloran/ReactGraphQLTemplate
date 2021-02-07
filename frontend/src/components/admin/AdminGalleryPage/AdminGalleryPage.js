import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminGalleryPage } from './AdminGalleryPage.styled';
import { uploadGalleryImages } from 'query/http_promises';
import Button from 'components/shared/Button/Button';

function AdminGalleryPage(props) {
    const [selected, setSelected] = useState([]);

    useLayoutEffect(() => {
        document.title = "Edit Gallery";
    },[])

    const fileSelectedHandler = (event) => {
        let newImages = event.target.files;
        if (newImages.length <= 0) {
            return;
        }
        setSelected([]);
        for(let i = 0; i < newImages.length; i++) {
            let fileSplit = newImages[i].name.split('.');
            processImage(newImages[i], fileSplit[0], fileSplit[1]);
        }
    }

    const processImage = (file, name, extension) => {
        let imageData = []
        let reader = new FileReader();
        reader.onloadend = () => {
            imageData = {
                name: name,
                extension: extension,
                data: reader.result
            };
            setSelected(images => [...images, imageData])
        }
        reader.readAsDataURL(file);
    }

    const uploadImages = useCallback(() => {
        if(selected.length <= 0) {
            alert('No images selected!');
            return;
        }
        let form = new FormData();
        selected.forEach(img => {
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
    }, [selected])

    const applyChanges = () => {
        
    }

    return (
        <StyledAdminGalleryPage>
            <h1>Gallery Edit</h1>
            <div>
                <h2>Select image(s) for upload</h2>
                <input type="file" onChange={fileSelectedHandler} multiple/>
                <Button onClick={uploadImages}>Upload</Button>
            </div>
            <h2>Reorder and delete images</h2>
            <div>
                
            </div>
            <Button onClick={applyChanges}>Apply Changes</Button>
        </StyledAdminGalleryPage>
    );
}

AdminGalleryPage.propTypes = {

}

export default AdminGalleryPage;

function ImageCard(props) {
    return(
        <div>
            <img src={`data:image/jpeg;base64,${props.b64}`} width="100px" height="100px" />
            <Button/>
        </div>
    );
}

ImageCard.propTypes = {
    b64: PropTypes.object.isRequired
}