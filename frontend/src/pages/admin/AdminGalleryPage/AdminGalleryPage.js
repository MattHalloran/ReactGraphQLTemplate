import { useCallback, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { uploadGalleryImages, getGallery, getImages, updateGallery } from 'query/http_promises';
import { getSession } from 'utils/storage';
import { Button, Typography } from '@material-ui/core';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { moveArrayIndex } from 'utils/arrayTools';
import { PubSub } from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { makeStyles } from '@material-ui/core/styles';
import GalleryCard from 'components/cards/GalleryCard/GalleryCard';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';
import { DropzoneArea } from 'material-ui-dropzone';
import GalleryTable from 'components/tables/GalleryTable/GalleryTable';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    padTop: {
        marginTop: theme.spacing(2),
    },
}));

function AdminGalleryPage() {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [data, setData] = useState([]);

    useLayoutEffect(() => {
        document.title = "Edit Gallery";
    }, [])

    useEffect(() => {
        let mounted = true;
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        getGallery().then(response => {
            if (!mounted) return;
            let response_meta = response.images_meta ?? [];
            if (response_meta.length > 0) {
                //Grab all thumbnail images
                let ids = response_meta.map(meta => meta.id);
                let data = [];
                getImages(ids, 'm').then(response => {
                    //Combine metadata with thumbnail images
                    for (let i = 0; i < ids.length; i++) {
                        let meta = response_meta[i];
                        if (!meta) {
                            console.log('META IS EMPTY', response_meta, i);
                            continue;
                        }
                        let img = response.images[i];
                        data.push({
                            'key': meta.id,
                            'src': `data:image/jpeg;base64,${img}`,
                            'alt': meta.alt,
                            'description': 'TODO',
                        });
                    }
                    setData(data);
                }).catch(error => {
                    console.error("Failed to load gallery data!", error);
                });
            } else {
                setData([]);
            }
        }).catch(error => {
            console.error("Failed to load gallery pictures!", error);
        })

        return (() => {
            mounted = false;
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    const fileSelectedHandler = (files) => {
        setSelectedFiles([]);
        for (let i = 0; i < files.length; i++) {
            let fileSplit = files[i].name.split('.');
            processImage(files[i], fileSplit[0], fileSplit[1]);
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
            setSelectedFiles(images => [...images, imageData])
        }
        reader.readAsDataURL(file);
    }

    const uploadImages = useCallback(() => {
        if (selectedFiles.length <= 0) {
            PubSub.publish(PUBS.Snack, {message: 'No images selected.', severity: 'error'});
            return;
        }
        let form = new FormData();
        selectedFiles.forEach(img => {
            form.append('name', img.name);
            form.append('extension', img.extension);
            form.append('image', img.data);
        });
        uploadGalleryImages(form).then(response => {
            PubSub.publish(PUBS.Snack, {message: `Uploaded ${response.passed_indexes?.length} images.`});
        }).catch(error => {
            console.error(error);
            PubSub.publish(PUBS.Snack, {message: 'Failed to upload images.', severity: 'error'});
        });
    }, [selectedFiles])

    const applyChanges = useCallback((changed_data) => {
        let gallery_data = changed_data.map(d => ({
            'id': d.key,
            'alt': d.alt,
            'description': d.description,
        }));
        updateGallery(session, gallery_data)
            .then(() => {
                PubSub.publish(PUBS.Snack, {message: 'Gallery updated.'});
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: 'Failed to update gallery.', severity: 'error'});
            })
    }, [data])

    function updateData(data) {
        console.log('updating datat', data)
        setData(data);
    }

    return (
        <div id='page' className={classes.root}>
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Gallery Edit</Typography>
            </div>
            <h2>Upload new images</h2>
            <DropzoneArea
                acceptedFiles={['image/*']}
                dropzoneText={"Drag and drop new images here or click"}
                onChange={fileSelectedHandler}
                showAlerts={false}
                filesLimit={100}
            />
            <Button className={classes.padTop} fullWidth onClick={uploadImages}>Upload Images</Button>
            <h2>Reorder and delete images</h2>
            <GalleryTable 
                data={data}
                onUpdate={updateData}
                onApply={applyChanges}/>
        </div>
    );
}

AdminGalleryPage.propTypes = {

}

export default AdminGalleryPage;