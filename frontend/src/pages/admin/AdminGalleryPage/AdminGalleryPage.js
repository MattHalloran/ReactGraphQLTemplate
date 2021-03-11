import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminGalleryPage } from './AdminGalleryPage.styled';
import { uploadGalleryImages, getGallery, getImages, updateGallery } from 'query/http_promises';
import { getSession, getTheme } from 'utils/storage';
import Button from 'components/Button/Button';
import FileUpload from 'components/FileUpload/FileUpload';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { moveArrayIndex, deleteArrayIndex } from 'utils/arrayTools';
import { XIcon, NoImageIcon } from 'assets/img';
import { PubSub } from 'utils/pubsub';
import { PUBS } from 'utils/consts';

// Sortable element steals the index parameter, so we must use i instead
const SortableItem = SortableElement(({ i, value, deleteRow }) => {
    let display_image;
    if (value.src) {
        display_image = <img src={value.src} className="cart-image" alt={value.alt} />
    } else {
        display_image = <NoImageIcon className="cart-image" />
    }

    return (<tr>
        <td><div className="product-row">
            <XIcon width="30px" height="30px" onClick={() => deleteRow(i)} />
            {display_image}
        </div></td>
        <td>{value.alt}</td>
        <td>TODO</td>
    </tr>);
});

const SortableList = SortableContainer(({ data, deleteRow }) => {
    return (
        <table className="cart-table no-select">
            <thead>
                <tr>
                    <th style={{ width: '25%' }}>Image</th>
                    <th style={{ width: '25%' }}>Tag</th>
                    <th style={{ width: '50%' }}>Description</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((value, index) => <SortableItem key={`item-${index}`} index={index} i={index} value={value} deleteRow={deleteRow} />)}
            </tbody>
        </table>
    );
});

function SortableComponent({ data, onSortEnd, deleteRow }) {
    return (
        <SortableList distance={10} data={data} onSortEnd={onSortEnd} deleteRow={deleteRow} />
    );
}


function AdminGalleryPage({
    theme = getTheme(),
}) {
    const [session, setSession] = useState(getSession());
    const [selected, setSelected] = useState([]);
    const [thumbnails, setThumbnails] = useState([]);
    const images_meta = useRef([]);

    useLayoutEffect(() => {
        document.title = "Edit Gallery";
    }, [])

    useEffect(() => {
        let mounted = true;
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        getGallery().then(response => {
            if (!mounted) return;
            images_meta.current = response.images_meta ?? [];
            if (images_meta.current.length > 0) {
                //Grab all thumbnail images
                let ids = images_meta.current.map(meta => meta.id)
                getImages(ids, 'm').then(response => {
                    let combined_data = [];
                    //Combine metadata with thumbnail images
                    for (let i = 0; i < ids.length; i++) {
                        let meta = images_meta.current[thumbnails.length + i];
                        if (!meta) {
                            console.log('META IS EMPTY', images_meta.current, i);
                            continue;
                        }
                        let img = response.images[i];
                        let new_data = {
                            "key": meta.id,
                            "src": `data:image/jpeg;base64,${img}`,
                            "alt": meta.alt,
                        };
                        // Prevent identical images from being added multiple times, if checks
                        // up to this point have failed
                        if (!images_meta.current.some(d => d.key === new_data.key)) {
                            combined_data.push(new_data);
                        }
                    }
                    setThumbnails(combined_data);
                }).catch(error => {
                    console.error("Failed to load thumbnails!", error);
                });
            } else {
                setThumbnails([]);
            }
        }).catch(error => {
            console.error("Failed to load gallery pictures!", error);
        })

        return (() => {
            mounted = false;
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    const deleteRow = (index) => {
        if (index < 0) {
            alert(`Error: Invalid index: ${index}`);
            return;
        }
        setThumbnails(items => deleteArrayIndex(items, index))
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setThumbnails(items => moveArrayIndex(items, oldIndex, newIndex));
    };

    const fileSelectedHandler = (event) => {
        let newImages = event.target.files;
        setSelected([]);
        for (let i = 0; i < newImages.length; i++) {
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
        if (selected.length <= 0) {
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
        updateGallery(session, thumbnails.map(t => {return {id: t.key, alt: t.alt, description: t.description}}))
            .then(() => {
                alert('Gallery updated!');
            })
            .catch(err => {
                console.error(err);
                alert('Error: Gallery failed to update!');
            })
    }

    return (
        <StyledAdminGalleryPage className="page" theme={theme}>
            <h1>Gallery Edit</h1>
            <div>
                <h2>Select image(s) for upload</h2>
                <FileUpload selectText="Select" uploadText="Upload" onUploadClick={uploadImages} onUploadChange={fileSelectedHandler} multiple />
            </div>
            <h2>Reorder and delete images</h2>
            <div>
                <SortableComponent data={thumbnails} deleteRow={deleteRow} onSortEnd={onSortEnd} />
            </div>
            <Button onClick={applyChanges}>Apply Changes</Button>
        </StyledAdminGalleryPage>
    );
}

AdminGalleryPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminGalleryPage;

function ImageCard({
    b64,
}) {
    return (
        <div>
            <img src={`data:image/jpeg;base64,${b64}`} width="100px" height="100px" />
            <Button />
        </div>
    );
}

ImageCard.propTypes = {
    b64: PropTypes.object.isRequired
}