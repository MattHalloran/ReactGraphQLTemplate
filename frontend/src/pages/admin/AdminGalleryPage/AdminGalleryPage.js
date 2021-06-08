import { useCallback, useState } from 'react';
import { useGet, useMutate } from "restful-react";
import { Button, Typography } from '@material-ui/core';
import { lightTheme, PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import {
    AdminBreadcrumbs,
    GalleryTable
} from 'components';
import { DropzoneArea } from 'material-ui-dropzone';
import { useDropzone } from 'react-dropzone';
import { addImageMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    padTop: {
        // marginTop: theme.spacing(2),
        marginTop: lightTheme.spacing(2),
    },
}));

function AdminGalleryPage({
}) {
    const classes = useStyles();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [data, setData] = useState([]);
    const [addImage, { loadingAddImage }] = useMutation(addImageMutation);

    useGet({
        path: "gallery",
        resolve: (response) => {
            if (response.ok) {
                let response_meta = response.images_meta ?? [];
                if (response_meta.length > 0) {
                    //Grab all thumbnail images
                    let image_keys = response_meta.map(meta => meta.hash);
                    let data = [];
                    // useGet({
                    //     path: "images",
                    //     queryParams: { keys: image_keys, size: 'm' },
                    //     resolve: (response) => {
                    //         if (response.ok) {
                    //             //Combine metadata with thumbnail images
                    //             for (let i = 0; i < ids.length; i++) {
                    //                 let meta = response_meta[i];
                    //                 if (!meta) {
                    //                     console.log('META IS EMPTY', response_meta, i);
                    //                     continue;
                    //                 }
                    //                 let img = response.images[i];
                    //                 data.push({
                    //                     'key': meta.hash,
                    //                     'src': `data:image/jpeg;base64,${img}`,
                    //                     'alt': meta.alt,
                    //                     'description': 'TODO',
                    //                 });
                    //             }
                    //             setData(data);
                    //         }
                    //         else
                    //             PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
                    //     }
                    // })
                } else {
                    setData([]);
                }
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

    const { mutate: updateGallery } = useMutate({
        verb: 'PUT',
        path: 'gallery',
        resolve: (response) => {
            if (response.ok) {
                PubSub.publish(PUBS.Snack, { message: 'Gallery updated.' });
            }
            else {
                console.error(response.msg);
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
            }
        }
    });

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

    const uploadImages = () => {

    }

    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: 'image/jpeg, image/png',
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length <= 0) {
                PubSub.publish(PUBS.Snack, { message: 'No images selected.', severity: 'error' });
                return;
            }
            PubSub.publish(PUBS.Loading, true);
            console.log('about to add image', acceptedFiles[0])
            addImage({
                variables: {
                    files: acceptedFiles,
                    alts: ['TODO'],
                    labels: ['gallery']
                }
            })
                .then((response) => {
                    console.log('GOT ADD IAMGE RESPONSE', response);
                    PubSub.publish(PUBS.Snack, { message: `Successfully uploaded ${acceptedFiles.length} image(s)` });
                    PubSub.publish(PUBS.Loading, false);
                })
                .catch((response) => {
                    PubSub.publish(PUBS.Loading, false);
                    console.error(response);
                    PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
                })
        }
    });

    const applyChanges = useCallback((changed_data) => {
        let gallery_data = changed_data.map(d => ({
            'id': d.key,
            'alt': d.alt,
            'description': d.description,
        }));
        updateGallery(gallery_data);
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
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
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
                onApply={applyChanges} />
        </div>
    );
}

AdminGalleryPage.propTypes = {
}

export { AdminGalleryPage };