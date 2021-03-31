import { useCallback, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { uploadGalleryImages, getGallery, getImages, updateGallery } from 'query/http_promises';
import { getSession } from 'utils/storage';
import { Button, Typography } from '@material-ui/core';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { moveArrayIndex } from 'utils/arrayTools';
import { PubSub } from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { makeStyles } from '@material-ui/core/styles';
import GalleryCard from 'components/GalleryCard/GalleryCard';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';
import { DropzoneArea } from 'material-ui-dropzone';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
        background: theme.palette.background.paper,
    },
    header: {
        textAlign: 'center',
    },
    table: {
        minWidth: 750,
    },
    image: {
        maxHeight: 100,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
}));

// Sortable element steals the index parameter, so we must use i instead
const SortableItem = SortableElement(({ i, row, onUpdate, onDelete }) => (
    <GalleryCard
        index={i}
        src={row.src}
        alt={row.alt}
        description={row.description}
        onUpdate={onUpdate}
        onDelete={onDelete} />
));

const SortableList = SortableContainer(({ data, onUpdate, onDelete }) => {
    const classes = useStyles();
    return (
        <div className={classes.cardFlex}>
            {data.map((row, index) =>
                <SortableItem
                    key={`item-${index}`}
                    index={index} i={index}
                    row={row}
                    onUpdate={onUpdate}
                    onDelte={onDelete} />)}
        </div>
    );
});

function SortableComponent({ data, onSortEnd, onUpdate, onDelete }) {
    return (
        <SortableList
            distance={10}
            data={data}
            onSortEnd={onSortEnd}
            onUpdate={onUpdate}
            onDelete={onDelete} />
    );
}

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

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setData(d => moveArrayIndex(d, oldIndex, newIndex));
    };

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
            alert('No images selected!');
            return;
        }
        let form = new FormData();
        selectedFiles.forEach(img => {
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
    }, [selectedFiles])

    const applyChanges = useCallback(() => {
        let gallery_data = data.map(d => ({
            'id': d.key,
            'alt': d.alt,
            'description': d.description,
        }));
        updateGallery(session, gallery_data)
            .then(() => {
                alert('Gallery updated!');
            })
            .catch(err => {
                console.error(err);
                alert('Error: Gallery failed to update!');
            })
    }, [data])

    const updateRow = useCallback((rowIndex, columnName, value) => {
        // if (rowIndex < 0 || rowIndex >= state.keys.length) return;
        // console.log('UPDATING ROW!', rowIndex, columnName, value);
        // setState(state => ({
        //     ...state,
        //     [columnName]: updateArray(state[columnName], rowIndex, value),
        // }));
    }, [data])

    const deleteRow = useCallback(() => {

    }, [])

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
            <Button onClick={uploadImages}>Upload Images</Button>
            <h2>Reorder and delete images</h2>
            <Button onClick={applyChanges}>Apply Changes</Button>
            <SortableComponent
                data={data}
                onSortEnd={onSortEnd}
                onUpdate={updateRow}
                onDelete={deleteRow} />
        </div>
    );
}

AdminGalleryPage.propTypes = {

}

export default AdminGalleryPage;