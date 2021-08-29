import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import { imagesByLabelQuery } from 'graphql/query';
import { addImagesMutation, updateImagesMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import { 
    AdminBreadcrumbs, 
    Dropzone, 
    WrappedImageList 
} from 'components';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    }
}));

function AdminGalleryPage() {
    console.log('GALLERY PAGE RENDER...')
    const classes = useStyles();
    const [imageData, setImageData] = useState([]);
    const { data: currImages, refetch: refetchImages } = useQuery(imagesByLabelQuery, { variables: { label: 'gallery', size: 'M' } });
    const [addImages] = useMutation(addImagesMutation);
    const [updateImages] = useMutation(updateImagesMutation);

    const uploadImages = (acceptedFiles) => {
        PubSub.publish(PUBS.Loading, true);
        addImages({
            variables: {
                files: acceptedFiles,
                labels: ['gallery']
            }
        })
            .then((response) => {
                refetchImages();
                PubSub.publish(PUBS.Snack, { message: `Successfully uploaded ${acceptedFiles.length} image(s)`, data: response });
                PubSub.publish(PUBS.Loading, false);
            })
            .catch((response) => {
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
            })
    }

    useEffect(() => {
        console.log('CURR IMAGES UPDATTEEEEE')
        console.log(currImages);
        // Table data must be extensible, and needs position
        setImageData(currImages?.imagesByLabel?.map((d, index) => ({
            ...d,
            pos: index
        })));
    }, [currImages])

    const applyChanges = useCallback((changed) => {
        PubSub.publish(PUBS.Loading, true);
        // Prepare data for request
        const data = changed.map(d => ({
            hash: d.hash,
            alt: d.alt,
            description: d.description
        }));
        // Determine which files to mark as deleting
        const originals = imageData.map(d => d.hash);
        const finals = changed.map(d => d.hash);
        const deleting = originals.filter(s => !finals.includes(s));
        // Perform update
        updateImages({ variables: { data, deleting, label: 'gallery' } })
        .then((response) => {
            console.log('GOT UPDATE IMAGE RESPONSE', response);
            PubSub.publish(PUBS.Snack, { message: `Successfully updated images` });
            PubSub.publish(PUBS.Loading, false);
        })
        .catch((response) => {
            console.error(response);
            PubSub.publish(PUBS.Loading, false);
            PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
        })
    }, [imageData, updateImages])

    return (
        <div id='page' className={classes.root}>
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Gallery</Typography>
            </div>
            <Dropzone
                dropzoneText={'Drag \'n\' drop new images here or click'}
                onUpload={uploadImages}
                uploadText='Upload Images'
            />
            <h2>Reorder and delete images</h2>
            <WrappedImageList data={imageData} onApply={applyChanges}/>
        </div>
    );
}

AdminGalleryPage.propTypes = {
}

export { AdminGalleryPage };